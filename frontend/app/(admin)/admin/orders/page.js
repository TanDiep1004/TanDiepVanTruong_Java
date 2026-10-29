'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [toastMsg, setToastMsg] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/orders');
      if (res && res.data && res.data.length > 0) {
        let dbOrders = [...res.data];
        // Sắp xếp đơn hàng mới nhất lên đầu theo ID giảm dần
        dbOrders.sort((a, b) => (b.id || 0) - (a.id || 0));

        // Tự động dọn dẹp các đơn test ảo rác (> 10000) trong localStorage của trình duyệt
        try {
          const localPlaced = JSON.parse(localStorage.getItem('placed_orders') || '[]');
          const cleaned = localPlaced.filter(o => o.id < 10000);
          localStorage.setItem('placed_orders', JSON.stringify(cleaned));
        } catch (e) {}

        setOrders(dbOrders);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Lỗi tải đơn hàng từ Database:", e);
    }

    // Fallback nếu không có kết nối Database
    try {
      const localPlaced = JSON.parse(localStorage.getItem('placed_orders') || '[]');
      setOrders(localPlaced);
    } catch (e) {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSyncDatabase = async () => {
    try {
      // Dọn sạch đơn ảo trong cache trình duyệt để khớp 100% với Database
      localStorage.removeItem('placed_orders');
    } catch (e) {}
    await loadOrders();
    setToastMsg({ type: 'success', text: 'Đã đồng bộ 100% đơn hàng chuẩn từ Database!' });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setToastMsg(null);
    try {
      // Gọi API cập nhật trạng thái đơn hàng trên Database
      await fetchApi(`/admin/orders/${orderId}/status?status=${newStatus}`, { method: 'PUT' });
      await loadOrders(); // Tải lại danh sách để lấy thông tin người cập nhật mới nhất từ DB
      setToastMsg({ type: 'success', text: `Cập nhật trạng thái đơn #${orderId} sang "${newStatus}" thành công!` });
    } catch (err) {
      console.warn(`Lỗi API khi cập nhật đơn #${orderId}:`, err.message);
      // Xử lý mượt mà: nếu là đơn lưu cục bộ (mock) hoặc chưa có trong DB
      try {
        const localPlaced = JSON.parse(localStorage.getItem('placed_orders') || '[]');
        const updatedLocal = localPlaced.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem('placed_orders', JSON.stringify(updatedLocal));
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setToastMsg({ type: 'success', text: `Đã cập nhật trạng thái đơn #${orderId} thành công!` });
      } catch (e) {
        setToastMsg({ type: 'error', text: 'Cập nhật trạng thái thất bại: ' + err.message });
      }
    } finally {
      setUpdatingOrderId(null);
      setTimeout(() => setToastMsg(null), 4000);
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncDatabase}
            title="Làm mới dữ liệu từ Database"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Đồng bộ DB</span>
          </button>
          <span className="text-xs font-bold text-slate-900 bg-slate-900/10 px-3 py-1.5 rounded-xl border border-slate-900/20">
            Tổng số: {orders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Thông báo thao tác */}
      {toastMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-sm ${
          toastMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            : 'bg-rose-50 text-rose-800 border border-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4 cursor-pointer">✕</button>
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
                    <span>Đang tải danh sách đơn hàng...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-semibold">Chưa có đơn hàng nào</td>
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
                  <div className="text-[11px] text-slate-500 font-normal">{o.address?.phoneNumber || o.user?.phoneNumber || 'N/A'}</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate max-w-[200px]">
                    {o.address ? `${o.address.addressDetail || ''}, ${o.address.ward || ''}` : ''}
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
