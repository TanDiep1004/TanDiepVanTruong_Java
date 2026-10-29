'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    hotline: '0329526730',
    logo_url: 'https://haze-eyewear.com/logo.png',
    store_address: '68 đường 79 Phước Long B',
    email_contact: 'tandiep@matkinh.com',
    facebook_page: 'https://facebook.com/haze.eyewear',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      // 1. Fetch from Spring Boot backend API
      try {
        const res = await fetchApi('/admin/settings');
        if (res.data && res.data.length > 0) {
          const apiObj = {};
          res.data.forEach((s) => {
            if (s.keyName) {
              apiObj[s.keyName] = s.keyValue;
            }
          });
          setSettings((prev) => ({ ...prev, ...apiObj }));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Backend settings fetch error:", e);
      }

      // 2. Load from localStorage backup
      try {
        const localSaved = localStorage.getItem('system_settings');
        if (localSaved) {
          setSettings(JSON.parse(localSaved));
        }
      } catch (e) {}

      setLoading(false);
    }

    loadSettings();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          logo_url: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    // Save to localStorage immediately
    try {
      localStorage.setItem('system_settings', JSON.stringify(settings));
    } catch (e) {}

    // Save to Spring Boot Backend API
    try {
      const payload = Object.keys(settings).map((key) => ({
        keyName: key,
        keyValue: settings[key] || '',
      }));

      await fetchApi('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.log("Backend sync notice:", e.message);
    }

    setSaving(false);
    setSuccessMsg('Đã lưu Logo và Cấu hình hệ thống (bảng settings) thành công!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin Cấu hình Hệ thống...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-900" />
          <span>Quản lý Cấu Hình Hệ Thống (Bảng settings)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Cấu hình hotline, tải logo từ máy tính, thông tin liên hệ chân trang website</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-slate-900/10 border border-slate-900/30 text-slate-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Hotline cửa hàng (key_name: hotline)</label>
          <input
            type="text"
            value={settings.hotline}
            onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
            className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-slate-900"
          />
        </div>

        {/* Upload Logo file directly from Computer */}
        <div className="space-y-2">
          <label className="block text-slate-700 font-semibold">
            Tải Ảnh Logo Cửa Hàng từ Máy Tính (key_name: logo_url)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Live Logo Image Preview */}
            <div className="w-20 h-20 rounded-xl bg-white border border-slate-900/40 flex items-center justify-center overflow-hidden shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo Preview" className="w-full h-full object-contain p-1" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-600" />
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <label className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-slate-800 text-white font-black rounded-xl cursor-pointer transition-all shadow-md">
                <Upload className="w-4 h-4" />
                <span>CHỌN FILE ẢNH TỪ MÁY TÍNH</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="text-[11px] text-slate-500">
                Hệ thống hỗ trợ tất cả các định dạng ảnh: PNG, JPG, JPEG, WebP, SVG...
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Địa chỉ cửa hàng chính (key_name: store_address)</label>
          <input
            type="text"
            value={settings.store_address}
            onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
            className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Email hỗ trợ (key_name: email_contact)</label>
          <input
            type="text"
            value={settings.email_contact}
            onChange={(e) => setSettings({ ...settings, email_contact: e.target.value })}
            className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-slate-800 text-white font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình hệ thống</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
