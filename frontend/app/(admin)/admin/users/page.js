'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, fullName: 'Aigars Silkalns (Admin)', email: 'admin@matkinh.com', role: 'admin', phone: '0988888888', status: 1, address: 'Buồng Lái Hệ Thống Admin Haze' },
    { id: 2, fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'customer', phone: '0912345678', status: 1, address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM' },
    { id: 3, fullName: 'Trần Thị Mai', email: 'mai.tran@gmail.com', role: 'customer', phone: '0987654321', status: 1, address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM' },
  ]);

  useEffect(() => {
    async function loadUsers() {
      // 1. Combine default users + locally registered users
      let combined = [
        { id: 1, fullName: 'Aigars Silkalns (Admin)', email: 'admin@matkinh.com', role: 'admin', phone: '0988888888', status: 1, address: 'Buồng Lái Hệ Thống Admin Haze' },
        { id: 2, fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'customer', phone: '0912345678', status: 1, address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM' },
        { id: 3, fullName: 'Trần Thị Mai', email: 'mai.tran@gmail.com', role: 'customer', phone: '0987654321', status: 1, address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM' },
      ];

      try {
        const localReg = JSON.parse(localStorage.getItem('registered_users') || '[]');
        localReg.forEach((u, idx) => {
          if (!combined.some(existing => existing.email.toLowerCase() === u.email.toLowerCase())) {
            combined.push({
              id: combined.length + 1,
              fullName: u.fullName || u.email.split('@')[0],
              email: u.email,
              role: u.role || 'customer',
              phone: u.phone || '0912345678',
              status: 1,
              address: 'Chưa cập nhật địa chỉ mặc định',
            });
          }
        });
      } catch (e) {}

      // 2. Fetch from backend API if available
      try {
        const res = await fetchApi('/admin/users');
        if (res.data && res.data.length > 0) {
          setUsers(res.data);
          return;
        }
      } catch (e) {}

      setUsers(combined);
    }

    loadUsers();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-900" />
            <span>Quản lý Tài Khoản & Sổ Địa Chỉ (Bảng users & user_addresses)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách tài khoản Admin, Nhân viên Staff và Khách hàng vừa đăng ký mới</p>
        </div>
        <span className="text-xs font-bold text-slate-900 bg-slate-900/10 px-3 py-1.5 rounded-xl border border-slate-900/20">
          Tổng số: {users.length} tài khoản
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Họ và tên</th>
              <th className="p-4">Email / Tên đăng nhập</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4">Phân quyền (Role)</th>
              <th className="p-4">Địa chỉ giao hàng (user_addresses)</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="p-4 font-bold text-slate-900">#{u.id}</td>
                <td className="p-4 font-bold text-slate-900 text-sm">{u.fullName || u.customerName}</td>
                <td className="p-4 font-mono text-slate-700">{u.email}</td>
                <td className="p-4 text-slate-500">{u.phone || 'N/A'}</td>
                <td className="p-4">
                  <span className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    {u.role || 'CUSTOMER'}
                  </span>
                </td>
                <td className="p-4 text-slate-500 max-w-xs truncate">{u.address || 'Chưa có địa chỉ'}</td>
                <td className="p-4">
                  <span className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/10 text-slate-900 border border-slate-900/20">
                    Hoạt động
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
