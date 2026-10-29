'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Search, ChevronRight, Clock, CheckCircle2, XCircle, Truck, PackageCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { getUser, getToken } from '@/lib/auth';

const tabs = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'DELIVERED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' }
];

const statusConfig = {
  PENDING: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Chờ xác nhận' },
  PROCESSING: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package, label: 'Đang xử lý' },
  SHIPPING: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Truck, label: 'Đang giao' },
  DELIVERED: { color: 'text-emerald-500', bg: 'bg-slate-900/10', icon: CheckCircle2, label: 'Hoàn thành' },
  CANCELLED: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle, label: 'Đã hủy' }
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchOrders() {
      try {
        const res = await orderService.getMyOrders();
        if (res.data) {
          // Sort by latest created
          const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [router]);

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.status && order.status.toUpperCase() === activeTab);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải lịch sử đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-xl shadow-emerald-500/10">
          <PackageCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Đơn hàng của tôi</h1>
          <p className="text-xs font-semibold text-slate-500">Quản lý và theo dõi trạng thái đơn hàng</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 border border-slate-200 rounded-2xl p-2 flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900 shadow-lg'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white/40 border border-slate-200 border-dashed rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100/50 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-700 font-bold">Chưa có đơn hàng nào!</p>
              <p className="text-xs text-slate-500 mt-1">Không tìm thấy đơn hàng nào trong trạng thái này.</p>
            </div>
            <Link href="/products" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusKey = order.status ? order.status.toUpperCase() : 'PENDING';
            const sConf = statusConfig[statusKey] || statusConfig.PENDING;
            const StatusIcon = sConf.icon;

            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-white/50">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold text-slate-900">Mã Đơn: #{order.id}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${sConf.bg} ${sConf.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{sConf.label}</span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Just show first item as preview if multiple */}
                  {order.orderDetails && order.orderDetails.length > 0 ? (
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0">
                        <img 
                          src={order.orderDetails[0].variant?.product?.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=200'} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{order.orderDetails[0].variant?.product?.name || 'Sản phẩm'}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Phân loại: {order.orderDetails[0].variant?.color || 'N/A'} | {order.orderDetails[0].variant?.degree || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">x{order.orderDetails[0].quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {Number(order.orderDetails[0].unitPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      Đang tải thông tin sản phẩm hoặc không có sản phẩm nào...
                    </div>
                  )}

                  {order.orderDetails && order.orderDetails.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-slate-200/50 text-center">
                      <span className="text-xs font-semibold text-slate-500">
                        ... và {order.orderDetails.length - 1} sản phẩm khác
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-white/80 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500">Thành tiền: </span>
                    <span className="text-lg font-black text-slate-900">{Number(order.finalAmount ?? order.totalAmount).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors"
                  >
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
