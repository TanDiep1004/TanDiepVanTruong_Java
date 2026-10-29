'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';
import { bannerService } from '@/services/bannerService';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    position: 1,
    status: 1,
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAllBannersAdmin();
      if (res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách Banner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

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

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      imageUrl: '',
      link: '/products',
      position: banners.length + 1,
      status: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      link: banner.link || '',
      position: banner.position || 1,
      status: banner.status ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Vui lòng chọn hình ảnh Banner từ máy tính!');
      return;
    }

    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
        alert('Cập nhật Banner thành công!');
      } else {
        await bannerService.createBanner(formData);
        alert('Thêm Banner mới thành công!');
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu Banner'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Banner này khỏi CSDL không?')) return;
    try {
      await bannerService.deleteBanner(id);
      alert('Xóa Banner thành công!');
      loadBanners();
    } catch (err) {
      alert('Lỗi khi xóa Banner: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-slate-900" />
            <span>Quản lý Banner Quảng Cáo (Bảng banners)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tải ảnh Banner trực tiếp từ máy tính lên Slider trang chủ
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm banner mới</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải danh sách Banner từ MySQL...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 hover:border-slate-300 transition-all">
              <div className="h-44 bg-slate-50 rounded-xl overflow-hidden relative border border-slate-200">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-50/80 backdrop-blur text-slate-900 font-bold text-[11px] border border-slate-900/30">
                  Vị trí: #{b.position}
                </span>
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                  b.status === 1 ? 'bg-slate-900/20 text-slate-900 border-slate-900/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {b.status === 1 ? 'Hiển thị' : 'Ẩn'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{b.title || 'Banner Quảng Cáo'}</h3>
                <p className="text-xs text-slate-500 font-mono line-clamp-1">{b.link || 'Chưa gắn liên kết'}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">ID: #{b.id}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 font-bold cursor-pointer transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Thêm / Sửa Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-900" />
                <span>{editingBanner ? 'Cập Nhật Banner #' + editingBanner.id : 'Thêm Banner Quảng Cáo Mới'}</span>
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
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề Banner</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bộ Sưu Tập Mắt Kính Hè 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Upload Banner Image from Computer */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Hình ảnh Banner (Tải từ máy tính) *</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-20 h-14 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>CHỌN FILE BANNERS TỪ MÁY TÍNH</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đường dẫn liên kết khi bấm vào (Link)</label>
                <input
                  type="text"
                  placeholder="/products hoặc /promotions"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vị trí thứ tự</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
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
                  <span>{editingBanner ? 'Lưu cập nhật' : 'Xác nhận thêm Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
