"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  useSubscribe, 
  useApproveUSDC, 
  useUSDCAllowance,
  useFiatCheckout,
  useIsSubscribed 
} from "@/hooks/useSubscription";
import { getContractsForChain } from "@/lib/contracts";
import { formatUnits, parseUnits } from "viem";
import toast from "react-hot-toast";

interface SubscribeButtonProps {
  planId: number;
  priceUsdc: string; // e.g., "9.99"
  creatorAddress: string;
  durationDays: number;
}

export default function SubscribeButton({
  planId,
  priceUsdc,
  creatorAddress,
  durationDays,
}: SubscribeButtonProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const [isApproving, setIsApproving] = useState(false);

  // Check if already subscribed
  const { data: isSubscribed, isLoading: checkingSubscription } = useIsSubscribed(
    address,
    planId
  );

  // Check USDC allowance
  const { data: allowance } = useUSDCAllowance(
    address,
    contracts.subscriptionManager
  );

  const { approve, isPending: isApprovePending, isSuccess: approveSuccess } = useApproveUSDC();
  const { subscribe, isPending: isSubscribePending, isSuccess: subscribeSuccess } = useSubscribe();
  const { createCheckoutSession } = useFiatCheckout();

  const needsApproval = allowance !== undefined && 
    allowance < parseUnits(priceUsdc, 6);

  const handleCryptoSubscribe = async () => {
    if (!address) return;

    try {
      // Step 1: Approve USDC if needed
      if (needsApproval) {
        setIsApproving(true);
        const toastId = toast.loading("Approving USDC...");
        
        await approve(contracts.subscriptionManager, priceUsdc);
        
        toast.success("USDC approved!", { id: toastId });
        setIsApproving(false);
      }

      // Step 2: Subscribe
      const toastId = toast.loading("Subscribing...");
      await subscribe(planId);
      toast.success("Subscribed successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to subscribe");
      setIsApproving(false);
    }
  };

  const handleFiatSubscribe = async () => {
    if (!address) return;

    try {
      const amountCents = Math.round(parseFloat(priceUsdc) * 100);

      const { url } = await createCheckoutSession({
        walletAddress: address,
        productType: "subscription",
        planId,
        amount: amountCents,
        creatorAddress,
      });

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Fiat checkout error:", error);
      toast.error(error.message || "Failed to create checkout");
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <ConnectButton />
      </div>
    );
  }

  if (checkingSubscription) {
    return (
      <div className="text-center text-gray-500">Checking subscription...</div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-semibold">✓ Active Subscription</p>
        <p className="text-sm text-green-600 mt-1">
          You have full access to this creator's content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Subscription Plan #{planId}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold">${priceUsdc}</div>
            <div className="text-sm text-gray-500">per {durationDays} days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Crypto Payment */}
          <button
            onClick={handleCryptoSubscribe}
            disabled={isApproving || isApprovePending || isSubscribePending}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving || isApprovePending ? (
              "Approving..."
            ) : isSubscribePending ? (
              "Subscribing..."
            ) : needsApproval ? (
              "Approve & Pay with USDC"
            ) : (
              "Pay with USDC"
            )}
          </button>

          {/* Fiat Payment */}
          <button
            onClick={handleFiatSubscribe}
            className="bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700"
          >
            Pay with Card
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Crypto: On-chain payment with USDC</p>
          <p>Card: Fiat payment via Stripe</p>
        </div>
      </div>
    </div>
  );
}
