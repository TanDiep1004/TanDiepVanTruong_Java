'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { articleService } from '@/services/articleService';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    content: '',
  });

  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await articleService.getAllArticlesAdmin();
      if (res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải Bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      thumbnail: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a) => {
    setEditingArticle(a);
    setFormData({
      title: a.title || '',
      thumbnail: a.thumbnail || '',
      content: a.content || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    try {
      if (editingArticle) {
        await articleService.updateArticle(editingArticle.id, formData);
        alert('Cập nhật Bài viết thành công!');
      } else {
        await articleService.createArticle(formData);
        alert('Thêm Bài viết mới thành công!');
      }
      setIsModalOpen(false);
      loadArticles();
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu Bài viết'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Bài viết này khỏi CSDL không?')) return;
    try {
      await articleService.deleteArticle(id);
      alert('Xóa Bài viết thành công!');
      loadArticles();
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
            <FileText className="w-6 h-6 text-slate-900" />
            <span>Quản lý Bài Viết Tin Tức (Bảng articles)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cập nhật tin tức thị lực, hướng dẫn chọn mắt kính, tải ảnh từ máy tính</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm bài viết mới</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải dữ liệu Bài viết từ MySQL...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 hover:border-slate-300 transition-all">
              <div className="h-44 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                <img src={a.thumbnail || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800'} alt={a.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{a.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3">{a.content || 'Nội dung chi tiết...'}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">ID: #{a.id}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(a)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 font-bold cursor-pointer transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
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

      {/* Modal Form Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-900" />
                <span>{editingArticle ? 'Cập Nhật Bài Viết #' + editingArticle.id : 'Thêm Bài Viết Tin Tức Mới'}</span>
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
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cách chọn gọng kính cận phù hợp với từng khuôn mặt"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Upload Article Thumbnail Image from Computer */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Ảnh đại diện bài viết (Tải từ máy tính)</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-20 h-14 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.thumbnail ? (
                      <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>CHỌN FILE BÀI VIẾT TỪ MÁY TÍNH</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nội dung chi tiết bài viết</label>
                <textarea
                  rows="5"
                  placeholder="Viết nội dung bài viết tin tức tại đây..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
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
                  <span>{editingArticle ? 'Lưu cập nhật' : 'Xác nhận đăng bài'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
