"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const navItems = [
    { href: '/manage', label: 'Dashboard', icon: '📊' },
    { href: '/manage/orders', label: 'Orders', icon: '📦' },
    { href: '/manage/products', label: 'Products', icon: '🛍️' },
    { href: '/manage/customers', label: 'Customers', icon: '👥' },
    { href: '/manage/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/manage" className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="text-xl font-bold">Lifewear Prints</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/manage' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm"
        >
          <span>🏠</span>
          <span>View Store</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm font-semibold"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
