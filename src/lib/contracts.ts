/**
 * Contract addresses per network
 * Update these after deployment
 */

export const CONTRACTS = {
  // Polygon Mainnet
  137: {
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_POLYGON!,
    payPerViewManager: process.env.NEXT_PUBLIC_PPV_MANAGER_POLYGON!,
    tipsManager: process.env.NEXT_PUBLIC_TIPS_MANAGER_POLYGON!,
    creatorToken: process.env.NEXT_PUBLIC_CREATOR_TOKEN_POLYGON!,
  },
  // Polygon Amoy Testnet
  80002: {
    usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_AMOY!,
    payPerViewManager: process.env.NEXT_PUBLIC_PPV_MANAGER_AMOY!,
    tipsManager: process.env.NEXT_PUBLIC_TIPS_MANAGER_AMOY!,
    creatorToken: process.env.NEXT_PUBLIC_CREATOR_TOKEN_AMOY!,
  },
  // Base Mainnet
  8453: {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_BASE!,
    payPerViewManager: process.env.NEXT_PUBLIC_PPV_MANAGER_BASE!,
    tipsManager: process.env.NEXT_PUBLIC_TIPS_MANAGER_BASE!,
    creatorToken: process.env.NEXT_PUBLIC_CREATOR_TOKEN_BASE!,
  },
  // Base Sepolia Testnet
  84532: {
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_BASE_SEPOLIA!,
    payPerViewManager: process.env.NEXT_PUBLIC_PPV_MANAGER_BASE_SEPOLIA!,
    tipsManager: process.env.NEXT_PUBLIC_TIPS_MANAGER_BASE_SEPOLIA!,
    creatorToken: process.env.NEXT_PUBLIC_CREATOR_TOKEN_BASE_SEPOLIA!,
  },
  // Localhost
  1337: {
    usdc: process.env.NEXT_PUBLIC_USDC_LOCAL!,
    subscriptionManager: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_LOCAL!,
    payPerViewManager: process.env.NEXT_PUBLIC_PPV_MANAGER_LOCAL!,
    tipsManager: process.env.NEXT_PUBLIC_TIPS_MANAGER_LOCAL!,
    creatorToken: process.env.NEXT_PUBLIC_CREATOR_TOKEN_LOCAL!,
  },
} as const;

export function getContractsForChain(chainId: number) {
  return CONTRACTS[chainId as keyof typeof CONTRACTS] || CONTRACTS[137];
}
