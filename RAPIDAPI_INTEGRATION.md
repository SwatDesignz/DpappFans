# RapidAPI Integration Guide

## Overview

This project integrates RapidAPI services for content moderation, media processing, and various utility functions. RapidAPI provides a marketplace of APIs that enhance the platform's capabilities.

## Setup

### 1. Get RapidAPI Key

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Navigate to your [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)
3. Copy your API key

### 2. Configure Environment

Add to your `.env` file:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here
```

### 3. Subscribe to APIs

Visit RapidAPI marketplace and subscribe to these APIs (most have free tiers):

#### Content Moderation APIs
- **Content Moderation API** - Detect NSFW content, violence
  - URL: https://rapidapi.com/content-moderation/api/content-moderation2
  - Used for: Image/video content safety
  
- **Text Moderation API** - Detect profanity, hate speech
  - URL: https://rapidapi.com/text-moderation/api/text-moderation1
  - Used for: Comment/caption moderation

#### Media Processing APIs
- **Image Analysis API** - Extract metadata, detect objects
  - URL: https://rapidapi.com/image-analysis/api/image-analysis1
  - Used for: Auto-tagging, face detection
  
- **Video Processing API** - Generate thumbnails, extract frames
  - URL: https://rapidapi.com/video-processing/api/video-processing1
  - Used for: Video thumbnail generation

- **Image Compression API** - Optimize images
  - URL: https://rapidapi.com/image-compression/api/image-compression1
  - Used for: Bandwidth optimization

#### Utility APIs
- **Spam Detection API** - Identify spam content
  - URL: https://rapidapi.com/spam-detection/api/spam-detection1
  - Used for: Comment spam filtering
  
- **Email Validator API** - Validate email addresses
  - URL: https://rapidapi.com/email-validator/api/email-validator8
  - Used for: User registration validation

## Available Services

### Content Moderation

```typescript
import { moderateContent, moderateText } from "@/lib/rapidapi";

// Moderate an image
const result = await moderateContent("https://example.com/image.jpg");
console.log(result.isAppropriate); // true/false
console.log(result.nsfwScore); // 0-1

// Moderate text
const textResult = await moderateText("User comment here");
console.log(textResult.isClean); // true/false
console.log(textResult.hasProfanity); // true/false
```

### Media Processing

```typescript
import { analyzeImage, processVideo, compressImage } from "@/lib/rapidapi";

// Analyze image
const analysis = await analyzeImage("https://example.com/image.jpg");
console.log(analysis.hasFaces);
console.log(analysis.objects);

// Process video and get thumbnail
const video = await processVideo("https://example.com/video.mp4");
console.log(video.thumbnailUrl);
console.log(video.duration);

// Compress image
const compressed = await compressImage("https://example.com/image.jpg", {
  quality: 85,
  format: "webp"
});
console.log(compressed.compressedUrl);
```

### Using Hooks in Components

```typescript
import { useContentModeration, useMediaProcessing } from "@/hooks/useContentModeration";

function UploadComponent() {
  const { moderateImage, isChecking } = useContentModeration();
  const { compressImage, generateThumbnail } = useMediaProcessing();

  const handleUpload = async (file: File) => {
    // Convert file to URL (upload to temporary storage first)
    const tempUrl = await uploadToTemp(file);
    
    // Moderate content
    const moderation = await moderateImage(tempUrl);
    
    if (!moderation.approved) {
      alert("Content violates community guidelines");
      return;
    }
    
    // Compress if image
    if (file.type.startsWith("image/")) {
      const compressed = await compressImage(tempUrl);
      // Use compressed.compressedUrl
    }
    
    // Continue with upload...
  };
  
  return <div>...</div>;
}
```

## API Routes

### POST /api/moderate

Moderate content before publishing.

```typescript
const response = await fetch("/api/moderate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "image", // or "text", "video"
    content: "https://example.com/content.jpg"
  })
});

const { approved, result } = await response.json();
```

### POST /api/process-media

Process media files for optimization.

```typescript
const response = await fetch("/api/process-media", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "image",
    url: "https://example.com/image.jpg",
    operation: "compress" // or "analyze", "thumbnail"
  })
});

const { result } = await response.json();
```

## Integration Points

### 1. Creator Upload Flow

```
User selects file
  ↓
Upload to temporary storage
  ↓
RapidAPI Moderation Check
  ↓
If approved → Encrypt with Lit Protocol
  ↓
Compress/Optimize with RapidAPI
  ↓
Upload to IPFS
  ↓
Store metadata on-chain
```

### 2. Comment System

```
User posts comment
  ↓
RapidAPI Text Moderation
  ↓
RapidAPI Spam Detection
  ↓
If clean → Store comment
  ↓
Else → Flag for review
```

### 3. Video Processing

```
User uploads video
  ↓
RapidAPI Generate Thumbnail
  ↓
RapidAPI Content Moderation
  ↓
Encrypt video with Lit Protocol
  ↓
Upload encrypted video + thumbnail to IPFS
```

## Cost Optimization

### Free Tier Limits

Most RapidAPI services offer free tiers:
- Content Moderation: 100-500 requests/month
- Image Processing: 100-1000 requests/month
- Text Moderation: 500-1000 requests/month

### Caching Strategy

Implement caching to reduce API calls:

```typescript
// Cache moderation results
const moderationCache = new Map<string, ModerationResult>();

async function moderateWithCache(contentHash: string, contentUrl: string) {
  if (moderationCache.has(contentHash)) {
    return moderationCache.get(contentHash);
  }
  
  const result = await moderateContent(contentUrl);
  moderationCache.set(contentHash, result);
  
  return result;
}
```

### Batch Processing

Process multiple items in parallel:

```typescript
const results = await Promise.all([
  moderateImage(image1),
  moderateImage(image2),
  moderateText(caption)
]);
```

## Error Handling

All RapidAPI functions have built-in error handling that "fails open":

```typescript
try {
  const result = await moderateContent(url);
  // Use result
} catch (error) {
  // API failed - logs error but continues
  // Default: content is assumed safe
  console.error("Moderation API unavailable:", error);
}
```

Override this behavior if needed:

```typescript
const result = await moderateContent(url);
if (!result.isAppropriate) {
  throw new Error("Content flagged by moderation");
}
```

## Testing

### Local Testing Without API Key

When `RAPIDAPI_KEY` is not set, mock responses are returned:

```typescript
// Returns safe defaults
const result = await moderateContent(url);
// result.isAppropriate = true
// result.nsfwScore = 0
```

### Testing with RapidAPI Playground

Use RapidAPI's built-in playground to test endpoints before integration:

1. Navigate to API page on RapidAPI
2. Click "Test Endpoint"
3. View request/response examples
4. Copy code snippets

## Alternative APIs

If you prefer different providers, update the host in `src/lib/rapidapi.ts`:

```typescript
// Change from:
"content-moderation2.p.rapidapi.com"

// To your preferred API:
"your-chosen-api.p.rapidapi.com"
```

## Production Recommendations

1. **Rate Limiting**: Implement rate limiting on API routes
2. **Caching**: Cache moderation results by content hash
3. **Monitoring**: Track API usage and costs
4. **Fallbacks**: Have backup moderation strategies
5. **User Reporting**: Allow users to flag content
6. **Manual Review**: Queue flagged content for human review

## Support

- RapidAPI Docs: https://docs.rapidapi.com/
- Support: support@rapidapi.com
- Community: https://community.rapidapi.com/
