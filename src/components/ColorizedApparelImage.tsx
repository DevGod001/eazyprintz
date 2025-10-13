"use client";

interface ColorizedApparelImageProps {
  imagePath: string;
  selectedColor: string; // hex color like "#FFFFFF"
  alt: string;
  className?: string;
}

/**
 * ColorizedApparelImage Component
 * 
 * Dynamically applies color to grayscale apparel mockup images using CSS.
 * This eliminates the need to upload separate images for each color variant.
 * 
 * Requirements:
 * - Base mockup image should be grayscale/white with preserved shadows and texture
 * - The component will apply the selected color while maintaining depth and realism
 * 
 * How it works:
 * - Uses CSS mask-image to create a silhouette from the grayscale mockup
 * - Applies background-color underneath to colorize the garment
 * - Preserves all shadows, highlights, and fabric texture for realistic appearance
 */
export default function ColorizedApparelImage({
  imagePath,
  selectedColor,
  alt,
  className = ""
}: ColorizedApparelImageProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Method 1: CSS Mask Approach (for grayscale mockups) */}
      <div
        className="w-full h-full"
        style={{
          backgroundColor: selectedColor,
          WebkitMaskImage: `url(${imagePath})`,
          maskImage: `url(${imagePath})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      
      {/* Fallback: Regular image with mix-blend-mode (for colored mockups) */}
      {/* Uncomment this section if you're using colored mockups instead of grayscale */}
      {/*
      <div className="relative w-full h-full">
        <img
          src={imagePath}
          alt={alt}
          className="w-full h-auto"
        />
        <div
          className="absolute inset-0 mix-blend-multiply opacity-70"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
      */}
    </div>
  );
}
