// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TipsManager
 * @notice Manages creator tips with optional messages
 * @dev Simple tip system with platform fee
 */
contract TipsManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable paymentToken;
    address public platformWallet;
    uint256 public platformFeeBps;

    event TipSent(
        address indexed tipper,
        address indexed creator,
        uint256 amount,
        uint256 platformFee,
        bytes32 messageHash
    );

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
     * @notice Send a tip to a creator
     * @param creator The creator to tip
     * @param amount Amount in USDC (6 decimals)
     * @param messageHash Optional message hash (keccak256 of encrypted message)
     */
    function tip(
        address creator,
        uint256 amount,
        bytes32 messageHash
    ) external nonReentrant {
        require(creator != address(0), "Invalid creator");
        require(amount > 0, "Amount must be positive");
        require(msg.sender != creator, "Cannot tip yourself");

        uint256 platformFee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - platformFee;

        if (platformFee > 0) {
            paymentToken.safeTransferFrom(msg.sender, platformWallet, platformFee);
        }
        paymentToken.safeTransferFrom(msg.sender, creator, creatorAmount);

        emit TipSent(msg.sender, creator, amount, platformFee, messageHash);
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
}
