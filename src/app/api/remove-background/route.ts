import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("Removing background...");

    // Convert data URL to blob
    let imageBlob: Blob;
    
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      imageBlob = await response.blob();
    } else {
      const response = await fetch(imageUrl);
      imageBlob = await response.blob();
    }

    // Use Hugging Face's background removal model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        method: "POST",
        body: imageBlob,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Background removal error:", errorText);
      
      if (errorText.includes("loading") || errorText.includes("currently loading")) {
        return NextResponse.json(
          { error: "AI model is warming up. Please wait 30 seconds and try again." },
          { status: 503 }
        );
      }
      
      // If background removal fails, return original image
      console.log("Background removal failed, returning original");
      return new NextResponse(imageBlob, {
        headers: {
          "Content-Type": "image/png",
          "X-Background-Removed": "failed",
          "Cache-Control": "no-cache",
        },
      });
    }

    const resultBlob = await response.blob();
    console.log("Background removed successfully");
    
    return new NextResponse(resultBlob, {
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
