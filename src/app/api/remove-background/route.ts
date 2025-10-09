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
    
    // Convert white background to transparent
    const transparentBuffer = await image
      .ensureAlpha() // Ensure image has alpha channel
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process pixels: make white (or near-white) pixels transparent
        const pixels = new Uint8Array(data);
        const threshold = 240; // Adjust this value (240-255) for white detection sensitivity
        
        let transparentPixels = 0;
        for (let i = 0; i < pixels.length; i += info.channels) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // If pixel is white or near-white, make it transparent
          if (r > threshold && g > threshold && b > threshold) {
            pixels[i + 3] = 0; // Set alpha to 0 (transparent)
            transparentPixels++;
          }
        }
        
        console.log(`Made ${transparentPixels} pixels transparent`);
        
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
