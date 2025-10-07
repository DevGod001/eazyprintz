import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Received prompt:", prompt);

    let enhancedPrompt = `${prompt}, DTF print design, vibrant colors, high contrast, clean illustration style, professional quality`;

    // Try to enhance prompt with Gemini, but don't fail if it doesn't work
    try {
      if (process.env.GEMINI_API_KEY) {
        console.log("Attempting Gemini enhancement...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const enhancePromptText = `Convert this into a concise image generation prompt (max 50 words): "${prompt}". Focus on visual style, colors, and DTF printing suitability. Return only the prompt, no explanation.`;

        const result = await model.generateContent(enhancePromptText);
        const response = await result.response;
        const geminiPrompt = response.text().trim();
        if (geminiPrompt && geminiPrompt.length > 10) {
          enhancedPrompt = `${geminiPrompt}, DTF print ready`;
          console.log("Gemini enhanced prompt:", enhancedPrompt);
        }
      }
    } catch (geminiError: any) {
      console.log("Gemini enhancement skipped:", geminiError.message);
      // Continue with original prompt - this is not critical
    }

    // Use Hugging Face Stable Diffusion with enhanced prompt
    const imageResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${enhancedPrompt}, DTF print design, vibrant colors, high contrast, clean edges, professional quality, sharp details, print-ready, isolated on transparent background, no shadows, flat design optimized for fabric printing`,
          parameters: {
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, signature, messy, grainy, pixelated, jpeg artifacts, noisy background, complex background, shadows, gradients that don't print well",
            num_inference_steps: 50,
            guidance_scale: 8.0,
            width: 1024,
            height: 1024,
          },
        }),
      }
    );

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", errorText);
      
      if (errorText.includes("loading")) {
        return NextResponse.json(
          { error: "AI model is warming up. Please try again in 20-30 seconds." },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to generate image. Please try again." },
        { status: 500 }
      );
    }

    const imageBlob = await imageResponse.blob();
    
    return new NextResponse(imageBlob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error in image generation:", error);
    console.error("Error details:", error.message);
    return NextResponse.json(
      { error: `Failed to generate image: ${error.message || "Please try again."}` },
      { status: 500 }
    );
  }
}
