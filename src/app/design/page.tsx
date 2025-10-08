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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setImageUrl(event.target?.result as string);
        setPrompt("");
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

  const optimizeForDTF = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setProcessingType("optimize");

    try {
      const response = await fetch("/api/optimize-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to optimize image"}`);
      }
    } catch (error) {
      console.error("Optimization error:", error);
      alert("Failed to optimize image. Please try again.");
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
      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to remove background"}`);
      }
    } catch (error) {
      console.error("Background removal error:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setLoading(false);
      setProcessingType(null);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "dtf-design.png";
    link.click();
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

                <div className="space-y-3">
                  <button
                    onClick={optimizeForDTF}
                    disabled={loading || !imageUrl}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && processingType === "optimize" ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Optimizing...
                      </>
                    ) : (
                      <>
                        ⚡ Optimize for DTF
                      </>
                    )}
                  </button>

                  <button
                    onClick={removeBackground}
                    disabled={loading || !imageUrl}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && processingType === "remove-bg" ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Removing Background...
                      </>
                    ) : (
                      <>
                        🔲 Remove Background
                      </>
                    )}
                  </button>
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
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Design Preview</h2>

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
                    <div className="relative bg-gray-100 p-4">
                      <div className="relative mx-auto" style={{ maxWidth: "400px" }}>
                        {mockupType === "tshirt" && (
                          <div className="relative">
                            <div className="w-full bg-white rounded-lg shadow-lg p-8">
                              <div className="text-center mb-4 text-gray-600">👕 T-Shirt Preview</div>
                              <div className="relative bg-gray-800 rounded-lg p-8 flex items-center justify-center" style={{ minHeight: "300px" }}>
                                <img
                                  src={imageUrl}
                                  alt="Design on t-shirt"
                                  className="max-w-full max-h-64 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {mockupType === "hoodie" && (
                          <div className="relative">
                            <div className="w-full bg-white rounded-lg shadow-lg p-8">
                              <div className="text-center mb-4 text-gray-600">🧥 Hoodie Preview</div>
                              <div className="relative bg-gray-700 rounded-lg p-8 flex items-center justify-center" style={{ minHeight: "300px" }}>
                                <img
                                  src={imageUrl}
                                  alt="Design on hoodie"
                                  className="max-w-full max-h-64 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {mockupType === "sweatshirt" && (
                          <div className="relative">
                            <div className="w-full bg-white rounded-lg shadow-lg p-8">
                              <div className="text-center mb-4 text-gray-600">👔 Sweatshirt Preview</div>
                              <div className="relative bg-gray-600 rounded-lg p-8 flex items-center justify-center" style={{ minHeight: "300px" }}>
                                <img
                                  src={imageUrl}
                                  alt="Design on sweatshirt"
                                  className="max-w-full max-h-64 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {mockupType === "onesie" && (
                          <div className="relative">
                            <div className="w-full bg-white rounded-lg shadow-lg p-8">
                              <div className="text-center mb-4 text-gray-600">👶 Baby Onesie Preview</div>
                              <div className="relative bg-pink-100 rounded-lg p-8 flex items-center justify-center" style={{ minHeight: "300px" }}>
                                <img
                                  src={imageUrl}
                                  alt="Design on baby onesie"
                                  className="max-w-full max-h-64 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {mockupType === "hat" && (
                          <div className="relative">
                            <div className="w-full bg-white rounded-lg shadow-lg p-8">
                              <div className="text-center mb-4 text-gray-600">🧢 Hat Preview</div>
                              <div className="relative bg-gray-900 rounded-full p-12 flex items-center justify-center mx-auto" style={{ maxWidth: "280px", height: "280px" }}>
                                <img
                                  src={imageUrl}
                                  alt="Design on hat"
                                  className="max-w-full max-h-32 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Design preview"
                      className="w-full h-auto"
                    />
                  )}
                </div>

                {/* Mockup type selector */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShowMockup(!showMockup)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                        showMockup
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {showMockup ? "👕 Mockup View" : "🖼️ Design View"}
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

                <div className="grid grid-cols-2 gap-3">
                  {!uploadedImage && (
                    <>
                      <button
                        onClick={optimizeForDTF}
                        disabled={loading}
                        className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                      >
                        ⚡ Optimize
                      </button>
                      <button
                        onClick={removeBackground}
                        disabled={loading}
                        className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
                      >
                        🔲 Remove BG
                      </button>
                    </>
                  )}
                  <button
                    onClick={downloadImage}
                    className="col-span-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    💾 Download Design
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>📋 Next Steps:</strong>
                    <br />1. Review your design variations
                    <br />2. Preview on mockups to see final look
                    <br />3. Optimize for best DTF print quality
                    <br />4. Download and send to production
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
    </div>
  );
}
