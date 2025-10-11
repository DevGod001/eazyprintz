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

    console.log("Processing image to remove background completely...");
    
    // Process the image with Sharp to make background transparent
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    console.log("Image metadata:", metadata);
    
    // Convert background to transparent with NO remnants
    const transparentBuffer = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const pixels = new Uint8Array(data);
        const width = info.width;
        const height = info.height;
        const channels = info.channels;
        
        // Sample edge pixels to detect background color
        const samplePoints = [];
        
        // Sample all four edges more comprehensively
        for (let x = 0; x < width; x += Math.floor(width / 20)) {
          samplePoints.push(x * channels); // Top
          samplePoints.push(((height - 1) * width + x) * channels); // Bottom
        }
        
        for (let y = 0; y < height; y += Math.floor(height / 20)) {
          samplePoints.push(y * width * channels); // Left
          samplePoints.push((y * width + (width - 1)) * channels); // Right
        }
        
        // Calculate background color
        let bgR = 0, bgG = 0, bgB = 0;
        let validSamples = 0;
        
        for (const sample of samplePoints) {
          if (sample + 2 < pixels.length) {
            const r = pixels[sample];
            const g = pixels[sample + 1];
            const b = pixels[sample + 2];
            
            // Only use uniform samples
            const variance = Math.max(
              Math.abs(r - g),
              Math.abs(r - b),
              Math.abs(g - b)
            );
            
            if (variance < 40) {
              bgR += r;
              bgG += g;
              bgB += b;
              validSamples++;
            }
          }
        }
        
        if (validSamples > 0) {
          bgR = Math.round(bgR / validSamples);
          bgG = Math.round(bgG / validSamples);
          bgB = Math.round(bgB / validSamples);
        }
        
        console.log(`Detected background: RGB(${bgR}, ${bgG}, ${bgB}) from ${validSamples} samples`);
        
        // Determine background type
        const avgBgIntensity = (bgR + bgG + bgB) / 3;
        const isDarkBackground = avgBgIntensity < 100;
        
        // VERY AGGRESSIVE threshold to remove ALL background pixels
        // This ensures NO remnants are left
        const threshold = isDarkBackground ? 110 : 105;
        
        console.log(`Using aggressive threshold: ${threshold} (${isDarkBackground ? 'dark' : 'light'} background)`);
        
        // Process pixels with binary decision - fully transparent or fully opaque
        let transparentPixels = 0;
        
        for (let i = 0; i < pixels.length; i += channels) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Calculate distance from background
          const distance = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );
          
          // Binary decision: similar to background = fully transparent
          if (distance < threshold) {
            pixels[i + 3] = 0; // Fully transparent
            transparentPixels++;
          } else {
            pixels[i + 3] = 255; // Fully opaque
          }
        }
        
        console.log(`Removed ${transparentPixels} background pixels (${((transparentPixels / (pixels.length / channels)) * 100).toFixed(1)}%)`);
        
        // Convert back to PNG
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
    
    console.log("Background removed successfully");
    
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
