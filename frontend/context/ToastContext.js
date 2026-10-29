'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, AlertCircle, Info, X, ArrowRight } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, message, type = 'success', image, duration = 3800 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, message, type, image, duration };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-xl border rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all animate-pop-in relative overflow-hidden flex gap-3.5 items-center ${
              toast.type === 'error'
                ? 'border-rose-200 shadow-rose-500/10'
                : toast.type === 'info'
                ? 'border-blue-200 shadow-blue-500/10'
                : 'border-slate-200/90 shadow-slate-900/10'
            }`}
          >
            {/* Thumbnail or Icon */}
            {toast.image ? (
              <div className="relative w-13 h-13 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0 p-1 flex items-center justify-center">
                <img
                  src={toast.image}
                  alt={toast.title || 'Product'}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            ) : (
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  toast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : toast.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : toast.type === 'info' ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
            )}

            {/* Toast Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                <span className={`font-bold text-xs uppercase tracking-wide ${
                  toast.type === 'error'
                    ? 'text-rose-600'
                    : toast.type === 'info'
                    ? 'text-blue-600'
                    : 'text-emerald-700'
                }`}>
                  {toast.title || 'Đã Thêm Vào Giỏ Hàng!'}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-semibold line-clamp-1 leading-snug">
                {toast.message}
              </p>
              <Link
                href="/cart"
                onClick={() => removeToast(toast.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 mt-1 transition-colors group cursor-pointer"
              >
                <span>Xem giỏ hàng</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer self-start"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thin Elegant Animated Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
              <div
                className={`h-full animate-progress ${
                  toast.type === 'error'
                    ? 'bg-rose-500'
                    : toast.type === 'info'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
