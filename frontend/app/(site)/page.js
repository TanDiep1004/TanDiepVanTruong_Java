'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Glasses,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileText,
  Building2,
  Tag
} from 'lucide-react';
import ProductCard from '@/app/_components/store/ProductCard';
import { bannerService } from '@/services/bannerService';
import { brandService } from '@/services/brandService';
import { productService } from '@/services/productService';
import { articleService } from '@/services/articleService';

export default function StoreHomePage() {
  const defaultBanners = [
    {
      id: 1,
      title: 'BỘ SƯU TẬP MẮT KÍNH SANG TRỌNG 2026',
      subtitle: 'Giảm tới 30% cho các thương hiệu Ray-Ban, Gucci & Gentle Monster',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600'
    },
    {
      id: 2,
      title: 'GỌNG KÍNH CẬN THỜI TRANG CAO CẤP',
      subtitle: 'Chất liệu Titanium & Acetate siêu nhẹ, bảo vệ đôi mắt hoàn hảo',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1600'
    }
  ];

  const defaultBrands = [
    { id: 1, name: 'Ray-Ban', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ray-Ban_logo.svg/800px-Ray-Ban_logo.svg.png' },
    { id: 2, name: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Gucci_logo.svg/800px-Gucci_logo.svg.png' },
    { id: 3, name: 'Gentle Monster', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Gentle_Monster_logo.svg/800px-Gentle_Monster_logo.svg.png' },
    { id: 4, name: 'Oakley', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Oakley_logo.svg/800px-Oakley_logo.svg.png' }
  ];

  const [banners, setBanners] = useState(defaultBanners);
  const [brands, setBrands] = useState(defaultBrands);
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      let activeBanners = defaultBanners;
      let activeBrands = defaultBrands;
      let defaultProds = [
        {
          id: 1,
          name: 'Kính Râm Ray-Ban Aviator Classic RB3025 G-15',
          price: 3250000,
          originalPrice: 4100000,
          brand: { name: 'Ray-Ban' },
          imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800'
        },
        {
          id: 2,
          name: 'Gọng Kính Cận Gucci Square Acetate Frame Gold',
          price: 4800000,
          originalPrice: 5600000,
          brand: { name: 'Gucci' },
          imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800'
        },
        {
          id: 3,
          name: 'Kính Râm Gentle Monster Her 01 Oversized Black',
          price: 6200000,
          originalPrice: 7000000,
          brand: { name: 'Gentle Monster' },
          imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800'
        },
        {
          id: 4,
          name: 'Kính Mát Oakley Holbrook Matte Black Prizm Sapphire',
          price: 4150000,
          originalPrice: 4900000,
          brand: { name: 'Oakley' },
          imageUrl: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=800'
        }
      ];

      // 1. Fetch Banners
      try {
        const bRes = await bannerService.getAllBannersPublic();
        if (bRes.data && bRes.data.length > 0) {
          activeBanners = bRes.data;
        }
      } catch (e) {}

      // 2. Fetch Brands
      try {
        const brRes = await brandService.getAllBrands();
        if (brRes.data && brRes.data.length > 0) {
          activeBrands = brRes.data;
        }
      } catch (e) {}

      // 3. Fetch Products
      try {
        const pRes = await productService.getAllProductsPublic();
        if (pRes.data) {
          const list = pRes.data.content || pRes.data;
          if (list.length > 0) defaultProds = list;
        }
      } catch (e) {}

      // Clear temporary test products from localStorage
      try {
        localStorage.removeItem('stored_products');
      } catch (e) {}

      // Deduplicate products by unique ID
      const uniqueProds = [];
      const seenIds = new Set();
      for (const p of defaultProds) {
        if (p && p.id && !seenIds.has(p.id.toString())) {
          seenIds.add(p.id.toString());
          uniqueProds.push(p);
        }
      }

      // 4. Fetch Articles
      let defaultArts = [
        {
          id: 1,
          title: 'Bí quyết chọn gọng kính cận phù hợp từng tỷ lệ khuôn mặt',
          content: 'Hướng dẫn chi tiết cách xác định dáng mặt tròn, vuông, trái xoan để chọn gọng kính tôn dáng nhất.',
          thumbnail: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800'
        },
        {
          id: 2,
          title: 'Tròng kính chống ánh sáng xanh có thực sự bảo vệ mắt?',
          content: 'Giải mã công nghệ lọc ánh sáng xanh từ màn hình máy tính, điện thoại giúp bớt mỏi mắt.',
          thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800'
        },
        {
          id: 3,
          title: 'Top 5 xu hướng kính râm sang trọng dẫn đầu năm 2026',
          content: 'Khám phá các thiết kế kính mát Oversized, Cat-Eye và kính phi công mạ vàng quyến rũ.',
          thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800'
        }
      ];

      try {
        const artRes = await articleService.getAllArticlesPublic();
        const articlesList = artRes.data || (Array.isArray(artRes) ? artRes : null);
        if (articlesList && articlesList.length > 0) {
          defaultArts = articlesList;
        }
      } catch (e) {}

      setBanners(activeBanners);
      setBrands(activeBrands);
      setProducts(uniqueProds);
      setArticles(defaultArts);
      setLoading(false);
    }

    loadHomeData();
  }, []);

  // Slide tự động chuyển đổi
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <div className="space-y-16 pb-20">
      {/* 💥 HERO CAROUSEL BANNER */}
      <section className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-slate-50">
        {banners.map((banner, index) => (
          <div
            key={banner.id ? `banner-${banner.id}-${index}` : index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-950/80 to-transparent z-10" />
            <img
              src={banner.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600'}
              alt={banner.title || 'Mắt kính cao cấp'}
              className="w-full h-full object-cover object-center scale-105 animate-pulse-subtle"
            />

            {/* Banner Text Content */}
            <div className="absolute inset-0 z-20 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-slate-900/30 text-slate-900 text-xs font-extrabold uppercase tracking-wider w-fit">
                <Sparkles className="w-4 h-4" />
                <span>CHÍNH HÃNG 100% • BẢO HÀNH 2 NĂM</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight max-w-2xl drop-shadow-lg">
                {banner.title || 'BỘ SƯU TẬP MẮT KÍNH SANG TRỌNG 2026'}
              </h1>

              <p className="text-sm md:text-lg text-slate-700 max-w-xl line-clamp-2 leading-relaxed">
                {banner.subtitle || banner.description || 'Khám phá các thiết kế gọng kính cận & kính râm thời thượng nhất.'}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>MUA NGAY HÔM NAY</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2.5 bg-slate-200 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 🛡️ VALUE PROPOSITIONS (CAM KẾT DỊCH VỤ) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center gap-4 hover:border-slate-900/40 transition-colors">
            <div className="p-3.5 rounded-xl bg-white/10 text-slate-900 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chính Hãng 100%</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cam kết hoàn tiền 200% nếu giả</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center gap-4 hover:border-slate-900/40 transition-colors">
            <div className="p-3.5 rounded-xl bg-white/10 text-slate-900 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Giao Hàng Toàn Quốc</h3>
              <p className="text-xs text-slate-500 mt-0.5">Freeship đơn từ 500.000 VNĐ</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center gap-4 hover:border-slate-900/40 transition-colors">
            <div className="p-3.5 rounded-xl bg-white/10 text-slate-900 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Đổi Trả Trong 7 Ngày</h3>
              <p className="text-xs text-slate-500 mt-0.5">Miễn phí nếu lỗi nhà sản xuất</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center gap-4 hover:border-slate-900/40 transition-colors">
            <div className="p-3.5 rounded-xl bg-white/10 text-slate-900 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tư Vấn Đo Khám Mắt</h3>
              <p className="text-xs text-slate-500 mt-0.5">Đo mắt miễn phí tại cửa hàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ BRANDS LOGOS SLIDER (THƯƠNG HIỆU ĐỐI TÁC) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-900" />
              <span>Thương Hiệu Mắt Kính Nổi Tiếng</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Đại lý phân phối ủy quyền chính hãng Ray-Ban, Gucci, Gentle Monster, Oakley</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {brands.map((brand, idx) => (
            <Link
              key={brand.id ? `brand-${brand.id}-${idx}` : idx}
              href={`/products?brandId=${brand.id}`}
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-900/50 transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-28 h-12 flex items-center justify-center bg-white p-2.5 rounded-2xl shadow-md">
                <img
                  src={brand.logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ray-Ban_logo.svg/800px-Ray-Ban_logo.svg.png'}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition-all"
                />
              </div>
              <span className="font-bold text-slate-900 text-xs group-hover:text-slate-900 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Mắt Kính Bán Chạy & Mới Về</h2>
            <p className="text-xs text-slate-500 mt-1">Những mẫu gọng kính cận và kính râm hot nhất thị trường</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs hover:bg-slate-100"
          >
            <span>Xem tất cả ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải danh sách mắt kính...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, idx) => (
              <ProductCard key={product.id ? `prod-${product.id}-${idx}` : idx} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 📰 ARTICLES NEWS SECTION (TIN TỨC MẮT KÍNH) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-slate-900" />
              <span>Góc Tư Vấn & Tin Tức Mắt Kính</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Kiến thức chăm sóc mắt và xu hướng thời trang kính mới nhất</p>
          </div>
          <Link
            href="/articles"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs hover:bg-slate-100"
          >
            <span>Tất cả bài viết</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((art, idx) => (
            <Link
              key={art.id ? `art-${art.id}-${idx}` : idx}
              href={`/articles/${art.id}`}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl hover:border-slate-300 transition-all group flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-50 overflow-hidden relative">
                <img
                  src={art.thumbnail || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-900 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {art.content}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1 text-xs font-bold text-slate-900">
                  <span>Đọc tiếp bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
