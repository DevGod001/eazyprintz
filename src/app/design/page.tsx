"use client";

import { useState } from "react";
import Link from "next/link";

export default function DesignPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processingType, setProcessingType] = useState<"generate" | "optimize" | "remove-bg" | null>(null);

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
    setUploadedImage(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to generate image"}`);
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      if (error.name === 'AbortError') {
        alert("Request timed out. The AI model may be loading. Please try again.");
      } else {
        alert("Failed to generate image. Please check your connection and try again.");
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

            {imageUrl ? (
              <div>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 mb-4">
                  <img
                    src={imageUrl}
                    alt="Design preview"
                    className="w-full h-auto"
                  />
                </div>

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
                    <br />1. Review your design
                    <br />2. Optimize for best DTF print quality
                    <br />3. Remove background if needed
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
