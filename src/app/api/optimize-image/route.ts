import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("Optimizing image for DTF printing...");

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

    try {
      // Optimize image using Sharp for DTF printing
      // - Ensure high resolution (300 DPI equivalent)
      // - Enhance colors and contrast
      // - Convert to PNG with transparency support
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(3000, 3000, {
          fit: 'inside',
          withoutEnlargement: false, // Allow upscaling for better print quality
        })
        .sharpen() // Enhance sharpness
        .normalise() // Enhance contrast and brightness
        .png({
          compressionLevel: 6, // Good balance of quality and file size
          adaptiveFiltering: true,
        })
        .toBuffer();

      console.log("Image optimized successfully for DTF printing");
      
      return new NextResponse(optimizedBuffer as any, {
        headers: {
          "Content-Type": "image/png",
          "X-Optimization-Status": "enhanced",
          "Cache-Control": "no-cache",
        },
      });
    } catch (sharpError: any) {
      console.warn("Sharp optimization failed, returning original image:", sharpError.message);
      
      // Return original image if optimization fails
      return new NextResponse(imageBuffer as any, {
        headers: {
          "Content-Type": "image/png",
          "X-Optimization-Status": "original",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (error: any) {
    console.error("Error in optimize-image route:", error);
    return NextResponse.json(
      { error: `Failed to process image: ${error.message}` },
      { status: 500 }
    );
  }
}
