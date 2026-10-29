'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

const StatusBadge = ({ status }) => {
  const normStatus = status ? status.toUpperCase() : 'PENDING';
  const colors = {
    PENDING: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    PROCESSING: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    SHIPPING: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
    DELIVERED: "bg-slate-900/20 text-emerald-500 border-slate-900/30",
    CANCELLED: "bg-rose-500/20 text-rose-500 border-rose-500/30",
  };

  const labels = {
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    DELIVERED: "Hoàn thành",
    CANCELLED: "Đã hủy"
  };

  const colorClass = colors[normStatus] || colors.PENDING;
  const label = labels[normStatus] || normStatus;

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${colorClass}`}>
      {label}
    </span>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = async () => {
    let combined = [];

    try {
      const res = await fetchApi('/admin/orders');
      if (res.data && res.data.length > 0) {
        let dbOrders = res.data;
        // Merge with local if needed, though db should be source of truth now
        try {
          const localPlaced = JSON.parse(localStorage.getItem('placed_orders') || '[]');
          localPlaced.forEach((o) => {
            if (!dbOrders.some(existing => existing.id === o.id)) {
              dbOrders.unshift(o);
            }
          });
        } catch (e) {}
        setOrders(dbOrders);
        setLoading(false);
        return;
      }
    } catch (e) {}

    setOrders(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await fetchApi(`/admin/orders/${orderId}/status?status=${newStatus}`, { method: 'PUT' });
      await loadOrders(); // Tải lại danh sách để lấy thông tin người cập nhật mới nhất
      
      // Update local storage just in case
      try {
        const localPlaced = JSON.parse(localStorage.getItem('placed_orders') || '[]');
        const updatedLocal = localPlaced.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem('placed_orders', JSON.stringify(updatedLocal));
      } catch (e) {}

    } catch (err) {
      alert('Cập nhật trạng thái thất bại: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status?.toUpperCase() === selectedStatus);

  const tabs = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-slate-900" />
            <span>Quản lý Đơn Hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Đơn hàng mới từ khách mua sắm sẽ tự động xuất hiện ở đây ngay tức thì</p>
        </div>
        <span className="text-xs font-bold text-slate-900 bg-slate-900/10 px-3 py-1.5 rounded-xl border border-slate-900/20">
          Tổng số: {orders.length} đơn hàng
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === tab
                ? 'bg-black text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Cập nhật bởi</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 font-semibold">Chưa có đơn hàng nào</td>
              </tr>
            ) : filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-100/40 transition-colors">
                <td className="p-4 font-bold text-slate-900">
                  #{o.id}
                  <div className="text-[10px] text-slate-500 mt-1 font-normal">
                    {new Date(o.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {o.address?.receiverName || o.user?.fullName || 'Khách hàng'}
                  <div className="text-[11px] text-slate-500 font-normal">{o.address?.phoneNumber || 'N/A'}</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate max-w-[200px]">
                    {o.address ? `${o.address.addressDetail}, ${o.address.ward}` : ''}
                  </div>
                </td>
                <td className="p-4 font-bold text-slate-900 text-sm">
                  {Number(o.finalAmount ?? o.totalAmount).toLocaleString('vi-VN')} đ
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {o.paymentMethod || 'COD'}
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-4 text-[11px] text-slate-500">
                  {o.updatedBy ? (
                    <div>
                      <div className="font-bold text-slate-700">{o.updatedBy.fullName || o.updatedBy.email}</div>
                      <div>{o.updatedAt ? new Date(o.updatedAt).toLocaleString('vi-VN') : ''}</div>
                    </div>
                  ) : (
                    <span className="italic text-slate-500">Chưa có</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status?.toUpperCase() || 'PENDING'}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updatingOrderId === o.id}
                      className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 cursor-pointer disabled:opacity-50"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="DELIVERED">Hoàn tất</option>
                      <option value="CANCELLED">Hủy bỏ</option>
                    </select>
                    {updatingOrderId === o.id && (
                      <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
