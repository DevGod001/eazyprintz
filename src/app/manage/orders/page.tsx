"use client";

import { useState, useEffect } from "react";
import { useOrders, type OrderStatus, type PaymentStatus } from "@/contexts/OrderContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrdersPage() {
  const { orders, getOrdersByStatus, getOrdersByPaymentStatus } = useOrders();
  const searchParams = useSearchParams();
  
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Apply filters from URL params on mount
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // Filter and sort orders
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, paymentFilter, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      printed: 'bg-purple-100 text-purple-800 border-purple-200',
      pressed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const statusCounts = {
    all: orders.length,
    paid: getOrdersByPaymentStatus('paid').length,
    pending: getOrdersByPaymentStatus('pending').length,
    processing: getOrdersByStatus('processing').length,
    printed: getOrdersByStatus('printed').length,
    pressed: getOrdersByStatus('pressed').length,
    shipped: getOrdersByStatus('shipped').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage all customer orders</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-lg border-2 transition ${
            statusFilter === "all"
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-xs text-gray-600">All Orders</div>
        </button>
        
        <button
          onClick={() => { setPaymentFilter("paid"); setStatusFilter("all"); }}
          className={`p-4 rounded-lg border-2 transition ${
            paymentFilter === "paid"
              ? 'bg-green-50 border-green-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{statusCounts.paid}</div>
          <div className="text-xs text-gray-600">Paid</div>
        </button>

        <button
          onClick={() => setStatusFilter("processing")}
          className={`p-4 rounded-lg border-2 transition ${
            statusFilter === "processing"
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div>
          <div className="text-xs text-gray-600">Processing</div>
        </button>

        <button
          onClick={() => setStatusFilter("printed")}
          className={`p-4 rounded-lg border-2 transition ${
            statusFilter === "printed"
              ? 'bg-purple-50 border-purple-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-purple-600">{statusCounts.printed}</div>
          <div className="text-xs text-gray-600">Printed</div>
        </button>

        <button
          onClick={() => setStatusFilter("pressed")}
          className={`p-4 rounded-lg border-2 transition ${
            statusFilter === "pressed"
              ? 'bg-indigo-50 border-indigo-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-indigo-600">{statusCounts.pressed}</div>
          <div className="text-xs text-gray-600">Pressed</div>
        </button>

        <button
          onClick={() => setStatusFilter("shipped")}
          className={`p-4 rounded-lg border-2 transition ${
            statusFilter === "shipped"
              ? 'bg-cyan-50 border-cyan-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-cyan-600">{statusCounts.shipped}</div>
          <div className="text-xs text-gray-600">Shipped</div>
        </button>

        <button
          onClick={() => { setPaymentFilter("pending"); setStatusFilter("all"); }}
          className={`p-4 rounded-lg border-2 transition ${
            paymentFilter === "pending"
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order #, name, email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="total">Total Amount</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setSortBy("date");
                setSortOrder("desc");
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here once customers place them"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      {order.items.some(i => i.hasCustomPrint) && (
                        <div className="text-xs text-purple-600 font-semibold mt-1">✨ Custom DTF</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">${order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/manage/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  );
}
