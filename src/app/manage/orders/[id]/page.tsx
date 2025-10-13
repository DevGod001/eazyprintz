"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrders, type OrderStatus } from "@/contexts/OrderContext";
import { downloadDTFDesign, generatePrintSpecs } from "@/lib/dtfExport";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, updateOrder } = useOrders();
  
  const order = getOrder(params.id as string);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [notes, setNotes] = useState(order?.notes || "");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link href="/manage/orders" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      printed: 'bg-purple-100 text-purple-800 border-purple-300',
      pressed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setIsUpdating(true);
    updateOrder(order.id, { status: newStatus });
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleSaveTracking = () => {
    setIsUpdating(true);
    updateOrder(order.id, { trackingNumber, notes });
    setTimeout(() => setIsUpdating(false), 500);
  };

  const handleDownloadDTF = async (item: typeof order.items[0]) => {
    if (!item.designUrl || !item.printSize) return;
    
    setDownloadingItem(item.id);
    try {
      await downloadDTFDesign({
        designUrl: item.designUrl,
        printSize: item.printSize,
        dpi: 300,
      });
    } catch (error) {
      console.error('Failed to download DTF:', error);
      alert('Failed to download DTF design. Please try again.');
    } finally {
      setDownloadingItem(null);
    }
  };

  const handleDownloadSpecs = (item: typeof order.items[0]) => {
    const specs = generatePrintSpecs(item);
    const blob = new Blob([specs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.orderNumber}-${item.name}-specs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 print:p-4">
      {/* Header */}
      <div className="mb-6 print:mb-4">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link
            href="/manage/orders"
            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2"
          >
            ← Back to Orders
          </Link>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold inline-flex items-center gap-2"
          >
            🖨️ Print Order
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(order.paymentStatus)}`}>
              💳 {order.paymentStatus.toUpperCase()}
            </span>
            <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(order.status)}`}>
              📦 {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow print:shadow-none">
            <div className="p-6 border-b border-gray-200 print:p-4">
              <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 print:p-4">
                  <div className="flex gap-4">
                    {/* Product Image with Design Overlay */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer print:w-24 print:h-24"
                         onClick={() => setZoomedImage(item.image)}>
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
                            className="w-full h-auto object-contain"
                            style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.15))' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 print:text-base">{item.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><span className="font-semibold">Color:</span> {item.color}</p>
                        <p><span className="font-semibold">Size:</span> {item.size}</p>
                        <p><span className="font-semibold">Quantity:</span> {item.quantity}</p>
                        <p><span className="font-semibold">Price:</span> ${item.price.toFixed(2)} each</p>
                      </div>

                      {/* Custom Print Details */}
                      {item.hasCustomPrint && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg print:p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-600 font-bold">✨ Custom DTF Print</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Print Size:</span>
                              <p className="text-gray-900 font-mono">{item.printSize}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Placement:</span>
                              <p className="text-gray-900">{item.printPlacement}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">DTF Quantity:</span>
                              <p className="text-gray-900">{item.dtfQuantity || 1}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">DTF Cost:</span>
                              <p className="text-gray-900">${(item.dtfPrice || 0).toFixed(2)}</p>
                            </div>
                          </div>

                          {/* DTF Design Preview */}
                          {item.designUrl && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-16 h-16 bg-white border border-purple-300 rounded overflow-hidden cursor-pointer"
                                   onClick={() => setZoomedImage(item.designUrl!)}>
                                <img
                                  src={item.designUrl}
                                  alt="Design"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-purple-700 font-semibold mb-2">
                                  Click design to zoom
                                </p>
                                <div className="flex gap-2 print:hidden">
                                  <button
                                    onClick={() => handleDownloadDTF(item)}
                                    disabled={downloadingItem === item.id}
                                    className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                                  >
                                    {downloadingItem === item.id ? '⏳ Downloading...' : '⬇️ Download DTF PNG'}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadSpecs(item)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                                  >
                                    📄 Download Specs
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow print:shadow-none print:break-inside-avoid">
            <div className="p-6 border-b border-gray-200 print:p-4">
              <h2 className="text-xl font-bold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-6 print:p-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {order.paymentStatus === 'paid' && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Payment Received</p>
                      <p className="text-sm text-gray-600">Order is ready for production</p>
                    </div>
                  </div>
                )}

                {order.status === 'processing' && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      ⚙️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">Order is being prepared</p>
                    </div>
                  </div>
                )}

                {(order.status === 'printed' || order.status === 'pressed' || order.status === 'shipped') && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      🖨️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">DTF Printed</p>
                      <p className="text-sm text-gray-600">Design has been printed</p>
                    </div>
                  </div>
                )}

                {(order.status === 'pressed' || order.status === 'shipped') && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      🔥
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Heat Pressed</p>
                      <p className="text-sm text-gray-600">Design has been pressed onto apparel</p>
                    </div>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">
                      📦
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-600">Order has been shipped to customer</p>
                      {order.trackingNumber && (
                        <p className="text-sm font-mono text-blue-600 mt-1">{order.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow print:shadow-none print:break-inside-avoid">
            <div className="p-6 border-b border-gray-200 print:p-4">
              <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
            </div>
            <div className="p-6 space-y-4 print:p-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Name</p>
                <p className="text-gray-900 font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900">{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Shipping Address</p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-gray-900">
                  <p className="font-semibold">{order.customer.name}</p>
                  <p>{order.customer.shippingAddress.street}</p>
                  <p>
                    {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state} {order.customer.shippingAddress.zipCode}
                  </p>
                  <p>{order.customer.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow print:shadow-none print:break-inside-avoid">
            <div className="p-6 border-b border-gray-200 print:p-4">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6 space-y-3 print:p-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold">${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-semibold">${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Controls */}
          <div className="bg-white rounded-lg shadow print:hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleStatusUpdate('processing')}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                ⚙️ Mark as Processing
              </button>
              <button
                onClick={() => handleStatusUpdate('printed')}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
              >
                🖨️ Mark as Printed
              </button>
              <button
                onClick={() => handleStatusUpdate('pressed')}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
              >
                🔥 Mark as Pressed
              </button>
              <button
                onClick={() => handleStatusUpdate('shipped')}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold disabled:opacity-50"
              >
                📦 Mark as Shipped
              </button>
            </div>
          </div>

          {/* Tracking & Notes */}
          <div className="bg-white rounded-lg shadow print:hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tracking & Notes</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSaveTracking}
                disabled={isUpdating}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition font-bold shadow-lg z-10"
            >
              ×
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
