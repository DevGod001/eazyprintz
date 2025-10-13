"use client";

import { useState } from 'react';
import { categories } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/data/products';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductSelectionModal({ isOpen, onClose, onSelectProduct }: ProductSelectionModalProps) {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-10 rounded-t-lg">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-gray-900">🛍️ Select Your Apparel</h1>
                
                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-8">
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

                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                  ×
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
          </div>

          {/* Product Grid */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.name || 'All Products'}
              </h2>
              <p className="text-gray-600">{filteredProducts.length} products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  {/* Product Image */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center overflow-hidden">
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
                          onSelectProduct(product);
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
          </div>
        </div>
      </div>
    </div>
  );
}
