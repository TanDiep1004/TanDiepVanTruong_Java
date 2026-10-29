'use client';

import { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage({ params }) {
  const resolvedParams = params ? (typeof params.then === 'function' ? use(params) : params) : {};
  const orderId = resolvedParams?.id || 'N/A';

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">
      <div className="w-24 h-24 bg-slate-900/20 text-slate-900 border-2 border-slate-900/40 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-xs border border-slate-200">
          Mã đơn hàng: #{orderId}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Cảm ơn bạn đã tin tưởng mua sắm tại <strong>NTD Eyewear</strong>. Nhân viên chăm sóc khách hàng sẽ liên hệ xác nhận đơn hàng và chuẩn bị đóng gói kính cho bạn ngay lập tức.
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl text-left space-y-3 text-xs text-slate-700 max-w-md mx-auto shadow-xl">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-500">Trạng thái đơn hàng:</span>
          <span className="font-bold text-slate-900">Pending (Đã tiếp nhận)</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-500">Thời gian giao dự kiến:</span>
          <span className="font-bold text-slate-900">2 - 3 ngày làm việc</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Chính sách bảo hành:</span>
          <span className="font-bold text-slate-900">12 tháng đổi mới gọng kính</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href="/products"
          className="px-6 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2"
        >
          <span>Tiếp tục mua sắm</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/orders"
          className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200"
        >
          Xem lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
}
