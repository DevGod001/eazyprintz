"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from '@/data/products';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize products from localStorage or use defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem('lifewear_products');
      if (storedProducts) {
        try {
          const parsed = JSON.parse(storedProducts);
          setProducts(parsed);
        } catch (error) {
          console.error('Error loading products:', error);
          setProducts(initialProducts);
        }
      } else {
        // First time - seed with initial products
        localStorage.setItem('lifewear_products', JSON.stringify(initialProducts));
      }
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && products.length > 0) {
      localStorage.setItem('lifewear_products', JSON.stringify(products));
    }
  }, [products, isInitialized]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
