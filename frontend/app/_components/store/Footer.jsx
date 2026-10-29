'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Glasses, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Footer() {
  const [sysSettings, setSysSettings] = useState({
    hotline: '1900 8888',
    email_contact: 'support@matkinh.com',
    store_address: '123 Đường 3/2, Quận 10, TP. Hồ Chí Minh',
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadSettings() {
      // Try local storage first
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSysSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}

      // Fetch from API
      try {
        const res = await fetchApi('/public/settings');
        if (res.data && res.data.length > 0) {
          const obj = {};
          res.data.forEach((item) => {
            if (item.keyName) obj[item.keyName] = item.keyValue;
          });
          setSysSettings((prev) => ({ ...prev, ...obj }));
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      alert('Vui lòng nhập một địa chỉ email hợp lệ!');
      return;
    }
    alert('Đăng ký thành công! Voucher giảm 50k sẽ được gửi đến email ' + email + ' trong ít phút.');
    setEmail('');
  };

  return (
    <footer className="bg-slate-50 text-slate-500 text-xs border-t border-slate-200/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-900/60 flex items-center justify-center text-slate-900">
              <Glasses className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-lg font-black text-slate-900">NTD EYEWEAR</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Hệ thống bán lẻ gọng kính, kính râm thời trang chính hãng cao cấp. Cam kết bảo hành 12 tháng và đo mắt vi tính miễn phí.
          </p>
          <div className="space-y-2 font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-900" /> Hotline: <strong className="text-slate-900 ml-1">{sysSettings.hotline || '1900 8888'}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-900" /> Email: <span className="text-slate-700">{sysSettings.email_contact || 'support@matkinh.com'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-900 shrink-0" /> <span className="text-slate-700">{sysSettings.store_address || '123 Đường 3/2, Q.10, TP. Hồ Chí Minh'}</span>
            </div>
          </div>
        </div>

        {/* Categories Col */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Danh mục mắt kính</h3>
          <ul className="space-y-2 text-slate-500">
            <li><Link href="/products?category=1" className="hover:text-slate-900">Gọng Kính Nam Cận</Link></li>
            <li><Link href="/products?category=2" className="hover:text-slate-900">Gọng Kính Nữ Thời Trang</Link></li>
            <li><Link href="/products?category=3" className="hover:text-slate-900">Kính Râm Ray-Ban & Gucci</Link></li>
            <li><Link href="/products?category=4" className="hover:text-slate-900">Tròng Kính Chống Ánh Sáng Xanh</Link></li>
          </ul>
        </div>

        {/* Policy Col */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Chính sách cửa hàng</h3>
          <ul className="space-y-2 text-slate-500">
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-slate-900" /> Bảo hành gọng 12 tháng</li>
            <li className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 text-slate-900" /> Đổi trả trong 7 ngày</li>
            <li className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-slate-900" /> Miễn phí ship đơn từ 500k</li>
            <li className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-slate-900" /> Đo mắt vi tính miễn phí</li>
          </ul>
        </div>

        {/* Newsletter Col */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Đăng ký nhận ưu đãi</h3>
          <p className="text-slate-500">Nhập email để nhận ngay voucher giảm 50k cho đơn hàng đầu tiên.</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              placeholder="Email của bạn..."
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <button 
              onClick={handleSubscribe}
              className="px-4 py-2.5 bg-black font-bold text-white rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-500/20 shrink-0 cursor-pointer transition-all"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 pt-6 border-t border-slate-200/60 text-center text-slate-500">
        © 2026 NTD EYEWEAR - Tất cả quyền được bảo lưu. Mắt Kính Cao Cấp.
      </div>
    </footer>
  );
}
