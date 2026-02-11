import { useState } from "react";

interface ModerationResult {
  approved: boolean;
  result: any;
  timestamp: number;
}

/**
 * Hook for content moderation
 */
export function useContentModeration() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateImage = async (imageUrl: string): Promise<ModerationResult> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "image",
          content: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Moderation check failed");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsChecking(false);
    }
  };

  const moderateText = async (text: string): Promise<ModerationResult> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "text",
          content: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Moderation check failed");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsChecking(false);
    }
  };

  const moderateVideo = async (videoUrl: string): Promise<ModerationResult> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "video",
          content: videoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Moderation check failed");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    moderateImage,
    moderateText,
    moderateVideo,
    isChecking,
    error,
  };
}

/**
 * Hook for media processing
 */
export function useMediaProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMedia = async (type: "image" | "video", url: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/process-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          url,
          operation: "analyze",
        }),
      });

      if (!response.ok) {
        throw new Error("Media analysis failed");
      }

      const data = await response.json();
      return data.result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const compressImage = async (url: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/process-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "image",
          url,
          operation: "compress",
        }),
      });

      if (!response.ok) {
        throw new Error("Image compression failed");
      }

      const data = await response.json();
      return data.result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateThumbnail = async (videoUrl: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/process-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "video",
          url: videoUrl,
          operation: "thumbnail",
        }),
      });

      if (!response.ok) {
        throw new Error("Thumbnail generation failed");
      }

      const data = await response.json();
      return data.result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    analyzeMedia,
    compressImage,
    generateThumbnail,
    isProcessing,
    error,
  };
}
