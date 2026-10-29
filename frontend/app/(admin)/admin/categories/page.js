'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { categoryService } from '@/services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    status: 1,
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategoriesAdmin();
      if (res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải Danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sortOrder: categories.length + 1,
      status: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
      status: cat.status ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        alert('Cập nhật Danh mục thành công!');
      } else {
        await categoryService.createCategory(formData);
        alert('Thêm Danh mục mới thành công!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu Danh mục'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Danh mục này khỏi CSDL không?')) return;
    try {
      await categoryService.deleteCategory(id);
      alert('Xóa Danh mục thành công!');
      loadCategories();
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
            <FolderTree className="w-6 h-6 text-slate-900" />
            <span>Quản lý Danh Mục Sản Phẩm (Bảng categories)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Phân loại mắt kính nam, nữ, kính râm, tròng kính cận</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm danh mục mới</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải dữ liệu Danh mục từ MySQL...</span>
          </div>
        </div>
      ) : (
        /* Table list */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Tên danh mục</th>
                <th className="p-4">Slug URL</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4">Thứ tự</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Cập nhật bởi</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-700">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900">#{c.id}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{c.name}</td>
                  <td className="p-4 font-mono text-slate-500">{c.slug}</td>
                  <td className="p-4 text-slate-700 line-clamp-1 max-w-xs">{c.description || 'Chưa có mô tả'}</td>
                  <td className="p-4 font-semibold text-amber-400">#{c.sortOrder}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      c.status === 1 ? 'bg-slate-900/10 text-slate-900 border-slate-900/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {c.status === 1 ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="p-4 text-[11px] text-slate-500">
                    {c.updatedBy ? (
                      <div>
                        <div className="font-bold text-slate-700">{c.updatedBy.fullName || c.updatedBy.email}</div>
                        <div>{c.updatedAt ? new Date(c.updatedAt).toLocaleString('vi-VN') : ''}</div>
                      </div>
                    ) : (
                      <span className="italic text-slate-500">Chưa có</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-2 text-slate-500 hover:text-amber-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                      title="Sửa danh mục"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                      title="Xóa danh mục"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-slate-900" />
                <span>{editingCategory ? 'Cập Nhật Danh Mục #' + editingCategory.id : 'Thêm Danh Mục Sản Phẩm Mới'}</span>
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
                <label className="block text-slate-700 font-bold mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gọng Kính Nam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Slug đường dẫn (Tự động nếu trống)</label>
                <input
                  type="text"
                  placeholder="gong-kinh-nam"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả ngắn</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả danh mục..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thứ tự ưu tiên</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
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
                    <option value={1}>Hiển thị Cửa hàng</option>
                    <option value={0}>Ẩn tạm thời</option>
                  </select>
                </div>
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
                  <span>{editingCategory ? 'Lưu cập nhật' : 'Xác nhận thêm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
