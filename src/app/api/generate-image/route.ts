import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  console.log("=== Generate Image API Called ===");
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log("Request body:", body);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      console.error("Invalid prompt:", prompt);
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("Processing prompt:", prompt);

    // Start with a basic enhanced prompt
    let enhancedPrompt = `${prompt}, DTF print design, vibrant colors, high contrast, clean illustration, professional quality`;

    // Try to enhance with Gemini (optional, non-critical)
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        console.log("Enhancing with Gemini...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(
          `Convert this into a concise image prompt (max 40 words): "${prompt}". Focus on visual style and colors. Return only the prompt.`
        );
        
        const response = await result.response;
        const geminiText = response.text().trim();
        
        if (geminiText && geminiText.length > 10 && geminiText.length < 200) {
          enhancedPrompt = `${geminiText}, DTF print ready`;
          console.log("Gemini enhanced:", enhancedPrompt);
        }
      } else {
        console.log("No Gemini API key, using basic prompt");
      }
    } catch (geminiError: any) {
      console.log("Gemini skip (non-critical):", geminiError.message);
    }

    // Generate image with Stable Diffusion
    console.log("Calling Stable Diffusion...");
    
    const imageResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${enhancedPrompt}, t-shirt design, clean background, high quality, detailed, sharp, professional`,
          parameters: {
            negative_prompt: "blurry, low quality, distorted, ugly, messy, watermark, signature, text",
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }),
      }
    );

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Stable Diffusion error:", errorText);
      
      if (errorText.includes("loading") || errorText.includes("warming")) {
        return NextResponse.json(
          { error: "AI model is loading. Please wait 30 seconds and try again." },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: `Image generation failed: ${errorText.substring(0, 100)}` },
        { status: 500 }
      );
    }

    const imageBlob = await imageResponse.blob();
    console.log("Image generated successfully, size:", imageBlob.size);
    
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    
  } catch (error: any) {
    console.error("=== CRITICAL ERROR ===");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
