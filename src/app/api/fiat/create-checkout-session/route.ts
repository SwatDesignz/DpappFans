import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ethers } from "ethers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Create a Stripe checkout session for subscription or PPV purchase
 * POST /api/fiat/create-checkout-session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      productType, // 'subscription' or 'ppv'
      planId,
      contentId,
      amount, // Amount in USD cents
      creatorAddress,
      successUrl,
      cancelUrl,
    } = body;

    // Validation
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    if (!productType || !["subscription", "ppv"].includes(productType)) {
      return NextResponse.json(
        { error: "Invalid product type" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Create line items based on product type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name:
              productType === "subscription"
                ? `Creator Subscription - Plan #${planId}`
                : `Content Purchase - ${contentId}`,
            description:
              productType === "subscription"
                ? "Monthly subscription to creator content"
                : "One-time content access",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        walletAddress,
        productType,
        planId: planId?.toString() || "",
        contentId: contentId || "",
        creatorAddress: creatorAddress || "",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
