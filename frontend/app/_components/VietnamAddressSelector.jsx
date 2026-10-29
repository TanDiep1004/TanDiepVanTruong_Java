'use client';

import { useState, useMemo } from 'react';
import { MapPin, Search, ChevronRight, Check, X, Building, Star } from 'lucide-react';
import VIETNAM_LOCATIONS from '@/lib/vietnam_locations.json';

function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function VietnamAddressSelector({ city, district, ward, onChange }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // 1: Tỉnh/Thành, 2: Quận/Huyện, 3: Phường/Xã
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Danh sách 63 Tỉnh / Thành phố (TP. Hồ Chí Minh, TP. Hà Nội đứng đầu)
  const allProvinces = useMemo(() => {
    return (VIETNAM_LOCATIONS || []).map(p => p.name);
  }, []);

  // Object dữ liệu Tỉnh được chọn hiện tại
  const selectedProvinceData = useMemo(() => {
    if (!city) return null;
    return (VIETNAM_LOCATIONS || []).find(
      p => p.name === city || p.fullName === city || p.name.includes(city) || (city.includes('Hồ Chí Minh') && p.name.includes('Hồ Chí Minh'))
    );
  }, [city]);

  // 2. Danh sách Quận / Huyện THỰC TẾ tương ứng với Tỉnh đã chọn
  const availableDistricts = useMemo(() => {
    if (selectedProvinceData && Array.isArray(selectedProvinceData.districts)) {
      return selectedProvinceData.districts;
    }
    return [];
  }, [selectedProvinceData]);

  // Object dữ liệu Quận được chọn hiện tại
  const selectedDistrictData = useMemo(() => {
    if (!district) return null;
    return availableDistricts.find(d => d.name === district);
  }, [availableDistricts, district]);

  // 3. Danh sách Phường / Xã THỰC TẾ tương ứng với Quận đã chọn
  const availableWards = useMemo(() => {
    if (selectedDistrictData && Array.isArray(selectedDistrictData.wards)) {
      return selectedDistrictData.wards;
    }
    return [];
  }, [selectedDistrictData]);

  const handleSelectCity = (cityName) => {
    onChange({ city: cityName, district: '', ward: '' });
    setActiveTab(2);
    setSearchTerm('');
  };

  const handleSelectDistrict = (districtName) => {
    onChange({ city, district: districtName, ward: '' });
    setActiveTab(3);
    setSearchTerm('');
  };

  const handleSelectWard = (wardName) => {
    onChange({ city, district, ward: wardName });
    setShowModal(false);
    setSearchTerm('');
  };

  // Filter thông minh chấp nhận cả tiếng Việt có dấu, không dấu, viết tắt (tphcm, hcm, hn, dn...)
  const filteredList = useMemo(() => {
    const rawTerm = searchTerm.trim();
    const cleanTerm = removeAccents(rawTerm);
    if (!cleanTerm) {
      if (activeTab === 1) return allProvinces;
      if (activeTab === 2) return availableDistricts.map(d => d.name);
      if (activeTab === 3) return availableWards;
    }

    if (activeTab === 1) {
      return allProvinces.filter(p => {
        const cleanName = removeAccents(p);
        if (cleanName.includes(cleanTerm)) return true;
        if ((cleanTerm === 'hcm' || cleanTerm === 'tphcm' || cleanTerm === 'sg' || cleanTerm === 'saigon') && cleanName.includes('ho chi minh')) return true;
        if ((cleanTerm === 'hn' || cleanTerm === 'hanoi') && cleanName.includes('ha noi')) return true;
        if ((cleanTerm === 'dn' || cleanTerm === 'danang') && cleanName.includes('da nang')) return true;
        return false;
      });
    }
    if (activeTab === 2) {
      return availableDistricts.map(d => d.name).filter(d => removeAccents(d).includes(cleanTerm));
    }
    if (activeTab === 3) {
      return availableWards.filter(w => removeAccents(w).includes(cleanTerm));
    }
    return [];
  }, [activeTab, searchTerm, allProvinces, availableDistricts, availableWards]);

  // Format địa chỉ chuẩn Shopee: "Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
  const formattedAddress = [ward, district, city].filter(Boolean).join(', ');

  return (
    <div className="col-span-full space-y-3.5">
      {/* 🟢 KHUNG CHỌN ĐỊA CHỈ GỘP CHUẨN SHOPEE */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
          Tỉnh/Thành phố, Quận/Huyện, Phường/Xã *
        </label>
        <div
          onClick={() => {
            setShowModal(true);
            setActiveTab(city ? (district ? 3 : 2) : 1);
          }}
          className="w-full bg-white border border-slate-300 hover:border-slate-900 focus-within:border-slate-900 rounded-xl p-3 text-xs flex items-center justify-between cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <MapPin className="w-4 h-4 text-slate-900 shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`truncate font-medium ${formattedAddress ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              {formattedAddress || 'Bấm vào đây để chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 🟢 3 Ô DROPDOWN THỰC TẾ TRÊN FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-400 text-[11px] font-medium mb-1">Tỉnh/Thành phố *</label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => handleSelectCity(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 appearance-none cursor-pointer"
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {allProvinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] font-medium mb-1">Quận/Huyện *</label>
          <div className="relative">
            <select
              disabled={!city || availableDistricts.length === 0}
              value={district}
              onChange={(e) => handleSelectDistrict(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="">{city ? '-- Chọn Quận / Huyện --' : '-- Hãy chọn Tỉnh/Thành trước --'}</option>
              {availableDistricts.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-[11px] font-medium mb-1">Phường/Xã *</label>
          <div className="relative">
            <select
              disabled={!district || availableWards.length === 0}
              value={ward}
              onChange={(e) => handleSelectWard(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed appearance-none cursor-pointer"
            >
              <option value="">{district ? '-- Chọn Phường / Xã --' : '-- Hãy chọn Quận/Huyện trước --'}</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 🔴 BẢNG MODAL POPUP PHONG CÁCH SHOPEE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-pop-in flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-900" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Địa chỉ giao hàng (Việt Nam)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shopee-style 3 Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all cursor-pointer truncate ${
                  activeTab === 1
                    ? 'border-slate-900 text-slate-900 bg-slate-900/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {city || 'Tỉnh/Thành phố'}
              </button>

              <button
                type="button"
                disabled={!city}
                onClick={() => setActiveTab(2)}
                className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all cursor-pointer truncate disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === 2
                    ? 'border-slate-900 text-slate-900 bg-slate-900/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {district || 'Quận/Huyện'}
              </button>

              <button
                type="button"
                disabled={!district}
                onClick={() => setActiveTab(3)}
                className={`flex-1 py-3 px-1 text-center font-semibold border-b-2 transition-all cursor-pointer truncate disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === 3
                    ? 'border-slate-900 text-slate-900 bg-slate-900/5'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {ward || 'Phường/Xã'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Gõ tìm ${
                    activeTab === 1 ? 'TP.HCM, Hà Nội, Đà Nẵng...' : activeTab === 2 ? 'Quận/Huyện' : 'Phường/Xã'
                  }... (tphcm, hcm, hn, dn)`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Không tìm thấy kết quả phù hợp cho "{searchTerm}"
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected =
                    (activeTab === 1 && (item === city || item.includes(city))) ||
                    (activeTab === 2 && item === district) ||
                    (activeTab === 3 && item === ward);

                  const isMajorCity = activeTab === 1 && item.startsWith('TP. ');

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (activeTab === 1) handleSelectCity(item);
                        else if (activeTab === 2) handleSelectDistrict(item);
                        else if (activeTab === 3) handleSelectWard(item);
                      }}
                      className={`w-full text-left py-2.5 px-3 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900/5 text-slate-900 font-bold'
                          : isMajorCity
                          ? 'hover:bg-slate-50 text-slate-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isMajorCity && (
                          <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-500 text-[9px] font-bold shrink-0">
                            TRUNG TÂM
                          </span>
                        )}
                        <span>{item}</span>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-slate-900" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-[11px] text-slate-500">
              Đã chọn: <span className="text-slate-900 font-semibold">{formattedAddress || 'Chưa hoàn tất'}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
