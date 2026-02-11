// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CreatorToken
 * @notice ERC1155 tokens representing creator membership tiers
 * @dev Each creator has their own token ID, can create multiple tiers
 */
contract CreatorToken is ERC1155, Ownable {
    using Strings for uint256;

    string public name = "DpappFans Creator Tokens";
    string public symbol = "DFCT";

    // tokenId => creator address
    mapping(uint256 => address) public tokenCreators;
    
    // creator => tokenId
    mapping(address => uint256) public creatorTokens;
    
    // tokenId => metadata URI
    mapping(uint256 => string) public tokenURIs;
    
    uint256 public nextTokenId = 1;

    event CreatorTokenMinted(
        address indexed creator,
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );

    event TokenURIUpdated(
        uint256 indexed tokenId,
        string uri
    );

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @notice Create a new creator token
     * @param metadataURI IPFS URI for token metadata
     * @return tokenId The newly created token ID
     */
    function createCreatorToken(string memory metadataURI) external returns (uint256) {
        require(creatorTokens[msg.sender] == 0, "Token already exists");

        uint256 tokenId = nextTokenId++;
        tokenCreators[tokenId] = msg.sender;
        creatorTokens[msg.sender] = tokenId;
        tokenURIs[tokenId] = metadataURI;

        return tokenId;
    }

    /**
     * @notice Mint tokens to an address (creator only)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(
        address to,
        uint256 amount
    ) external {
        uint256 tokenId = creatorTokens[msg.sender];
        require(tokenId != 0, "No token for creator");
        require(to != address(0), "Invalid recipient");

        _mint(to, tokenId, amount, "");

        emit CreatorTokenMinted(msg.sender, tokenId, to, amount);
    }

    /**
     * @notice Batch mint tokens
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Length mismatch");
        
        uint256 tokenId = creatorTokens[msg.sender];
        require(tokenId != 0, "No token for creator");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _mint(recipients[i], tokenId, amounts[i], "");
            emit CreatorTokenMinted(msg.sender, tokenId, recipients[i], amounts[i]);
        }
    }

    /**
     * @notice Update token metadata URI (creator only)
     * @param metadataURI New IPFS URI
     */
    function setTokenURI(string memory metadataURI) external {
        uint256 tokenId = creatorTokens[msg.sender];
        require(tokenId != 0, "No token for creator");

        tokenURIs[tokenId] = metadataURI;
        emit TokenURIUpdated(tokenId, metadataURI);
    }

    /**
     * @notice Get token URI for a specific token
     * @param tokenId The token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenCreators[tokenId] != address(0), "Token does not exist");
        return tokenURIs[tokenId];
    }

    /**
     * @notice Check if an address holds creator tokens
     * @param holder Address to check
     * @param creator Creator address
     * @return balance Token balance
     */
    function holdsCreatorToken(
        address holder,
        address creator
    ) external view returns (uint256) {
        uint256 tokenId = creatorTokens[creator];
        if (tokenId == 0) return 0;
        return balanceOf(holder, tokenId);
    }
}
