'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Glasses, Search, ShoppingBag, User, Phone, ChevronDown, Shield, Tag, UserPlus, LogOut, Package, ClipboardList, ArrowRight, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/api';
import { getUser, getToken, isAdmin, logout } from '@/lib/auth';
import { productService } from '@/services/productService';

function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const SAFE_FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
  'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800',
  'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800'
];

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [user, setUserState] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchRef = useRef(null);

  const [sysSettings, setSysSettings] = useState({
    hotline: '0329526730',
    logo_url: '',
  });

  useEffect(() => {
    async function loadInitialData() {
      // 1. Settings
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSysSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}

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

      // 2. Fetch all products for Live Autocomplete Search
      try {
        const pRes = await productService.getAllProducts();
        const rawList = pRes.data || (Array.isArray(pRes) ? pRes : []);
        if (rawList && rawList.length > 0) {
          setAllProducts(rawList);
        }
      } catch (e) {
        console.log('Using default product search catalog...');
      }
    }

    loadInitialData();
    setUserState(getUser());
    setUserIsAdmin(isAdmin());

    // Close search dropdown on click outside
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter live search suggestions dynamically as user types
  const searchSuggestions = useMemo(() => {
    const term = searchQuery.trim();
    if (!term || term.length < 1) return [];

    const cleanTerm = removeAccents(term);

    return allProducts.filter((p) => {
      const cleanName = removeAccents(p.name);
      const cleanBrand = removeAccents(p.brand?.name || '');
      const cleanDesc = removeAccents(p.description || '');

      return (
        cleanName.includes(cleanTerm) ||
        cleanBrand.includes(cleanTerm) ||
        cleanDesc.includes(cleanTerm)
      );
    }).slice(0, 6); // Top 6 matching items
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectProduct = (productId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    router.push(`/products/${productId}`);
  };

  const handleCartClick = (e) => {
    const token = getToken();
    if (!token) {
      e.preventDefault();
      alert('VUI LÒNG ĐĂNG NHẬP!\nBạn cần đăng nhập tài khoản trước khi truy cập giỏ hàng.');
      router.push('/login');
    }
  };

  const hasCustomLogo = sysSettings.logo_url && (sysSettings.logo_url.startsWith('http') || sysSettings.logo_url.startsWith('data:image'));

  return (
    <header className="sticky top-0 z-40 w-full shadow-lg">
      {/* Top Banner Bar */}
      <div className="bg-slate-50 text-slate-500 text-xs py-2 px-6 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
            <Phone className="w-3.5 h-3.5" /> Hotline Đặt Hàng: <strong className="text-slate-900 ml-1">{sysSettings.hotline || '0329526730'}</strong>
          </span>
          <span className="hidden sm:inline-block text-slate-500">
            ✨ Miễn phí đo mắt vi tính & Bảo hành gọng kính 12 tháng
          </span>
        </div>
        <div className="flex items-center gap-4">
          {userIsAdmin ? (
            <Link href="/admin/dashboard" className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-900" /> Buồng lái Admin
            </Link>
          ) : (
            <span className="text-slate-500 text-[11px]">
              Chào mừng bạn đến với Mắt Kính NTD Eyewear
            </span>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4 px-6 md:px-12 flex items-center justify-between gap-6">
        {/* Logo NTD Eyewear */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {hasCustomLogo ? (
            <div className="bg-white p-1.5 rounded-xl border border-slate-300 shadow-md flex items-center justify-center">
              <img src={sysSettings.logo_url} alt="Logo Cửa Hàng" className="h-9 w-auto max-w-[140px] object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border-2 border-slate-900/60 flex items-center justify-center text-slate-900 shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Glasses className="w-6 h-6 text-slate-900 stroke-[2.2]" />
            </div>
          )}
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              NTD <span className="text-slate-900">EYEWEAR</span>
            </span>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">Cửa hàng mắt kính cao cấp</p>
          </div>
        </Link>

        {/* 🟢 LIVE AUTCOMPLETE SEARCH BAR WITH DROPDOWN POPUP */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kính Ray-Ban, Gucci, Gentle Monster, gọng cận..."
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="w-full bg-slate-100/90 text-slate-900 text-xs pl-4 pr-10 py-2.5 rounded-full border border-slate-300/60 focus:outline-none focus:border-slate-900 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* 🟢 LIVE SEARCH RESULT DROPDOWN MENU POPUP */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-300/90 rounded-2xl shadow-2xl overflow-hidden animate-pop-in divide-y divide-slate-800">
              
              <div className="p-2.5 bg-slate-50/60 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>Gợi ý kính phù hợp ({searchSuggestions.length})</span>
                <span className="text-slate-900 font-mono text-[10px]">Gõ để tìm kiếm</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                {searchSuggestions.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 space-y-1">
                    <p>Không tìm thấy mẫu kính nào khớp với "<strong>{searchQuery}</strong>"</p>
                    <p className="text-[11px] text-slate-500">Thử tìm: Ray-Ban, Gucci, Gentle Monster, Kính Cận...</p>
                  </div>
                ) : (
                  searchSuggestions.map((prod) => {
                    const fallbackImg = SAFE_FALLBACK_PHOTOS[(Number(prod.id) || 1) % SAFE_FALLBACK_PHOTOS.length];
                    const imgUrl = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : prod.imageUrl || fallbackImg;
                    const price = prod.price || 1500000;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="p-2.5 flex items-center gap-3 hover:bg-slate-100/70 rounded-xl cursor-pointer transition-colors group"
                      >
                        <img
                          src={imgUrl}
                          alt={prod.name}
                          onError={(e) => { e.target.src = fallbackImg; }}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-300/80 shrink-0 bg-slate-50 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors truncate">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-900 bg-slate-900/10 px-1.5 py-0.5 rounded border border-slate-900/20">
                              {prod.brand?.name || 'Ray-Ban'}
                            </span>
                            <span className="text-xs font-black text-slate-700">
                              {Number(price).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>

              {/* View all search results button */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-slate-900 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem tất cả kết quả tìm kiếm cho "{searchQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls: User Account + Cart */}
        <div className="flex items-center gap-4">
          {/* User Account Controls */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900/20 text-slate-900 flex items-center justify-center font-bold border border-slate-900/40">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline-block font-bold">{user.fullName || 'Khách hàng'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-white bg-black hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-400/30 px-3 py-2 rounded-xl transition-all"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-black hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-400/30 px-3 py-2 rounded-xl transition-all"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}

            {showUserDropdown && user && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-200">
                  <div className="font-bold text-slate-900 text-xs">{user.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="text-[10px] text-slate-900 font-bold uppercase mt-0.5">Role: {user.role || 'customer'}</div>
                </div>

                {userIsAdmin && (
                  <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100">
                    <Shield className="w-3.5 h-3.5 text-slate-900" />
                    <span>Buồng lái Admin</span>
                  </Link>
                )}

                <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-900" />
                  <span>Lịch sử đơn hàng</span>
                </Link>

                <Link href="/cart" onClick={handleCartClick} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100">
                  <Package className="w-3.5 h-3.5 text-slate-900" />
                  <span>Giỏ hàng của tôi</span>
                </Link>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-t border-slate-200/80 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon Counter Badge */}
          <Link
            href="/cart"
            onClick={handleCartClick}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-400/30 text-white font-bold text-xs transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-50 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Giỏ hàng ({cartCount})</span>
          </Link>
        </div>
      </div>

      {/* Navigation Categories Menu Bar */}
      <nav className="bg-white border-b border-slate-200/80 px-6 md:px-12">
        <ul className="flex items-center gap-8 overflow-x-auto text-xs font-bold uppercase tracking-wider py-3 text-slate-700">
          <li>
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link href="/products" className="hover:text-slate-900 transition-colors">
              Tất Cả Mắt Kính
            </Link>
          </li>
          <li>
            <Link href="/articles" className="hover:text-slate-900 transition-colors">
              Tin Tức
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Liên Hệ
            </Link>
          </li>
          <li className="ml-auto">
            <Link href="/promotions" className="text-slate-900 flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <Tag className="w-3.5 h-3.5" /> Mã Khuyến Mãi HOT
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
