'use client';

import { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Edit2, Trash2, ChevronRight, X, Save, 
  Glasses, Check, Layers, Ruler, ShieldCheck, Tag, Loader2 
} from 'lucide-react';
import { productService } from '@/services/productService';
import { attributeService } from '@/services/attributeService';
import { fetchApi } from '@/lib/api';

export default function AttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedAttrId, setSelectedAttrId] = useState(1);
  const [loading, setLoading] = useState(true);

  // States thêm thuộc tính & giá trị
  const [newAttrName, setNewAttrName] = useState('');
  const [valName, setValName] = useState('');
  const [valPrice, setValPrice] = useState(0);

  // States sửa giá trị
  const [editingValue, setEditingValue] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValName, setEditValName] = useState('');
  const [editValPrice, setEditValPrice] = useState(0);

  // Gán biến thể cho sản phẩm
  const [productList, setProductList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productVariants, setProductVariants] = useState([]);
  const [assignForm, setAssignForm] = useState({
    color: 'Đen Nhám (Matte Black)',
    degree: 'Không độ (0.00)',
    price: 1500000,
    stockQuantity: 50,
  });

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const res = await attributeService.getAllAttributes();
      if (res && res.data && res.data.length > 0) {
        setAttributes(res.data);
        if (!res.data.some(a => a.id === selectedAttrId)) {
          setSelectedAttrId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Lỗi tải thuộc tính:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productService.getAllProductsAdmin();
      if (res.data && res.data.length > 0) {
        setProductList(res.data);
        if (!selectedProductId) {
          setSelectedProductId(res.data[0].id);
          setProductVariants(res.data[0].variants || []);
        }
      }
    } catch (e) {
      console.error('Load products error:', e);
    }
  };

  useEffect(() => {
    loadAttributes();
    loadProducts();
  }, []);

  const handleSelectProduct = (prodId) => {
    setSelectedProductId(prodId);
    const found = productList.find((p) => p.id.toString() === prodId.toString());
    if (found) {
      setProductVariants(found.variants || []);
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;

    try {
      await attributeService.createAttribute({ name: newAttrName.trim() });
      setNewAttrName('');
      await loadAttributes();
      alert('Thêm thuộc tính mới thành công!');
    } catch (err) {
      alert('Lỗi khi thêm thuộc tính: ' + err.message);
    }
  };

  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!valName.trim()) return;

    try {
      await attributeService.addAttributeValue(selectedAttrId, {
        value: valName.trim(),
        price: Number(valPrice) || 0
      });
      setValName('');
      setValPrice(0);
      await loadAttributes();
      alert('Thêm giá trị thuộc tính vào CSDL thành công!');
    } catch (err) {
      alert('Lỗi khi thêm giá trị: ' + err.message);
    }
  };

  const handleOpenEditValModal = (val) => {
    setEditingValue(val);
    setEditValName(val.value);
    setEditValPrice(val.price || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveEditVal = async (e) => {
    e.preventDefault();
    if (!editValName.trim()) return;

    try {
      // Xóa cũ và thêm mới vào CSDL
      await attributeService.deleteAttributeValue(editingValue.id);
      await attributeService.addAttributeValue(selectedAttrId, {
        value: editValName.trim(),
        price: Number(editValPrice) || 0
      });
      setIsEditModalOpen(false);
      await loadAttributes();
      alert('Cập nhật giá trị thuộc tính thành công!');
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleDeleteVal = async (valId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giá trị này khỏi CSDL không?')) return;
    try {
      await attributeService.deleteAttributeValue(valId);
      await loadAttributes();
      alert('Đã xóa giá trị thuộc tính!');
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleDeleteAttribute = async (attrId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thuộc tính này và toàn bộ giá trị của nó?')) return;
    try {
      await attributeService.deleteAttribute(attrId);
      await loadAttributes();
      alert('Đã xóa thuộc tính thành công!');
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleAssignVariantToProduct = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Vui lòng chọn 1 sản phẩm để gán!');
      return;
    }

    const newVar = {
      color: assignForm.color,
      degree: assignForm.degree,
      price: Number(assignForm.price),
      stockQuantity: Number(assignForm.stockQuantity),
    };

    try {
      const res = await fetchApi(`/admin/products/${selectedProductId}/variants`, {
        method: 'POST',
        body: JSON.stringify(newVar)
      });
      
      const createdVar = res.data;
      const updatedVars = [...productVariants, createdVar];
      setProductVariants(updatedVars);

      const targetProd = productList.find(p => p.id.toString() === selectedProductId.toString());
      if (targetProd) {
        targetProd.variants = updatedVars;
      }

      alert(`Đã gán thành công Biến thể "${assignForm.color}" - "${assignForm.degree}" cho sản phẩm!`);
    } catch (error) {
      alert('Lỗi khi thêm biến thể: ' + error.message);
    }
  };

  const handleDeleteProductVariant = async (varId) => {
    if (!confirm('Xóa tùy chọn này khỏi sản phẩm?')) return;
    try {
      await fetchApi(`/admin/products/variants/${varId}`, {
        method: 'DELETE'
      });
      setProductVariants(prev => prev.filter(v => v.id !== varId));
      alert('Xóa biến thể thành công!');
    } catch (error) {
      alert('Lỗi khi xóa biến thể: ' + error.message);
    }
  };

  // Lọc thuộc tính theo Nhóm Tab
  const filteredAttributes = attributes.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.group === activeTab;
  });

  const selectedAttr = attributes.find(a => a.id === selectedAttrId) || attributes[0];

  // Danh sách màu và độ cận dùng cho form gán biến thể
  const frameColorAttr = attributes.find(a => a.id === 1);
  const colorList = frameColorAttr?.values || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-slate-900" />
            <span>Quản lý Thuộc Tính Mắt Kính (Eyewear Specifications & Dimensions)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đặc tả kỹ thuật (Chất liệu, Kiểu dáng, Màu sắc), Kích thước (Lens/Bridge/Temple) và Tính năng bảo vệ (UV, Blue Light, AR, Đổi màu)
          </p>
        </div>
        <span className="text-xs font-bold text-slate-900 bg-slate-900/10 px-3.5 py-1.5 rounded-xl border border-slate-900/20 w-fit">
          Tổng số: {attributes.length} thuộc tính ({attributes.reduce((acc, a) => acc + (a.values?.length || 0), 0)} giá trị)
        </span>
      </div>

      {/* Tabs Phân loại Thuộc tính */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tất cả ({attributes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SPECS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SPECS'
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Glasses className="w-4 h-4" />
          <span>👓 1. Đặc tả kỹ thuật ({attributes.filter(a => a.group === 'SPECS').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DIMENSIONS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DIMENSIONS'
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>📏 2. Kích thước & Trọng lượng ({attributes.filter(a => a.group === 'DIMENSIONS').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FEATURES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FEATURES'
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🛡️ 3. Tính năng bảo vệ mắt ({attributes.filter(a => a.group === 'FEATURES').length})</span>
        </button>
      </div>

      {/* KHỐI 1: Danh sách thuộc tính & Giá trị chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Danh mục Thuộc tính */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Danh mục thuộc tính</h3>
            <span className="text-[11px] text-slate-400 font-medium">{filteredAttributes.length} mục</span>
          </div>

          {/* Form thêm thuộc tính mới */}
          <form onSubmit={handleAddAttribute} className="flex gap-2">
            <input
              type="text"
              placeholder="Tên thuộc tính mới..."
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              className="flex-1 bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
            />
            <button type="submit" className="p-2 rounded-xl bg-black text-white hover:bg-slate-800 font-bold cursor-pointer" title="Thêm thuộc tính">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Danh sách nút chọn thuộc tính */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Đang tải CSDL...</span>
              </div>
            ) : filteredAttributes.map((attr) => (
              <div
                key={attr.id}
                onClick={() => setSelectedAttrId(attr.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedAttrId === attr.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span className="truncate pr-2">{attr.name}</span>
                <span className={`flex items-center gap-1 text-[11px] shrink-0 ${
                  selectedAttrId === attr.id ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {attr.values?.length || 0} giá trị <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Giá trị chi tiết của thuộc tính đang chọn */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedAttr?.name || 'Chi tiết thuộc tính'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Nhóm: {selectedAttr?.group || 'SPECS'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Các giá trị hiển thị trên bộ lọc và trang chi tiết sản phẩm</p>
            </div>
            {selectedAttr && selectedAttr.id > 16 && (
              <button
                onClick={() => handleDeleteAttribute(selectedAttr.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1"
                title="Xóa thuộc tính này"
              >
                Xóa thuộc tính
              </button>
            )}
          </div>

          {/* Form thêm giá trị mới */}
          <form onSubmit={handleAddValue} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giá trị (VD: Vuông, Titanium...)</label>
              <input
                type="text"
                required
                placeholder="Nhập giá trị mới..."
                value={valName}
                onChange={(e) => setValName(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giá phụ thu cộng thêm (VNĐ)</label>
              <input
                type="number"
                value={valPrice}
                onChange={(e) => setValPrice(e.target.value)}
                className="w-full bg-white text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm giá trị</span>
              </button>
            </div>
          </form>

          {/* Bảng danh sách giá trị của thuộc tính */}
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">GIÁ TRỊ THUỘC TÍNH</th>
                  <th className="p-3">GIÁ PHỤ THU</th>
                  <th className="p-3 text-right pr-6">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(!selectedAttr?.values || selectedAttr.values.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-400 font-medium">Chưa có giá trị nào. Hãy thêm giá trị mới ở form trên!</td>
                  </tr>
                ) : selectedAttr.values.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 text-sm">{v.value}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {Number(v.price) > 0 ? `+${Number(v.price).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ (Mặc định)'}
                    </td>
                    <td className="p-3 text-right pr-6">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditValModal(v)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                          title="Sửa giá trị"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVal(v.id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Xóa giá trị"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KHỐI 2: Gán Màu sắc & Độ cận cho Sản phẩm Cụ thể */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Glasses className="w-5 h-5 text-slate-900" />
              <span>Gán Biến Thể Màu Sắc & Độ Cận Cho Sản Phẩm Cụ Thể</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Chọn mẫu kính trong shop để thiết lập các tùy chọn Màu sắc, Độ cận, Tồn kho và Giá bán riêng</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 pl-2">Sản phẩm:</span>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="bg-white text-slate-900 font-bold text-xs p-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer max-w-xs"
            >
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form gán biến thể mới */}
        <form onSubmit={handleAssignVariantToProduct} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Màu sắc gọng kính</label>
            <select
              value={assignForm.color}
              onChange={(e) => setAssignForm({ ...assignForm, color: e.target.value })}
              className="w-full bg-white text-slate-900 p-2.5 rounded-xl border border-slate-200 cursor-pointer"
            >
              {colorList.map((c) => (
                <option key={c.id} value={c.value}>{c.value}</option>
              ))}
              <option value="Đen Nhám (Matte Black)">Đen Nhám (Matte Black)</option>
              <option value="Vàng Kim (Gold)">Vàng Kim (Gold)</option>
              <option value="Bạc Sang Trọng (Silver)">Bạc Sang Trọng (Silver)</option>
              <option value="Đồi Mồi (Tortoise)">Đồi Mồi (Tortoise)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Độ cận tròng kính</label>
            <select
              value={assignForm.degree}
              onChange={(e) => setAssignForm({ ...assignForm, degree: e.target.value })}
              className="w-full bg-white text-slate-900 p-2.5 rounded-xl border border-slate-200 cursor-pointer"
            >
              <option value="Không độ (0.00)">Không độ (0.00)</option>
              <option value="Cận 1.00 độ">Cận 1.00 độ</option>
              <option value="Cận 1.50 độ">Cận 1.50 độ</option>
              <option value="Cận 2.00 độ">Cận 2.00 độ</option>
              <option value="Cận 2.50 độ">Cận 2.50 độ</option>
              <option value="Cận 3.00 độ">Cận 3.00 độ</option>
              <option value="Cận 3.50 độ">Cận 3.50 độ</option>
              <option value="Cận 4.00 độ">Cận 4.00 độ</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Đơn giá biến thể (VNĐ)</label>
            <input
              type="number"
              required
              value={assignForm.price}
              onChange={(e) => setAssignForm({ ...assignForm, price: e.target.value })}
              className="w-full bg-white text-slate-900 p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Số lượng tồn kho</label>
            <input
              type="number"
              required
              value={assignForm.stockQuantity}
              onChange={(e) => setAssignForm({ ...assignForm, stockQuantity: e.target.value })}
              className="w-full bg-white text-slate-900 p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Gán cho sản phẩm</span>
            </button>
          </div>
        </form>

        {/* Danh sách biến thể hiện tại */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">MÀU SẮC</th>
                <th className="p-3">ĐỘ CẬN</th>
                <th className="p-3">ĐƠN GIÁ BÁN</th>
                <th className="p-3">TỒN KHO</th>
                <th className="p-3 text-right pr-6">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {productVariants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">Sản phẩm này chưa có biến thể màu sắc / độ cận riêng</td>
                </tr>
              ) : productVariants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 text-sm">{v.color || 'Mặc định'}</td>
                  <td className="p-3 font-medium text-slate-700">{v.degree || '0.00 (Không độ)'}</td>
                  <td className="p-3 font-black text-slate-900">{Number(v.price).toLocaleString('vi-VN')} VNĐ</td>
                  <td className="p-3 font-bold text-emerald-600">{v.stockQuantity || 50} chiếc</td>
                  <td className="p-3 text-right pr-6">
                    <button
                      onClick={() => handleDeleteProductVariant(v.id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-500 rounded-xl cursor-pointer transition-colors"
                      title="Xóa biến thể"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Sửa Giá Trị Thuộc Tính */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-slate-900" />
                <span>Chỉnh Sửa Giá Trị Thuộc Tính</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditVal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên giá trị *</label>
                <input
                  type="text"
                  required
                  value={editValName}
                  onChange={(e) => setEditValName(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Giá phụ thu cộng thêm (VNĐ)</label>
                <input
                  type="number"
                  value={editValPrice}
                  onChange={(e) => setEditValPrice(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu cập nhật</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
