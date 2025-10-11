"use client";

import { useState, useEffect } from 'react';
import { products } from '@/data/products';

interface ProductPreviewModalProps {
  isOpen: boolean;
  product: typeof products[0] | null;
  designUrl: string;
  onClose: () => void;
  onChangeProduct: () => void;
  onAddToCart: (config: ProductConfig) => void;
}

export interface ProductConfig {
  product: typeof products[0];
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
  
  // Drag and resize state for custom placement
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
    
    // If scale percentage is provided (for custom positioning), adjust the price
    if (scalePercentage !== undefined) {
      const scaleFactor = scalePercentage / 100;
      const areaFactor = scaleFactor * scaleFactor;
      basePrice = Math.max(0.37, basePrice * areaFactor);
    }
    
    // Apply quantity discounts
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

  if (!isOpen || !product) return null;

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
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">{product.brand}</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onChangeProduct}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Change Product
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left: Product Preview */}
            <div>
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-4">
                {/* View Toggle */}
                <div className="absolute top-4 right-4 flex gap-1 bg-black bg-opacity-75 rounded-full p-1 z-20">
                  <button
                    onClick={() => {
                      setCurrentView('front');
                      setCurrentImageIndex(0);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
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
                      // If 3+ images, use index 2 for back view; if 2 images, use index 1; otherwise use 0
                      setCurrentImageIndex(product.images.length >= 3 ? 2 : (product.images.length > 1 ? 1 : 0));
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
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
                  className={`relative p-4 ${isEditingCustom && printPlacement === 'custom' ? 'cursor-default' : 'cursor-zoom-in'}`}
                  onClick={(e) => {
                    if (!isEditingCustom || printPlacement !== 'custom') {
                      setShowZoomModal(true);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (printPlacement === 'custom' && isEditingCustom) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      if (isDragging) {
                        const deltaX = e.clientX - dragStart.x;
                        const deltaY = e.clientY - dragStart.y;
                        const percentX = (deltaX / rect.width) * 100;
                        const percentY = (deltaY / rect.height) * 100;
                        
                        setCustomPosition(prev => ({
                          x: Math.max(10, Math.min(90, prev.x + percentX)),
                          y: Math.max(10, Math.min(90, prev.y + percentY))
                        }));
                        setDragStart({ x: e.clientX, y: e.clientY });
                      } else if (isResizing) {
                        const deltaX = e.clientX - dragStart.x;
                        const scaleChange = (deltaX / rect.width) * 100;
                        
                        setCustomScale(prev => Math.max(15, Math.min(70, prev + scaleChange)));
                        setDragStart({ x: e.clientX, y: e.clientY });
                      }
                    }
                  }}
                  onMouseUp={() => {
                    setIsDragging(false);
                    setIsResizing(false);
                  }}
                  onMouseLeave={() => {
                    setIsDragging(false);
                    setIsResizing(false);
                  }}
                >
                  <img
                    src={product.images[currentImageIndex]}
                    alt={`${product.name} ${currentView}`}
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
                      className={printPlacement === 'custom' && isEditingCustom ? 'absolute cursor-move select-none' : 'absolute select-none'}
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
                      onMouseDown={(e) => {
                        if (printPlacement === 'custom' && isEditingCustom) {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                          setDragStart({ x: e.clientX, y: e.clientY });
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
                      
                      {/* Custom Position Controls - Only show when actively editing */}
                      {printPlacement === 'custom' && isEditingCustom && (
                        <>
                          {/* Bounding Box */}
                          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none">
                            {/* Corner Handles for Resizing */}
                            <div 
                              className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                            ></div>
                            <div 
                              className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                            ></div>
                            <div 
                              className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                            ></div>
                            <div 
                              className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setDragStart({ x: e.clientX, y: e.clientY });
                              }}
                            ></div>
                          </div>
                          
                          {/* Position & Size Indicator */}
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {customScale.toFixed(0)}% • {customPosition.x.toFixed(0)}%, {customPosition.y.toFixed(0)}%
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Zoom indicator */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  🔍 Click to Zoom
                </div>
              </div>

              {/* Image Thumbnails if multiple */}
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setCurrentView(idx === 0 ? 'front' : 'back');
                      }}
                      className={`flex-1 rounded-lg border-2 overflow-hidden transition ${
                        currentImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-300'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Customization Controls */}
            <div>
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* DTF Print Size Selection */}
              <div className="mb-6 border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  📏 DTF Transfer Size
                </h3>
                
                {/* Size Type Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-300">
                  <button
                    onClick={() => setSizeType('popular')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold transition border-b-2 ${
                      sizeType === 'popular'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>⭐</span> Popular
                  </button>
                  <button
                    onClick={() => setSizeType('custom')}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold transition border-b-2 ${
                      sizeType === 'custom'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>📐</span> Custom
                  </button>
                </div>

                {/* Popular Size Dropdown */}
                {sizeType === 'popular' && (
                  <div className="mb-4">
                    <select
                      value={selectedPopularSize}
                      onChange={(e) => setSelectedPopularSize(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {popularSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label} - ${size.price} each
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Size Input */}
                {sizeType === 'custom' && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Width (in)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          step="0.1"
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Height (in)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          step="0.1"
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* DTF Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    DTF Transfer Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDtfQuantity(Math.max(1, dtfQuantity - 1))}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={dtfQuantity}
                      onChange={(e) => setDtfQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center border-2 border-gray-300 rounded-lg py-1 font-semibold"
                    />
                    <button
                      onClick={() => setDtfQuantity(dtfQuantity + 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* DTF Pricing Display */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Price per transfer:</span>
                    <span className="font-bold">${dtfPricing.pricePerUnit}</span>
                  </div>
                  {dtfPricing.discount > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">Bulk discount:</span>
                      <span className="text-green-600 font-bold">{dtfPricing.discount}% off</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-bold">DTF Total:</span>
                    <span className="text-xl font-bold text-green-600">${dtfPricing.total}</span>
                  </div>
                </div>

                {/* Bulk Discount Info */}
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
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        }
                      }}
                      className={`p-3 border-2 rounded-lg transition text-sm font-semibold ${
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
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>Custom Positioning Active:</strong> Drag to move, use corner handles to resize
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color: {selectedColor}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-lg border-2 transition ${
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

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Size: {selectedSize}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
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
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-semibold"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="border-t pt-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">DTF Transfers ({dtfQuantity}x):</span>
                    <span className="font-bold">${dtfPricing.total}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Apparel ({quantity}x):</span>
                    <span className="font-bold">${(product.basePrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      ${(dtfPricing.total + (product.basePrice * quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg"
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
                  src={product.images[currentImageIndex]}
                  alt="Enlarged view"
                  className="w-full h-auto"
                />
                {/* Design overlay in zoom */}
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
