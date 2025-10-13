"use client";

import Link from "next/link";

export default function ProductsManagementPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your product catalog and color-specific images</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Management Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          This section will allow you to:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Add new products</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Upload color-specific images (front & back)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Edit product details</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Manage inventory</span>
          </li>
        </ul>
        <Link
          href="/manage"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
