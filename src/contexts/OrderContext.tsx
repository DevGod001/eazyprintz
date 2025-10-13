"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'printed' | 'pressed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
  type: string;
  hasCustomPrint?: boolean;
  designUrl?: string;
  printPlacement?: 'front' | 'back' | 'breast-left' | 'breast-right' | 'custom';
  customPosition?: { x: number; y: number };
  customScale?: number;
  printSize?: string;
  dtfQuantity?: number;
  dtfPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  getOrder: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByPaymentStatus: (paymentStatus: PaymentStatus) => Order[];
  deleteOrder: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load orders from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined') {
        const savedOrders = localStorage.getItem('lifewear_orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifewear_orders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving orders:', error);
      }
    }
  }, [orders, isMounted]);

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LW${year}${month}${day}${random}`;
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: generateOrderNumber(),
      createdAt: now,
      updatedAt: now,
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const getOrder = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByPaymentStatus = (paymentStatus: PaymentStatus) => {
    return orders.filter(order => order.paymentStatus === paymentStatus);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        getOrder,
        getOrdersByStatus,
        getOrdersByPaymentStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
