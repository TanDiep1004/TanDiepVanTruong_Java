'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Glasses, Plus, Edit2, Trash2, Search, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';

const SAFE_EYEWEAR_PHOTOS = [
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=300',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=300',
  'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=300',
  'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=300',
  'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=300',
  'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=300',
  'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=300'
];

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [formData, setFormData] = useState({
    name: '',
    price: 1500000,
    originalPrice: 1875000,
    description: '',
    content: '',
    categoryId: 1,
    brandId: 1,
    status: 1,
    imageUrl: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        productService.getAllProductsAdmin(),
        categoryService.getAllCategoriesAdmin(),
        brandService.getAllBrandsAdmin(),
      ]);

      if (prodRes.data) {
        const prodList = prodRes.data.content || prodRes.data;
        setProducts(prodList);
      }
      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrands(brandRes.data);
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    const mainImg = product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : product.imageUrl || '';

    setFormData({
      name: product.name || '',
      price: product.price ? Number(product.price) : 1500000,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : 1875000,
      description: product.description || '',
      content: product.content || '',
      categoryId: product.category?.id || (categories[0]?.id || 1),
      brandId: product.brand?.id || (brands[0]?.id || 1),
      status: product.status ?? 1,
      imageUrl: mainImg,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Vui lòng nhập giá bán chính thức cho sản phẩm!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || Number(formData.price) * 1.25,
        description: formData.description,
        content: formData.content,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        status: formData.status,
        images: formData.imageUrl ? [{ imageUrl: formData.imageUrl, isPrimary: 1 }] : [],
      };

      await productService.updateProduct(editingProduct.id, payload);

      // Update localStorage backup
      try {
        const storedProds = JSON.parse(localStorage.getItem('stored_products') || '[]');
        const idx = storedProds.findIndex(p => p.id.toString() === editingProduct.id.toString());
        if (idx > -1) {
          storedProds[idx] = { ...storedProds[idx], ...payload };
          localStorage.setItem('stored_products', JSON.stringify(storedProds));
        }
      } catch (e) {}

      alert(`Cập nhật Sản phẩm #${editingProduct.id} thành công với Giá ${Number(formData.price).toLocaleString('vi-VN')} VNĐ!`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Lỗi khi cập nhật sản phẩm: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi CSDL không?')) return;
    try {
      await productService.deleteProduct(id);
      alert('Xóa sản phẩm thành công!');
      loadData();
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Glasses className="w-6 h-6 text-slate-900" />
            <span>Quản lý Sản Phẩm Mắt Kính (Bảng products)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách gọng kính, kính râm, giá bán và hình ảnh sản phẩm</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm theo tên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-900 text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
        />
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>

      {/* Products List Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải dữ liệu sản phẩm từ CSDL MySQL...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Thương hiệu</th>
                <th className="p-4">Giá bán (VNĐ)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Cập nhật bởi</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-700">
              {currentProducts.map((p) => {
                const raw = (p.images && p.images.length > 0) ? p.images[0].imageUrl : p.imageUrl;
                const fallbackIdx = (Number(p.id) || 1) % SAFE_EYEWEAR_PHOTOS.length;
                const safeFallback = SAFE_EYEWEAR_PHOTOS[fallbackIdx];
                const imgUrl = (raw && !raw.includes('wikimedia.org')) ? raw : safeFallback;
                const pPrice = p.price || 1500000;

                return (
                  <tr key={p.id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900">#{p.id}</td>
                    <td className="p-4">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        onError={(e) => { e.target.src = safeFallback; }}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900 max-w-xs">{p.name}</td>
                    <td className="p-4 text-slate-500">{p.category?.name || 'Gọng Kính Nam'}</td>
                    <td className="p-4 text-slate-500">{p.brand?.name || 'Ray-Ban'}</td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      {Number(pPrice).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-4">
                      <span className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        p.status === 1 ? 'bg-slate-900/10 text-slate-900 border-slate-900/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {p.status === 1 ? 'Đang bán' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] text-slate-500">
                      {p.updatedBy ? (
                        <div>
                          <div className="font-bold text-slate-700">{p.updatedBy.fullName || p.updatedBy.email}</div>
                          <div>{p.updatedAt ? new Date(p.updatedAt).toLocaleString('vi-VN') : ''}</div>
                        </div>
                      ) : (
                        <span className="italic text-slate-500">Chưa có</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-2 text-slate-500 hover:text-amber-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-100/20 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hiển thị trang <b className="text-slate-900">{currentPage}</b> trên <b className="text-slate-900">{totalPages}</b>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-slate-200 transition-colors"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-black text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-slate-200 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form Sửa Sản Phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Glasses className="w-5 h-5 text-slate-900" />
                <span>Chỉnh Sửa Sản Phẩm #{editingProduct?.id}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Tên mắt kính..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Upload image file from Computer */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Hình ảnh sản phẩm (Tải từ máy tính)</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>CHỌN FILE TỪ MÁY TÍNH</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Ô SỬA GIÁ BÁN CHÍNH THỨC & GIÁ GỐC NIÊM YẾT */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100/50 p-3.5 rounded-2xl border border-slate-300/50">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Giá bán chính thức (VNĐ) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 1500000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-100 text-slate-900 font-bold text-sm p-3 rounded-xl border border-slate-900/40 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Giá gốc niêm yết (VNĐ)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 1875000"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-100 text-slate-700 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Danh mục sản phẩm</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thương hiệu</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                    className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả ngắn</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả sản phẩm..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nội dung chi tiết (Thông số kính)</label>
                <textarea
                  rows="3"
                  placeholder="Thông số kỹ thuật gọng kính, tròng kính..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                >
                  <option value={1}>Đang bán</option>
                  <option value={0}>Ẩn tạm thời</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
