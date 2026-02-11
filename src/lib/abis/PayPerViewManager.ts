export const PayPerViewManagerABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_paymentToken", "type": "address" },
      { "internalType": "address", "name": "_platformWallet", "type": "address" },
      { "internalType": "uint256", "name": "_platformFeeBps", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "contentId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "ContentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "contentId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint8", "name": "paymentMethod", "type": "uint8" }
    ],
    "name": "ContentPurchased",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "contentId", "type": "bytes32" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "registerContent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "contentId", "type": "bytes32" }
    ],
    "name": "buyView",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "buyer", "type": "address" },
      { "internalType": "bytes32", "name": "contentId", "type": "bytes32" }
    ],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "viewer", "type": "address" },
      { "internalType": "bytes32", "name": "contentId", "type": "bytes32" }
    ],
    "name": "hasAccess",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
