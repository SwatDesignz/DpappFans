// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayPerViewManager
 * @notice Manages one-time purchases for premium content
 * @dev Supports both crypto and fiat payment methods
 */
contract PayPerViewManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable paymentToken;
    address public platformWallet;
    address public trustedBackend;
    uint256 public platformFeeBps;

    struct Content {
        bytes32 contentId;
        address creator;
        uint256 price;
        bool isActive;
        string metadata; // IPFS hash
    }

    enum PaymentMethod {
        CRYPTO,
        FIAT
    }

    mapping(bytes32 => Content) public contents;
    mapping(address => mapping(bytes32 => bool)) public access;
    mapping(bytes32 => mapping(address => PaymentMethod)) public purchaseMethod;

    event ContentRegistered(
        bytes32 indexed contentId,
        address indexed creator,
        uint256 price,
        string metadata
    );

    event ContentUpdated(
        bytes32 indexed contentId,
        uint256 price,
        bool isActive
    );

    event ContentPurchased(
        address indexed buyer,
        bytes32 indexed contentId,
        address indexed creator,
        uint256 amount,
        PaymentMethod paymentMethod
    );

    event FiatAccessGranted(
        address indexed buyer,
        bytes32 indexed contentId
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
     * @notice Register new premium content
     * @param contentId Unique content identifier (keccak256 hash)
     * @param price Price in USDC (6 decimals)
     * @param metadata IPFS hash with content metadata
     */
    function registerContent(
        bytes32 contentId,
        uint256 price,
        string calldata metadata
    ) external {
        require(contents[contentId].creator == address(0), "Content already exists");
        require(price > 0, "Price must be positive");

        contents[contentId] = Content({
            contentId: contentId,
            creator: msg.sender,
            price: price,
            isActive: true,
            metadata: metadata
        });

        emit ContentRegistered(contentId, msg.sender, price, metadata);
    }

    /**
     * @notice Update content price or active status
     * @param contentId The content to update
     * @param newPrice New price (0 to keep current)
     * @param isActive Active status
     */
    function updateContent(
        bytes32 contentId,
        uint256 newPrice,
        bool isActive
    ) external {
        Content storage content = contents[contentId];
        require(content.creator == msg.sender, "Not content creator");

        if (newPrice > 0) {
            content.price = newPrice;
        }
        content.isActive = isActive;

        emit ContentUpdated(contentId, content.price, isActive);
    }

    /**
     * @notice Purchase content with USDC
     * @param contentId The content to purchase
     */
    function buyView(bytes32 contentId) external nonReentrant {
        Content storage content = contents[contentId];
        require(content.isActive, "Content not active");
        require(content.creator != address(0), "Content does not exist");
        require(!access[msg.sender][contentId], "Already purchased");

        uint256 amount = content.price;
        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;

        paymentToken.safeTransferFrom(msg.sender, platformWallet, platformFee);
        paymentToken.safeTransferFrom(msg.sender, content.creator, creatorAmount);

        access[msg.sender][contentId] = true;
        purchaseMethod[contentId][msg.sender] = PaymentMethod.CRYPTO;

        emit ContentPurchased(
            msg.sender,
            contentId,
            content.creator,
            amount,
            PaymentMethod.CRYPTO
        );
    }

    /**
     * @notice Grant access via fiat payment (backend only)
     * @dev Called after successful fiat payment confirmation
     * @param buyer The buyer address
     * @param contentId The content ID
     */
    function grantAccess(
        address buyer,
        bytes32 contentId
    ) external onlyTrustedBackend {
        Content storage content = contents[contentId];
        require(content.creator != address(0), "Content does not exist");
        require(content.isActive, "Content not active");
        require(!access[buyer][contentId], "Already has access");

        access[buyer][contentId] = true;
        purchaseMethod[contentId][buyer] = PaymentMethod.FIAT;

        emit FiatAccessGranted(buyer, contentId);
    }

    /**
     * @notice Check if viewer has access to content
     * @dev Used by Lit Protocol for access control
     * @param viewer The viewer address
     * @param contentId The content ID
     */
    function hasAccess(
        address viewer,
        bytes32 contentId
    ) external view returns (bool) {
        return access[viewer][contentId];
    }

    /**
     * @notice Set platform fee
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 10000, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    /**
     * @notice Set platform wallet
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
