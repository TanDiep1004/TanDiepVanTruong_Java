'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Save, CheckSquare, Square } from 'lucide-react';
import { promotionService } from '@/services/promotionService';
import { productService } from '@/services/productService';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'FIXED',
    discountValue: 50000,
    applyTo: 'all',
    status: 1,
    productIds: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [promRes, prodRes] = await Promise.all([
        promotionService.getAllPromotionsAdmin(),
        productService.getAllProductsAdmin(),
      ]);
      if (promRes.data) setPromotions(promRes.data);
      if (prodRes.data) setProductList(prodRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Khuyến mãi/Sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPromotion(null);
    setFormData({
      name: '',
      code: 'KM' + Math.floor(Math.random() * 900 + 100),
      discountType: 'FIXED',
      discountValue: 50000,
      applyTo: 'all',
      status: 1,
      productIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPromotion(p);
    setFormData({
      name: p.name || '',
      code: p.code || '',
      discountType: p.discountType || 'FIXED',
      discountValue: p.discountValue || 0,
      applyTo: p.applyTo || 'all',
      status: p.status ?? 1,
      productIds: p.productIds || [],
    });
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId) => {
    setFormData((prev) => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập tên chương trình và mã giảm giá!');
      return;
    }
    if (formData.applyTo === 'specific' && formData.productIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm áp dụng giảm giá!');
      return;
    }

    try {
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, formData);
        alert('Cập nhật Mã giảm giá thành công!');
      } else {
        await promotionService.createPromotion(formData);
        alert('Thêm Mã giảm giá mới thành công!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu Khuyến mãi'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Mã giảm giá này khỏi CSDL không?')) return;
    try {
      await promotionService.deletePromotion(id);
      alert('Xóa Mã giảm giá thành công!');
      loadData();
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-slate-900" />
            <span>Quản lý Mã Giảm Giá & Sản Phẩm Khuyến Mãi (Bảng promotions)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình giảm giá cho toàn bộ cửa hàng hoặc chỉ áp dụng cho sản phẩm cụ thể</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm mã giảm giá mới</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải dữ liệu Khuyến mãi từ MySQL...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Tên chương trình</th>
                <th className="p-4">Mã Voucher</th>
                <th className="p-4">Mức giảm</th>
                <th className="p-4">Phạm vi áp dụng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Cập nhật bởi</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-700">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900">#{p.id}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{p.name}</td>
                  <td className="p-4 font-mono font-bold text-amber-400 px-3 py-1 bg-slate-50 rounded-lg w-fit border border-amber-500/20">{p.code}</td>
                  <td className="p-4 font-extrabold text-slate-900 text-sm">
                    {p.discountType === 'PERCENT' ? `${p.discountValue}%` : `${Number(p.discountValue).toLocaleString('vi-VN')} VNĐ`}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {p.applyTo === 'specific' ? (
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Chỉ sản phẩm chọn
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                        Tất cả sản phẩm
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      p.status === 1 ? 'bg-slate-900/10 text-slate-900 border-slate-900/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {p.status === 1 ? 'Khả dụng' : 'Khóa'}
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
                      title="Sửa mã"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                      title="Xóa mã"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-slate-900" />
                <span>{editingPromotion ? 'Cập Nhật Mã Giảm Giá #' + editingPromotion.id : 'Thêm Mã Giảm Giá Mới'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên chương trình khuyến mãi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm 50K cho Gọng Ray-Ban"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mã Voucher (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="SALE50K"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-100 text-slate-900 font-mono font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Loại giảm giá</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  >
                    <option value="FIXED">Tiền mặt (VNĐ)</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Giá trị giảm</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phạm vi sản phẩm áp dụng *</label>
                <select
                  value={formData.applyTo}
                  onChange={(e) => setFormData({ ...formData, applyTo: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                >
                  <option value="all">Tất cả sản phẩm trong cửa hàng</option>
                  <option value="specific">Chỉ áp dụng cho các sản phẩm được chọn bên dưới</option>
                </select>
              </div>

              {/* Danh sách chọn sản phẩm khi applyTo === 'specific' */}
              {formData.applyTo === 'specific' && (
                <div className="space-y-2 border border-slate-200 p-3 rounded-2xl bg-slate-50">
                  <label className="block text-slate-900 font-bold">Chọn các sản phẩm được áp dụng giảm giá:</label>
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {productList.map((prod) => {
                      const isSelected = formData.productIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProductSelection(prod.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-900/10 border-slate-900/40 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="font-semibold text-xs line-clamp-1">{prod.name} (ID: #{prod.id})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                >
                  <option value={1}>Khả dụng (Cho phép sử dụng)</option>
                  <option value={0}>Khóa tạm thời</option>
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
                  <span>{editingPromotion ? 'Lưu cập nhật' : 'Xác nhận thêm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
