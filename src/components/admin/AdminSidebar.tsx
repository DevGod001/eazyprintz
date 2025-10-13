"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/manage', label: 'Dashboard', icon: '📊' },
    { href: '/manage/orders', label: 'Orders', icon: '📦' },
    { href: '/manage/products', label: 'Products', icon: '🛍️' },
    { href: '/manage/customers', label: 'Customers', icon: '👥' },
    { href: '/manage/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/manage" className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <div>
            <h1 className="text-lg font-bold">Lifewear Prints</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-2xl p-2 hover:bg-gray-800 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 text-white min-h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo - Desktop Only */}
      <div className="hidden lg:block p-6 border-b border-gray-700">
        <Link href="/manage" className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="text-xl font-bold">Lifewear Prints</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Mobile Header Inside Sidebar */}
      <div className="lg:hidden p-4 border-b border-gray-700 flex items-center justify-between">
        <Link href="/manage" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="text-xl font-bold">Lifewear Prints</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-2xl p-2 hover:bg-gray-800 rounded-lg transition"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/manage' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
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
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm"
        >
          <span>🏠</span>
          <span>View Store</span>
        </Link>
        <button
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm font-semibold"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}
