'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, QrCode, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

function VNPayMockContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || '99999';
  const rawAmount = searchParams.get('amount') || '3550000';
  const amount = Number(rawAmount);

  const [selectedBank, setSelectedBank] = useState('NCB');
  const [cardNumber, setCardNumber] = useState('9704 1985 2619 1432 198');
  const [cardHolder, setCardHolder] = useState('NGUYEN VAN A');
  const [issueDate, setIssueDate] = useState('07/15');
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState(1); // 1: Card info, 2: OTP
  const [processing, setProcessing] = useState(false);

  const banks = [
    { code: 'NCB', name: 'Ngân hàng Quốc Dân' },
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'MB', name: 'MB Bank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'CTG', name: 'VietinBank' },
  ];

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const txnNo = Math.floor(Math.random() * 90000000) + 10000000;
      const vnpAmount = amount * 100;
      router.push(`/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=${orderId}&vnp_Amount=${vnpAmount}&vnp_BankCode=${selectedBank}&vnp_TransactionNo=${txnNo}&vnp_OrderInfo=Thanh+toan+don+hang+NTD+Eyewear`);
    }, 1200);
  };

  const handleCancelPayment = () => {
    const vnpAmount = amount * 100;
    router.push(`/vnpay-return?vnp_ResponseCode=24&vnp_TxnRef=${orderId}&vnp_Amount=${vnpAmount}&vnp_BankCode=${selectedBank}&vnp_TransactionNo=0&vnp_OrderInfo=Khach+hang+huy+giao+dich`);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* VNPay Header */}
        <div className="bg-[#005baa] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-[#005baa] text-xl">
              V
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide flex items-center gap-2">
                <span>VNPAY</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">
                  SANDBOX DEMO
                </span>
              </h1>
              <p className="text-xs text-blue-100">Cổng thanh toán điện tử an toàn VNPAY</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="text-blue-200">Đơn vị chấp nhận thanh toán</div>
            <div className="font-bold text-white text-sm">NTD EYEWEAR</div>
          </div>
        </div>

        {/* Order Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500">Mã đơn hàng:</span>{' '}
            <span className="font-bold text-slate-900">#{orderId}</span>
          </div>
          <div>
            <span className="text-slate-500">Số tiền thanh toán:</span>{' '}
            <span className="font-black text-rose-600 text-base">
              {amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-6">
          <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600">
            <button className="pb-3 border-b-2 border-[#005baa] text-[#005baa] flex items-center gap-2 px-2 cursor-pointer">
              <CreditCard className="w-4 h-4" />
              <span>Thẻ ATM & Tài khoản Ngân hàng</span>
            </button>
            <button className="pb-3 text-slate-400 flex items-center gap-2 px-4 cursor-not-allowed">
              <QrCode className="w-4 h-4" />
              <span>Quét mã VNPAY-QR</span>
            </button>
          </div>

          {/* Select Bank */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Chọn ngân hàng thử nghiệm:</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {banks.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => setSelectedBank(b.code)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBank === b.code
                      ? 'border-[#005baa] bg-blue-50 text-[#005baa] ring-2 ring-[#005baa]/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {b.code}
                </button>
              ))}
            </div>
          </div>

          {/* Card Input Form */}
          {step === 1 && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800">Thông tin thẻ thử nghiệm VNPAY Sandbox</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Thẻ test an toàn
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số thẻ ATM *</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-white text-slate-900 font-mono font-bold p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#005baa]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên chủ thẻ *</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-white text-slate-900 font-bold p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#005baa]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày phát hành (MM/YY) *</label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-white text-slate-900 font-mono font-bold p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#005baa]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-[#005baa] hover:bg-[#004785] text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  Tiếp tục xác thực OTP
                </button>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === 2 && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800">Nhập mã xác thực OTP</span>
                <span className="text-[11px] text-slate-500">Mã gửi tới số điện thoại đăng ký</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã OTP thử nghiệm *</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-white text-slate-900 font-mono font-black text-center text-lg tracking-widest p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#005baa]"
                />
                <p className="text-[11px] text-slate-500 mt-1 text-center">
                  Mã OTP thử nghiệm mặc định của VNPAY là: <strong className="text-slate-900">123456</strong>
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmPayment}
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xử lý giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Xác nhận thanh toán</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleCancelPayment}
              className="text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Hủy thanh toán và quay về cửa hàng
            </button>
            <div className="text-[11px] text-slate-400">
              Kết nối SSL 256-bit an toàn
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-200 text-[11px] text-slate-500">
          Hệ thống mô phỏng cổng thanh toán VNPAY Sandbox phục vụ đồ án & báo cáo tốt nghiệp
        </div>
      </div>
    </div>
  );
}

export default function VNPayMockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Đang tải cổng thanh toán VNPAY Sandbox...</div>}>
      <VNPayMockContent />
    </Suspense>
  );
}
