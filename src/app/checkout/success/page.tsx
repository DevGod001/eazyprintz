"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Your Order Number</p>
            <p className="text-3xl font-bold text-blue-600 font-mono">{orderNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Information */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="font-semibold text-gray-900">Confirmation Email Sent</p>
              <p className="text-sm text-gray-600">We've sent an order confirmation to your email address.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="font-semibold text-gray-900">Order Processing</p>
              <p className="text-sm text-gray-600">Your custom DTF prints will be processed and shipped soon.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-gray-900">Tracking Information</p>
              <p className="text-sm text-gray-600">You'll receive tracking details once your order ships.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/design"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg text-center"
          >
            🎨 Create Another Design
          </Link>
          <Link
            href="/shop"
            className="bg-gray-200 text-gray-900 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            🛍️ Continue Shopping
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-gray-600">
            Questions about your order? <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">Contact Us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
