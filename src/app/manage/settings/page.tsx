"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your store settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          This section will allow you to configure:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>DTF pricing rules</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Shipping rates</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Tax settings</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Email notifications</span>
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
