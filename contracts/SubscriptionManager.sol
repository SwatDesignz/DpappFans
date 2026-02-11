// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SubscriptionManager
 * @notice Manages creator subscription plans with USDC payments
 * @dev Supports both on-chain crypto and off-chain fiat payments with trusted backend bridge
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable paymentToken; // USDC
    address public platformWallet;
    address public trustedBackend;
    uint256 public platformFeeBps; // Basis points (100 = 1%)

    struct Plan {
        uint256 planId;
        address creator;
        uint256 pricePerMonth; // In USDC (6 decimals)
        uint256 duration; // In seconds
        bool isActive;
        string metadata; // IPFS hash for plan details
    }

    struct Subscription {
        uint256 planId;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        PaymentMethod paymentMethod;
    }

    enum PaymentMethod {
        CRYPTO,
        FIAT
    }

    mapping(uint256 => Plan) public plans;
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;
    uint256 public nextPlanId = 1;

    event PlanCreated(
        uint256 indexed planId,
        address indexed creator,
        uint256 pricePerMonth,
        uint256 duration,
        string metadata
    );

    event PlanUpdated(
        uint256 indexed planId,
        uint256 pricePerMonth,
        bool isActive
    );

    event Subscribed(
        address indexed subscriber,
        uint256 indexed planId,
        address indexed creator,
        uint256 amount,
        uint256 endTime,
        PaymentMethod paymentMethod
    );

    event SubscriptionRenewed(
        address indexed subscriber,
        uint256 indexed planId,
        uint256 newEndTime
    );

    event SubscriptionCancelled(
        address indexed subscriber,
        uint256 indexed planId
    );

    event FiatSubscriptionGranted(
        address indexed subscriber,
        uint256 indexed planId,
        uint256 endTime
    );

    modifier onlyTrustedBackend() {
        require(msg.sender == trustedBackend, "Only trusted backend");
        _;
    }

    constructor(
        address _paymentToken,
        address _platformWallet,
        uint256 _platformFeeBps
    ) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Invalid payment token");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_platformFeeBps <= 10000, "Fee too high");

        paymentToken = IERC20(_paymentToken);
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
    }

    /**
     * @notice Create a new subscription plan
     * @param pricePerMonth Subscription price in USDC (6 decimals)
     * @param duration Duration in seconds (e.g., 30 days = 2592000)
     * @param metadata IPFS hash containing plan details
     */
    function createPlan(
        uint256 pricePerMonth,
        uint256 duration,
        string calldata metadata
    ) external returns (uint256) {
        require(pricePerMonth > 0, "Price must be positive");
        require(duration > 0, "Duration must be positive");

        uint256 planId = nextPlanId++;

        plans[planId] = Plan({
            planId: planId,
            creator: msg.sender,
            pricePerMonth: pricePerMonth,
            duration: duration,
            isActive: true,
            metadata: metadata
        });

        emit PlanCreated(planId, msg.sender, pricePerMonth, duration, metadata);

        return planId;
    }

    /**
     * @notice Update an existing plan
     * @param planId The plan to update
     * @param newPrice New price (0 to keep current)
     * @param isActive Active status
     */
    function updatePlan(
        uint256 planId,
        uint256 newPrice,
        bool isActive
    ) external {
        Plan storage plan = plans[planId];
        require(plan.creator == msg.sender, "Not plan creator");

        if (newPrice > 0) {
            plan.pricePerMonth = newPrice;
        }
        plan.isActive = isActive;

        emit PlanUpdated(planId, plan.pricePerMonth, isActive);
    }

    /**
     * @notice Subscribe to a plan with USDC
     * @param planId The plan to subscribe to
     */
    function subscribe(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        require(plan.isActive, "Plan not active");
        require(plan.creator != address(0), "Plan does not exist");

        Subscription storage sub = subscriptions[msg.sender][planId];
        require(!sub.isActive || sub.endTime < block.timestamp, "Already subscribed");

        uint256 amount = plan.pricePerMonth;
        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;

        // Transfer USDC
        paymentToken.safeTransferFrom(msg.sender, platformWallet, platformFee);
        paymentToken.safeTransferFrom(msg.sender, plan.creator, creatorAmount);

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + plan.duration;

        subscriptions[msg.sender][planId] = Subscription({
            planId: planId,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            paymentMethod: PaymentMethod.CRYPTO
        });

        emit Subscribed(
            msg.sender,
            planId,
            plan.creator,
            amount,
            endTime,
            PaymentMethod.CRYPTO
        );
    }

    /**
     * @notice Renew an existing subscription
     * @param planId The plan to renew
     */
    function renew(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        require(plan.isActive, "Plan not active");

        Subscription storage sub = subscriptions[msg.sender][planId];
        require(sub.startTime > 0, "No existing subscription");

        uint256 amount = plan.pricePerMonth;
        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;

        paymentToken.safeTransferFrom(msg.sender, platformWallet, platformFee);
        paymentToken.safeTransferFrom(msg.sender, plan.creator, creatorAmount);

        uint256 newEndTime = sub.endTime > block.timestamp
            ? sub.endTime + plan.duration
            : block.timestamp + plan.duration;

        sub.endTime = newEndTime;
        sub.isActive = true;

        emit SubscriptionRenewed(msg.sender, planId, newEndTime);
    }

    /**
     * @notice Grant subscription via fiat payment (backend only)
     * @dev Called after successful fiat payment confirmation
     * @param subscriber The subscriber address
     * @param planId The plan ID
     */
    function grantSubscription(
        address subscriber,
        uint256 planId
    ) external onlyTrustedBackend {
        Plan storage plan = plans[planId];
        require(plan.creator != address(0), "Plan does not exist");
        require(plan.isActive, "Plan not active");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + plan.duration;

        subscriptions[subscriber][planId] = Subscription({
            planId: planId,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            paymentMethod: PaymentMethod.FIAT
        });

        emit FiatSubscriptionGranted(subscriber, planId, endTime);
    }

    /**
     * @notice Check if a subscription is currently active
     * @dev Used by Lit Protocol for access control
     * @param subscriber The subscriber address
     * @param planId The plan ID
     */
    function isSubscriptionActive(
        address subscriber,
        uint256 planId
    ) external view returns (bool) {
        Subscription storage sub = subscriptions[subscriber][planId];
        return sub.isActive && sub.endTime >= block.timestamp;
    }

    /**
     * @notice Cancel a subscription (stops auto-renewal)
     * @param planId The plan to cancel
     */
    function cancelSubscription(uint256 planId) external {
        Subscription storage sub = subscriptions[msg.sender][planId];
        require(sub.isActive, "No active subscription");

        sub.isActive = false;

        emit SubscriptionCancelled(msg.sender, planId);
    }

    /**
     * @notice Get subscription details
     * @param subscriber The subscriber address
     * @param planId The plan ID
     */
    function getSubscription(
        address subscriber,
        uint256 planId
    ) external view returns (Subscription memory) {
        return subscriptions[subscriber][planId];
    }

    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 10000, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    /**
     * @notice Update platform wallet
     * @param newWallet New platform wallet address
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        platformWallet = newWallet;
    }

    /**
     * @notice Set trusted backend for fiat bridging
     * @param backend Backend signer address
     */
    function setTrustedBackend(address backend) external onlyOwner {
        require(backend != address(0), "Invalid backend");
        trustedBackend = backend;
    }
}
