"use client";

import Link from "next/link";

export default function CustomersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-gray-600">View and manage customer information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Management Coming Soon</h2>
        <p className="text-gray-600 mb-8">
          This section will display customer details and order history
        </p>
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
