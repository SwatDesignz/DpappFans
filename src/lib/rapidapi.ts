import axios, { AxiosRequestConfig } from "axios";

/**
 * RapidAPI Configuration and Utilities
 * Centralized service for all RapidAPI integrations
 */

interface RapidAPIConfig {
  apiKey: string;
  baseUrl?: string;
}

class RapidAPIClient {
  private config: RapidAPIConfig;

  constructor(config: RapidAPIConfig) {
    this.config = config;
  }

  /**
   * Make a generic RapidAPI request
   */
  async request<T = any>(
    host: string,
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      ...options,
      url: `https://${host}${endpoint}`,
      headers: {
        "X-RapidAPI-Key": this.config.apiKey,
        "X-RapidAPI-Host": host,
        ...options.headers,
      },
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error(`RapidAPI Error [${host}]:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "RapidAPI request failed");
    }
  }
}

// Initialize client
let rapidApiClient: RapidAPIClient | null = null;

export function getRapidAPIClient(): RapidAPIClient {
  if (!rapidApiClient) {
    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error("RapidAPI key not configured");
    }
    rapidApiClient = new RapidAPIClient({ apiKey });
  }
  return rapidApiClient;
}

/**
 * Content Moderation API
 * Detects NSFW content, violence, hate speech, etc.
 */
export async function moderateContent(imageUrl: string): Promise<{
  isAppropriate: boolean;
  nsfwScore: number;
  violenceScore: number;
  categories: string[];
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "content-moderation2.p.rapidapi.com",
      "/moderate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          url: imageUrl,
        },
      }
    );

    return {
      isAppropriate: result.isAppropriate ?? true,
      nsfwScore: result.nsfwScore ?? 0,
      violenceScore: result.violenceScore ?? 0,
      categories: result.categories ?? [],
    };
  } catch (error) {
    console.error("Content moderation error:", error);
    // Fail open - allow content if moderation fails
    return {
      isAppropriate: true,
      nsfwScore: 0,
      violenceScore: 0,
      categories: [],
    };
  }
}

/**
 * Image Analysis API
 * Extract metadata, detect objects, faces, etc.
 */
export async function analyzeImage(imageUrl: string): Promise<{
  width: number;
  height: number;
  format: string;
  hasF aces: boolean;
  objects: string[];
  colors: string[];
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "image-analysis1.p.rapidapi.com",
      "/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          url: imageUrl,
        },
      }
    );

    return {
      width: result.width ?? 0,
      height: result.height ?? 0,
      format: result.format ?? "unknown",
      hasFaces: result.hasFaces ?? false,
      objects: result.objects ?? [],
      colors: result.colors ?? [],
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      width: 0,
      height: 0,
      format: "unknown",
      hasFaces: false,
      objects: [],
      colors: [],
    };
  }
}

/**
 * Video Processing API
 * Generate thumbnails, extract metadata, etc.
 */
export async function processVideo(videoUrl: string): Promise<{
  duration: number;
  thumbnailUrl: string;
  width: number;
  height: number;
  format: string;
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "video-processing1.p.rapidapi.com",
      "/process",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          url: videoUrl,
          generateThumbnail: true,
        },
      }
    );

    return {
      duration: result.duration ?? 0,
      thumbnailUrl: result.thumbnailUrl ?? "",
      width: result.width ?? 0,
      height: result.height ?? 0,
      format: result.format ?? "unknown",
    };
  } catch (error) {
    console.error("Video processing error:", error);
    throw error;
  }
}

/**
 * Text Moderation API
 * Detect profanity, hate speech, spam, etc.
 */
export async function moderateText(text: string): Promise<{
  isClean: boolean;
  hasProfanity: boolean;
  hasHateSpeech: boolean;
  hasSpam: boolean;
  score: number;
  flaggedWords: string[];
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "text-moderation1.p.rapidapi.com",
      "/moderate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          text,
        },
      }
    );

    return {
      isClean: result.isClean ?? true,
      hasProfanity: result.hasProfanity ?? false,
      hasHateSpeech: result.hasHateSpeech ?? false,
      hasSpam: result.hasSpam ?? false,
      score: result.score ?? 1,
      flaggedWords: result.flaggedWords ?? [],
    };
  } catch (error) {
    console.error("Text moderation error:", error);
    // Fail open
    return {
      isClean: true,
      hasProfanity: false,
      hasHateSpeech: false,
      hasSpam: false,
      score: 1,
      flaggedWords: [],
    };
  }
}

/**
 * Image Compression API
 * Optimize images for web delivery
 */
export async function compressImage(
  imageUrl: string,
  options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: "jpeg" | "png" | "webp";
  } = {}
): Promise<{
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "image-compression1.p.rapidapi.com",
      "/compress",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          url: imageUrl,
          quality: options.quality ?? 85,
          width: options.width,
          height: options.height,
          format: options.format ?? "webp",
        },
      }
    );

    return {
      compressedUrl: result.compressedUrl,
      originalSize: result.originalSize ?? 0,
      compressedSize: result.compressedSize ?? 0,
      compressionRatio: result.compressionRatio ?? 0,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
}

/**
 * Face Detection API
 * Detect and analyze faces in images
 */
export async function detectFaces(imageUrl: string): Promise<{
  faceCount: number;
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "face-detection6.p.rapidapi.com",
      "/detect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          url: imageUrl,
        },
      }
    );

    return {
      faceCount: result.faceCount ?? 0,
      faces: result.faces ?? [],
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return {
      faceCount: 0,
      faces: [],
    };
  }
}

/**
 * Spam Detection API
 * Detect spam in user-generated content
 */
export async function detectSpam(content: string): Promise<{
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "spam-detection1.p.rapidapi.com",
      "/detect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          content,
        },
      }
    );

    return {
      isSpam: result.isSpam ?? false,
      confidence: result.confidence ?? 0,
      reasons: result.reasons ?? [],
    };
  } catch (error) {
    console.error("Spam detection error:", error);
    return {
      isSpam: false,
      confidence: 0,
      reasons: [],
    };
  }
}

/**
 * Email Validation API
 * Validate and verify email addresses
 */
export async function validateEmail(email: string): Promise<{
  isValid: boolean;
  isDisposable: boolean;
  isRole: boolean;
  suggestion: string | null;
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "email-validator8.p.rapidapi.com",
      "/validate",
      {
        method: "GET",
        params: {
          email,
        },
      }
    );

    return {
      isValid: result.isValid ?? false,
      isDisposable: result.isDisposable ?? false,
      isRole: result.isRole ?? false,
      suggestion: result.suggestion ?? null,
    };
  } catch (error) {
    console.error("Email validation error:", error);
    return {
      isValid: true,
      isDisposable: false,
      isRole: false,
      suggestion: null,
    };
  }
}

/**
 * Web Screenshot API
 * Capture screenshots of web pages
 */
export async function captureScreenshot(url: string): Promise<{
  screenshotUrl: string;
  width: number;
  height: number;
}> {
  const client = getRapidAPIClient();
  
  try {
    const result = await client.request(
      "website-screenshot6.p.rapidapi.com",
      "/screenshot",
      {
        method: "GET",
        params: {
          url,
          width: 1920,
          height: 1080,
        },
      }
    );

    return {
      screenshotUrl: result.screenshotUrl ?? "",
      width: result.width ?? 1920,
      height: result.height ?? 1080,
    };
  } catch (error) {
    console.error("Screenshot capture error:", error);
    throw error;
  }
}
