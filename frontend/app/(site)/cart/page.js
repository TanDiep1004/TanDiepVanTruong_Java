'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, TicketPercent, ArrowLeft, CheckSquare, Square, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast() || {};
  const {
    cartItems,
    discountAmount,
    removeFromCart,
    updateQuantity,
    applyCouponCode,
  } = useCart();

  // 1. Quản lý trạng thái Checkbox chọn sản phẩm thanh toán (Shopee Style)
  const [selectedIndices, setSelectedIndices] = useState([]);

  // Mặc định tự động chọn tất cả các sản phẩm khi giỏ hàng thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedIndices(cartItems.map((_, idx) => idx));
    } else {
      setSelectedIndices([]);
    }
  }, [cartItems.length]);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  // 2. Danh sách sản phẩm ĐƯỢC CHỌN thanh toán
  const selectedItems = useMemo(() => {
    return cartItems.filter((_, idx) => selectedIndices.includes(idx));
  }, [cartItems, selectedIndices]);

  // 3. Tính toán tiền hàng CHỈ DỰA TRÊN SẢN PHẨM ĐƯỢC CHỌN
  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = item.variant?.price || item.product.price || 1500000;
      return acc + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  const selectedTotal = useMemo(() => {
    return Math.max(0, selectedSubtotal - discountAmount);
  }, [selectedSubtotal, discountAmount]);

  // Xử lý chọn/bỏ chọn tất cả
  const isAllSelected = cartItems.length > 0 && selectedIndices.length === cartItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(cartItems.map((_, idx) => idx));
    }
  };

  // Xử lý chọn/bỏ chọn từng sản phẩm lẻ
  const handleToggleSelectOne = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = await applyCouponCode(couponInput, selectedSubtotal, selectedItems);
    setCouponSuccess(res.success);
    setCouponMsg(res.message);
  };

  const handleProceedCheckout = () => {
    if (selectedItems.length === 0) {
      if (showToast) {
        showToast({
          type: 'error',
          title: 'Chưa Chọn Sản Phẩm!',
          message: 'Vui lòng tích chọn ít nhất 1 sản phẩm để tiến hành thanh toán.',
        });
      } else {
        alert('Vui lòng tích chọn ít nhất 1 sản phẩm để tiến hành thanh toán!');
      }
      return;
    }

    // Lưu danh sách sản phẩm được chọn vào localStorage cho trang Checkout
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkout_selected_items', JSON.stringify(selectedItems));
    }

    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Hãy khám phá bộ sưu tập hơn 500+ mẫu kính cận và kính râm thời trang cao cấp tại NTD Eyewear.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black text-xs shadow-xl shadow-emerald-500/20 transition-all"
        >
          <span>Khám phá sản phẩm ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-slate-900" />
            <span>Giỏ Hàng Mua Sắm ({cartItems.length} món)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Tích chọn từng sản phẩm bạn muốn thanh toán (Phong cách Shopee)</p>
        </div>
        <Link href="/products" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Tiếp tục chọn kính
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items List Table with Checkboxes */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Thanh Chọn Tất Cả (Shopee Header) */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2.5 text-slate-700 font-bold hover:text-slate-900 transition-colors cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                isAllSelected ? 'bg-black border-slate-900 text-white' : 'border-slate-300 bg-white'
              }`}>
                {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span>Chọn Tất Cả ({cartItems.length} sản phẩm)</span>
            </button>

            <span className="text-slate-500">
              Đã chọn: <strong className="text-slate-900 font-black">{selectedItems.length}</strong> / {cartItems.length}
            </span>
          </div>

          {/* List of Cart Items */}
          <div className="divide-y divide-slate-800/80">
            {cartItems.map((item, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const itemPrice = item.variant?.price || item.product.price || 1500000;
              const itemTotal = itemPrice * item.quantity;
              const imgUrl =
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0].imageUrl
                  : item.product.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800';

              return (
                <div
                  key={idx}
                  className={`p-5 flex flex-col sm:flex-row items-center justify-between gap-5 transition-colors ${
                    isSelected ? 'bg-slate-900/5' : 'hover:bg-slate-100/30'
                  }`}
                >
                  {/* Checkbox + Product Info */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    {/* Checkbox lẻ từng món */}
                    <button
                      onClick={() => handleToggleSelectOne(idx)}
                      className="shrink-0 cursor-pointer p-1"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-black border-slate-900 text-white shadow-md' : 'border-slate-300 bg-slate-50'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>

                    <img src={imgUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.product.name}</h3>
                      <div className="text-xs text-slate-900 font-semibold mt-0.5">
                        Thương hiệu: {item.product.brand?.name || 'Ray-Ban'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">Màu: {item.variant?.color || 'Đen Nhám'}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">Độ: {item.variant?.degree || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity + Subtotal + Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
                    <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-300 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 text-slate-900 font-bold hover:bg-slate-600 flex items-center justify-center text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 text-slate-900 font-bold hover:bg-slate-600 flex items-center justify-center text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">{itemTotal.toLocaleString('vi-VN')} VNĐ</div>
                      <div className="text-[10px] text-slate-500 font-medium">{itemPrice.toLocaleString('vi-VN')} VNĐ / chiếc</div>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Bill Summary based ONLY on selected items */}
        <div className="space-y-6">
          {/* Coupon Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-2">
              <TicketPercent className="w-4 h-4 text-slate-900" />
              <span>Mã Giảm Giá / Voucher</span>
            </h3>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã (VD: SALE50K)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-100 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md shrink-0 cursor-pointer"
              >
                Áp dụng
              </button>
            </form>

            {couponMsg && (
              <p className={`text-xs font-semibold ${couponSuccess ? 'text-slate-900' : 'text-rose-400'}`}>
                {couponMsg}
              </p>
            )}
          </div>

          {/* Bill breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tóm tắt hóa đơn</h3>
              <span className="text-slate-900 font-bold text-xs">
                ({selectedItems.length} món được chọn)
              </span>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Tiền hàng ({selectedItems.length} món):</span>
                <span className="font-bold text-slate-900">{selectedSubtotal.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá Voucher:</span>
                <span className="font-bold text-slate-900">-{discountAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-slate-900">Miễn phí (0 VNĐ)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Tổng thanh toán:</span>
              <span className="font-black text-slate-900 text-xl">{selectedTotal.toLocaleString('vi-VN')} VNĐ</span>
            </div>

            <button
              onClick={handleProceedCheckout}
              disabled={selectedItems.length === 0}
              className={`w-full py-4 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 ${
                selectedItems.length > 0
                  ? 'bg-black hover:bg-slate-800 text-white shadow-emerald-500/25'
                  : 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-300'
              }`}
            >
              <span>TIẾN HÀNH THANH TOÁN ({selectedItems.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
