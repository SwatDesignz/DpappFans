export const SubscriptionManagerABI = [
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
      { "indexed": true, "internalType": "uint256", "name": "planId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "pricePerMonth", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "PlanCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "subscriber", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "planId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "indexed": false, "internalType": "uint8", "name": "paymentMethod", "type": "uint8" }
    ],
    "name": "Subscribed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "subscriber", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "planId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }
    ],
    "name": "FiatSubscriptionGranted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "pricePerMonth", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "createPlan",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "planId", "type": "uint256" }
    ],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "subscriber", "type": "address" },
      { "internalType": "uint256", "name": "planId", "type": "uint256" }
    ],
    "name": "grantSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "subscriber", "type": "address" },
      { "internalType": "uint256", "name": "planId", "type": "uint256" }
    ],
    "name": "isSubscriptionActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "subscriber", "type": "address" },
      { "internalType": "uint256", "name": "planId", "type": "uint256" }
    ],
    "name": "getSubscription",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "planId", "type": "uint256" },
          { "internalType": "uint256", "name": "startTime", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint8", "name": "paymentMethod", "type": "uint8" }
        ],
        "internalType": "struct SubscriptionManager.Subscription",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
