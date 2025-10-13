"use client";

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/data/products';

interface ProductPreviewModalProps {
  isOpen: boolean;
  product: Product | null;
  designUrl: string;
  onClose: () => void;
  onChangeProduct: () => void;
  onAddToCart: (config: ProductConfig) => void;
}

export interface ProductConfig {
  product: Product;
  color: string;
  size: string;
  quantity: number;
  printSize: string;
  printPlacement: 'front' | 'back' | 'breast-left' | 'breast-right' | 'custom';
  customPosition?: { x: number; y: number };
  customScale?: number;
  dtfQuantity: number;
  dtfPrice: number;
}

export default function ProductPreviewModal({
  isOpen,
  product,
  designUrl,
  onClose,
  onChangeProduct,
  onAddToCart
}: ProductPreviewModalProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [printPlacement, setPrintPlacement] = useState<'front' | 'back' | 'breast-left' | 'breast-right' | 'custom'>('front');
  const [customPosition, setCustomPosition] = useState({ x: 50, y: 35 });
  const [customScale, setCustomScale] = useState(40);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  
  // DTF Print Size Selection
  const [sizeType, setSizeType] = useState<'popular' | 'custom'>('popular');
  const [selectedPopularSize, setSelectedPopularSize] = useState('10x10');
  const [customWidth, setCustomWidth] = useState('10');
  const [customHeight, setCustomHeight] = useState('10');
  const [dtfQuantity, setDtfQuantity] = useState(1);
  
  // Drag and resize state for custom placement with touch support
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasManuallyAdjustedCustom, setHasManuallyAdjustedCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Design dimensions tracking
  const [originalDesignDimensions, setOriginalDesignDimensions] = useState<{ width: number; height: number } | null>(null);

  // Color transformation state
  const [recoloredImages, setRecoloredImages] = useState<{ [key: string]: string }>({});
  const [isRecoloring, setIsRecoloring] = useState(false);

  // Popular sizes with pricing
  const popularSizes = [
    { label: '2" × 2"', value: '2x2', price: 0.37 },
    { label: '3" × 3"', value: '3x3', price: 0.55 },
    { label: '4" × 2"', value: '4x2', price: 0.60 },
    { label: '4" × 4"', value: '4x4', price: 0.75 },
    { label: '5" × 3"', value: '5x3', price: 0.80 },
    { label: '5" × 5"', value: '5x5', price: 0.90 },
    { label: '6" × 6"', value: '6x6', price: 1.05 },
    { label: '7" × 7"', value: '7x7', price: 1.20 },
    { label: '8" × 8"', value: '8x8', price: 1.35 },
    { label: '9" × 9"', value: '9x9', price: 1.50 },
    { label: '9" × 11"', value: '9x11', price: 1.75 },
    { label: '10" × 10"', value: '10x10', price: 1.85 },
    { label: '11" × 5"', value: '11x5', price: 1.90 },
    { label: '11" × 11"', value: '11x11', price: 2.15 },
    { label: '11" × 14"', value: '11x14', price: 2.50 },
    { label: '12" × 17"', value: '12x17', price: 2.85 },
  ];

  // Dynamic color recoloring function
  const recolorImage = (imageUrl: string, targetColor: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        
        try {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert target color to RGB
          const targetR = parseInt(targetColor.slice(1, 3), 16);
          const targetG = parseInt(targetColor.slice(3, 5), 16);
          const targetB = parseInt(targetColor.slice(5, 7), 16);

          // Detect background by sampling corners
          const cornerSamples: number[][] = [];
          const sampleSize = 5;
          
          for (let y = 0; y < sampleSize; y++) {
            for (let x = 0; x < sampleSize; x++) {
              cornerSamples.push([x, y]);
              cornerSamples.push([canvas.width - 1 - x, y]);
              cornerSamples.push([x, canvas.height - 1 - y]);
              cornerSamples.push([canvas.width - 1 - x, canvas.height - 1 - y]);
            }
          }

          let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
          cornerSamples.forEach(([x, y]) => {
            const idx = (y * canvas.width + x) * 4;
            if (data[idx + 3] > 200) {
              bgR += data[idx];
              bgG += data[idx + 1];
              bgB += data[idx + 2];
              bgCount++;
            }
          });

          const bgColor = {
            r: bgCount > 0 ? bgR / bgCount : 255,
            g: bgCount > 0 ? bgG / bgCount : 255,
            b: bgCount > 0 ? bgB / bgCount : 255
          };

          const isBackground = (r: number, g: number, b: number): boolean => {
            const diff = Math.abs(r - bgColor.r) + Math.abs(g - bgColor.g) + Math.abs(b - bgColor.b);
            return diff < 60;
          };

          // Process each pixel
          for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const alpha = data[i + 3];

            if (alpha < 10) continue;
            if (isBackground(red, green, blue)) continue;

            const luminosity = 0.299 * red + 0.587 * green + 0.114 * blue;
            const lumFactor = luminosity / 255;

            data[i] = targetR * lumFactor;
            data[i + 1] = targetG * lumFactor;
            data[i + 2] = targetB * lumFactor;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Error processing image:', error);
          resolve(imageUrl);
        }
      };

      img.onerror = () => {
        console.error('Error loading image');
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  };

  // Recolor images when color changes
  useEffect(() => {
    if (!product || !selectedColor) return;

    const colorObj = product.colors.find(c => c.name === selectedColor);
    if (!colorObj) return;

    // Skip recoloring for white (use original images)
    if (colorObj.hex.toUpperCase() === '#FFFFFF') {
      setRecoloredImages({});
      setIsRecoloring(false);
      return;
    }

    const recolorAllImages = async () => {
      setIsRecoloring(true);
      const newRecoloredImages: { [key: string]: string } = {};

      for (let i = 0; i < product.images.length; i++) {
        const originalUrl = product.images[i];
        const recoloredUrl = await recolorImage(originalUrl, colorObj.hex);
        newRecoloredImages[`image-${i}`] = recoloredUrl;
      }

      setRecoloredImages(newRecoloredImages);
      setIsRecoloring(false);
    };

    recolorAllImages();
  }, [selectedColor, product]);

  // Calculate DTF price based on size and quantity
  const calculateDTFPrice = (scalePercentage?: number) => {
    let basePrice = 1.09;
    
    if (sizeType === 'popular') {
      const size = popularSizes.find(s => s.value === selectedPopularSize);
      if (size) basePrice = size.price;
    } else {
      const width = parseFloat(customWidth) || 0;
      const height = parseFloat(customHeight) || 0;
      const area = width * height;
      basePrice = Math.max(0.37, Math.round(area * 0.10 * 100) / 100);
    }
    
    if (scalePercentage !== undefined) {
      const scaleFactor = scalePercentage / 100;
      const areaFactor = scaleFactor * scaleFactor;
      basePrice = Math.max(0.37, basePrice * areaFactor);
    }
    
    let discount = 0;
    if (dtfQuantity >= 250) discount = 0.50;
    else if (dtfQuantity >= 100) discount = 0.40;
    else if (dtfQuantity >= 50) discount = 0.30;
    else if (dtfQuantity >= 15) discount = 0.20;
    
    const pricePerUnit = basePrice * (1 - discount);
    return {
      basePrice,
      pricePerUnit: Math.round(pricePerUnit * 100) / 100,
      total: Math.round(pricePerUnit * dtfQuantity * 100) / 100,
      discount: discount * 100
    };
  };

  const dtfPricing = calculateDTFPrice(printPlacement === 'custom' && isEditingCustom ? customScale : undefined);

  // Initialize selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || '');
      setSelectedSize(product.sizes[0] || '');
    }
  }, [product]);

  // Detect original design dimensions
  useEffect(() => {
    if (designUrl && !originalDesignDimensions) {
      const img = new Image();
      img.onload = () => {
        const widthInches = img.width / 300;
        const heightInches = img.height / 300;
        setOriginalDesignDimensions({
          width: Math.round(widthInches * 10) / 10,
          height: Math.round(heightInches * 10) / 10
        });
      };
      img.src = designUrl;
    }
  }, [designUrl, originalDesignDimensions]);

  const getCurrentDTFDimensions = () => {
    if (sizeType === 'popular') {
      const size = popularSizes.find(s => s.value === selectedPopularSize);
      if (size) {
        const [width, height] = size.label.replace(/"/g, '').split(' × ').map(Number);
        return { width, height };
      }
    }
    return {
      width: parseFloat(customWidth) || 10,
      height: parseFloat(customHeight) || 10
    };
  };

  const calculateVisualScale = () => {
    const APPAREL_PRINT_WIDTH = 13;
    const dtfDimensions = getCurrentDTFDimensions();
    
    if (printPlacement === 'front' || printPlacement === 'back') {
      return Math.min((dtfDimensions.width / APPAREL_PRINT_WIDTH) * 100, 70);
    } else if (printPlacement === 'breast-left' || printPlacement === 'breast-right') {
      return Math.min((dtfDimensions.width / APPAREL_PRINT_WIDTH) * 100, 25);
    } else {
      if (hasManuallyAdjustedCustom || isResizing) {
        return customScale;
      }
      return Math.min((dtfDimensions.width / APPAREL_PRINT_WIDTH) * 100, 95);
    }
  };

  const visualScale = calculateVisualScale();

  useEffect(() => {
    if (printPlacement === 'custom' && !isResizing && !isDragging && !hasManuallyAdjustedCustom) {
      const APPAREL_PRINT_WIDTH = 13;
      const dtfDimensions = getCurrentDTFDimensions();
      const calculatedScale = Math.min((dtfDimensions.width / APPAREL_PRINT_WIDTH) * 100, 95);
      setCustomScale(calculatedScale);
    }
  }, [printPlacement, sizeType, selectedPopularSize, customWidth, customHeight, isResizing, isDragging, hasManuallyAdjustedCustom]);

  // Unified handler for both mouse and touch move events
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (printPlacement === 'custom' && isEditingCustom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      if (isDragging) {
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        const percentX = (deltaX / rect.width) * 100;
        const percentY = (deltaY / rect.height) * 100;
        
        setCustomPosition(prev => ({
          x: Math.max(10, Math.min(90, prev.x + percentX)),
          y: Math.max(10, Math.min(90, prev.y + percentY))
        }));
        setDragStart({ x: clientX, y: clientY });
      } else if (isResizing) {
        const deltaX = clientX - dragStart.x;
        const scaleChange = (deltaX / rect.width) * 100;
        
        setCustomScale(prev => Math.max(15, Math.min(95, prev + scaleChange)));
        setDragStart({ x: clientX, y: clientY });
      }
    }
  };

  // End dragging/resizing
  const handlePointerEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  if (!isOpen || !product) return null;

  // Get current images (original or recolored)
  const getCurrentImages = () => {
    if (!product?.images || product.images.length === 0) {
      return ['/products/placeholder.jpg'];
    }

    const colorObj = product.colors.find(c => c.name === selectedColor);
    
    // If white or no recolored images yet, use originals
    if (!colorObj || colorObj.hex.toUpperCase() === '#FFFFFF' || Object.keys(recoloredImages).length === 0) {
      return product.images;
    }
    
    // Use recolored images
    return product.images.map((_, idx) => recoloredImages[`image-${idx}`] || product.images[idx]);
  };

  const currentImages = getCurrentImages();

  const handleAddToCart = () => {
    const printSizeString = sizeType === 'popular' 
      ? (popularSizes.find(s => s.value === selectedPopularSize)?.label || '10" × 10"')
      : `${customWidth}" × ${customHeight}"`;
    
    onAddToCart({
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
      printSize: printSizeString,
      printPlacement,
      customPosition: printPlacement === 'custom' ? customPosition : undefined,
      customScale: printPlacement === 'custom' ? customScale : undefined,
      dtfQuantity,
      dtfPrice: dtfPricing.total,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="border-b p-3 sm:p-6">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase">{product.brand}</p>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm sm:text-base ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">({product.reviews})</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={onChangeProduct}
                  className="hidden sm:block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                >
                  Change Product
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 text-2xl sm:text-3xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            <button
              onClick={onChangeProduct}
              className="sm:hidden w-full mt-3 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
            >
              Change Product
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 p-3 sm:p-6">
            {/* Left: Product Preview */}
            <div>
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-4">
                {/* View Toggle */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 bg-black bg-opacity-75 rounded-full p-1 z-20">
                  <button
                    onClick={() => {
                      setCurrentView('front');
                      setCurrentImageIndex(0);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition ${
                      currentView === 'front'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('back');
                      setCurrentImageIndex(product.images.length >= 3 ? 2 : (product.images.length > 1 ? 1 : 0));
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition ${
                      currentView === 'back'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    Back
                  </button>
                </div>

                {/* Product Image with Design Overlay */}
                <div 
                  ref={containerRef}
                  className={`relative p-2 sm:p-4 ${isEditingCustom && printPlacement === 'custom' ? 'cursor-default touch-none' : 'cursor-zoom-in'}`}
                  onClick={(e) => {
                    if (!isEditingCustom || printPlacement !== 'custom') {
                      setShowZoomModal(true);
                    }
                  }}
                  onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                  onTouchMove={(e) => {
                    if (e.touches.length === 1) {
                      e.preventDefault();
                      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onMouseUp={handlePointerEnd}
                  onTouchEnd={handlePointerEnd}
                  onMouseLeave={handlePointerEnd}
                >
                  <img
                    src={currentImages[currentImageIndex]}
                    alt={`${product.name} ${currentView} - ${selectedColor}`}
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />

                  {/* Design Overlay */}
                  {((currentView === 'front' && ['front', 'breast-left', 'breast-right', 'custom'].includes(printPlacement)) ||
                    (currentView === 'back' && ['back', 'custom'].includes(printPlacement))) && (
                    <div
                      className={printPlacement === 'custom' && isEditingCustom ? 'absolute cursor-move select-none touch-none' : 'absolute select-none pointer-events-none'}
                      style={{
                        top: printPlacement === 'custom' ? `${customPosition.y}%` :
                             printPlacement === 'front' || printPlacement === 'back' ? '30%' : '25%',
                        left: printPlacement === 'custom' ? `${customPosition.x}%` :
                              printPlacement === 'breast-left' ? '30%' :
                              printPlacement === 'breast-right' ? '70%' : '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${visualScale}%`,
                        zIndex: 5
                      }}
                      onMouseDown={(e) => {
                        if (printPlacement === 'custom' && isEditingCustom) {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                          setHasManuallyAdjustedCustom(true);
                          setDragStart({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onTouchStart={(e) => {
                        if (printPlacement === 'custom' && isEditingCustom && e.touches.length === 1) {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                          setHasManuallyAdjustedCustom(true);
                          setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                        }
                      }}
                    >
                      <img
                        src={designUrl}
                        alt="Design preview"
                        className="w-full h-auto object-contain pointer-events-none"
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
                        draggable="false"
                      />
                      
                      {printPlacement === 'custom' && isEditingCustom && (
                        <>
                          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none">
                            <div 
                              className="absolute -top-3 -left-3 w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto touch-none shadow-lg"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setHasManuallyAdjustedCustom(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                if (e.touches.length === 1) {
                                  setIsResizing(true);
                                  setHasManuallyAdjustedCustom(true);
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                }
                              }}
                            ></div>
                            <div 
                              className="absolute -top-3 -right-3 w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto touch-none shadow-lg"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setHasManuallyAdjustedCustom(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                if (e.touches.length === 1) {
                                  setIsResizing(true);
                                  setHasManuallyAdjustedCustom(true);
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                }
                              }}
                            ></div>
                            <div 
                              className="absolute -bottom-3 -left-3 w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto touch-none shadow-lg"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setHasManuallyAdjustedCustom(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                if (e.touches.length === 1) {
                                  setIsResizing(true);
                                  setHasManuallyAdjustedCustom(true);
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                }
                              }}
                            ></div>
                            <div 
                              className="absolute -bottom-3 -right-3 w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto touch-none shadow-lg"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setHasManuallyAdjustedCustom(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                if (e.touches.length === 1) {
                                  setIsResizing(true);
                                  setHasManuallyAdjustedCustom(true);
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                }
                              }}
                            ></div>
                          </div>
                          
                          <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {(() => {
                              const scaleFactor = customScale / 100;
                              const APPAREL_PRINT_WIDTH = 13;
                              const actualWidth = (APPAREL_PRINT_WIDTH * scaleFactor).toFixed(1);
                              const aspectRatio = originalDesignDimensions ? originalDesignDimensions.height / originalDesignDimensions.width : 1;
                              const actualHeight = (parseFloat(actualWidth) * aspectRatio).toFixed(1);
                              return `${actualWidth}" × ${actualHeight}"`;
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                  🔍 Click to Zoom
                </div>
              </div>

              {/* Image Thumbnails */}
              {currentImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setCurrentView(idx === 0 ? 'front' : 'back');
                      }}
                      className={`flex-1 min-w-[80px] rounded-lg border-2 overflow-hidden transition ${
                        currentImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`${selectedColor} - ${idx === 0 ? 'Front' : 'Back'}`} className="w-full h-16 sm:h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Customization Controls */}
            <div className="overflow-y-auto max-h-[70vh] lg:max-h-none">
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{product.description}</p>

              {/* Color Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Color: {selectedColor}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 transition ${
                        selectedColor === color.name
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* DTF Print Size Selection */}
              <div className="mb-4 sm:mb-6 border-2 border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  📏 DTF Transfer Size
                </h3>
                
                <div className="flex gap-2 mb-4 border-b border-gray-300">
                  <button
                    onClick={() => setSizeType('popular')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-semibold transition border-b-2 text-sm ${
                      sizeType === 'popular'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>⭐</span> Popular
                  </button>
                  <button
                    onClick={() => setSizeType('custom')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-semibold transition border-b-2 text-sm ${
                      sizeType === 'custom'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>📐</span> Custom
                  </button>
                </div>

                {sizeType === 'popular' && (
                  <div className="mb-4">
                    <select
                      value={selectedPopularSize}
                      onChange={(e) => setSelectedPopularSize(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium text-sm"
                    >
                      {popularSizes.map((size) => (
                        <option key={size.value} value={size.value} className="text-gray-900 bg-white">
                          {size.label} - ${size.price} each
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sizeType === 'custom' && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-900 mb-1">Width (in)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          step="0.1"
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-900 mb-1">Height (in)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          step="0.1"
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 mb-1">📐 Design Info:</p>
                      {originalDesignDimensions && (
                        <p className="text-blue-800">
                          <span className="font-semibold">Original:</span> {originalDesignDimensions.width}" × {originalDesignDimensions.height}"
                        </p>
                      )}
                      <p className="text-blue-800 mt-1">
                        <span className="font-semibold">Print Size:</span> {(() => {
                          const dims = getCurrentDTFDimensions();
                          return `${dims.width}" × ${dims.height}"`;
                        })()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded border-2 border-blue-300 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[8px] font-bold"
                          style={{
                            width: `${Math.min(visualScale * 0.8, 90)}%`,
                            height: `${Math.min(visualScale * 0.8, 90)}%`,
                          }}
                        >
                          {(() => {
                            const dims = getCurrentDTFDimensions();
                            return `${dims.width}"×${dims.height}"`;
                          })()}
                        </div>
                      </div>
                      <p className="text-[9px] text-blue-700 mt-1 font-semibold">Preview</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-700 mt-2 italic">
                    💡 The design on the apparel shows actual print size
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    DTF Transfer Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDtfQuantity(Math.max(1, dtfQuantity - 1))}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-900"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={dtfQuantity}
                      onChange={(e) => setDtfQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center border-2 border-gray-300 rounded-lg py-1 font-semibold text-gray-900 text-sm"
                    />
                    <button
                      onClick={() => setDtfQuantity(dtfQuantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-900"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-900 font-semibold">Price per transfer:</span>
                    <span className="font-bold text-gray-900">${dtfPricing.pricePerUnit}</span>
                  </div>
                  {dtfPricing.discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-green-700 font-semibold">Bulk discount:</span>
                      <span className="text-green-700 font-bold">{dtfPricing.discount}% off</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">DTF Total:</span>
                    <span className="text-lg sm:text-xl font-bold text-green-600">${dtfPricing.total}</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded text-xs">
                  <p className="font-bold mb-1">💰 Volume Discounts:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span className={dtfQuantity >= 15 ? 'text-green-700 font-bold' : 'text-gray-600'}>15-49: 20% off</span>
                    <span className={dtfQuantity >= 50 ? 'text-green-700 font-bold' : 'text-gray-600'}>50-99: 30% off</span>
                    <span className={dtfQuantity >= 100 ? 'text-green-700 font-bold' : 'text-gray-600'}>100-249: 40% off</span>
                    <span className={dtfQuantity >= 250 ? 'text-green-700 font-bold' : 'text-gray-600'}>250+: 50% off</span>
                  </div>
                </div>
              </div>

              {/* Print Placement */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Print Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['front', 'back', 'breast-left', 'breast-right', 'custom'] as const).map((placement) => (
                    <button
                      key={placement}
                      onClick={() => {
                        setPrintPlacement(placement);
                        if (placement === 'custom') {
                          setIsEditingCustom(true);
                        } else {
                          setIsEditingCustom(false);
                          setHasManuallyAdjustedCustom(false);
                        }
                      }}
                      className={`p-2 sm:p-3 border-2 rounded-lg transition text-xs sm:text-sm font-semibold ${
                        printPlacement === placement
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-300 hover:border-blue-400 text-gray-900'
                      }`}
                    >
                      {placement === 'front' ? '👉 Front' :
                       placement === 'back' ? '👈 Back' :
                       placement === 'breast-left' ? '📌 Left' : 
                       placement === 'breast-right' ? '📌 Right' : '✋ Custom'}
                    </button>
                  ))}
                </div>
                {printPlacement === 'custom' && isEditingCustom && (
                  <div className="mt-2 space-y-2">
                    <div className="p-2 bg-blue-50 rounded text-xs text-blue-800">
                      <strong>Custom Positioning Active:</strong> Drag to move, use corner handles to resize
                    </div>
                    <button
                      onClick={() => setIsEditingCustom(false)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                    >
                      ✓ Done Editing
                    </button>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Size: {selectedSize}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-2 rounded-lg border-2 font-semibold transition text-sm ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-900"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-semibold text-gray-900"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="border-t pt-4 sm:pt-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-900 font-semibold">DTF Transfers ({dtfQuantity}x):</span>
                    <span className="font-bold text-gray-900">${dtfPricing.total}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-900 font-semibold">Apparel ({quantity}x):</span>
                    <span className="font-bold text-gray-900">${(product.basePrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                      ${(dtfPricing.total + (product.basePrice * quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoomModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowZoomModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition font-bold shadow-lg z-10"
            >
              ×
            </button>
            <div className="bg-white rounded-lg p-4">
              <div className="relative">
                <img
                  src={currentImages[currentImageIndex]}
                  alt={`Enlarged view - ${selectedColor}`}
                  className="w-full h-auto"
                />
                {((currentView === 'front' && ['front', 'breast-left', 'breast-right', 'custom'].includes(printPlacement)) ||
                  (currentView === 'back' && ['back', 'custom'].includes(printPlacement))) && (
                  <div
                    className="absolute"
                    style={{
                      top: printPlacement === 'custom' ? `${customPosition.y}%` :
                           printPlacement === 'front' || printPlacement === 'back' ? '30%' : '25%',
                      left: printPlacement === 'custom' ? `${customPosition.x}%` :
                            printPlacement === 'breast-left' ? '30%' :
                            printPlacement === 'breast-right' ? '70%' : '50%',
                      transform: 'translate(-50%, -50%)',
                      width: printPlacement === 'custom' ? `${customScale}%` :
                             printPlacement === 'front' || printPlacement === 'back' ? '40%' : '20%',
                      zIndex: 5
                    }}
                  >
                    <img
                      src={designUrl}
                      alt="Design"
                      className="w-full h-auto object-contain"
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
