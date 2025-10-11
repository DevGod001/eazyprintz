"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductSelectionModal from "@/components/ProductSelectionModal";
import ProductPreviewModal, { ProductConfig } from "@/components/ProductPreviewModal";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

export default function DesignPage() {
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();
  
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processingType, setProcessingType] = useState<"generate" | "optimize" | "remove-bg" | null>(null);
  
  const [hasTransparency, setHasTransparency] = useState(false);
  
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [showProductPreview, setShowProductPreview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [showEnlargedModal, setShowEnlargedModal] = useState(false);

  const checkImageTransparency = (imageUrl: string) => {
    const img = new Image();
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

    try {
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
        checkImageTransparency(imageUrls[0]);
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
        checkImageTransparency(url);
        
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
      
      const bgRemovedHeader = response.headers.get('X-Background-Removed');
      console.log('X-Background-Removed header:', bgRemovedHeader);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob type:', blob.type);
        console.log('Received blob size:', blob.size);
        
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        checkImageTransparency(url);
        
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
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Lifewear Prints
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">DTF Design Studio</span>
              <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition">
                <span className="text-2xl">🛒</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                ← Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

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
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Design Input</h2>

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
                    <label htmlFor="file-upload" className="cursor-pointer">
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

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Design Preview</h2>
              
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
              <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0">
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
                  
                  <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500"
                      style={{ width: `${(generatedImages.length / 3) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-6 flex justify-center gap-4 text-3xl">
                    <span className="animate-float" style={{ animationDelay: "0s" }}>👕</span>
                    <span className="animate-float" style={{ animationDelay: "0.5s" }}>🧥</span>
                    <span className="animate-float" style={{ animationDelay: "1s" }}>👶</span>
                  </div>
                </div>
                
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

                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 mb-4">
                  <div className="relative">
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
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 pointer-events-none">
                        <span>🔍</span>
                        <span>Tap to Enlarge</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-700 text-center flex items-center justify-center gap-2">
                        <span className="text-lg">✨</span>
                        <span>
                          <strong>Professional Print Quality:</strong> Actual prints are significantly sharper and more vibrant than screen preview. Our DTF transfers deliver 100% true-to-design quality with exceptional detail and color accuracy.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

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

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowProductSelection(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-2 text-lg"
                  >
                    👕 Preview/Select Apparel
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>📋 Next Steps:</strong>
                    <br />1. Review your design variations
                    <br />2. Click "Preview/Select Apparel" to choose your product
                    <br />3. Customize size, placement, and quantity
                    <br />4. Add to cart and checkout
                  </p>
                </div>
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

      <ProductSelectionModal
        isOpen={showProductSelection}
        onClose={() => setShowProductSelection(false)}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          setShowProductSelection(false);
          setShowProductPreview(true);
        }}
      />

      <ProductPreviewModal
        isOpen={showProductPreview}
        product={selectedProduct}
        designUrl={imageUrl}
        onClose={() => {
          setShowProductPreview(false);
          setSelectedProduct(null);
        }}
        onChangeProduct={() => {
          setShowProductPreview(false);
          setShowProductSelection(true);
        }}
        onAddToCart={(config: ProductConfig) => {
          const cartItem = {
            id: `${config.product.id}-${Date.now()}`,
            productId: config.product.id,
            name: `${config.product.name} - Custom DTF Print`,
            price: config.dtfPrice + (config.product.basePrice * config.quantity),
            color: config.color,
            size: config.size,
            quantity: 1,
            image: config.product.images[0],
            type: 'custom-dtf',
            hasCustomPrint: true,
            designUrl: imageUrl,
            printPlacement: config.printPlacement,
            customPosition: config.customPosition,
            customScale: config.customScale,
            printSize: config.printSize,
            dtfQuantity: config.dtfQuantity,
          };
          
          addToCart(cartItem);
          setShowProductPreview(false);
          setSelectedProduct(null);
          
          router.push('/cart');
        }}
      />
    </div>
  );
}
