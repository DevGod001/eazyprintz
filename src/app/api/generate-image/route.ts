import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  console.log("=== Gemini Image Generation ===");
  
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    console.log("User prompt:", prompt);

    // Initialize Gemini with API key
    const ai = new GoogleGenAI({ apiKey });

    // Create DTF-optimized prompt - instruct to use white background for easy removal
    const dtfPrompt = `Create a professional DTF (Direct-to-Film) transfer design: ${prompt}.
CRITICAL REQUIREMENTS:
- Place the design on a SOLID PURE WHITE BACKGROUND (#FFFFFF) for background removal
- The design elements themselves should NOT use pure white color - use off-white or cream if needed
- High resolution quality suitable for printing (at least 1024x1024 pixels)
- Vibrant, saturated colors that will pop on fabric
- High contrast and sharp edges
- Bold, clean design optimized for heat transfer printing
- Professional DTF sticker quality like commercial print shops
Style: Professional DTF transfer sticker, commercial print quality, ready for transparent PNG conversion.`;

    console.log("Generating with Gemini 2.5 Flash Image...");
    console.log("Enhanced DTF prompt:", dtfPrompt);

    // Generate image using Gemini 2.5 Flash Image model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: dtfPrompt,
    });

    // Extract image data from response
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates in Gemini response");
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("No content parts in response");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        const initialBuffer = Buffer.from(imageData, "base64");
        
        console.log("Image generated successfully, initial size:", initialBuffer.length);
        
        // Process the image with Sharp to make the background transparent
        console.log("Removing white background with Sharp...");
        
        // First, get image metadata
        const image = sharp(initialBuffer);
        const metadata = await image.metadata();
        
        // Convert white background to transparent
        const transparentBuffer = await image
          .ensureAlpha() // Ensure image has alpha channel
          .raw()
          .toBuffer({ resolveWithObject: true })
          .then(({ data, info }) => {
            // Process pixels: make white (or near-white) pixels transparent
            const pixels = new Uint8Array(data);
            const threshold = 240; // Adjust this value (240-255) for white detection sensitivity
            
            for (let i = 0; i < pixels.length; i += info.channels) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              
              // If pixel is white or near-white, make it transparent
              if (r > threshold && g > threshold && b > threshold) {
                pixels[i + 3] = 0; // Set alpha to 0 (transparent)
              }
            }
            
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
        
        console.log("Background removed, final size:", transparentBuffer.length);
        
        return new NextResponse(transparentBuffer as any, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    // If no image found in response
    throw new Error("No image data in Gemini response");
    
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: `Failed to generate: ${error.message}` },
      { status: 500 }
    );
  }
}
