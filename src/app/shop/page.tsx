"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { products, categories } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSelectionMode = searchParams.get('mode') === 'selection';
  const returnTo = searchParams.get('returnTo');
  const printSize = searchParams.get('printSize');
  const printQuantity = searchParams.get('quantity');
  const placement = searchParams.get('placement');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (product: typeof products[0], color: string, size: string, qty: number) => {
    addToCart({
      id: '',
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      color,
      size,
      quantity: qty,
      image: product.images[0],
      type: product.category,
    });
    setSelectedProduct(null);
    setShowCart(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="TWO KINGS CO." className="h-24 md:h-32 w-auto object-contain" style={{ imageRendering: 'crisp-edges' }} />
            </Link>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <span className="text-3xl">🛒</span>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>

          {/* Category Navigation */}
          <nav className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Selection Mode Banner */}
      {isSelectionMode && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">🎨 Select Apparel for Your Custom Design</p>
                <p className="text-sm opacity-90">Choose the product you want to print your design on</p>
              </div>
              <Link
                href={`/${returnTo || ''}`}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                ← Cancel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {categories.find(c => c.id === selectedCategory)?.name || 'All Products'}
          </h1>
          <p className="text-gray-600">{filteredProducts.length} products</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setModalImageIndex(0);
                setSelectedColor(product.colors[0].name);
                setSelectedSize(product.sizes[0]);
                setQuantity(1);
              }}
            >
              {/* Product Image */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center overflow-hidden group">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.emoji-fallback')) {
                      const emoji = document.createElement('span');
                      emoji.className = 'emoji-fallback text-6xl';
                      emoji.textContent = product.category === 'tshirts' ? '👕' :
                                        product.category === 'hoodies' ? '🧥' :
                                        product.category === 'sweatshirts' ? '👔' :
                                        product.category === 'polos' ? '👕' :
                                        product.category === 'baby' ? '👶' : '👕';
                      parent.appendChild(emoji);
                    }
                  }}
                />
                {product.topSeller && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                    ⭐ Top Seller
                  </span>
                )}
                {product.featured && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {/* Image count indicator for products with multiple images */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                    📷 {product.images.length}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase">{product.brand}</p>
                <h3 className="font-bold text-gray-900 mt-1 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.reviews})</span>
                </div>

                {/* Colors */}
                <div className="flex gap-1 mb-3">
                  {product.colors.slice(0, 6).map(color => (
                    <div
                      key={color.name}
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                  {product.colors.length > 6 && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs">
                      +{product.colors.length - 6}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.basePrice}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                      setModalImageIndex(0);
                      setSelectedColor(product.colors[0].name);
                      setSelectedSize(product.sizes[0]);
                      setQuantity(1);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase">{selectedProduct.brand}</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(selectedProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({selectedProduct.reviews} reviews)</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image Carousel */}
                <div>
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedProduct.images[modalImageIndex]}
                      alt={`${selectedProduct.name} - Image ${modalImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.emoji-fallback')) {
                          const emoji = document.createElement('span');
                          emoji.className = 'emoji-fallback text-9xl';
                          emoji.textContent = selectedProduct.category === 'tshirts' ? '👕' :
                                            selectedProduct.category === 'hoodies' ? '🧥' :
                                            selectedProduct.category === 'sweatshirts' ? '👔' :
                                            selectedProduct.category === 'polos' ? '👕' :
                                            selectedProduct.category === 'baby' ? '👶' : '👕';
                          parent.appendChild(emoji);
                        }
                      }}
                    />
                    
                    {/* Navigation Arrows - Only show if multiple images */}
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex((prev) => 
                              prev === 0 ? selectedProduct.images.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition"
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex((prev) => 
                              prev === selectedProduct.images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition"
                        >
                          ›
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm font-bold px-3 py-1 rounded">
                          {modalImageIndex + 1} / {selectedProduct.images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Navigation - Only show if multiple images */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setModalImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition ${
                            modalImageIndex === idx
                              ? 'border-blue-600 ring-2 ring-blue-300'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Options */}
                <div>
                  <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                  
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Details:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Fabric: {selectedProduct.fabric}</li>
                      {selectedProduct.weight && <li>• Weight: {selectedProduct.weight}</li>}
                      <li>• Available in {selectedProduct.colors.length} colors</li>
                      <li>• {selectedProduct.sizes.length} sizes available</li>
                    </ul>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color: {selectedColor}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map(color => (
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
                      {selectedProduct.sizes.map(size => (
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
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${(selectedProduct.basePrice * quantity).toFixed(2)}
                      </span>
                    </div>
                    {isSelectionMode ? (
                      <button
                        onClick={() => {
                          // Store selection data in localStorage to pass back to design page
                          localStorage.setItem('selectedApparel', JSON.stringify({
                            id: selectedProduct.id,
                            name: selectedProduct.name,
                            type: selectedProduct.category,
                            basePrice: selectedProduct.basePrice,
                            color: selectedColor,
                            size: selectedSize,
                            quantity: quantity,
                            brand: selectedProduct.brand,
                            fabric: selectedProduct.fabric,
                          }));
                          // Return to design page
                          router.push(`/${returnTo || 'design'}`);
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition"
                      >
                        ✓ Select This Product & Continue
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(selectedProduct, selectedColor, selectedSize, quantity)}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                      >
                        Add to Cart 🛒
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl">🛒</span>
                  <p className="text-gray-500 mt-4">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex gap-4">
                          <div className="bg-gray-100 rounded-lg w-20 h-20 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">
                              {item.type === 'tshirts' ? '👕' :
                               item.type === 'hoodies' ? '🧥' :
                               item.type === 'sweatshirts' ? '👔' :
                               item.type === 'baby' ? '�' : '👕'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.color} • {item.size}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 rounded font-bold text-sm"
                              >
                                −
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-200 rounded font-bold text-sm"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-red-600 text-sm font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition">
                      Proceed to Checkout 🚀
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
