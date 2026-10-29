'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Receipt, Phone, AlertCircle, ShoppingCart } from 'lucide-react';
import { orderService } from '@/services/orderService';

// Timeline steps
const steps = [
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'SHIPPING', label: 'Đang giao hàng' },
  { id: 'DELIVERED', label: 'Hoàn thành' }
];

export default function OrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await orderService.getOrderById(orderId);
        if (res.data) {
          setOrder(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    setCanceling(true);
    try {
      await orderService.cancelOrder(orderId);
      alert('Đã hủy đơn hàng thành công!');
      // Refresh order
      const res = await orderService.getOrderById(orderId);
      if (res.data) setOrder(res.data);
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setCanceling(false);
    }
  };

  const handleBuyAgain = () => {
    // Add logic to add items to cart if needed, or redirect to home
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-3"></div>
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy đơn hàng</h2>
        <Link href="/orders" className="text-slate-900 hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const currentStatus = order.status ? order.status.toUpperCase() : 'PENDING';
  const isCancelled = currentStatus === 'CANCELLED';

  // Determine current step index
  let currentStepIndex = steps.findIndex(s => s.id === currentStatus);
  if (currentStepIndex === -1) currentStepIndex = 0; // Default PENDING if not found and not cancelled

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại Đơn hàng
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Chi tiết Đơn hàng #{order.id}</h1>
        {isCancelled && (
          <span className="px-4 py-1.5 bg-rose-500/20 text-rose-500 font-bold text-xs rounded-full border border-rose-500/30">
            Đã Hủy
          </span>
        )}
      </div>

      {/* Stepper Timeline (Only show if not cancelled) */}
      {!isCancelled && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="flex items-center justify-between relative">
            {/* Connecting lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
            
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 bg-white px-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 transition-colors ${
                    isCompleted 
                      ? 'bg-black border-black text-white' 
                      : 'bg-white border-slate-900 text-slate-900'
                  }`}>
                    {isCompleted ? '✓' : (index + 1)}
                  </div>
                  <span className={`text-[11px] font-bold ${
                    isCurrent ? 'text-slate-900' : (isCompleted ? 'text-slate-700' : 'text-slate-500')
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}

            {/* Active connecting line overlay */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-900 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Delivery Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-900" /> Địa chỉ nhận hàng
          </h3>
          {order.address ? (
            <div className="space-y-1 text-sm text-slate-700">
              <p className="font-bold text-slate-900">{order.address.receiverName}</p>
              <p className="text-slate-500 text-xs mt-1">{order.address.phoneNumber}</p>
              <p className="mt-2 text-xs leading-relaxed">
                {order.address.addressDetail}<br />
                {order.address.ward}, {order.address.district}, {order.address.city}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Không có thông tin địa chỉ</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-900" /> Phương thức thanh toán
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="text-slate-500 text-xs">Hình thức: </span> 
              <span className="font-bold">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</span>
            </p>
            <p>
              <span className="text-slate-500 text-xs">Ngày đặt: </span>
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white/50">
          <h3 className="font-bold text-slate-900">Sản phẩm đã mua</h3>
        </div>
        <div className="p-6 space-y-6">
          {(!order.orderDetails || order.orderDetails.length === 0) ? (
            <div className="text-sm text-slate-500 text-center py-4">
              Đang tải thông tin sản phẩm hoặc không có sản phẩm nào...
            </div>
          ) : (
            order.orderDetails.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0">
                  <img 
                    src={item.variant?.product?.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=200'} 
                    alt="Product" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">{item.variant?.product?.name || 'Sản phẩm'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Màu: {item.variant?.color || 'N/A'} | Độ: {item.variant?.degree || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{Number(item.unitPrice || 0).toLocaleString('vi-VN')} đ</p>
                  <p className="text-xs text-slate-500 mt-1">Số lượng: {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-white/80 border-t border-slate-200 flex justify-end">
          <div className="w-full max-w-xs space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính:</span>
              <span>{Number(order.totalAmount).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Khuyến mãi:</span>
              <span className="text-rose-400">-{Number(order.discountAmount || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-lg pt-3 border-t border-slate-200">
              <span>Tổng cộng:</span>
              <span className="text-slate-900">{Number(order.finalAmount ?? order.totalAmount).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Action Buttons */}
      <div className="flex justify-end gap-4">
        {currentStatus === 'PENDING' && (
          <button 
            onClick={handleCancelOrder}
            disabled={canceling}
            className="px-6 py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-slate-900 font-bold text-xs transition-colors disabled:opacity-50"
          >
            {canceling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}

        {currentStatus === 'DELIVERED' && (
          <button 
            onClick={handleBuyAgain}
            className="px-6 py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <ShoppingCart className="w-4 h-4" /> Mua lại
          </button>
        )}
      </div>

    </div>
  );
}
