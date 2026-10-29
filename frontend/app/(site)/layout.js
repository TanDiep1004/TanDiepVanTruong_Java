'use client';

import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Header from '@/app/_components/store/Header';
import Footer from '@/app/_components/store/Footer';

export default function StoreLayout({ children }) {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-black selection:text-slate-900">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
