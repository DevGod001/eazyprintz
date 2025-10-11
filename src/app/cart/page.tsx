"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cart.length === 0) {
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
                <Link
                  href="/design"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Design Studio
                </Link>
                <Link
                  href="/shop"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Shop
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Empty Cart */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Start designing your custom DTF prints or browse our shop!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/design"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                🎨 Design Studio
              </Link>
              <Link
                href="/shop"
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                🛍️ Browse Shop
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <Link
                href="/design"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Design Studio
              </Link>
              <Link
                href="/shop"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Shop
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-semibold transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-4"
              >
                {/* Product Image with Design Overlay */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Design Overlay */}
                  {item.hasCustomPrint && item.designUrl && (
                    <div
                      className="absolute"
                      style={{
                        top: item.printPlacement === 'custom' && item.customPosition 
                          ? `${item.customPosition.y}%`
                          : item.printPlacement === 'front' || item.printPlacement === 'back' ? '30%' : '25%',
                        left: item.printPlacement === 'custom' && item.customPosition
                          ? `${item.customPosition.x}%`
                          : item.printPlacement === 'breast-left' ? '30%'
                          : item.printPlacement === 'breast-right' ? '70%' : '50%',
                        transform: 'translate(-50%, -50%)',
                        width: item.printPlacement === 'custom' && item.customScale
                          ? `${item.customScale}%`
                          : item.printPlacement === 'front' || item.printPlacement === 'back' ? '40%' : '20%',
                        zIndex: 5
                      }}
                    >
                      <img
                        src={item.designUrl}
                        alt="Design"
                        className="w-full h-auto object-contain pointer-events-none"
                        style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.15))' }}
                      />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Color: {item.color}</span>
                        <span>Size: {item.size}</span>
                      </div>
                      {item.hasCustomPrint && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ✨ Custom DTF Print
                          </span>
                          {item.designUrl && (
                            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-300 overflow-hidden">
                              <img
                                src={item.designUrl}
                                alt="Design"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} each
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg mb-3">
                Proceed to Checkout
              </button>

              <Link
                href="/design"
                className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>📦 Free Shipping</strong> on orders over $50
                  <br />
                  <strong>💳 Secure Checkout</strong> with SSL encryption
                  <br />
                  <strong>✅ Money-Back Guarantee</strong> on all orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
