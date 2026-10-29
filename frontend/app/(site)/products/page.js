'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Glasses, Filter, Search, ChevronDown, RotateCcw, X, Shield, Sparkles, Check } from 'lucide-react';
import ProductCard from '@/app/_components/store/ProductCard';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

function ProductsContent() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get('brandId');
  const initialSearch = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  useEffect(() => {
    if (initialSearch !== null) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Bộ lọc cơ bản
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL');

  // Bộ lọc đặc tả kỹ thuật mắt kính (Eyewear Specifications)
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [shapeFilter, setShapeFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [featureFilter, setFeatureFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Reset về trang 1 khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, priceFilter, genderFilter, shapeFilter, materialFilter, featureFilter]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load Categories
      try {
        const catRes = await categoryService.getAllCategories();
        if (catRes.data) {
          setCategories(catRes.data.content || catRes.data || []);
        }
      } catch (e) {
        console.error('Lỗi API lấy danh mục:', e);
      }

      // Load Products
      let list = [];
      try {
        const res = await productService.getAllProductsPublic();
        if (res.data) {
          list = res.data.content || res.data;
        }
      } catch (e) {
        console.error('Lỗi API lấy sản phẩm:', e);
      }

      // Clear temporary test products from localStorage
      try {
        localStorage.removeItem('stored_products');
      } catch (e) {}

      // Deduplicate products by unique ID
      const uniqueProds = [];
      const seenIds = new Set();
      for (const p of list) {
        if (p && p.id && !seenIds.has(p.id.toString())) {
          seenIds.add(p.id.toString());
          uniqueProds.push(p);
        }
      }

      setProducts(uniqueProds);
      setLoading(false);
    }
    loadData();
  }, []);

  const hasActiveFilters = searchQuery !== '' || 
    selectedCategory !== 'ALL' || 
    selectedBrand !== 'ALL' || 
    priceFilter !== 'ALL' || 
    genderFilter !== 'ALL' || 
    shapeFilter !== 'ALL' || 
    materialFilter !== 'ALL' || 
    featureFilter !== 'ALL';

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setPriceFilter('ALL');
    setGenderFilter('ALL');
    setShapeFilter('ALL');
    setMaterialFilter('ALL');
    setFeatureFilter('ALL');
  };

  const filtered = products.filter((p) => {
    const fullText = `${p.name || ''} ${p.description || ''} ${p.content || ''} ${p.category?.name || ''} ${p.brand?.name || ''}`.toLowerCase();

    // 1. Search Query
    if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Category
    if (selectedCategory !== 'ALL') {
      const pCatName = (p.category?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const selCatName = selectedCategory.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (p.category?.name !== selectedCategory && pCatName !== selCatName) {
        return false;
      }
    }

    // 3. Brand
    if (selectedBrand !== 'ALL' && p.brand?.name !== selectedBrand) {
      return false;
    }

    // 4. Price
    const price = p.price || 1500000;
    if (priceFilter === 'UNDER_2M' && price >= 2000000) return false;
    if (priceFilter === '2M_4M' && (price < 2000000 || price > 4000000)) return false;
    if (priceFilter === 'ABOVE_4M' && price <= 4000000) return false;

    // 5. Giới tính (Gender)
    if (genderFilter !== 'ALL') {
      if (genderFilter === 'NAM' && !fullText.includes('nam') && !fullText.includes('men')) return false;
      if (genderFilter === 'NU' && !fullText.includes('nữ') && !fullText.includes('nu') && !fullText.includes('women')) return false;
      if (genderFilter === 'UNISEX' && !fullText.includes('unisex') && (fullText.includes('nam') && fullText.includes('nữ'))) return false;
    }

    // 6. Kiểu dáng gọng (Frame Shape)
    if (shapeFilter !== 'ALL') {
      const s = shapeFilter.toLowerCase();
      if (!fullText.includes(s)) return false;
    }

    // 7. Chất liệu gọng (Frame Material)
    if (materialFilter !== 'ALL') {
      const m = materialFilter.toLowerCase();
      if (!fullText.includes(m)) return false;
    }

    // 8. Tính năng bảo vệ tròng kính (Lens Features)
    if (featureFilter !== 'ALL') {
      if (featureFilter === 'UV' && !fullText.includes('uv')) return false;
      if (featureFilter === 'BLUE' && !fullText.includes('xanh') && !fullText.includes('blue')) return false;
      if (featureFilter === 'PHOTO' && !fullText.includes('đổi màu') && !fullText.includes('photochromic')) return false;
      if (featureFilter === 'AR' && !fullText.includes('chống lóa') && !fullText.includes('phản quang')) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filtered.slice(indexOfFirstProduct, indexOfLastProduct);

  const categoryOptions = ['ALL', ...categories.map(c => c.name)];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Glasses className="w-8 h-8 text-slate-900" />
            <span>Bộ Sưu Tập Mắt Kính Cao Cấp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Khám phá các thiết kế gọng kính cận, kính râm nam nữ và kính thể thao phân loại theo đặc tả kỹ thuật
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm mắt kính, thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar Filter & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter Đa Chiều */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-6 h-fit space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-slate-900" />
              <span>Bộ Lọc Kỹ Thuật</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetAllFilters}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* 1. Lọc Giới tính (Gender) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Giới tính (Gender)</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'NAM', label: 'Nam' },
                { id: 'NU', label: 'Nữ' },
                { id: 'UNISEX', label: 'Unisex' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenderFilter(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-center font-semibold transition-all cursor-pointer ${
                    genderFilter === g.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Lọc Kiểu dáng gọng (Frame Shape) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Kiểu dáng gọng (Shape)</label>
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'Tất cả kiểu dáng' },
                { id: 'vuông', label: 'Gọng Vuông (Square)' },
                { id: 'tròn', label: 'Gọng Tròn (Round)' },
                { id: 'chữ nhật', label: 'Chữ nhật (Rectangle)' },
                { id: 'aviator', label: 'Phi công (Aviator)' },
                { id: 'mắt mèo', label: 'Mắt mèo (Cat-eye)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShapeFilter(s.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    shapeFilter === s.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lọc Chất liệu gọng (Frame Material) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Chất liệu gọng</label>
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'Tất cả chất liệu' },
                { id: 'titanium', label: 'Titanium Siêu Nhẹ' },
                { id: 'acetate', label: 'Nhựa Acetate Cao Cấp' },
                { id: 'tr90', label: 'Nhựa dẻo TR90' },
                { id: 'kim loại', label: 'Kim loại mạ vàng / bạc' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMaterialFilter(m.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    materialFilter === m.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Lọc Tính năng bảo vệ tròng kính (Lens Features) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Tính năng bảo vệ</label>
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'Tất cả tính năng' },
                { id: 'UV', label: '🛡️ Chống tia UV400 (100%)' },
                { id: 'BLUE', label: '💻 Lọc ánh sáng xanh' },
                { id: 'PHOTO', label: '☀️ Đổi màu khi ra nắng' },
                { id: 'AR', label: '✨ Chống lóa / Phản quang' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeatureFilter(f.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    featureFilter === f.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Category Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Danh mục sản phẩm</label>
            <div className="space-y-1">
              {categoryOptions.map((cat, idx) => (
                <button
                  key={`cat-${idx}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    selectedCategory === cat ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'Tất cả danh mục' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Brand Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Thương hiệu</label>
            <div className="space-y-1">
              {['ALL', 'Ray-Ban', 'Gucci', 'Gentle Monster', 'Oakley'].map((b, idx) => (
                <button
                  key={`brand-${b}-${idx}`}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    selectedBrand === b ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {b === 'ALL' ? 'Tất cả thương hiệu' : b}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Price Range Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase">Khoảng giá</label>
            <div className="space-y-1 text-xs text-slate-500">
              {[
                { id: 'ALL', label: 'Tất cả mức giá' },
                { id: 'UNDER_2M', label: 'Dưới 2.000.000 đ' },
                { id: '2M_4M', label: '2.000.000 - 4.000.000 đ' },
                { id: 'ABOVE_4M', label: 'Trên 4.000.000 đ' },
              ].map((p, idx) => (
                <button
                  key={`price-${p.id}-${idx}`}
                  onClick={() => setPriceFilter(p.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-colors ${
                    priceFilter === p.id ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị <b className="text-slate-900">{filtered.length}</b> mẫu mắt kính phù hợp</span>
            {hasActiveFilters && (
              <span className="text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                Đang áp dụng bộ lọc đặc tả
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentProducts.map((product, idx) => (
              <ProductCard key={product.id ? `prod-${product.id}-${idx}` : idx} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 space-y-3">
              <Glasses className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-900 text-base">Không tìm thấy mẫu kính nào phù hợp</div>
              <p className="text-xs text-slate-400">Hãy thử đổi các tiêu chí lọc như giới tính, chất liệu hoặc mức giá</p>
              <button
                onClick={handleResetAllFilters}
                className="mt-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Trang <b className="text-slate-900">{currentPage}</b> / {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-black text-white shadow-md'
                        : 'border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
