import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    // Create DTF-optimized prompt
    const dtfPrompt = `${prompt}. Professional DTF print design with vibrant colors, high contrast, clean outlines, bold design, optimized for fabric printing. The background must be white or transparent.`;

    console.log("Generating with Gemini 2.5 Flash Image...");

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
        const buffer = Buffer.from(imageData, "base64");
        
        console.log("Image generated successfully, size:", buffer.length);
        
        return new NextResponse(buffer as any, {
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