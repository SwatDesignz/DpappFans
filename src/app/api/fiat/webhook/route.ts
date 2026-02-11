import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ethers } from "ethers";
import { SubscriptionManagerABI } from "@/lib/abis/SubscriptionManager";
import { PayPerViewManagerABI } from "@/lib/abis/PayPerViewManager";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handle Stripe webhook events
 * POST /api/fiat/webhook
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      await handleSuccessfulPayment(session);
    } catch (error: any) {
      console.error("Error handling successful payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Process successful payment and grant on-chain access
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const {
    walletAddress,
    productType,
    planId,
    contentId,
    creatorAddress,
  } = session.metadata!;

  console.log("Processing payment for:", {
    walletAddress,
    productType,
    planId,
    contentId,
  });

  // Initialize backend signer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || "http://127.0.0.1:8545"
  );
  const signer = new ethers.Wallet(
    process.env.BACKEND_SIGNER_PRIVATE_KEY!,
    provider
  );

  if (productType === "subscription") {
    // Grant subscription on-chain
    const subscriptionManager = new ethers.Contract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS!,
      SubscriptionManagerABI,
      signer
    );

    const tx = await subscriptionManager.grantSubscription(
      walletAddress,
      planId
    );
    
    await tx.wait();
    
    console.log("Subscription granted:", {
      subscriber: walletAddress,
      planId,
      txHash: tx.hash,
    });
  } else if (productType === "ppv") {
    // Grant PPV access on-chain
    const payPerViewManager = new ethers.Contract(
      process.env.PPV_MANAGER_ADDRESS!,
      PayPerViewManagerABI,
      signer
    );

    // Convert contentId string to bytes32
    const contentIdBytes32 = ethers.id(contentId);

    const tx = await payPerViewManager.grantAccess(
      walletAddress,
      contentIdBytes32
    );
    
    await tx.wait();
    
    console.log("PPV access granted:", {
      viewer: walletAddress,
      contentId,
      txHash: tx.hash,
    });
  }
}
