'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [sysSettings, setSysSettings] = useState({
    hotline: '1900 8888',
    email_contact: 'support@matkinh.com',
    store_address: '123 Đường 3/2, Phường 10, Quận 10, TP. Hồ Chí Minh'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const saved = localStorage.getItem('system_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSysSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {}

      try {
        const res = await fetchApi('/public/settings');
        if (res.data && res.data.length > 0) {
          const obj = {};
          res.data.forEach((item) => {
            if (item.keyName) obj[item.keyName] = item.keyValue;
          });
          setSysSettings((prev) => ({ ...prev, ...obj }));
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.customerName || !formData.email || !formData.message) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi('/public/contacts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (res.code === 200) {
        setSuccess(true);
        setFormData({ customerName: '', email: '', phone: '', message: '' });
      } else {
        setError(res.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Nếu bạn có bất kỳ câu hỏi nào về sản phẩm, dịch vụ hoặc cần đặt lịch đo mắt vi tính, đừng ngần ngại gửi tin nhắn cho chúng tôi. NTD Eyewear luôn sẵn lòng hỗ trợ bạn!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Thông Tin Liên Hệ</h3>
            
            <div className="space-y-6 text-sm text-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900/20 text-slate-900 rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Địa chỉ Cửa hàng</p>
                  <p>{sysSettings.store_address || '123 Đường 3/2, Phường 10, Quận 10, TP. Hồ Chí Minh'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900/20 text-slate-900 rounded-xl">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Hotline Hỗ trợ (24/7)</p>
                  <p>{sysSettings.hotline}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900/20 text-slate-900 rounded-xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Email CSKH</p>
                  <p>{sysSettings.email_contact || 'support@matkinh.com'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden h-64">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460232421532!2d106.6669992!3d10.7760195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzMzLjciTiAxMDbCsDQwJzAxLjIiRQ!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Gửi Lời Nhắn</h3>
          
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-slate-900" />
              <h4 className="text-lg font-bold text-slate-900">Gửi thành công!</h4>
              <p className="text-sm text-slate-500">
                Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi qua email hoặc số điện thoại của bạn trong thời gian sớm nhất.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl transition-colors"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Họ và Tên <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên của bạn"
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Email <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Nội dung <span className="text-rose-500">*</span></label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Bạn muốn hỏi gì về sản phẩm hoặc đặt lịch tư vấn?..."
                  rows={5}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-colors resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> GỬI TIN NHẮN
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
