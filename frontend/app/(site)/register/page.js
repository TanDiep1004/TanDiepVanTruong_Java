'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight, Glasses, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import SuccessModal from '@/app/_components/SuccessModal';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !emailInput || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp!');
      return;
    }

    setLoading(true);

    const formattedEmail = emailInput.includes('@') ? emailInput : `${emailInput}@gmail.com`;

    const newUserObj = {
      fullName,
      email: formattedEmail,
      phone: phone || '0912345678',
      password,
      role: 'customer',
      token: 'customer-jwt-token-' + Date.now(),
    };

    try {
      const res = await fetchApi('/public/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email: formattedEmail,
          phone,
          password,
          role: 'customer',
        }),
      });

      // After successful registration, usually backend returns user or token
      // We will login automatically or redirect to login
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setUser(res.data);
        setSuccessData({ email: formattedEmail });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        // Just redirect to login if no token returned
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã được sử dụng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal
        open={!!successData}
        title="Đăng Ký Thành Công!"
        message={`Tài khoản NTD Eyewear (${successData?.email}) đã được tạo thành công. Đang tự động đăng nhập...`}
        onConfirm={() => (window.location.href = '/')}
        buttonText="VÀO TRANG CHỦ NGAY"
      />
      <div className="max-w-md mx-auto my-12 px-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-slate-50 border border-slate-900/50 text-slate-900 mb-1">
            <Glasses className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Đăng Ký Tài Khoản Mới</h1>
          <p className="text-xs text-slate-500">Tạo tài khoản để nhận voucher 50k & tích điểm mua hàng tại NTD Eyewear</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs" autoComplete="off">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Họ và tên *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                autoComplete="off"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Địa chỉ Email / Tên đăng nhập *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="khachhang@gmail.com"
                autoComplete="off"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                placeholder="0912345678"
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mật khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nhập lại mật khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 font-bold text-white text-xs shadow-lg shadow-slate-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>TẠO TÀI KHOẢN NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
