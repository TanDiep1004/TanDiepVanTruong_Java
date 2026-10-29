'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getToken } from '@/lib/auth';

const SAFE_EYEWEAR_PHOTOS = [
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
  'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800',
  'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800',
  'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800',
  'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=800',
  'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=800'
];

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const toastCtx = useToast();

  const brandName = product.brand?.name || 'Ray-Ban';
  const defaultIdx = (Number(product.id) || 1) % SAFE_EYEWEAR_PHOTOS.length;
  const safeFallback = SAFE_EYEWEAR_PHOTOS[defaultIdx];

  const rawImage =
    product.images && product.images.length > 0 && product.images[0].imageUrl
      ? product.images[0].imageUrl
      : product.imageUrl;

  const [imgSrc, setImgSrc] = useState(rawImage || safeFallback);

  useEffect(() => {
    const valid = rawImage && !rawImage.includes('wikimedia.org');
    setImgSrc(valid ? rawImage : safeFallback);
  }, [rawImage, safeFallback]);

  const price = product.price || 1500000;
  const originalPrice = product.originalPrice && product.originalPrice > price ? product.originalPrice : null;
  const discountPercent =
    product.discountPercent ||
    (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      if (toastCtx?.showToast) {
        toastCtx.showToast({
          type: 'error',
          title: 'Yêu Cầu Đăng Nhập!',
          message: 'Bạn cần đăng nhập tài khoản trước khi thêm sản phẩm vào giỏ hàng.',
        });
      }
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 1200);
      return;
    }

    const added = addToCart(product, null, 1);
    if (added && toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'success',
        title: 'Đã Thêm Vào Giỏ Hàng!',
        message: product.name,
        image: imgSrc,
      });
    }
  };

  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/10 hover:border-slate-900/40 transition-all duration-300 flex flex-col justify-between">
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(safeFallback)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Sale badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-rose-500 text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
            -{discountPercent}% OFF
          </span>
        )}
        {/* Brand tag */}
        <span className="absolute top-3 right-3 bg-slate-50/80 backdrop-blur text-slate-900 font-bold text-[10px] px-2.5 py-1 rounded-full border border-slate-900/30">
          {brandName}
        </span>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 mb-1.5 text-[11px]">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-500 font-semibold ml-1">(4.9)</span>
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-slate-900 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-base font-black text-slate-900">
              {Number(price).toLocaleString('vi-VN')} VNĐ
            </div>
            {originalPrice && (
              <div className="text-[11px] text-slate-500 line-through font-medium">
                {Number(originalPrice).toLocaleString('vi-VN')} VNĐ
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/products/${product.id}`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleQuickAdd}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold shadow-sm transition-all cursor-pointer"
              title="Thêm nhanh giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
