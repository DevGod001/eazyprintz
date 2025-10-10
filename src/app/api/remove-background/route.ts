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
        const pixels = new Uint8Array(data);
        const width = info.width;
        const height = info.height;
        const channels = info.channels;
        
        // Sample multiple edge pixels to better detect background color
        const samplePoints = [];
        
        // Top edge
        for (let x = 0; x < width; x += Math.floor(width / 10)) {
          samplePoints.push(x * channels);
        }
        
        // Bottom edge
        for (let x = 0; x < width; x += Math.floor(width / 10)) {
          samplePoints.push(((height - 1) * width + x) * channels);
        }
        
        // Left edge
        for (let y = 0; y < height; y += Math.floor(height / 10)) {
          samplePoints.push(y * width * channels);
        }
        
        // Right edge
        for (let y = 0; y < height; y += Math.floor(height / 10)) {
          samplePoints.push((y * width + (width - 1)) * channels);
        }
        
        // Calculate average background color from edge samples
        let bgR = 0, bgG = 0, bgB = 0;
        let validSamples = 0;
        
        for (const sample of samplePoints) {
          if (sample + 2 < pixels.length) {
            const r = pixels[sample];
            const g = pixels[sample + 1];
            const b = pixels[sample + 2];
            
            // Only use samples that are relatively uniform (likely background)
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
        
        console.log(`Detected background color from ${validSamples} samples: RGB(${bgR}, ${bgG}, ${bgB})`);
        
        // Determine if background is dark or light
        const avgBgIntensity = (bgR + bgG + bgB) / 3;
        const isDarkBackground = avgBgIntensity < 100;
        
        // Adjust thresholds based on background type
        const colorThreshold = isDarkBackground ? 50 : 45; // More lenient for dark backgrounds
        const edgeThreshold = isDarkBackground ? 70 : 65;
        
        console.log(`Background type: ${isDarkBackground ? 'dark' : 'light'}, using thresholds: ${colorThreshold}, ${edgeThreshold}`);
        
        // Process all pixels
        let transparentPixels = 0;
        
        for (let i = 0; i < pixels.length; i += channels) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Calculate color distance from detected background
          const colorDistance = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );
          
          // Calculate color variance (how uniform the color is)
          const avgIntensity = (r + g + b) / 3;
          const colorVariance = Math.max(
            Math.abs(r - avgIntensity),
            Math.abs(g - avgIntensity),
            Math.abs(b - avgIntensity)
          );
          
          // If pixel is very similar to background color
          if (colorDistance < colorThreshold && colorVariance < 50) {
            pixels[i + 3] = 0; // Fully transparent
            transparentPixels++;
          }
          // For edge pixels (similar but not exact match)
          else if (colorDistance < edgeThreshold && colorVariance < 70) {
            // Gradual transparency based on distance
            const alphaValue = Math.min(255, (colorDistance / edgeThreshold) * 255);
            pixels[i + 3] = Math.round(alphaValue);
            if (alphaValue < 200) transparentPixels++;
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
