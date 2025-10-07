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

    console.log("Optimizing image...");

    // Convert data URL to blob
    let imageBlob: Blob;
    
    if (imageUrl.startsWith('data:')) {
      const response = await fetch(imageUrl);
      imageBlob = await response.blob();
    } else {
      const response = await fetch(imageUrl);
      imageBlob = await response.blob();
    }

    // Try to enhance the image using Hugging Face model
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr",
        {
          method: "POST",
          body: imageBlob,
        }
      );

      if (response.ok) {
        const enhancedBlob = await response.blob();
        console.log("Image enhanced successfully");
        return new NextResponse(enhancedBlob, {
          headers: {
            "Content-Type": "image/png",
            "X-Optimization-Status": "enhanced",
            "Cache-Control": "no-cache",
          },
        });
      } else {
        console.log("Enhancement model not available, returning original");
      }
    } catch (error) {
      console.log("Enhancement failed:", error);
    }

    // If enhancement fails, return the original image
    console.log("Returning original image");
    return new NextResponse(imageBlob, {
      headers: {
        "Content-Type": "image/png",
        "X-Optimization-Status": "original",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error optimizing image:", error);
    return NextResponse.json(
      { error: `Failed to optimize image: ${error.message}` },
      { status: 500 }
    );
  }
}
