'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api';

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [details, setDetails] = useState({
    orderId: '',
    amount: 0,
    bankCode: '',
    transactionNo: '',
    message: ''
  });

  useEffect(() => {
    async function verifyPayment() {
      setLoading(true);
      const responseCode = searchParams.get('vnp_ResponseCode');
      const orderId = searchParams.get('vnp_TxnRef');
      const rawAmount = searchParams.get('vnp_Amount');
      const amount = rawAmount ? Number(rawAmount) / 100 : 0;
      const bankCode = searchParams.get('vnp_BankCode') || 'N/A';
      const transactionNo = searchParams.get('vnp_TransactionNo') || 'N/A';

      const success = responseCode === '00';
      setIsSuccess(success);
      setDetails({
        orderId: orderId || 'N/A',
        amount,
        bankCode,
        transactionNo,
        message: success ? 'Giao dịch thanh toán VNPAY thành công!' : 'Giao dịch thanh toán VNPAY không thành công hoặc đã bị hủy.'
      });

      // Call backend to verify signature & update database status
      try {
        const queryString = searchParams.toString();
        await fetchApi(`/public/payment/vnpay-callback?${queryString}`);
      } catch (err) {
        console.error('Lỗi gọi API cập nhật trạng thái đơn hàng:', err);
      }

      // Update local storage placed_orders status if exists
      try {
        const localOrders = JSON.parse(localStorage.getItem('placed_orders') || '[]');
        const updatedOrders = localOrders.map(o => {
          if (String(o.id) === String(orderId)) {
            return { ...o, status: success ? 'Confirmed' : 'Pending', paymentMethod: 'VNPAY' };
          }
          return o;
        });
        localStorage.setItem('placed_orders', JSON.stringify(updatedOrders));
      } catch (e) {}

      setLoading(false);
    }

    if (searchParams) {
      verifyPayment();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 text-sm font-semibold">Đang xác thực kết quả thanh toán từ cổng VNPAY...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-8">
      {isSuccess ? (
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
        </div>
      ) : (
        <div className="w-24 h-24 bg-rose-50 text-rose-500 border-2 border-rose-500/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/20">
          <XCircle className="w-14 h-14 stroke-[2.5]" />
        </div>
      )}

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Cổng thanh toán điện tử VNPAY</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          {isSuccess ? 'THANH TOÁN THÀNH CÔNG!' : 'THANH TOÁN CHƯA HOÀN TẤT'}
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          {isSuccess
            ? 'Cảm ơn bạn! Đơn hàng của bạn tại NTD Eyewear đã được thanh toán an toàn qua cổng VNPAY. Cửa hàng đang chuẩn bị đóng gói kính cho bạn.'
            : 'Giao dịch qua VNPAY bị gián đoạn hoặc bạn đã hủy thao tác thanh toán. Đơn hàng vẫn được lưu ở trạng thái Chờ thanh toán.'}
        </p>
      </div>

      {/* Transaction Details Box */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl text-left space-y-3 text-xs text-slate-700 max-w-md mx-auto shadow-xl">
        <div className="flex justify-between border-b border-slate-200 pb-2.5">
          <span className="text-slate-500">Mã đơn hàng:</span>
          <span className="font-bold text-slate-900">#{details.orderId}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2.5">
          <span className="text-slate-500">Số tiền thanh toán:</span>
          <span className="font-extrabold text-blue-600 text-sm">
            {details.amount.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2.5">
          <span className="text-slate-500">Ngân hàng thanh toán:</span>
          <span className="font-semibold text-slate-900">{details.bankCode}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-2.5">
          <span className="text-slate-500">Mã giao dịch VNPAY:</span>
          <span className="font-mono text-slate-700">{details.transactionNo}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-500">Trạng thái:</span>
          <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isSuccess ? 'Đã Thanh Toán (Confirmed)' : 'Chưa Thanh Toán (Pending)'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {details.orderId && details.orderId !== 'N/A' && (
          <Link
            href={`/orders/${details.orderId}`}
            className="px-6 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-xl shadow-slate-900/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Xem chi tiết đơn hàng</span>
          </Link>
        )}
        <Link
          href="/products"
          className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Tiếp tục mua sắm</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm">
        Đang tải thông tin giao dịch VNPAY...
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  );
}
