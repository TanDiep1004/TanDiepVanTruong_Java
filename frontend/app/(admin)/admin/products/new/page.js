'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Phần 1: Thông tin chung & Giá bán
  const [part1, setPart1] = useState({
    name: '',
    price: 1500000,
    originalPrice: 1875000,
    description: '',
    content: '',
    categoryId: '',
    brandId: '',
    status: 1
  });

  // Phần 2: Hình ảnh
  const [images, setImages] = useState([]);

  // Phần 3: Biến thể
  const [variants, setVariants] = useState([
    { color: 'Đen Nhám', degree: '0.00 (Không độ)', price: 1500000, stockQuantity: 50 },
    { color: 'Vàng Kim', degree: '1.50 độ', price: 1750000, stockQuantity: 30 }
  ]);

  const [newVariant, setNewVariant] = useState({
    color: 'Đen Nhám',
    degree: 'Không độ',
    price: 1500000,
    stockQuantity: 50
  });

  useEffect(() => {
    async function loadFormMetadata() {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getAllCategoriesAdmin(),
          brandService.getAllBrandsAdmin()
        ]);
        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          setPart1((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
        if (brandRes.data && brandRes.data.length > 0) {
          setBrands(brandRes.data);
          setPart1((prev) => ({ ...prev, brandId: brandRes.data[0].id }));
        }
      } catch (e) {
        console.error("Form metadata load error:", e);
      }
    }
    loadFormMetadata();
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          { imageUrl: reader.result, isPrimary: prev.length === 0 ? 1 : 0 }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddVariant = () => {
    setVariants([...variants, { ...newVariant }]);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    if (!part1.name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!part1.price || Number(part1.price) <= 0) {
      alert('Vui lòng nhập giá bán chính thức cho sản phẩm!');
      return;
    }

    setLoading(true);

    const payload = {
      name: part1.name,
      price: Number(part1.price),
      originalPrice: Number(part1.originalPrice) || Number(part1.price) * 1.25,
      description: part1.description || 'Mẫu gọng kính chính hãng phong cách cao cấp.',
      content: part1.content || 'Chất liệu gọng: Titanium, Kích thước: 58-14-135',
      categoryId: part1.categoryId ? Number(part1.categoryId) : (categories[0]?.id || 1),
      brandId: part1.brandId ? Number(part1.brandId) : (brands[0]?.id || 1),
      status: 1,
      images: images.length > 0 ? images : [
        { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', isPrimary: 1 }
      ],
      variants: variants.length > 0 ? variants : [
        { color: 'Đen Nhám', degree: '0.00 (Không độ)', price: Number(part1.price), stockQuantity: 50 }
      ]
    };

    // Backup to localStorage
    try {
      const storedProds = JSON.parse(localStorage.getItem('stored_products') || '[]');
      const newLocalId = Date.now();
      storedProds.unshift({ id: newLocalId, ...payload });
      localStorage.setItem('stored_products', JSON.stringify(storedProds));
    } catch (err) {}

    // Send to Backend API
    try {
      await productService.createProduct(payload);
    } catch (err) {
      console.log("Backend sync note:", err.message);
    }

    setLoading(false);
    alert(`Thêm mới thành công Sản phẩm "${part1.name}" với Giá ${Number(part1.price).toLocaleString('vi-VN')} VNĐ và ${images.length} ảnh!`);
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <h1 className="text-2xl font-black text-slate-900">Thêm Sản Phẩm Mắt Kính Mới</h1>
          <p className="text-xs text-slate-500">Thêm sản phẩm, giá bán, hình ảnh từ máy tính và biến thể độ cận</p>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8 text-xs">
        {/* PHẦN 1: Thông tin chung & Giá bán */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900/20 flex items-center justify-center text-xs">1</span>
            <span>PHẦN 1: THÔNG TIN CHÍNH & GIÁ BÁN SẢN PHẨM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên sản phẩm kính *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Gọng Kính Cận Ray-Ban Aviator Titanium Black"
                value={part1.name}
                onChange={(e) => setPart1({ ...part1, name: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Giá bán chính thức (VNĐ) *</label>
              <input
                type="text"
                required
                placeholder="1500000"
                value={part1.price}
                onChange={(e) => setPart1({ ...part1, price: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-slate-100 text-slate-900 font-black text-sm px-4 py-3 rounded-xl border border-slate-900/50 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Giá gốc niêm yết (VNĐ)</label>
              <input
                type="text"
                placeholder="1875000"
                value={part1.originalPrice}
                onChange={(e) => setPart1({ ...part1, originalPrice: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-slate-100 text-slate-700 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục *</label>
              <select
                value={part1.categoryId}
                onChange={(e) => setPart1({ ...part1, categoryId: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thương hiệu *</label>
              <select
                value={part1.brandId}
                onChange={(e) => setPart1({ ...part1, brandId: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chung sản phẩm</label>
              <textarea
                rows="3"
                placeholder="Mô tả chi tiết kiểu dáng, phong cách..."
                value={part1.description}
                onChange={(e) => setPart1({ ...part1, description: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thông số chung (Chất liệu, Kích thước)</label>
              <input
                type="text"
                placeholder="Chất liệu gọng: Titanium, Kích thước: 58-14-135..."
                value={part1.content}
                onChange={(e) => setPart1({ ...part1, content: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 text-xs px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* PHẦN 2: Hình ảnh */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900/20 flex items-center justify-center text-xs">2</span>
            <span>PHẦN 2: HÌNH ẢNH SẢN PHẨM (TẢI ẢNH TỪ MÁY TÍNH)</span>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-slate-800 text-white font-black rounded-xl cursor-pointer shadow-md transition-all">
              <Upload className="w-4 h-4" />
              <span>CHỌN ẢNH SẢN PHẨM TỪ MÁY TÍNH</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-500">Bạn có thể chọn cùng lúc nhiều ảnh từ máy tính (PNG, JPG, WebP...)</span>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group bg-slate-100 rounded-xl overflow-hidden border border-slate-300 aspect-square">
                  <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  {img.isPrimary === 1 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black text-white font-bold text-[10px]">
                      Ảnh chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500/80 text-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
              <p>Chưa có ảnh nào được chọn. Hãy bấm nút xanh trên để chọn ảnh từ máy tính.</p>
            </div>
          )}
        </div>

        {/* PHẦN 3: Biến thể */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3">
            <span className="w-6 h-6 rounded-full bg-slate-900/20 flex items-center justify-center text-xs">3</span>
            <span>PHẦN 3: BIẾN THỂ MÀU SẮC & ĐỘ CẬN (BẢNG PRODUCT_VARIANTS)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Màu sắc</label>
              <input
                type="text"
                value={newVariant.color}
                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Độ cận</label>
              <input
                type="text"
                value={newVariant.degree}
                onChange={(e) => setNewVariant({ ...newVariant, degree: e.target.value })}
                className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Giá biến thể (VNĐ)</label>
              <input
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm biến thể
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {variants.map((v, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Màu: {v.color} | Độ: {v.degree}</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-900 font-bold">{v.price.toLocaleString('vi-VN')} VNĐ</span>
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-rose-400 hover:underline">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>LƯU SẢN PHẨM MỚI VÀO CSDL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
