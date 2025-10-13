import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProductProvider } from "@/contexts/ProductContext";

export const metadata: Metadata = {
  title: "Lifewear Prints - Custom DTF Printing",
  description: "Professional Direct-to-Film printing service for custom apparel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <ProductProvider>
          <AdminAuthProvider>
            <OrderProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </OrderProvider>
          </AdminAuthProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
