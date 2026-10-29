'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WelcomeBanner({ username = 'Admin Manager', newOrdersCount = 12, revenueToday = '4.200.000' }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-8 text-slate-900 shadow-xl border border-emerald-800/40">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-slate-900/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/20 text-emerald-300 text-xs font-semibold border border-slate-900/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ thống Bán hàng Mắt Kính NTD</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {username}!
          </h1>
          <p className="text-emerald-200/90 text-sm font-medium">
            Hôm nay bạn có <span className="font-bold text-slate-900 underline decoration-emerald-400">{newOrdersCount} đơn hàng mới</span> và đạt <span className="font-bold text-emerald-300">{revenueToday} VNĐ</span> doanh thu.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-slate-900 font-semibold text-sm border border-slate-300/60 shadow-lg hover:shadow-emerald-500/10 transition-all duration-200"
        >
          <span>Quản lý đơn hàng</span>
          <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
