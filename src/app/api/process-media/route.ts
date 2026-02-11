import { NextRequest, NextResponse } from "next/server";
import { analyzeImage, processVideo, compressImage, detectFaces } from "@/lib/rapidapi";

/**
 * Media processing API endpoint
 * POST /api/process-media
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, operation } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: "Missing type or url" },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "analyze":
        if (type === "image") {
          const [analysis, faces] = await Promise.all([
            analyzeImage(url),
            detectFaces(url),
          ]);
          result = { ...analysis, ...faces };
        } else if (type === "video") {
          result = await processVideo(url);
        }
        break;

      case "compress":
        if (type === "image") {
          result = await compressImage(url, {
            quality: 85,
            format: "webp",
          });
        } else {
          return NextResponse.json(
            { error: "Compression only available for images" },
            { status: 400 }
          );
        }
        break;

      case "thumbnail":
        if (type === "video") {
          result = await processVideo(url);
        } else {
          return NextResponse.json(
            { error: "Thumbnail generation only available for videos" },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Media processing error:", error);
    return NextResponse.json(
      { error: error.message || "Media processing failed" },
      { status: 500 }
    );
  }
}
