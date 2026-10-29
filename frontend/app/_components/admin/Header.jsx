'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  LogOut,
  Check,
  CheckCheck,
  Package,
  AlertTriangle,
  UserCheck,
  Tag,
  MessageSquare,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { getUser, logout } from '@/lib/auth';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    title: 'Đơn hàng mới #1021',
    desc: 'Khách hàng vừa thanh toán thành công qua cổng VNPAY (4.200.000 VNĐ)',
    time: '2 phút trước',
    read: false,
    link: '/admin/orders',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Cảnh báo sắp hết hàng',
    desc: 'Kính Mát Thể Thao Oakley Flak 2.0 chỉ còn 2 cái trong kho',
    time: '15 phút trước',
    read: false,
    link: '/admin/products',
  },
  {
    id: 3,
    type: 'user',
    title: 'Khách hàng mới',
    desc: 'Tài khoản tdiep76 vừa cập nhật sổ địa chỉ nhận hàng',
    time: '45 phút trước',
    read: false,
    link: '/admin/users',
  },
  {
    id: 4,
    type: 'promo',
    title: 'Khuyến mãi được sử dụng',
    desc: 'Voucher GIAM50K đã được áp dụng cho 5 đơn hàng trong ngày',
    time: '2 giờ trước',
    read: true,
    link: '/admin/promotions',
  },
  {
    id: 5,
    type: 'contact',
    title: 'Tin nhắn liên hệ mới',
    desc: 'Khách gửi yêu cầu đo độ cận tròng kính mắt đổi màu',
    time: '3 giờ trước',
    read: true,
    link: '/admin/contacts',
  },
];

export default function Header() {
  const router = useRouter();
  const [user, setUserState] = useState(null);

  // Dropdown States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Feature States
  const [lang, setLang] = useState('VN');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchKey, setSearchKey] = useState('');

  const containerRef = useRef(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserState(u);
    }

    // Load language preference
    const savedLang = localStorage.getItem('admin_lang') || 'VN';
    setLang(savedLang);

    // Load theme preference
    const savedTheme = localStorage.getItem('admin_theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load saved notifications
    try {
      const savedNotifs = localStorage.getItem('admin_notifications');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
    } catch (e) {}
  }, []);

  // 2. Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowLangDropdown(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Actions
  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('admin_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('admin_lang', newLang);
    setShowLangDropdown(false);
  };

  const handleMarkAsRead = (id, link) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
    } catch (e) {}
    setShowNotifications(false);
    if (link) {
      router.push(link);
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('admin_notifications');
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchKey.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchKey.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder={lang === 'VN' ? 'Tìm kiếm sản phẩm, đơn hàng... (Enter)' : 'Search products, orders...'}
            className="w-full bg-slate-100 text-slate-800 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls Container */}
      <div ref={containerRef} className="flex items-center gap-3">
        {/* 1. Language Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangDropdown(!showLangDropdown);
              setShowNotifications(false);
              setShowDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-sm"
            title={lang === 'VN' ? 'Đổi ngôn ngữ' : 'Change Language'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span>{lang === 'VN' ? '🇻🇳 VN' : '🇺🇸 EN'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-pop-in">
              <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                {lang === 'VN' ? 'Chọn ngôn ngữ' : 'Select Language'}
              </div>
              <button
                onClick={() => handleSelectLang('VN')}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  lang === 'VN' ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">🇻🇳</span>
                  <span>Tiếng Việt</span>
                </span>
                {lang === 'VN' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <button
                onClick={() => handleSelectLang('EN')}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  lang === 'EN' ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">🇺🇸</span>
                  <span>English (US)</span>
                </span>
                {lang === 'EN' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>
          )}
        </div>

        {/* 2. Dark / Light Mode Button */}
        <button
          onClick={handleToggleTheme}
          title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200/80 shadow-sm"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-500 transition-transform rotate-0 hover:rotate-90" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* 3. Notifications Bell Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowLangDropdown(false);
              setShowDropdown(false);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all cursor-pointer border border-slate-200/80 shadow-sm"
            title="Trung tâm thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-0 z-50 text-xs overflow-hidden animate-pop-in">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === 'VN' ? 'Thông Báo Hệ Thống' : 'Notifications'}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                      {unreadCount} {lang === 'VN' ? 'mới' : 'new'}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'VN' ? 'Đã đọc tất cả' : 'Mark all read'}</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
                    <p className="text-xs">{lang === 'VN' ? 'Chưa có thông báo nào mới' : 'No new notifications'}</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start cursor-pointer group ${
                        !n.read ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      {/* Icon per type */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                          n.type === 'order'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : n.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : n.type === 'user'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : n.type === 'promo'
                            ? 'bg-purple-50 border-purple-200 text-purple-600'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {n.type === 'order' && <Package className="w-4 h-4" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                        {n.type === 'user' && <UserCheck className="w-4 h-4" />}
                        {n.type === 'promo' && <Tag className="w-4 h-4" />}
                        {n.type === 'contact' && <MessageSquare className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`font-bold text-xs truncate ${
                              !n.read ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {n.desc}
                        </p>
                      </div>

                      {/* Unread Indicator Dot */}
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center"></div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <Link
                  href="/admin/orders"
                  onClick={() => setShowNotifications(false)}
                  className="font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'VN' ? 'Xem tất cả đơn hàng' : 'View all orders'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifs}
                    className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                    title={lang === 'VN' ? 'Xóa toàn bộ thông báo' : 'Clear all'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'VN' ? 'Dọn dẹp' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-200 my-auto mx-1"></div>

        {/* 4. User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowLangDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.fullName || 'Nguyễn Tấn Điệp'}
              </div>
              <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                {user?.role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-pop-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tài khoản quản trị</p>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{user?.fullName || 'Nguyễn Tấn Điệp'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@matkinh.com'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'VN' ? 'Đăng xuất tài khoản' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
