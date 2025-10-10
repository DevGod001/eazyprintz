"use client";

import { useState } from "react";
import Link from "next/link";

type AudienceType = "baby" | "kids" | "adult";
type MockupType = "tshirt" | "hoodie" | "sweatshirt" | "onesie" | "hat";

export default function DesignPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processingType, setProcessingType] = useState<"generate" | "optimize" | "remove-bg" | null>(null);
  const [showMockup, setShowMockup] = useState(false);
  const [mockupType, setMockupType] = useState<MockupType>("tshirt");
  const [detectedAudience, setDetectedAudience] = useState<AudienceType>("adult");
  const [mockupPlacement, setMockupPlacement] = useState<"front" | "back" | "breast-left" | "breast-right" | "custom">("front");
  const [mockupView, setMockupView] = useState<"front" | "back">("front");
  
  // Custom positioning state
  const [customPosition, setCustomPosition] = useState({ x: 50, y: 35 }); // percentage
  const [customScale, setCustomScale] = useState(40); // percentage width
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isEditingCustom, setIsEditingCustom] = useState(false); // Track if actively editing
  
  // Multi-position placement with checkboxes
  const [selectedPlacements, setSelectedPlacements] = useState<("front" | "back" | "breast-left" | "breast-right" | "custom")[]>(["front"]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);
  
  // Background detection
  const [hasTransparency, setHasTransparency] = useState(false);
  
  // Size selection state
  const [showSizeSelection, setShowSizeSelection] = useState(false);
  const [sizeType, setSizeType] = useState<"popular" | "custom">("popular");
  const [selectedPopularSize, setSelectedPopularSize] = useState("3.5x3.5");
  const [customWidth, setCustomWidth] = useState("3.41");
  const [customHeight, setCustomHeight] = useState("3.41");
  const [quantity, setQuantity] = useState(1);
  
  // Selected designs for printing
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [expandedDesign, setExpandedDesign] = useState<string | null>(null);
  
  // Unified modal state - ONE MODAL FOR EVERYTHING
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [showApparelMarketplace, setShowApparelMarketplace] = useState(false);
  const [selectedApparel, setSelectedApparel] = useState<{
    id: string;
    name: string;
    type: string;
    basePrice: number;
    color: string;
    size: string;
    quantity: number;
  } | null>(null);
  const [printPlacement, setPrintPlacement] = useState<"front" | "back" | "breast-left" | "breast-right">("front");
  const [showPlacementSelector, setShowPlacementSelector] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showApparelView, setShowApparelView] = useState<"front" | "back">("front");
  
  // Magnifying lens state
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [showEnlargedModal, setShowEnlargedModal] = useState(false);
  
  // Mockup magnifying lens state
  const [showMockupLens, setShowMockupLens] = useState(false);
  const [mockupLensPosition, setMockupLensPosition] = useState({ x: 0, y: 0 });
  const [showMockupEnlargedModal, setShowMockupEnlargedModal] = useState(false);

  // Apparel catalog based on audience
  const getApparelCatalog = () => {
    if (detectedAudience === "baby") {
      return [
        { id: "baby-onesie-1", name: "Soft Cotton Baby Onesie", type: "onesie", basePrice: 8.99, sizes: ["NB", "0-3M", "3-6M", "6-12M", "12-18M"], colors: ["White", "Pink", "Blue", "Yellow", "Gray"], rating: 4.8, reviews: 342 },
        { id: "baby-tee-1", name: "Baby T-Shirt", type: "tshirt", basePrice: 7.99, sizes: ["NB", "0-3M", "3-6M", "6-12M", "12-18M"], colors: ["White", "Pink", "Blue", "Mint", "Peach"], rating: 4.7, reviews: 198 },
        { id: "baby-hoodie-1", name: "Baby Zip-Up Hoodie", type: "hoodie", basePrice: 15.99, sizes: ["3-6M", "6-12M", "12-18M", "18-24M"], colors: ["White", "Pink", "Blue", "Gray", "Navy"], rating: 4.9, reviews: 156 },
      ];
    } else if (detectedAudience === "kids") {
      return [
        { id: "kids-tee-1", name: "Youth Premium T-Shirt", type: "tshirt", basePrice: 9.99, sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Black", "Navy", "Red", "Royal Blue", "Pink", "Gray"], rating: 4.8, reviews: 512 },
        { id: "kids-hoodie-1", name: "Youth Pullover Hoodie", type: "hoodie", basePrice: 19.99, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Navy", "Gray", "Red", "Royal Blue"], rating: 4.9, reviews: 387 },
        { id: "kids-sweat-1", name: "Youth Crewneck Sweatshirt", type: "sweatshirt", basePrice: 17.99, sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Black", "Navy", "Gray", "Maroon"], rating: 4.7, reviews: 289 },
      ];
    } else {
      return [
        { id: "adult-tee-1", name: "Premium Cotton T-Shirt", type: "tshirt", basePrice: 12.99, sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], colors: ["White", "Black", "Navy", "Gray", "Red", "Royal Blue", "Forest Green"], rating: 4.9, reviews: 865 },
        { id: "adult-hoodie-1", name: "Heavyweight Pullover Hoodie", type: "hoodie", basePrice: 29.99, sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colors: ["Black", "Navy", "Gray", "Maroon", "Forest Green"], rating: 4.8, reviews: 672 },
        { id: "adult-sweat-1", name: "Crewneck Sweatshirt", type: "sweatshirt", basePrice: 24.99, sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colors: ["White", "Black", "Navy", "Gray", "Burgundy"], rating: 4.7, reviews: 534 },
        { id: "adult-polo-1", name: "Performance Polo Shirt", type: "polo", basePrice: 18.99, sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colors: ["White", "Black", "Navy", "Gray", "Red"], rating: 4.6, reviews: 298 },
      ];
    }
  };

  const apparelCatalog = getApparelCatalog();

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

  // Calculate price based on size and quantity
  const calculatePrice = () => {
    let basePrice = 1.09; // Default custom size price
    
    if (sizeType === "popular") {
      const size = popularSizes.find(s => s.value === selectedPopularSize);
      if (size) basePrice = size.price;
    } else {
      // Custom size pricing based on area
      const width = parseFloat(customWidth) || 0;
      const height = parseFloat(customHeight) || 0;
      const area = width * height;
      // Simple pricing: $0.10 per square inch
      basePrice = Math.max(0.37, Math.round(area * 0.10 * 100) / 100);
    }
    
    // Apply quantity discounts
    let discount = 0;
    if (quantity >= 250) discount = 0.50;
    else if (quantity >= 100) discount = 0.40;
    else if (quantity >= 50) discount = 0.30;
    else if (quantity >= 15) discount = 0.20;
    
    const pricePerUnit = basePrice * (1 - discount);
    return {
      basePrice,
      pricePerUnit: Math.round(pricePerUnit * 100) / 100,
      total: Math.round(pricePerUnit * quantity * 100) / 100,
      discount: discount * 100
    };
  };

  const pricing = calculatePrice();

  // Detect audience type from prompt
  const detectAudience = (promptText: string): AudienceType => {
    const lowerPrompt = promptText.toLowerCase();
    
    // Check for baby-related keywords
    if (lowerPrompt.match(/\b(baby|infant|newborn|onesie|first|6 months|12 months)\b/)) {
      return "baby";
    }
    
    // Check for kids-related keywords
    if (lowerPrompt.match(/\b(kid|kids|child|children|toddler|youth)\b/)) {
      return "kids";
    }
    
    // Default to adult
    return "adult";
  };

  // Check if image has transparency
  const checkImageTransparency = (imageUrl: string) => {
    const img = new Image();
    // Don't set crossOrigin for blob URLs
    if (!imageUrl.startsWith('blob:')) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.log("Could not get canvas context");
          setHasTransparency(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Check if any pixel has alpha < 255 (transparent)
        let hasTransparentPixel = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparentPixel = true;
            break;
          }
        }
        
        console.log(`Transparency check: ${hasTransparentPixel ? 'HAS' : 'NO'} transparency`);
        setHasTransparency(hasTransparentPixel);
      } catch (error) {
        // If we can't read the image data, assume no transparency
        console.error("Cannot check transparency:", error);
        setHasTransparency(false);
      }
    };
    
    img.onerror = (error) => {
      console.error("Error loading image for transparency check:", error);
      setHasTransparency(false);
    };
    
    img.src = imageUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUploadedImage(url);
        setImageUrl(url);
        setPrompt("");
        // Check if uploaded image has transparency
        checkImageTransparency(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setProcessingType("generate");
    setImageUrl("");
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setUploadedImage(null);
    setShowMockup(false);

    try {
      // Generate 3 variations
      const variations = ["", " - variation 1", " - variation 2"];
      const imageUrls: string[] = [];

      for (let i = 0; i < 3; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const variationPrompt = prompt + variations[i];
        
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: variationPrompt }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          imageUrls.push(url);
          
          // Update UI as each image generates
          setGeneratedImages([...imageUrls]);
        } else {
          const data = await response.json();
          console.error(`Error generating variation ${i + 1}:`, data.error);
        }
      }

      if (imageUrls.length > 0) {
        setGeneratedImages(imageUrls);
        setSelectedImageIndex(0);
        setImageUrl(imageUrls[0]);
        
        // Check if generated image has transparency
        checkImageTransparency(imageUrls[0]);
        
        // Detect audience type from prompt
        const audience = detectAudience(prompt);
        setDetectedAudience(audience);
        
        // Set appropriate default mockup type
        if (audience === "baby") {
          setMockupType("onesie");
        } else {
          setMockupType("tshirt");
        }
      } else {
        alert("Failed to generate any images. Please try again.");
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      if (error.name === 'AbortError') {
        alert("Request timed out. The AI model may be loading. Please try again.");
      } else {
        alert("Failed to generate images. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
      setProcessingType(null);
    }
  };

  // Helper function to convert blob URL to base64
  const blobToBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const optimizeForDTF = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setProcessingType("optimize");

    try {
      // Convert blob URL to base64 if needed
      let imageData = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        console.log('Converting blob URL to base64...');
        imageData = await blobToBase64(imageUrl);
      }

      console.log('Sending optimization request...');
      const response = await fetch("/api/optimize-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: imageData }),
      }).catch((fetchError) => {
        console.error('Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}. Please ensure the development server is running.`);
      });

      console.log('Optimization response status:', response.status);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        // Re-check transparency after optimization
        checkImageTransparency(url);
        
        // Check if it was actually optimized or just returned original
        const status = response.headers.get('X-Optimization-Status');
        if (status === 'original') {
          alert('✨ Image processed! (Optimization library is loading, your original high-quality image is ready for printing.)');
        } else {
          alert('✨ Image optimized successfully for DTF printing!');
        }
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Optimization error:', data);
        alert(`Error: ${data.error || "Failed to optimize image"}`);
      }
    } catch (error: any) {
      console.error("Optimization error:", error);
      alert(`Failed to optimize image: ${error.message || 'Network error. Please restart the development server and try again.'}`);
    } finally {
      setLoading(false);
      setProcessingType(null);
    }
  };

  const removeBackground = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setProcessingType("remove-bg");

    try {
      // Convert blob URL to base64 if needed
      let imageData = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        console.log('Converting blob URL to base64...');
        imageData = await blobToBase64(imageUrl);
      }

      console.log('Sending background removal request...');
      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: imageData }),
      });

      console.log('Background removal response status:', response.status);
      
      // Check response headers
      const bgRemovedHeader = response.headers.get('X-Background-Removed');
      console.log('X-Background-Removed header:', bgRemovedHeader);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob type:', blob.type);
        console.log('Received blob size:', blob.size);
        
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        
        // Re-check transparency after background removal
        checkImageTransparency(url);
        
        // Check if background was actually removed
        if (bgRemovedHeader === 'failed') {
          alert('⚠️ Background removal failed. The AI model may be loading. Your original image is ready, but try again in 30 seconds for background removal.');
        } else if (bgRemovedHeader === 'true') {
          alert('✅ Background removed successfully!');
        } else {
          alert('⚠️ Background removal may not have worked. The AI model might be loading. Try again in 30 seconds.');
        }
      } else if (response.status === 503) {
        const data = await response.json().catch(() => ({ error: 'Service temporarily unavailable' }));
        alert(`⏳ ${data.error || 'The AI model is warming up. Please wait 30 seconds and try again.'}`);
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Background removal error:', data);
        alert(`Error: ${data.error || "Failed to remove background"}`);
      }
    } catch (error: any) {
      console.error("Background removal error:", error);
      alert(`Failed to remove background: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
      setProcessingType(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Lifewear Prints
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">DTF Design Studio</span>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                ← Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DTF Print Design Studio
          </h1>
          <p className="text-lg text-gray-600">
            Create, optimize, and prepare designs for Direct-to-Film printing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Design Input</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setImageUrl("");
                }}
                className={`px-4 py-2 font-semibold transition border-b-2 ${
                  !uploadedImage
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Generate with AI
              </button>
              <button
                onClick={() => {
                  setUploadedImage("switching");
                }}
                className={`px-4 py-2 font-semibold transition border-b-2 ${
                  uploadedImage
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Upload Design
              </button>
            </div>

            {!uploadedImage ? (
              /* AI Generation Tab */
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Describe Your Design
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your design in detail. Include style, colors, elements, and composition..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                <button
                  onClick={generateImage}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && processingType === "generate" ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Generating Design...
                    </>
                  ) : (
                    <>
                      🎨 Generate Design
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 DTF Printing Tips:</strong>
                    <br />• Be specific about colors and details
                    <br />• Describe the style clearly (realistic, cartoon, abstract, etc.)
                    <br />• Mention if you want transparent background
                    <br />• Include size preferences if important
                  </p>
                </div>
              </div>
            ) : (
              /* Upload Tab */
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload Your Design
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, or GIF (Max 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>✨ Optimization Features:</strong>
                    <br />• Enhance colors for DTF printing
                    <br />• Adjust resolution and quality
                    <br />• Remove unwanted backgrounds
                    <br />• Prepare for production
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Design Preview</h2>
              
              {/* Optimization Buttons - Now on Preview Side */}
              {imageUrl && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={optimizeForDTF}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  >
                    {loading && processingType === "optimize" ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span className="hidden sm:inline">Optimizing...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span className="hidden sm:inline">Optimize</span>
                        <span className="sm:hidden">Opt.</span>
                      </>
                    )}
                  </button>

                  {!hasTransparency && (
                    <button
                      onClick={removeBackground}
                      disabled={loading}
                      className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                    >
                      {loading && processingType === "remove-bg" ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span className="hidden sm:inline">Removing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <span>🔲</span>
                          <span className="hidden sm:inline">Remove BG</span>
                          <span className="sm:hidden">Rem. BG</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {hasTransparency && (
                    <div className="flex-1 sm:flex-none px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800 flex items-center gap-1">
                        <span>✓</span>
                        <span className="hidden sm:inline">BG Removed</span>
                        <span className="sm:hidden">✓ Ready</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {loading && processingType === "generate" ? (
              /* Loading Animation */
              <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0">
                  {/* Animated stars */}
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "20%", left: "10%", animationDelay: "0s" }}></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "40%", left: "20%", animationDelay: "0.5s" }}></div>
                  <div className="absolute w-2 h-2 bg-yellow-200 rounded-full animate-twinkle" style={{ top: "60%", left: "80%", animationDelay: "1s" }}></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "80%", left: "15%", animationDelay: "1.5s" }}></div>
                  <div className="absolute w-1 h-1 bg-pink-300 rounded-full animate-twinkle" style={{ top: "30%", left: "70%", animationDelay: "2s" }}></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "50%", left: "90%", animationDelay: "2.5s" }}></div>
                  <div className="absolute w-2 h-2 bg-blue-200 rounded-full animate-twinkle" style={{ top: "70%", left: "40%", animationDelay: "3s" }}></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "10%", left: "60%", animationDelay: "0.3s" }}></div>
                  <div className="absolute w-1 h-1 bg-purple-300 rounded-full animate-twinkle" style={{ top: "90%", left: "70%", animationDelay: "1.2s" }}></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full animate-twinkle" style={{ top: "25%", left: "45%", animationDelay: "2.7s" }}></div>
                </div>
                
                <div className="relative z-10 text-center px-8">
                  {/* Animated printing elements */}
                  <div className="mb-6 relative">
                    <div className="text-6xl animate-bounce">🎨</div>
                    <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</div>
                    <div className="absolute -bottom-2 -left-2 text-3xl animate-pulse">🖨️</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white mb-2 animate-pulse">
                      Crafting Your Design...
                    </div>
                    <div className="text-blue-200 text-sm">
                      {generatedImages.length === 0 && "Initializing AI galaxy..."}
                      {generatedImages.length === 1 && "✨ Design 1 of 3 complete!"}
                      {generatedImages.length === 2 && "🎨 Design 2 of 3 complete!"}
                      {generatedImages.length >= 3 && "🚀 Almost there..."}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
                      style={{ width: `${(generatedImages.length / 3) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Floating DTF elements */}
                  <div className="mt-6 flex justify-center gap-4 text-3xl">
                    <span className="animate-float" style={{ animationDelay: "0s" }}>👕</span>
                    <span className="animate-float" style={{ animationDelay: "0.5s" }}>🧥</span>
                    <span className="animate-float" style={{ animationDelay: "1s" }}>👶</span>
                  </div>
                </div>
                
                {/* Show generated images as they come in */}
                {generatedImages.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center z-20">
                    {generatedImages.map((imgUrl, index) => (
                      <div 
                        key={index}
                        className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg animate-scale-in"
                      >
                        <img
                          src={imgUrl}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : imageUrl ? (
              <div>
                {/* Show generated variations if available */}
                {generatedImages.length > 0 && !uploadedImage && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Choose Your Favorite Design
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {generatedImages.map((imgUrl, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageUrl(imgUrl);
                          }}
                          className={`border-2 rounded-lg overflow-hidden transition ${
                            selectedImageIndex === index
                              ? "border-blue-600 ring-2 ring-blue-300"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Variation ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main preview with mockup toggle */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 mb-4">
                {showMockup ? (
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-lg">
                      <div className="relative mx-auto" style={{ maxWidth: "500px" }}>
                        {/* Realistic Apparel Mockup with Zoom */}
                        <div 
                          className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
                        >
                          {/* Mockup Type Label */}
                          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                            {mockupType === "tshirt" ? "👕 T-Shirt" : 
                             mockupType === "hoodie" ? "🧥 Hoodie" : 
                             mockupType === "sweatshirt" ? "👔 Sweatshirt" :
                             mockupType === "onesie" ? "👶 Baby Onesie" : "🧢 Hat"}
                          </div>

                          {/* View Toggle (Front/Back) */}
                          <div className="absolute top-4 right-4 flex gap-1 bg-black bg-opacity-75 rounded-full p-1 z-10">
                            <button
                              onClick={() => {
                                setMockupView("front");
                                if (mockupPlacement === "back") setMockupPlacement("front");
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                mockupView === "front" 
                                  ? "bg-white text-gray-900" 
                                  : "text-white hover:bg-white hover:bg-opacity-20"
                              }`}
                            >
                              Front
                            </button>
                            <button
                              onClick={() => {
                                setMockupView("back");
                                setMockupPlacement("back");
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                mockupView === "back" 
                                  ? "bg-white text-gray-900" 
                                  : "text-white hover:bg-white hover:bg-opacity-20"
                              }`}
                            >
                              Back
                            </button>
                          </div>

                          {/* Apparel with Design Overlay - Clickable Area */}
                          <div 
                            className={`relative ${isEditingCustom ? "cursor-default" : "cursor-zoom-in"}`}
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              
                              // Only show lens if NOT actively editing custom position
                              if (!isEditingCustom) {
                                setMockupLensPosition({ x, y });
                              }
                              
                              // Handle dragging and resizing (only in custom mode)
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
                            }}
                            onMouseUp={() => {
                              setIsDragging(false);
                              setIsResizing(false);
                            }}
                            onMouseLeave={() => {
                              if (!isEditingCustom) {
                                setShowMockupLens(false);
                              }
                              setIsDragging(false);
                              setIsResizing(false);
                            }}
                            onMouseEnter={() => {
                              // Only show lens if NOT actively editing custom position
                              if (!isEditingCustom) {
                                setShowMockupLens(true);
                              }
                            }}
                            onClick={(e) => {
                              // Only allow zoom modal if NOT actively editing and not dragging
                              if (!isEditingCustom && !isDragging && !isResizing) {
                                setShowMockupEnlargedModal(true);
                              }
                            }}
                            onTouchMove={(e) => {
                              if (mockupPlacement === "custom" && (isDragging || isResizing) && e.touches.length === 1) {
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                
                                if (isDragging) {
                                  const deltaX = e.touches[0].clientX - dragStart.x;
                                  const deltaY = e.touches[0].clientY - dragStart.y;
                                  const percentX = (deltaX / rect.width) * 100;
                                  const percentY = (deltaY / rect.height) * 100;
                                  
                                  setCustomPosition(prev => ({
                                    x: Math.max(10, Math.min(90, prev.x + percentX)),
                                    y: Math.max(10, Math.min(90, prev.y + percentY))
                                  }));
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                } else if (isResizing) {
                                  const deltaX = e.touches[0].clientX - dragStart.x;
                                  const scaleChange = (deltaX / rect.width) * 100;
                                  
                                  setCustomScale(prev => Math.max(15, Math.min(70, prev + scaleChange)));
                                  setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                }
                              }
                            }}
                            onTouchEnd={() => {
                              setIsDragging(false);
                              setIsResizing(false);
                            }}
                          >
                            {/* Background Pattern for Depth */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
                            
                            {/* Realistic Apparel Shape */}
                            <div className="relative">
                              {mockupType === "tshirt" && mockupView === "front" && (
                                <div className="relative">
                                  <img
                                    src="/mockups/adult/tshirt-front.png"
                                    alt="T-Shirt Front"
                                    className="w-full h-auto"
                                  />
                                </div>
                              )}
                              {mockupType === "tshirt" && mockupView === "back" && (
                                <div className="relative">
                                  <img
                                    src="/mockups/adult/tshirt-back.png"
                                    alt="T-Shirt Back"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                      // Fallback to SVG if image doesn't exist
                                      e.currentTarget.style.display = 'none';
                                      const svg = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (svg) svg.style.display = 'block';
                                    }}
                                  />
                                  <svg viewBox="0 0 400 500" className="w-full h-auto" style={{ display: 'none' }}>
                                    {/* T-Shirt Body - Back View */}
                                    <path
                                      d="M 80 80 L 120 50 L 150 50 L 150 20 Q 200 10 250 20 L 250 50 L 280 50 L 320 80 L 320 450 Q 320 480 300 480 L 100 480 Q 80 480 80 450 Z"
                                      fill="#ffffff"
                                      stroke="#e5e7eb"
                                      strokeWidth="2"
                                    />
                                    {/* Sleeves */}
                                    <path d="M 80 80 L 50 120 L 70 180 L 120 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                    <path d="M 320 80 L 350 120 L 330 180 L 280 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                  </svg>
                                </div>
                              )}
                              {mockupType === "hoodie" && (
                                <svg viewBox="0 0 400 520" className="w-full h-auto">
                                  {/* Hoodie Body */}
                                  <path
                                    d="M 80 100 L 120 60 L 150 60 L 150 40 Q 200 25 250 40 L 250 60 L 280 60 L 320 100 L 320 470 Q 320 500 300 500 L 100 500 Q 80 500 80 470 Z"
                                    fill="#f3f4f6"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                  />
                                  {/* Hood */}
                                  <path d="M 150 40 Q 200 10 250 40 L 240 80 Q 200 70 160 80 Z" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
                                  {/* Pocket */}
                                  <rect x="130" y="280" width="140" height="80" rx="5" fill="#ffffff" stroke="#d1d5db" strokeWidth="1" opacity="0.7" />
                                  {/* Drawstrings */}
                                  <line x1="180" y1="100" x2="180" y2="140" stroke="#9ca3af" strokeWidth="2" />
                                  <line x1="220" y1="100" x2="220" y2="140" stroke="#9ca3af" strokeWidth="2" />
                                </svg>
                              )}
                              {mockupType === "sweatshirt" && (
                                <svg viewBox="0 0 400 500" className="w-full h-auto">
                                  {/* Sweatshirt Body */}
                                  <path
                                    d="M 80 90 L 120 55 L 150 55 L 150 30 Q 200 15 250 30 L 250 55 L 280 55 L 320 90 L 320 460 Q 320 490 300 490 L 100 490 Q 80 490 80 460 Z"
                                    fill="#e5e7eb"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                  />
                                  {/* Ribbed Cuffs */}
                                  <rect x="80" y="440" width="40" height="40" fill="#d1d5db" />
                                  <rect x="280" y="440" width="40" height="40" fill="#d1d5db" />
                                  {/* Crew Neck */}
                                  <ellipse cx="200" cy="65" rx="45" ry="30" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
                                </svg>
                              )}
                              {mockupType === "onesie" && (
                                <svg viewBox="0 0 400 550" className="w-full h-auto">
                                  {/* Onesie Body */}
                                  <path
                                    d="M 100 100 L 130 60 L 160 60 L 160 35 Q 200 20 240 35 L 240 60 L 270 60 L 300 100 L 300 400 L 320 450 L 310 480 L 280 480 L 270 450 L 250 420 L 250 500 L 230 530 L 170 530 L 150 500 L 150 420 L 130 450 L 120 480 L 90 480 L 80 450 L 100 400 Z"
                                    fill="#fce7f3"
                                    stroke="#f9a8d4"
                                    strokeWidth="2"
                                  />
                                  {/* Snap Buttons */}
                                  <circle cx="200" cy="400" r="5" fill="#d1d5db" />
                                  <circle cx="200" cy="430" r="5" fill="#d1d5db" />
                                  <circle cx="200" cy="460" r="5" fill="#d1d5db" />
                                </svg>
                              )}
                              {mockupType === "hat" && mockupView === "front" && (
                                <div className="relative">
                                  <img
                                    src="/mockups/adult/hat-front.png"
                                    alt="Hat Front"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                      // Fallback to SVG if image doesn't exist
                                      e.currentTarget.style.display = 'none';
                                      const svg = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (svg) svg.style.display = 'block';
                                    }}
                                  />
                                  <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ display: 'none' }}>
                                    <ellipse cx="200" cy="180" rx="150" ry="20" fill="#4b5563" opacity="0.3" />
                                    <path
                                      d="M 100 180 Q 100 120 200 100 Q 300 120 300 180 L 280 185 Q 280 140 200 125 Q 120 140 120 185 Z"
                                      fill="#1f2937"
                                      stroke="#111827"
                                      strokeWidth="2"
                                    />
                                    <ellipse cx="200" cy="185" rx="180" ry="30" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                                    <path d="M 100 180 Q 200 190 300 180" stroke="#111827" strokeWidth="1" fill="none" />
                                  </svg>
                                </div>
                              )}
                              {mockupType === "hat" && mockupView === "back" && (
                                <div className="relative">
                                  <img
                                    src="/mockups/adult/hat-back.png"
                                    alt="Hat Back"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                      // Fallback to SVG if image doesn't exist
                                      e.currentTarget.style.display = 'none';
                                      const svg = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (svg) svg.style.display = 'block';
                                    }}
                                  />
                                  <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ display: 'none' }}>
                                    <ellipse cx="200" cy="180" rx="150" ry="20" fill="#4b5563" opacity="0.3" />
                                    <path
                                      d="M 100 180 Q 100 120 200 100 Q 300 120 300 180 L 280 185 Q 280 140 200 125 Q 120 140 120 185 Z"
                                      fill="#1f2937"
                                      stroke="#111827"
                                      strokeWidth="2"
                                    />
                                    <ellipse cx="200" cy="185" rx="180" ry="30" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                                  </svg>
                                </div>
                              )}

                              {/* Design Overlay - Positioned based on placement selection */}
                              {mockupView === "front" && mockupPlacement !== "back" && (
                                <div 
                                  className={mockupPlacement === "custom" && isEditingCustom ? "absolute cursor-move select-none" : "absolute select-none"}
                                  style={{
                                    top: mockupPlacement === "custom" ? `${customPosition.y}%` :
                                         mockupPlacement === "front" ? "30%" :
                                         mockupPlacement === "breast-left" || mockupPlacement === "breast-right" ? "25%" : "30%",
                                    left: mockupPlacement === "custom" ? `${customPosition.x}%` :
                                          mockupPlacement === "breast-left" ? "30%" :
                                          mockupPlacement === "breast-right" ? "70%" : "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: mockupPlacement === "custom" ? `${customScale}%` :
                                           mockupPlacement === "front" ? (mockupType === "hat" ? "35%" : "40%") :
                                           mockupPlacement === "breast-left" || mockupPlacement === "breast-right" ? "20%" : "40%",
                                    maxWidth: mockupPlacement === "custom" ? "none" : (mockupPlacement === "front" ? "180px" : "80px"),
                                    zIndex: 5
                                  }}
                                  onMouseDown={(e) => {
                                    if (mockupPlacement === "custom" && isEditingCustom) {
                                      e.preventDefault();
                                      setIsDragging(true);
                                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                      setDragStart({
                                        x: e.clientX,
                                        y: e.clientY
                                      });
                                    }
                                  }}
                                  onTouchStart={(e) => {
                                    if (mockupPlacement === "custom" && isEditingCustom && e.touches.length === 1) {
                                      e.preventDefault();
                                      setIsDragging(true);
                                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                      setDragStart({
                                        x: e.touches[0].clientX,
                                        y: e.touches[0].clientY
                                      });
                                    }
                                  }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt="Design preview on apparel"
                                    className="w-full h-auto object-contain pointer-events-none"
                                    style={{
                                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                                    }}
                                    draggable="false"
                                  />
                                  
                                  {/* Custom Position Controls - Only show when actively editing */}
                                  {mockupPlacement === "custom" && isEditingCustom && (
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
                                          onTouchStart={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                          }}
                                        ></div>
                                        <div 
                                          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.clientX, y: e.clientY });
                                          }}
                                          onTouchStart={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                          }}
                                        ></div>
                                        <div 
                                          className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.clientX, y: e.clientY });
                                          }}
                                          onTouchStart={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                                          }}
                                        ></div>
                                        <div 
                                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.clientX, y: e.clientY });
                                          }}
                                          onTouchStart={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
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
                              
                              {/* Back View Design */}
                              {mockupView === "back" && mockupPlacement === "back" && (
                                <div 
                                  className="absolute"
                                  style={{
                                    top: "32%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: mockupType === "hat" ? "35%" : "45%",
                                    maxWidth: "200px",
                                    zIndex: 5
                                  }}
                                >
                                  <img
                                    src={imageUrl}
                                    alt="Design preview on apparel back"
                                    className="w-full h-auto object-contain"
                                    style={{
                                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Placement Controls with Multi-Position Checkboxes + Custom Position */}
                          <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
                            <p className="text-xs text-white mb-2 font-semibold">Design Placement - Select mode:</p>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {(mockupType === "hat" 
                                ? (["front", "back", "custom"] as const)
                                : (["front", "back", "breast-left", "breast-right", "custom"] as const)
                              ).map((placement) => (
                                <label
                                  key={placement}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                                    selectedPlacements.includes(placement)
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPlacements.includes(placement)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPlacements([...selectedPlacements, placement]);
                                        setMockupPlacement(placement);
                                        if (placement === "back") setMockupView("back");
                                        else setMockupView("front");
                                        // Enable editing mode when custom is selected
                                        if (placement === "custom") {
                                          setIsEditingCustom(true);
                                        }
                                      } else {
                                        const newPlacements = selectedPlacements.filter(p => p !== placement);
                                        setSelectedPlacements(newPlacements.length > 0 ? newPlacements : ["front"]);
                                        if (newPlacements.length > 0) {
                                          setMockupPlacement(newPlacements[0]);
                                          if (newPlacements[0] === "back") setMockupView("back");
                                          else setMockupView("front");
                                        }
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-xs font-semibold">
                                    {placement === "front" ? "Front Center" : 
                                     placement === "back" ? "Back Center" :
                                     placement === "breast-left" ? "Left Breast" : 
                                     placement === "breast-right" ? "Right Breast" : "Custom Position"}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {selectedPlacements.length > 1 && (
                              <button
                                onClick={() => {
                                  setAutoRotate(!autoRotate);
                                  if (!autoRotate) {
                                    setCurrentRotationIndex(0);
                                    const interval = setInterval(() => {
                                      setCurrentRotationIndex(prev => {
                                        const next = (prev + 1) % selectedPlacements.length;
                                        const nextPlacement = selectedPlacements[next];
                                        setMockupPlacement(nextPlacement);
                                        if (nextPlacement === "back") setMockupView("back");
                                        else setMockupView("front");
                                        return next;
                                      });
                                    }, 2000);
                                    (window as any).rotationInterval = interval;
                                  } else {
                                    clearInterval((window as any).rotationInterval);
                                  }
                                }}
                                className={`w-full py-2 rounded-lg font-semibold text-xs transition ${
                                  autoRotate
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {autoRotate ? "🔄 Auto-Rotating..." : "🔄 Preview All Positions"}
                              </button>
                            )}
                          </div>

                          {/* Info Bar */}
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 text-center">
                              <strong>Viewing:</strong> {mockupView === "front" ? "Front" : "Back"} • 
                              <strong> Placement:</strong> {
                                mockupPlacement === "front" ? "Front Center" :
                                mockupPlacement === "back" ? "Back Center" :
                                mockupPlacement === "breast-left" ? "Left Breast" : "Right Breast"
                              }
                              <br />
                              Actual print quality may vary slightly.
                            </p>
                          </div>

                          {/* Magnifying Lens for Mockup - Desktop only (disabled when actively editing) */}
                          {showMockupLens && mockupType === "tshirt" && !isEditingCustom && (
                            <div
                              className="absolute pointer-events-none border-4 border-blue-500 rounded-full shadow-2xl hidden md:block"
                              style={{
                                width: '150px',
                                height: '150px',
                                left: `${mockupLensPosition.x}px`,
                                top: `${mockupLensPosition.y}px`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 20,
                                overflow: 'hidden'
                              }}
                            >
                              {/* Magnified mockup content */}
                              <div
                                style={{
                                  position: 'absolute',
                                  width: '300%',
                                  height: '300%',
                                  left: `${-mockupLensPosition.x * 3 + 75}px`,
                                  top: `${-mockupLensPosition.y * 3 + 75}px`,
                                  transform: 'scale(1.5)',
                                  transformOrigin: '0 0'
                                }}
                              >
                                {mockupView === "front" && (
                                  <div className="relative">
                                    <img
                                      src="/mockups/adult/tshirt-front.png"
                                      alt="T-Shirt Front Zoomed"
                                      className="w-full h-auto"
                                      style={{ width: '500px' }}
                                    />
                                    {mockupPlacement !== "back" && (
                                      <div 
                                        className="absolute"
                                        style={{
                                          top: mockupPlacement === "custom" ? `${customPosition.y}%` :
                                               mockupPlacement === "front" ? "30%" :
                                               mockupPlacement === "breast-left" || mockupPlacement === "breast-right" ? "25%" : "30%",
                                          left: mockupPlacement === "custom" ? `${customPosition.x}%` :
                                                mockupPlacement === "breast-left" ? "30%" :
                                                mockupPlacement === "breast-right" ? "70%" : "50%",
                                          transform: "translate(-50%, -50%)",
                                          width: mockupPlacement === "custom" ? `${customScale}%` :
                                                 mockupPlacement === "front" ? "40%" : "20%",
                                          maxWidth: mockupPlacement === "custom" ? "none" : (mockupPlacement === "front" ? "180px" : "80px"),
                                        }}
                                      >
                                        <img
                                          src={imageUrl}
                                          alt="Design"
                                          className="w-full h-auto object-contain"
                                          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                                {mockupView === "back" && (
                                  <div className="relative">
                                    <img
                                      src="/mockups/adult/tshirt-back.png"
                                      alt="T-Shirt Back Zoomed"
                                      className="w-full h-auto"
                                      style={{ width: '500px' }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const svg = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (svg) svg.style.display = 'block';
                                      }}
                                    />
                                    <svg viewBox="0 0 400 500" className="w-full h-auto" style={{ display: 'none', width: '500px' }}>
                                      <path
                                        d="M 80 80 L 120 50 L 150 50 L 150 20 Q 200 10 250 20 L 250 50 L 280 50 L 320 80 L 320 450 Q 320 480 300 480 L 100 480 Q 80 480 80 450 Z"
                                        fill="#ffffff"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                      />
                                      <path d="M 80 80 L 50 120 L 70 180 L 120 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                      <path d="M 320 80 L 350 120 L 330 180 L 280 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                    </svg>
                                    {mockupPlacement === "back" && (
                                      <div 
                                        className="absolute"
                                        style={{
                                          top: "32%",
                                          left: "50%",
                                          transform: "translate(-50%, -50%)",
                                          width: "45%",
                                          maxWidth: "200px",
                                        }}
                                      >
                                        <img
                                          src={imageUrl}
                                          alt="Design"
                                          className="w-full h-auto object-contain"
                                          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="absolute inset-0 border-2 border-white rounded-full pointer-events-none"></div>
                            </div>
                          )}
                          
                          {/* Tap to Enlarge Badge - Mobile only (hidden when actively editing) */}
                          {!isEditingCustom && (
                            <div className="md:hidden absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                              <span>🔍</span>
                              <span>Tap to Enlarge</span>
                            </div>
                          )}
                          
                          {/* Custom Positioning Mode Indicator & Done Button */}
                          {mockupPlacement === "custom" && isEditingCustom && (
                            <>
                              <div className="absolute top-2 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 z-10 shadow-lg">
                                <span>✋</span>
                                <span className="hidden md:inline">Custom Positioning Active</span>
                                <span className="md:hidden">Editing</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Exit editing mode but KEEP custom placement
                                  setIsEditingCustom(false);
                                  setIsDragging(false);
                                  setIsResizing(false);
                                }}
                                className="absolute top-2 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 z-10 shadow-lg transition"
                              >
                                <span>✓</span>
                                <span>Done</span>
                              </button>
                            </>
                          )}
                        </div>

                        {/* Print Quality Notice for Mockup */}
                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-700 text-center flex items-center justify-center gap-2">
                            <span className="text-lg">✨</span>
                            <span>
                              <strong>Professional Print Quality:</strong> Actual prints are significantly sharper and more vibrant than screen preview. Our DTF transfers deliver 100% true-to-design quality with exceptional detail and color accuracy.
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Enlarged Mockup Modal for Mobile */}
                      {showMockupEnlargedModal && (
                        <div 
                          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                          onClick={() => setShowMockupEnlargedModal(false)}
                        >
                          <div className="relative max-w-full max-h-full">
                            <button
                              onClick={() => setShowMockupEnlargedModal(false)}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition font-bold shadow-lg z-10"
                            >
                              ×
                            </button>
                            <div className="bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-auto">
                              <div className="relative">
                                {mockupView === "front" && (
                                  <img
                                    src="/mockups/adult/tshirt-front.png"
                                    alt="Enlarged mockup front"
                                    className="w-full h-auto"
                                  />
                                )}
                                {mockupView === "back" && (
                                  <img
                                    src="/mockups/adult/tshirt-back.png"
                                    alt="Enlarged mockup back"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const svg = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (svg) svg.style.display = 'block';
                                    }}
                                  />
                                )}
                                {mockupView === "back" && (
                                  <svg viewBox="0 0 400 500" className="w-full h-auto" style={{ display: 'none' }}>
                                    <path
                                      d="M 80 80 L 120 50 L 150 50 L 150 20 Q 200 10 250 20 L 250 50 L 280 50 L 320 80 L 320 450 Q 320 480 300 480 L 100 480 Q 80 480 80 450 Z"
                                      fill="#ffffff"
                                      stroke="#e5e7eb"
                                      strokeWidth="2"
                                    />
                                    <path d="M 80 80 L 50 120 L 70 180 L 120 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                    <path d="M 320 80 L 350 120 L 330 180 L 280 140 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
                                  </svg>
                                )}
                                {mockupView === "front" && mockupPlacement !== "back" && (
                                  <div 
                                    className="absolute"
                                    style={{
                                      top: mockupPlacement === "custom" ? `${customPosition.y}%` :
                                           mockupPlacement === "front" ? "30%" :
                                           mockupPlacement === "breast-left" || mockupPlacement === "breast-right" ? "25%" : "30%",
                                      left: mockupPlacement === "custom" ? `${customPosition.x}%` :
                                            mockupPlacement === "breast-left" ? "30%" :
                                            mockupPlacement === "breast-right" ? "70%" : "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: mockupPlacement === "custom" ? `${customScale}%` :
                                             mockupPlacement === "front" ? (mockupType === "hat" ? "35%" : "40%") :
                                             mockupPlacement === "breast-left" || mockupPlacement === "breast-right" ? "20%" : "40%",
                                      maxWidth: mockupPlacement === "custom" ? "none" : (mockupPlacement === "front" ? "180px" : "80px"),
                                      zIndex: 5
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt="Design preview"
                                      className="w-full h-auto object-contain"
                                      style={{
                                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                                      }}
                                    />
                                  </div>
                                )}
                                {mockupView === "back" && mockupPlacement === "back" && (
                                  <div 
                                    className="absolute"
                                    style={{
                                      top: "32%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: "45%",
                                      maxWidth: "200px",
                                      zIndex: 5
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt="Design preview on back"
                                      className="w-full h-auto object-contain"
                                      style={{
                                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-center mt-4 text-white text-sm">
                              Pinch to zoom • Swipe to pan
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Desktop: Magnifying Lens on Hover + Click to Enlarge */}
                      <div 
                        className="relative select-none hidden md:block cursor-zoom-in"
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={() => setShowEnlargedModal(true)}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          setLensPosition({ x, y });
                        }}
                        onMouseEnter={() => setShowLens(true)}
                        onMouseLeave={() => setShowLens(false)}
                      >
                        <img
                          src={imageUrl}
                          alt="Design preview"
                          className="w-full h-auto"
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="text-white text-opacity-10 text-6xl font-bold transform rotate-[-30deg]">
                            LIFEWEAR PRINTS
                          </div>
                        </div>
                        
                        {/* Magnifying Lens */}
                        {showLens && (
                          <div
                            className="absolute pointer-events-none border-4 border-blue-500 rounded-full overflow-hidden shadow-2xl"
                            style={{
                              width: '200px',
                              height: '200px',
                              left: `${lensPosition.x}px`,
                              top: `${lensPosition.y}px`,
                              transform: 'translate(-50%, -50%)',
                              backgroundImage: `url(${imageUrl})`,
                              backgroundPosition: `${-lensPosition.x * 2 + 100}px ${-lensPosition.y * 2 + 100}px`,
                              backgroundSize: '200%',
                              backgroundRepeat: 'no-repeat',
                              zIndex: 10
                            }}
                          >
                            <div className="absolute inset-0 border-2 border-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Mobile: Click to Enlarge */}
                      <div 
                        className="relative select-none md:hidden cursor-pointer"
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowEnlargedModal(true);
                        }}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <img
                          src={imageUrl}
                          alt="Design preview"
                          className="w-full h-auto"
                          draggable="false"
                          onDragStart={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowEnlargedModal(true);
                          }}
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="text-white text-opacity-10 text-6xl font-bold transform rotate-[-30deg]">
                            LIFEWEAR PRINTS
                          </div>
                        </div>
                        {/* Click to Enlarge Badge */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 pointer-events-none">
                          <span>🔍</span>
                          <span>Tap to Enlarge</span>
                        </div>
                      </div>

                      {/* Print Quality Notice */}
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-700 text-center flex items-center justify-center gap-2">
                          <span className="text-lg">✨</span>
                          <span>
                            <strong>Professional Print Quality:</strong> Actual prints are significantly sharper and more vibrant than screen preview. Our DTF transfers deliver 100% true-to-design quality with exceptional detail and color accuracy.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Enlarged Modal for Mobile */}
                  {showEnlargedModal && (
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                      onClick={() => setShowEnlargedModal(false)}
                    >
                      <div className="relative max-w-full max-h-full">
                        <button
                          onClick={() => setShowEnlargedModal(false)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition font-bold shadow-lg z-10"
                        >
                          ×
                        </button>
                        <img
                          src={imageUrl}
                          alt="Enlarged design"
                          className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <div className="text-center mt-4 text-white text-sm">
                          Pinch to zoom • Swipe to pan
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mockup type selector */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShowMockup(!showMockup)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition text-sm ${
                        showMockup
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {showMockup ? "🖼️ Back to Design View" : "👕 Preview on Apparel"}
                    </button>
                  </div>
                  {showMockup && (
                    <>
                      {detectedAudience === "baby" ? (
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setMockupType("onesie")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "onesie"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👶 Onesie
                          </button>
                          <button
                            onClick={() => setMockupType("tshirt")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "tshirt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👕 Baby Tee
                          </button>
                          <button
                            onClick={() => setMockupType("hoodie")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "hoodie"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            🧥 Baby Hoodie
                          </button>
                        </div>
                      ) : detectedAudience === "kids" ? (
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setMockupType("tshirt")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "tshirt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👕 Kids Tee
                          </button>
                          <button
                            onClick={() => setMockupType("hoodie")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "hoodie"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            🧥 Kids Hoodie
                          </button>
                          <button
                            onClick={() => setMockupType("sweatshirt")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "sweatshirt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👔 Kids Sweatshirt
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setMockupType("tshirt")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "tshirt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👕 T-Shirt
                          </button>
                          <button
                            onClick={() => setMockupType("hoodie")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "hoodie"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            🧥 Hoodie
                          </button>
                          <button
                            onClick={() => setMockupType("sweatshirt")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "sweatshirt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            👔 Sweatshirt
                          </button>
                          <button
                            onClick={() => setMockupType("hat")}
                            className={`py-2 px-3 rounded-lg font-medium transition ${
                              mockupType === "hat"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            🧢 Hat
                          </button>
                        </div>
                      )}
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>💡 Detected:</strong> {detectedAudience === "baby" ? "Baby" : detectedAudience === "kids" ? "Kids" : "Adult"} design - Showing appropriate product sizes
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!uploadedImage && prompt && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Edit & Regenerate
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Modify your prompt to regenerate the design..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      onClick={generateImage}
                      disabled={loading || !prompt.trim()}
                      className="w-full mt-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && processingType === "generate" ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Regenerating...
                        </>
                      ) : (
                        <>
                          🔄 Regenerate 3 New Designs
                        </>
                      )}
                    </button>
                  </div>
                )}


                {/* Selected Designs for Printing */}
                {selectedDesigns.length > 0 && (
                  <div className="mt-6 border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      ✓ Selected for Printing ({selectedDesigns.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {selectedDesigns.map((design, index) => (
                        <div key={index} className="relative group">
                          <div 
                            className="border-2 border-blue-600 rounded-lg overflow-hidden cursor-pointer hover:border-blue-800 transition"
                            onClick={() => setExpandedDesign(design)}
                          >
                            <img
                              src={design}
                              alt={`Selected design ${index + 1}`}
                              className="w-full h-auto"
                            />
                          </div>
                          <button
                            onClick={() => setSelectedDesigns(selectedDesigns.filter(d => d !== design))}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition text-sm font-bold shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700">
                      Click on a thumbnail to expand • Click × to remove from selection
                    </p>
                  </div>
                )}

                {/* Expanded Design Modal */}
                {expandedDesign && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setExpandedDesign(null)}
                  >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-4">
                      <button
                        onClick={() => setExpandedDesign(null)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition font-bold shadow-lg z-10"
                      >
                        ×
                      </button>
                      <img
                        src={expandedDesign}
                        alt="Expanded design"
                        className="w-full h-auto max-h-[85vh] object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Add to Print Selection Button */}
                {selectedDesigns.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        if (!selectedDesigns.includes(imageUrl)) {
                          setSelectedDesigns([...selectedDesigns, imageUrl]);
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 text-lg"
                    >
                      ✓ Add This Design to Print Selection
                    </button>
                  </div>
                )}

                {/* Size Selection Section */}
                {selectedDesigns.length > 0 && !showSizeSelection && (
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setShowSizeSelection(true);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg flex items-center justify-center gap-2 text-lg"
                    >
                      📏 Select Print Size
                    </button>
                  </div>
                )}

                {selectedDesigns.length > 0 && showSizeSelection && (
                  <div className="mt-6 border-2 border-green-500 rounded-lg p-6 bg-green-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      📏 Choose Your Print Size
                    </h3>
                    
                    {/* Size Type Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-300">
                      <button
                        onClick={() => setSizeType("custom")}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold transition border-b-2 ${
                          sizeType === "custom"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <span className="text-xl">📐</span> Custom Size
                      </button>
                      <button
                        onClick={() => setSizeType("popular")}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold transition border-b-2 ${
                          sizeType === "popular"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <span className="text-xl">⭐</span> Popular Size
                      </button>
                    </div>

                    {/* Size Guide Link */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Need help?</strong> Check out our{" "}
                        <button className="text-blue-600 underline hover:text-blue-700 font-semibold">
                          Size Guide
                        </button>{" "}
                        for recommendations
                      </p>
                    </div>

                    {/* Custom Size Input */}
                    {sizeType === "custom" && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">
                          Choose a size your design will fit within (W×H in inches)
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Width (inches)
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => setCustomWidth(String(Math.max(1, parseFloat(customWidth) - 0.5)))}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                step="0.1"
                                min="1"
                                max="20"
                                className="flex-1 px-3 py-2 text-center focus:outline-none text-gray-900"
                              />
                              <button
                                onClick={() => setCustomWidth(String(Math.min(20, parseFloat(customWidth) + 0.5)))}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Height (inches)
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => setCustomHeight(String(Math.max(1, parseFloat(customHeight) - 0.5)))}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                step="0.1"
                                min="1"
                                max="20"
                                className="flex-1 px-3 py-2 text-center focus:outline-none text-gray-900"
                              />
                              <button
                                onClick={() => setCustomHeight(String(Math.min(20, parseFloat(customHeight) + 0.5)))}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Popular Size Dropdown */}
                    {sizeType === "popular" && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select a popular size
                        </label>
                        <select
                          value={selectedPopularSize}
                          onChange={(e) => setSelectedPopularSize(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                        >
                          {popularSizes.map((size) => (
                            <option key={size.value} value={size.value}>
                              {size.label} - ${size.price} each
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white w-48">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          className="flex-1 px-4 py-3 text-center focus:outline-none text-gray-900 font-semibold"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="mb-6 p-4 bg-white rounded-lg border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per piece:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${pricing.pricePerUnit} <span className="text-sm text-gray-500">ea</span>
                        </span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-600 text-sm font-semibold">Bulk discount:</span>
                          <span className="text-green-600 font-bold">{pricing.discount}% off</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-600">${pricing.total}</span>
                      </div>
                    </div>

                    {/* Bulk Discount Info */}
                    <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <p className="text-xs font-bold text-gray-900 mb-2">💰 Buy More & Save w/ Cumulative Discounts</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded ${quantity >= 15 ? 'bg-green-200 text-gray-900' : 'bg-white text-gray-900'}`}>
                          <span className="font-semibold">15-49 pcs:</span> 20% off
                        </div>
                        <div className={`p-2 rounded ${quantity >= 50 ? 'bg-green-200 text-gray-900' : 'bg-white text-gray-900'}`}>
                          <span className="font-semibold">50-99 pcs:</span> 30% off
                        </div>
                        <div className={`p-2 rounded ${quantity >= 100 ? 'bg-green-200 text-gray-900' : 'bg-white text-gray-900'}`}>
                          <span className="font-semibold">100-249 pcs:</span> 40% off
                        </div>
                        <div className={`p-2 rounded ${quantity >= 250 ? 'bg-green-200 text-gray-900' : 'bg-white text-gray-900'}`}>
                          <span className="font-semibold">250+ pcs:</span> 50% off
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowSizeSelection(false)}
                        className="bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          setShowUnifiedShop(true);
                        }}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg"
                      >
                        Continue to Apparel Selection →
                      </button>
                    </div>
                  </div>
                )}

                {/* UNIFIED SHOPPING MODAL - Everything in ONE place */}
                {showUnifiedShop && (
                  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
                      <div className="w-full max-w-7xl bg-white rounded-lg md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-4">
                        {/* LEFT SIDE - LIVE PREVIEW */}
                        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8 flex flex-col">
                          <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white">Live Preview</h2>
                            <button
                              onClick={() => setShowUnifiedShop(false)}
                              className="text-white hover:text-gray-300 text-3xl font-bold"
                            >
                              ×
                            </button>
                          </div>

                          {/* Front/Back Toggle */}
                          {selectedApparel && (
                            <div className="flex gap-2 mb-4 md:mb-6">
                              <button
                                onClick={() => setShowApparelView("front")}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                                  showApparelView === "front"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                👉 Front View
                              </button>
                              <button
                                onClick={() => setShowApparelView("back")}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                                  showApparelView === "back"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                👈 Back View
                              </button>
                            </div>
                          )}

                          {/* Live Apparel Preview with Design */}
                          <div className="flex-1 flex items-center justify-center min-h-[300px] md:min-h-0">
                            {selectedApparel ? (
                              <div className="relative">
                                {/* Apparel Base */}
                                <div 
                                  className="w-64 h-64 md:w-96 md:h-96 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden"
                                  style={{ 
                                    backgroundColor: selectedApparel.color.toLowerCase() === 'white' ? '#f3f4f6' : 
                                                   selectedApparel.color.toLowerCase() === 'black' ? '#1f2937' :
                                                   selectedApparel.color.toLowerCase()
                                  }}
                                >
                                  {/* Apparel Icon/Shape */}
                                  <div className="text-6xl md:text-9xl opacity-20">
                                    {selectedApparel.type === "tshirt" ? "👕" : 
                                     selectedApparel.type === "hoodie" ? "🧥" : 
                                     selectedApparel.type === "onesie" ? "👶" : "👔"}
                                  </div>

                                  {/* Design Placement - Real-time Preview */}
                                  {selectedDesigns[0] && (
                                    <div 
                                      className="absolute"
                                      style={{
                                        top: printPlacement === "front" || printPlacement === "back" ? "50%" :
                                             printPlacement === "breast-left" || printPlacement === "breast-right" ? "30%" : "50%",
                                        left: printPlacement === "breast-left" ? "25%" :
                                              printPlacement === "breast-right" ? "75%" : "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: printPlacement === "front" || printPlacement === "back" ? "60%" : "25%",
                                        maxWidth: "250px"
                                      }}
                                    >
                                      <img
                                        src={selectedDesigns[0]}
                                        alt="Design preview"
                                        className="w-full h-auto object-contain"
                                        style={{
                                          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                                        }}
                                      />
                                      <div className="text-center mt-2 text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                                        {sizeType === 'popular' ? popularSizes.find(s => s.value === selectedPopularSize)?.label : `${customWidth}" × ${customHeight}"`}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* View Indicator */}
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                  {showApparelView === "front" ? "Front View" : "Back View"}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-gray-400">
                                <div className="text-8xl mb-4">👕</div>
                                <p className="text-xl">Select an apparel item to preview</p>
                              </div>
                            )}
                          </div>

                          {/* Placement Quick Info */}
                          {selectedApparel && (
                            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800 rounded-lg">
                              <p className="text-white text-xs md:text-sm">
                                <strong>Current View:</strong> {selectedApparel.color} {selectedApparel.name} • Size {selectedApparel.size}
                                <br />
                                <strong>Design Placement:</strong> {printPlacement === "front" ? "Front Center" : 
                                                                     printPlacement === "back" ? "Back Center" :
                                                                     printPlacement === "breast-left" ? "Left Breast" : "Right Breast"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT SIDE - CUSTOMIZATION CONTROLS */}
                        <div className="w-full md:w-1/2 overflow-y-auto p-4 md:p-8 max-h-[60vh] md:max-h-none">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                            🎨 Customize Your Order
                          </h2>

                          {/* Step 1: Select Apparel */}
                          <div className="mb-6 md:mb-8">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                              <span className="bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">1</span>
                              Choose Apparel
                            </h3>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                              {apparelCatalog.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedApparel({
                                      id: item.id,
                                      name: item.name,
                                      type: item.type,
                                      basePrice: item.basePrice,
                                      color: item.colors[0],
                                      size: item.sizes[Math.floor(item.sizes.length / 2)],
                                      quantity: 1
                                    });
                                  }}
                                  className={`p-4 border-2 rounded-lg transition text-left ${
                                    selectedApparel?.id === item.id
                                      ? "border-blue-600 bg-blue-50"
                                      : "border-gray-300 hover:border-blue-400"
                                  }`}
                                >
                                  <div className="text-3xl md:text-4xl mb-2">
                                    {item.type === "tshirt" ? "👕" : item.type === "hoodie" ? "🧥" : item.type === "onesie" ? "👶" : "👔"}
                                  </div>
                                  <div className="font-bold text-xs md:text-sm text-gray-900">{item.name}</div>
                                  <div className="text-green-600 font-bold text-sm md:text-base">${item.basePrice}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Step 2: Select Color */}
                          {selectedApparel && (
                            <div className="mb-6 md:mb-8">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">2</span>
                                Choose Color
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {apparelCatalog.find(item => item.id === selectedApparel.id)?.colors.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setSelectedApparel({...selectedApparel, color})}
                                    className={`px-3 md:px-4 py-2 rounded-lg border-2 transition font-semibold text-xs md:text-sm ${
                                      selectedApparel.color === color
                                        ? "border-blue-600 bg-blue-50 text-blue-900"
                                        : "border-gray-300 hover:border-blue-400 text-gray-900"
                                    }`}
                                  >
                                    {color}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step 3: Select Size */}
                          {selectedApparel && (
                            <div className="mb-6 md:mb-8">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">3</span>
                                Choose Size
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {apparelCatalog.find(item => item.id === selectedApparel.id)?.sizes.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => setSelectedApparel({...selectedApparel, size})}
                                    className={`px-3 md:px-4 py-2 rounded-lg border-2 transition font-semibold text-xs md:text-sm ${
                                      selectedApparel.size === size
                                        ? "border-blue-600 bg-blue-50 text-blue-900"
                                        : "border-gray-300 hover:border-blue-400 text-gray-900"
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step 4: Design Placement */}
                          {selectedApparel && (
                            <div className="mb-6 md:mb-8">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">4</span>
                                Design Placement
                              </h3>
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {(["front", "back", "breast-left", "breast-right"] as const).map((placement) => (
                                  <button
                                    key={placement}
                                    onClick={() => {
                                      setPrintPlacement(placement);
                                      if (placement === "back") {
                                        setShowApparelView("back");
                                      } else {
                                        setShowApparelView("front");
                                      }
                                    }}
                                    className={`p-3 md:p-4 border-2 rounded-lg transition ${
                                      printPlacement === placement
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-300 hover:border-blue-400"
                                    }`}
                                  >
                                    <div className="text-2xl md:text-3xl mb-1">
                                      {placement === "front" ? "👉" : placement === "back" ? "👈" : "📌"}
                                    </div>
                                    <div className="font-semibold text-xs md:text-sm text-gray-900">
                                      {placement === "front" ? "Front" : 
                                       placement === "back" ? "Back" :
                                       placement === "breast-left" ? "Left Breast" : "Right Breast"}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step 5: Quantity */}
                          {selectedApparel && (
                            <div className="mb-6 md:mb-8">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">5</span>
                                Quantity
                              </h3>
                              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white w-full max-w-[200px]">
                                <button
                                  onClick={() => setSelectedApparel({...selectedApparel, quantity: Math.max(1, selectedApparel.quantity - 1)})}
                                  className="px-3 md:px-4 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 transition font-bold text-gray-900"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={selectedApparel.quantity}
                                  onChange={(e) => setSelectedApparel({...selectedApparel, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                                  min="1"
                                  className="flex-1 px-2 md:px-4 py-2 md:py-3 text-center focus:outline-none text-gray-900 font-semibold text-sm md:text-base"
                                />
                                <button
                                  onClick={() => setSelectedApparel({...selectedApparel, quantity: selectedApparel.quantity + 1})}
                                  className="px-3 md:px-4 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 transition font-bold text-gray-900"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Order Summary & Checkout */}
                          {selectedApparel && (
                            <div className="border-t pt-4 md:pt-6">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Order Summary</h3>
                              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                                <div className="flex justify-between mb-2 text-sm md:text-base">
                                  <span>DTF Transfer ({quantity}x)</span>
                                  <span className="font-bold">${pricing.total}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm md:text-base">
                                  <span className="text-sm">{selectedApparel.name} ({selectedApparel.quantity}x)</span>
                                  <span className="font-bold">${(selectedApparel.basePrice * selectedApparel.quantity).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                  <span className="text-base md:text-lg font-bold">Total:</span>
                                  <span className="text-xl md:text-2xl font-bold text-green-600">
                                    ${(pricing.total + (selectedApparel.basePrice * selectedApparel.quantity)).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setShowUnifiedShop(false);
                                  alert("Proceeding to checkout...");
                                }}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 md:py-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg text-base md:text-lg"
                              >
                                Proceed to Checkout 🛒
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Apparel Customization Modal (Color/Size/Qty FIRST) */}
                {showPlacementSelector && selectedApparel && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 py-8">
                      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">🎨 Customize Your {selectedApparel.name}</h2>
                        
                        <div className="mb-8">
                          {/* Color selector */}
                          <div className="mb-6">
                            <label className="block font-bold text-gray-900 mb-3 text-lg">Color:</label>
                            <div className="flex flex-wrap gap-3">
                              {apparelCatalog.find(item => item.id === selectedApparel.id)?.colors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedApparel({...selectedApparel, color})}
                                  className={`px-6 py-3 rounded-lg border-2 transition font-semibold ${
                                    selectedApparel.color === color
                                      ? "border-blue-600 bg-blue-50 text-blue-900"
                                      : "border-gray-300 hover:border-blue-400 text-gray-900"
                                  }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Size selector */}
                          <div className="mb-6">
                            <label className="block font-bold text-gray-900 mb-3 text-lg">Size:</label>
                            <div className="flex flex-wrap gap-3">
                              {apparelCatalog.find(item => item.id === selectedApparel.id)?.sizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedApparel({...selectedApparel, size})}
                                  className={`px-6 py-3 rounded-lg border-2 transition font-semibold ${
                                    selectedApparel.size === size
                                      ? "border-blue-600 bg-blue-50 text-blue-900"
                                      : "border-gray-300 hover:border-blue-400 text-gray-900"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quantity selector */}
                          <div className="mb-6">
                            <label className="block font-bold text-gray-900 mb-3 text-lg">Quantity:</label>
                            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white w-48">
                              <button
                                onClick={() => setSelectedApparel({...selectedApparel, quantity: Math.max(1, selectedApparel.quantity - 1)})}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold text-gray-900"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={selectedApparel.quantity}
                                onChange={(e) => setSelectedApparel({...selectedApparel, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                                min="1"
                                className="flex-1 px-4 py-3 text-center focus:outline-none text-gray-900 font-semibold"
                              />
                              <button
                                onClick={() => setSelectedApparel({...selectedApparel, quantity: selectedApparel.quantity + 1})}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold text-gray-900"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Current Selection Summary */}
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-900 font-semibold">
                              <strong>Selected:</strong> {selectedApparel.color} {selectedApparel.name} • Size {selectedApparel.size} • Quantity: {selectedApparel.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              setShowPlacementSelector(false);
                              setSelectedApparel(null);
                            }}
                            className="bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                          >
                            ← Back to Apparel
                          </button>
                          <button
                            onClick={() => {
                              setShowPlacementSelector(false);
                              setShowFinalPreview(true);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                          >
                            Choose Print Placement →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Print Placement Selector Modal (AFTER color/size selection) */}
                {showFinalPreview && selectedApparel && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 py-8">
                      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">📍 Where should we place your design?</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {(["front", "back", "breast-left", "breast-right"] as const).map((placement) => (
                            <button
                              key={placement}
                              onClick={() => setPrintPlacement(placement)}
                              className={`p-6 border-2 rounded-lg transition ${
                                printPlacement === placement
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-300 hover:border-blue-400"
                              }`}
                            >
                              <div className="text-4xl mb-2">
                                {placement === "front" ? "👉" : placement === "back" ? "👈" : "📌"}
                              </div>
                              <div className="font-semibold text-gray-900">
                                {placement === "front" ? "Front Center" : 
                                 placement === "back" ? "Back Center" :
                                 placement === "breast-left" ? "Left Breast" : "Right Breast"}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Selected Details Summary */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-900">
                            <strong>Your Selection:</strong> {selectedApparel.color} {selectedApparel.name} • Size {selectedApparel.size} • Qty: {selectedApparel.quantity}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              setShowFinalPreview(false);
                              setShowPlacementSelector(true);
                            }}
                            className="bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                          >
                            ← Back to Customization
                          </button>
                          <button
                            onClick={() => {
                              setShowCheckout(true);
                            }}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg"
                          >
                            Preview & Checkout →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Checkout Modal */}
                {showCheckout && selectedApparel && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 py-8">
                      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">✅ Final Preview & Checkout</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          {/* Preview */}
                          <div>
                            <h3 className="text-xl font-bold mb-4">Your Custom Design</h3>
                            <div className="border-2 rounded-lg p-6 bg-gray-50">
                              <div className="bg-gray-200 rounded-lg p-8 mb-4 flex items-center justify-center" style={{ height: "300px" }}>
                                <div className="text-center">
                                  <div className="text-6xl mb-4">
                                    {selectedApparel.type === "tshirt" ? "👕" : selectedApparel.type === "hoodie" ? "🧥" : selectedApparel.type === "onesie" ? "👶" : "👔"}
                                  </div>
                                  <div className="relative inline-block">
                                    <img src={selectedDesigns[0]} alt="Design" className="max-w-[150px] max-h-[150px] object-contain border-2 border-blue-500 rounded" />
                                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                      {printPlacement === "front" ? "Front" : printPlacement === "back" ? "Back" : printPlacement === "breast-left" ? "Left" : "Right"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700">
                                <p><strong>Apparel:</strong> {selectedApparel.name}</p>
                                <p><strong>Color:</strong> {selectedApparel.color}</p>
                                <p><strong>Size:</strong> {selectedApparel.size}</p>
                                <p><strong>Placement:</strong> {printPlacement.replace("-", " ").toUpperCase()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div>
                            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                            <div className="border-2 rounded-lg p-6">
                              {/* DTF Transfer */}
                              <div className="mb-4 pb-4 border-b">
                                <div className="flex justify-between mb-2">
                                  <span>DTF Transfer ({quantity}x)</span>
                                  <span className="font-bold">${pricing.total}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Size: {sizeType === 'popular' ? popularSizes.find(s => s.value === selectedPopularSize)?.label : `${customWidth}" × ${customHeight}"`}
                                </div>
                              </div>

                              {/* Apparel */}
                              <div className="mb-4 pb-4 border-b">
                                <div className="flex justify-between mb-2">
                                  <span>{selectedApparel.name} ({selectedApparel.quantity}x)</span>
                                  <span className="font-bold">${(selectedApparel.basePrice * selectedApparel.quantity).toFixed(2)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {selectedApparel.color} • Size {selectedApparel.size}
                                </div>
                              </div>

                              {/* Shipping */}
                              <div className="mb-4 pb-4 border-b">
                                <div className="flex justify-between">
                                  <span>Shipping (calculated at checkout)</span>
                                  <span className="font-bold">TBD</span>
                                </div>
                              </div>

                              {/* Total */}
                              <div className="mb-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-xl font-bold">Total:</span>
                                  <span className="text-3xl font-bold text-green-600">
                                    ${(pricing.total + (selectedApparel.basePrice * selectedApparel.quantity)).toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">+ shipping (calculated at checkout)</p>
                              </div>

                              <div className="space-y-3">
                                <button
                                  onClick={() => alert("Proceeding to checkout... (Shipping address collection would happen here)")}
                                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg text-lg"
                                >
                                  Proceed to Checkout 🛒
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCheckout(false);
                                    setShowFinalPreview(true);
                                  }}
                                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                  ← Back to Placement
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>🎉 Almost there!</strong> Review your order above. Shipping cost will be calculated based on your delivery address at checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showApparelMarketplace && !showPlacementSelector && !showFinalPreview && !showCheckout && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>📋 Next Steps:</strong>
                      <br />1. Review your design variations
                      <br />2. Preview on mockups to see final look
                      <br />3. Select your preferred print size
                      <br />4. Choose quantity and proceed to checkout
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-500 text-lg font-medium">
                    Your design will appear here
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Generate with AI or upload your own design
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
