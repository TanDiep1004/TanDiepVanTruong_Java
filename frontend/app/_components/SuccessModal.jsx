'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SuccessModal({ open, title, message, onConfirm, buttonText = "TIẾP TỤC" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-slate-900/20 animate-pop-in relative overflow-hidden space-y-5">
        {/* Top glowing bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 animate-pulse" />
        
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-slate-900 animate-bounce" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">{title || 'Thành Công!'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-slate-900 h-full animate-progress" />
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 font-bold text-white text-xs shadow-lg shadow-slate-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
