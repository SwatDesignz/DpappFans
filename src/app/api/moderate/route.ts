import { NextRequest, NextResponse } from "next/server";
import { moderateContent, moderateText, detectSpam } from "@/lib/rapidapi";

/**
 * Content moderation API endpoint
 * POST /api/moderate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Missing type or content" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "image":
        result = await moderateContent(content);
        break;
      
      case "text":
        const [textMod, spamCheck] = await Promise.all([
          moderateText(content),
          detectSpam(content),
        ]);
        result = {
          ...textMod,
          isSpam: spamCheck.isSpam,
          spamConfidence: spamCheck.confidence,
        };
        break;
      
      case "video":
        // For video, we can moderate the thumbnail
        result = await moderateContent(content);
        break;
      
      default:
        return NextResponse.json(
          { error: "Invalid moderation type" },
          { status: 400 }
        );
    }

    // Determine if content should be approved
    const isApproved = type === "image" || type === "video"
      ? result.isAppropriate && result.nsfwScore < 0.7
      : result.isClean && !result.isSpam;

    return NextResponse.json({
      approved: isApproved,
      result,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Moderation API error:", error);
    return NextResponse.json(
      { error: error.message || "Moderation failed" },
      { status: 500 }
    );
  }
}
