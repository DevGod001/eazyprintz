"use client";

import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/data/products';
import { Upload, X, Edit2, Trash2, Plus } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FF8C00' },
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Coral', hex: '#FF7F50' },
];

const CATEGORIES = ['tshirts', 'hoodies', 'sweatshirts', 'polos', 'kids', 'baby', 'accessories'] as const;
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'NB', '0-3M', '3-6M', '6-12M', '12-18M', '6M', '12M', '18M', '24M'];

export default function ProductsManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'tshirts',
    basePrice: 0,
    images: [],
    colors: [],
    sizes: [],
    brand: '',
    rating: 4.5,
    reviews: 0,
    fabric: '',
    weight: '',
    availableSizes: [],
    featured: false,
    topSeller: false,
  });

  const [imageFiles, setImageFiles] = useState<{
    main: string | null;
    front: string | null;
    back: string | null;
  }>({
    main: null,
    front: null,
    back: null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageFiles(prev => ({ ...prev, [type]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleColorToggle = (color: typeof PRESET_COLORS[0]) => {
    setFormData(prev => {
      const colors = prev.colors || [];
      const exists = colors.find(c => c.name === color.name);
      
      if (exists) {
        return {
          ...prev,
          colors: colors.filter(c => c.name !== color.name)
        };
      } else {
        return {
          ...prev,
          colors: [...colors, { ...color, available: true }]
        };
      }
    });
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => {
      const sizes = prev.sizes || [];
      if (sizes.includes(size)) {
        return {
          ...prev,
          sizes: sizes.filter(s => s !== size),
          availableSizes: (prev.availableSizes || []).filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...sizes, size],
          availableSizes: [...(prev.availableSizes || []), size]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare images array
    const images = [];
    if (imageFiles.main) images.push(imageFiles.main);
    if (imageFiles.front) images.push(imageFiles.front);
    if (imageFiles.back) images.push(imageFiles.back);

    const productData: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      category: formData.category || 'tshirts',
      basePrice: formData.basePrice || 0,
      images: images.length > 0 ? images : editingProduct?.images || [],
      colors: formData.colors || [],
      sizes: formData.sizes || [],
      brand: formData.brand || '',
      rating: formData.rating || 4.5,
      reviews: formData.reviews || 0,
      fabric: formData.fabric || '',
      weight: formData.weight || '',
      availableSizes: formData.availableSizes || [],
      featured: formData.featured || false,
      topSeller: formData.topSeller || false,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      showToast('Product updated successfully! ✓', 'success');
    } else {
      addProduct(productData);
      showToast('Product added successfully! ✓', 'success');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'tshirts',
      basePrice: 0,
      images: [],
      colors: [],
      sizes: [],
      brand: '',
      rating: 4.5,
      reviews: 0,
      fabric: '',
      weight: '',
      availableSizes: [],
      featured: false,
      topSeller: false,
    });
    setImageFiles({ main: null, front: null, back: null });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setImageFiles({
      main: product.images[0] || null,
      front: product.images[1] || null,
      back: product.images[2] || null,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      showToast('Product deleted successfully! ✓', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="text-lg font-semibold">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Product Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add New Product</span>
            <span className="sm:hidden">Add Product</span>
          </button>
        </div>
      </div>

      {/* Product List - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold">Product</th>
              <th className="text-left p-4 font-semibold">Category</th>
              <th className="text-left p-4 font-semibold">Price</th>
              <th className="text-left p-4 font-semibold">Colors</th>
              <th className="text-left p-4 font-semibold">Sizes</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 capitalize">{product.category}</td>
                <td className="p-4">${product.basePrice.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {product.colors.slice(0, 5).map((color) => (
                      <div
                        key={color.name}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                    {product.colors.length > 5 && (
                      <span className="text-xs text-gray-600">+{product.colors.length - 5}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm">{product.sizes.length} sizes</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product List - Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-3 mb-3">
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">${product.basePrice.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-semibold capitalize">{product.category}</p>
              </div>
              <div>
                <span className="text-gray-600">Sizes:</span>
                <p className="font-semibold">{product.sizes.length} available</p>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm text-gray-600">Colors:</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fabric *</label>
                      <input
                        type="text"
                        value={formData.fabric}
                        onChange={(e) => setFormData(prev => ({ ...prev, fabric: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                        placeholder="100% Cotton"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400"
                        placeholder="5.3 oz"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.topSeller}
                        onChange={(e) => setFormData(prev => ({ ...prev, topSeller: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-700">Top Seller</span>
                    </label>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Image Uploads */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Images (White/Neutral Base) *</label>
                    <div className="space-y-3">
                      {['main', 'front', 'back'].map((type) => (
                        <div key={type} className="border rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2 capitalize">{type} Image</p>
                          {imageFiles[type as keyof typeof imageFiles] ? (
                            <div className="relative">
                              <img
                                src={imageFiles[type as keyof typeof imageFiles]!}
                                alt={type}
                                className="w-full h-32 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setImageFiles(prev => ({ ...prev, [type]: null }))}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                              <Upload size={24} className="text-gray-400" />
                              <span className="text-xs text-gray-500 mt-2">Upload {type}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, type as any)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Colors */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Available Colors *</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition ${
                        formData.colors?.some(c => c.name === color.name)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium text-center">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Sizes */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Available Sizes *</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
                        formData.sizes?.includes(size)
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
