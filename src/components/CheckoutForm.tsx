"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) newErrors.name = "Name is required";
    if (!customerInfo.email.trim()) newErrors.email = "Email is required";
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!customerInfo.phone.trim()) newErrors.phone = "Phone is required";
    if (!customerInfo.street.trim()) newErrors.street = "Street address is required";
    if (!customerInfo.city.trim()) newErrors.city = "City is required";
    if (!customerInfo.state.trim()) newErrors.state = "State is required";
    if (!customerInfo.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    const order = addOrder({
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        shippingAddress: {
          street: customerInfo.street,
          city: customerInfo.city,
          state: customerInfo.state,
          zipCode: customerInfo.zipCode,
          country: customerInfo.country,
        },
      },
      items: cart.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
        type: item.type,
        hasCustomPrint: item.hasCustomPrint,
        designUrl: item.designUrl,
        printPlacement: item.printPlacement,
        customPosition: item.customPosition,
        customScale: item.customScale,
        printSize: item.printSize,
        dtfQuantity: item.dtfQuantity,
        dtfPrice: item.price - (item.price / (item.quantity || 1)), // Approximate DTF price
      })),
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'paid', // Simulating successful payment
    });

    // Clear cart
    clearCart();

    // Redirect to success page
    router.push(`/checkout/success?order=${order.orderNumber}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={customerInfo.street}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, street: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main St"
                />
                {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.state}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
            >
              {isProcessing ? '⏳ Processing Order...' : '💳 Place Order'}
            </button>
            <p className="text-sm text-gray-600 text-center mt-4">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div>
        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

          {/* Items */}
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    {item.color} • {item.size} • Qty: {item.quantity}
                  </p>
                  {item.hasCustomPrint && (
                    <p className="text-xs text-purple-600 font-semibold">✨ Custom Print</p>
                  )}
                  <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping === 0 && (
              <p className="text-xs text-green-600">🎉 Free shipping on orders over $50!</p>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
