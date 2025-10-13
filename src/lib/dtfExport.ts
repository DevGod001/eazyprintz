// DTF Export Utility Functions

export interface DTFExportOptions {
  designUrl: string;
  printSize: string; // e.g., "10" × 10""
  dpi?: number;
}

/**
 * Parse print size string (e.g., "10" × 10"") and return dimensions
 */
export function parsePrintSize(printSize: string): { width: number; height: number } {
  const matches = printSize.match(/(\d+\.?\d*)"?\s*[×x]\s*(\d+\.?\d*)"/);
  if (matches) {
    return {
      width: parseFloat(matches[1]),
      height: parseFloat(matches[2]),
    };
  }
  // Default to 10x10 if parsing fails
  return { width: 10, height: 10 };
}

/**
 * Convert inches to pixels at specified DPI
 */
export function inchesToPixels(inches: number, dpi: number = 300): number {
  return Math.round(inches * dpi);
}

/**
 * Download DTF design as transparent PNG at exact print size
 */
export async function downloadDTFDesign(options: DTFExportOptions): Promise<void> {
  const { designUrl, printSize, dpi = 300 } = options;
  const dimensions = parsePrintSize(printSize);
  
  // Create a canvas for high-res export
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size based on print dimensions at specified DPI
  canvas.width = inchesToPixels(dimensions.width, dpi);
  canvas.height = inchesToPixels(dimensions.height, dpi);

  // Load the image
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Handle CORS if needed
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to fit the design in the canvas while maintaining aspect ratio
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DTF-Design-${dimensions.width}x${dimensions.height}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = designUrl;
  });
}

/**
 * Generate print specification text
 */
export function generatePrintSpecs(item: {
  name: string;
  color: string;
  size: string;
  printSize?: string;
  printPlacement?: string;
  customPosition?: { x: number; y: number };
  customScale?: number;
  dtfQuantity?: number;
}): string {
  let specs = `Product: ${item.name}\n`;
  specs += `Color: ${item.color}\n`;
  specs += `Size: ${item.size}\n`;
  specs += `\nDTF Print Specifications:\n`;
  specs += `Size: ${item.printSize || 'Standard'}\n`;
  specs += `Quantity: ${item.dtfQuantity || 1}\n`;
  specs += `Placement: ${formatPlacement(item.printPlacement || 'front')}\n`;
  
  if (item.printPlacement === 'custom' && item.customPosition) {
    specs += `Custom Position: X=${item.customPosition.x.toFixed(1)}%, Y=${item.customPosition.y.toFixed(1)}%\n`;
  }
  
  if (item.customScale) {
    specs += `Custom Scale: ${item.customScale.toFixed(1)}%\n`;
  }
  
  return specs;
}

function formatPlacement(placement: string): string {
  const placements: Record<string, string> = {
    front: 'Front Center',
    back: 'Back Center',
    'breast-left': 'Left Breast',
    'breast-right': 'Right Breast',
    custom: 'Custom Position',
  };
  return placements[placement] || placement;
}
