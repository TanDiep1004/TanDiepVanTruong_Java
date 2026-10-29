'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Trash2, Clock, Check } from 'lucide-react';
import { contactService } from '@/services/contactService';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.getAllContactsAdmin();
      if (res.data) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải Liên hệ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await contactService.updateStatus(id, newStatus);
      alert('Đã cập nhật trạng thái liên hệ!');
      loadContacts();
    } catch (err) {
      alert('Lỗi khi cập nhật: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn Liên hệ này không?')) return;
    try {
      await contactService.deleteContact(id);
      alert('Đã xóa liên hệ!');
      loadContacts();
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-slate-900" />
          <span>Quản lý Yêu Cầu Liên Hệ & Tư Vấn (Bảng contacts)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Danh sách thắc mắc, yêu cầu tư vấn gọng kính và lịch đo mắt của khách hàng</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Đang tải dữ liệu Liên hệ từ MySQL...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Thông tin liên hệ</th>
                <th className="p-4">Nội dung thắc mắc</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-700">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900">#{c.id}</td>
                  <td className="p-4 font-black text-slate-900 text-sm">{c.customerName || 'Khách hàng ẩn danh'}</td>
                  <td className="p-4 space-y-1">
                    <p className="font-semibold text-slate-700">{c.phone}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                  </td>
                  <td className="p-4 text-slate-700 max-w-sm">{c.message}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      c.status === 'PROCESSED'
                        ? 'bg-slate-900/10 text-slate-900 border-slate-900/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {c.status === 'PROCESSED' ? 'Đã xử lý' : 'Chờ tư vấn'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {c.status !== 'PROCESSED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'PROCESSED')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 border border-slate-900/30 font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                        title="Đánh dấu đã tư vấn"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã tư vấn</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all inline-block"
                      title="Xóa liên hệ"
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
    </div>
  );
}
