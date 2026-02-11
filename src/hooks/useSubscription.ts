import { useContractRead, useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { useChainId } from "wagmi";
import { getContractsForChain } from "@/lib/contracts";
import { SubscriptionManagerABI } from "@/lib/abis/SubscriptionManager";
import { ERC20ABI } from "@/lib/abis/TipsManager";
import { parseUnits } from "viem";

/**
 * Hook to check if user has an active subscription
 */
export function useIsSubscribed(subscriberAddress?: `0x${string}`, planId?: number) {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  return useContractRead({
    address: contracts.subscriptionManager as `0x${string}`,
    abi: SubscriptionManagerABI,
    functionName: "isSubscriptionActive",
    args: subscriberAddress && planId !== undefined 
      ? [subscriberAddress, BigInt(planId)] 
      : undefined,
    enabled: !!subscriberAddress && planId !== undefined,
  });
}

/**
 * Hook to get subscription details
 */
export function useSubscriptionDetails(subscriberAddress?: `0x${string}`, planId?: number) {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  return useContractRead({
    address: contracts.subscriptionManager as `0x${string}`,
    abi: SubscriptionManagerABI,
    functionName: "getSubscription",
    args: subscriberAddress && planId !== undefined 
      ? [subscriberAddress, BigInt(planId)] 
      : undefined,
    enabled: !!subscriberAddress && planId !== undefined,
  });
}

/**
 * Hook to create a subscription plan
 */
export function useCreatePlan() {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPlan = async (
    pricePerMonth: string, // In USDC (e.g., "9.99")
    durationDays: number,
    metadataUri: string
  ) => {
    const priceInUsdc = parseUnits(pricePerMonth, 6); // USDC has 6 decimals
    const durationInSeconds = BigInt(durationDays * 24 * 60 * 60);

    return writeContract({
      address: contracts.subscriptionManager as `0x${string}`,
      abi: SubscriptionManagerABI,
      functionName: "createPlan",
      args: [priceInUsdc, durationInSeconds, metadataUri],
    });
  };

  return {
    createPlan,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to subscribe with USDC
 */
export function useSubscribe() {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const subscribe = async (planId: number) => {
    return writeContract({
      address: contracts.subscriptionManager as `0x${string}`,
      abi: SubscriptionManagerABI,
      functionName: "subscribe",
      args: [BigInt(planId)],
    });
  };

  return {
    subscribe,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to approve USDC spending
 */
export function useApproveUSDC() {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const { data: hash, writeContract, isPending, error } = useContractWrite();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: string, amount: string) => {
    const amountInUsdc = parseUnits(amount, 6);

    return writeContract({
      address: contracts.usdc as `0x${string}`,
      abi: ERC20ABI,
      functionName: "approve",
      args: [spender as `0x${string}`, amountInUsdc],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to check USDC allowance
 */
export function useUSDCAllowance(owner?: `0x${string}`, spender?: string) {
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  return useContractRead({
    address: contracts.usdc as `0x${string}`,
    abi: ERC20ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender as `0x${string}`] : undefined,
    enabled: !!owner && !!spender,
  });
}

/**
 * Hook to create fiat checkout session
 */
export function useFiatCheckout() {
  const createCheckoutSession = async (params: {
    walletAddress: string;
    productType: "subscription" | "ppv";
    planId?: number;
    contentId?: string;
    amount: number; // USD cents
    creatorAddress: string;
  }) => {
    const response = await fetch("/api/fiat/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const data = await response.json();
    return data;
  };

  return { createCheckoutSession };
}
