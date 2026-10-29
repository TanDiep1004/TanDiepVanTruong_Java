'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Glasses, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { setToken, setUser, getToken, getUser } from '@/lib/auth';
import { authService } from '@/services/authService';
import SuccessModal from '@/app/_components/SuccessModal';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const doRedirect = (role) => {
    if (role === 'admin' || role === 'staff' || role === 'role_admin' || role === 'role_staff') {
      window.location.href = '/admin/dashboard';
      return;
    }
    
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();
    if (token) {
      if (typeof window !== 'undefined') {
        setToken(token); // Sync cookie just in case it was missing
        const role = currentUser?.role?.toLowerCase();
        doRedirect(role);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailInput || !password) {
      setError('Vui lòng điền đầy đủ Email/Tên đăng nhập và Mật khẩu!');
      return;
    }

    setLoading(true);

    const formattedEmail = emailInput.includes('@') ? emailInput : `${emailInput}@gmail.com`;

    try {
      const res = await authService.login({ email: formattedEmail, password });

      const loginData = res?.data || res;
      if (loginData && (loginData.token || loginData.jwt)) {
        const tokenVal = loginData.token || loginData.jwt;
        setToken(tokenVal);
        setUser(loginData);
        const role = (loginData.role || 'customer').toLowerCase();
        setSuccessData({ name: loginData.fullName || loginData.email, role });
        setTimeout(() => doRedirect(role), 1200);
        return;
      }
    } catch (err) {
      // Error handling for backend failure
      setError(err.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal
        open={!!successData}
        title="Đăng Nhập Thành Công!"
        message={`Xin chào ${successData?.name || 'bạn'}, hệ thống đang tự động chuyển hướng...`}
        onConfirm={() => doRedirect(successData?.role)}
        buttonText="CHUYỂN HƯỚNG NGAY"
      />
      <div className="max-w-md mx-auto my-12 px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-slate-50 border border-slate-900/50 text-slate-900 mb-1">
              <Glasses className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Đăng Nhập Hệ Thống</h1>
            <p className="text-xs text-slate-500">Đăng nhập tài khoản để mua sắm hoặc quản lý hệ thống</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Địa chỉ Email / Tên đăng nhập *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="khachhang@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
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
                  autoComplete="new-password"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 font-bold text-white text-xs shadow-lg shadow-slate-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>ĐĂNG NHẬP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <div>
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-slate-900 font-bold hover:underline">
                Đăng ký tài khoản mới ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
