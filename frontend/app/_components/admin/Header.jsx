'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Globe, ChevronDown, LogOut } from 'lucide-react';
import { getUser, logout } from '@/lib/auth';

export default function Header() {
  const [user, setUserState] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserState(u);
    }
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            className="w-full bg-slate-100/60 text-slate-700 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300/50 focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100/40 rounded-lg border border-slate-300/40 transition-colors">
          <Globe className="w-3.5 h-3.5 text-slate-900" />
          <span>VN</span>
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Moon className="w-4 h-4" />
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
        </button>

        <div className="h-4 w-[1px] bg-slate-100 my-auto"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/60 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900/20 text-slate-900 border border-slate-900/30 flex items-center justify-center font-bold text-xs shadow-inner">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName || 'Quản trị viên'}
              </div>
              <div className="text-[10px] text-slate-900 font-bold uppercase tracking-wider">
                {user?.role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase">Tài khoản hiện tại</p>
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Quản trị viên'}</p>
                <p className="text-[11px] text-slate-900 truncate">{user?.email || 'admin@matkinh.com'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
