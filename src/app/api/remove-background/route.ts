import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("Removing background using Sharp...");

    // Convert data URL to buffer
    let imageBuffer: Buffer;
    
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    console.log("Processing image to remove white background...");
    
    // Process the image with Sharp to make white background transparent
    // Using the same logic as generate-image route
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    console.log("Image metadata:", metadata);
    
    // Convert background to transparent
    const transparentBuffer = await image
      .ensureAlpha() // Ensure image has alpha channel
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process pixels: detect and remove background color
        const pixels = new Uint8Array(data);
        
        let transparentPixels = 0;
        for (let i = 0; i < pixels.length; i += info.channels) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Detect white or near-white backgrounds (for white backgrounds)
          const isWhitish = r > 235 && g > 235 && b > 235;
          
          // Detect blue backgrounds (common in product photos)
          // Blue channel dominant, with r and g being lower
          const isBlueBackground = b > 100 && b > r + 20 && b > g + 20;
          
          // More aggressive white/light color detection
          const isLightBackground = r > 200 && g > 200 && b > 200;
          
          // Calculate color distance for gradual transparency
          // This helps remove edge artifacts
          const avgIntensity = (r + g + b) / 3;
          const colorVariance = Math.max(
            Math.abs(r - avgIntensity),
            Math.abs(g - avgIntensity),
            Math.abs(b - avgIntensity)
          );
          
          // If it's a background color (low variance, light or blue)
          if ((isWhitish || isLightBackground || isBlueBackground) && colorVariance < 40) {
            pixels[i + 3] = 0; // Set alpha to 0 (transparent)
            transparentPixels++;
          }
          // For edge pixels, use gradual transparency
          else if (colorVariance < 60 && avgIntensity > 180) {
            // Gradually fade based on how close to background color
            const alphaValue = Math.min(255, colorVariance * 4);
            pixels[i + 3] = alphaValue;
            transparentPixels++;
          }
        }
        
        console.log(`Made ${transparentPixels} pixels transparent or semi-transparent`);
        
        // Convert back to image
        return sharp(pixels, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        })
        .png()
        .toBuffer();
      });
    
    console.log("Background removed successfully, final size:", transparentBuffer.length);
    
    return new NextResponse(transparentBuffer as any, {
      headers: {
        "Content-Type": "image/png",
        "X-Background-Removed": "true",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error removing background:", error);
    return NextResponse.json(
      { error: `Failed to remove background: ${error.message}` },
      { status: 500 }
    );
  }
}
