'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ShoppingBag, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, message, type = 'success', image, duration = 3500 }) => {
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
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl transition-all animate-pop-in relative overflow-hidden flex gap-3.5 items-start ${
              toast.type === 'error'
                ? 'border-rose-500/40 shadow-rose-500/10'
                : toast.type === 'info'
                ? 'border-sky-500/40 shadow-sky-500/10'
                : 'border-emerald-500/40 shadow-emerald-500/20'
            }`}
          >
            {/* Top accent glow line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                toast.type === 'error'
                  ? 'bg-rose-500'
                  : toast.type === 'info'
                  ? 'bg-sky-500'
                  : 'bg-emerald-500'
              }`}
            />

            {/* Thumbnail or Icon */}
            {toast.image ? (
              <img
                src={toast.image}
                alt={toast.title || 'Product'}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  toast.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : toast.type === 'info'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : toast.type === 'info' ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                )}
              </div>
            )}

            {/* Toast Content */}
            <div className="flex-1 space-y-1 pr-4">
              <h4
                className={`font-bold text-xs flex items-center gap-1.5 ${
                  toast.type === 'error'
                    ? 'text-rose-400'
                    : toast.type === 'info'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }`}
              >
                <span>{toast.title || 'Thông Báo NTD Eyewear'}</span>
              </h4>
              <p className="text-xs text-slate-200 leading-snug line-clamp-2 font-medium">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animated Progress Bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
              <div
                className={`h-full animate-progress ${
                  toast.type === 'error'
                    ? 'bg-rose-500'
                    : toast.type === 'info'
                    ? 'bg-sky-500'
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
