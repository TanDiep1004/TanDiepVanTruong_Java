'use client';

import { useState, useEffect } from 'react';
import { Sliders, Plus, Edit2, Trash2, ChevronRight, X, Save, Glasses, Check } from 'lucide-react';
import { productService } from '@/services/productService';
import { fetchApi } from '@/lib/api';

export default function AttributesPage() {
  const [attributes, setAttributes] = useState([
    {
      id: 1,
      name: 'Màu sắc gọng',
      values: [
        { id: 1, value: 'Đen nhám', price: 0 },
        { id: 2, value: 'Vàng Kim', price: 150000 },
        { id: 3, value: 'Xanh Đen', price: 50000 },
      ]
    },
    {
      id: 2,
      name: 'Độ cận / Tròng kính',
      values: [
        { id: 4, value: 'Không độ (0.00)', price: 0 },
        { id: 5, value: 'Cận 1.50 độ', price: 120000 },
        { id: 6, value: 'Cận 2.50 độ', price: 180000 },
        { id: 7, value: 'Cận 3.50 độ', price: 250000 },
      ]
    }
  ]);

  const [productList, setProductList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productVariants, setProductVariants] = useState([]);

  const [newAttrName, setNewAttrName] = useState('');
  const [selectedAttrId, setSelectedAttrId] = useState(1);
  const [valName, setValName] = useState('');
  const [valPrice, setValPrice] = useState(0);

  const [editingValue, setEditingValue] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValName, setEditValName] = useState('');
  const [editValPrice, setEditValPrice] = useState(0);

  // Form gán biến thể cho sản phẩm chọn
  const [assignForm, setAssignForm] = useState({
    color: 'Đen nhám',
    degree: 'Không độ (0.00)',
    price: 1500000,
    stockQuantity: 50,
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await productService.getAllProductsAdmin();
        if (res.data && res.data.length > 0) {
          setProductList(res.data);
          setSelectedProductId(res.data[0].id);
          setProductVariants(res.data[0].variants || [
            { id: 101, color: 'Đen nhám', degree: 'Không độ (0.00)', price: 1500000, stockQuantity: 50 },
            { id: 102, color: 'Vàng Kim', degree: 'Cận 1.50 độ', price: 1750000, stockQuantity: 30 },
          ]);
        }
      } catch (e) {
        console.error("Load products error:", e);
      }
    }
    loadProducts();
  }, []);

  const handleSelectProduct = (prodId) => {
    setSelectedProductId(prodId);
    const found = productList.find((p) => p.id.toString() === prodId.toString());
    if (found) {
      setProductVariants(found.variants || [
        { id: 101, color: 'Đen nhám', degree: 'Không độ (0.00)', price: 1500000, stockQuantity: 50 },
        { id: 102, color: 'Vàng Kim', degree: 'Cận 1.50 độ', price: 1750000, stockQuantity: 30 },
      ]);
    }
  };

  const handleAddAttribute = (e) => {
    e.preventDefault();
    if (!newAttrName) return;
    const newAttr = {
      id: Date.now(),
      name: newAttrName,
      values: []
    };
    setAttributes([...attributes, newAttr]);
    setNewAttrName('');
    alert('Thêm thuộc tính chung mới thành công!');
  };

  const handleAddValue = (e) => {
    e.preventDefault();
    if (!valName) return;
    setAttributes(attributes.map(attr => {
      if (attr.id === selectedAttrId) {
        return {
          ...attr,
          values: [...attr.values, { id: Date.now(), value: valName, price: Number(valPrice) }]
        };
      }
      return attr;
    }));
    setValName('');
    setValPrice(0);
    alert('Thêm giá trị thuộc tính thành công!');
  };

  const handleOpenEditValModal = (val) => {
    setEditingValue(val);
    setEditValName(val.value);
    setEditValPrice(val.price);
    setIsEditModalOpen(true);
  };

  const handleSaveEditVal = (e) => {
    e.preventDefault();
    if (!editValName) return;
    setAttributes(attributes.map(attr => {
      if (attr.id === selectedAttrId) {
        return {
          ...attr,
          values: attr.values.map(v => v.id === editingValue.id ? { ...v, value: editValName, price: Number(editValPrice) } : v)
        };
      }
      return attr;
    }));
    setIsEditModalOpen(false);
    alert('Cập nhật giá trị thuộc tính thành công!');
  };

  const handleDeleteVal = (valId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giá trị này không?')) return;
    setAttributes(attributes.map(attr => {
      if (attr.id === selectedAttrId) {
        return {
          ...attr,
          values: attr.values.filter(v => v.id !== valId)
        };
      }
      return attr;
    }));
    alert('Đã xóa giá trị thuộc tính!');
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

      // Cập nhật vào danh sách sản phẩm
      const targetProd = productList.find(p => p.id.toString() === selectedProductId.toString());
      if (targetProd) {
        targetProd.variants = updatedVars;
        try {
          const storedProds = JSON.parse(localStorage.getItem('stored_products') || '[]');
          const idx = storedProds.findIndex(p => p.id.toString() === selectedProductId.toString());
          if (idx !== -1) {
            storedProds[idx] = targetProd;
          } else {
            storedProds.unshift(targetProd);
          }
          localStorage.setItem('stored_products', JSON.stringify(storedProds));
        } catch (err) {}
      }

      alert(`Đã gán thành công Màu "${assignForm.color}" & Độ cận "${assignForm.degree}" cho sản phẩm "${targetProd?.name || ''}"!`);
    } catch (error) {
      alert('Lỗi khi thêm biến thể: ' + error.message);
    }
  };

  const handleDeleteProductVariant = async (varId) => {
    if (!confirm('Xóa tùy chọn độ cận / màu sắc này khỏi sản phẩm?')) return;
    
    try {
      await fetchApi(`/admin/products/variants/${varId}`, {
        method: 'DELETE'
      });
      
      const updatedVars = productVariants.filter(v => v.id !== varId);
      setProductVariants(updatedVars);

      const targetProd = productList.find(p => p.id.toString() === selectedProductId.toString());
      if (targetProd) {
        targetProd.variants = updatedVars;
        try {
          const storedProds = JSON.parse(localStorage.getItem('stored_products') || '[]');
          const idx = storedProds.findIndex(p => p.id.toString() === selectedProductId.toString());
          if (idx !== -1) {
            storedProds[idx] = targetProd;
            localStorage.setItem('stored_products', JSON.stringify(storedProds));
          }
        } catch (err) {}
      }
      alert('Xóa biến thể thành công!');
    } catch (error) {
      alert('Lỗi khi xóa biến thể: ' + error.message);
    }
  };

  const selectedAttr = attributes.find(a => a.id === selectedAttrId) || attributes[0];
  const colorList = attributes.find(a => a.id === 1)?.values || [];
  const degreeList = attributes.find(a => a.id === 2)?.values || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-slate-900" />
          <span>Quản lý Thuộc Tính & Gán Độ Cận, Màu Sắc Cho Sản Phẩm</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Định nghĩa thuộc tính cha/con và gán Màu sắc, Độ cận, Đơn giá cho từng mẫu kính cụ thể</p>
      </div>

      {/* BLOCK 1: Quản lý thuộc tính chung */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Attribute List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-900 text-sm">1. Danh mục Thuộc tính chung</h3>
          <form onSubmit={handleAddAttribute} className="flex gap-2">
            <input
              type="text"
              placeholder="Tên thuộc tính mới..."
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              className="flex-1 bg-slate-100 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
            />
            <button type="submit" className="p-2 rounded-xl bg-black text-white hover:bg-slate-800 font-bold cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {attributes.map((attr) => (
              <button
                key={attr.id}
                onClick={() => setSelectedAttrId(attr.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedAttrId === attr.id
                    ? 'bg-slate-900/10 text-slate-900 border border-slate-900/30'
                    : 'bg-slate-100/40 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{attr.name}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  {attr.values.length} giá trị <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Values of Selected Attribute */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tùy chọn giá trị cho "{selectedAttr?.name}"</h3>
              <p className="text-xs text-slate-500">Thiết lập các lựa chọn chi tiết khi mua hàng</p>
            </div>
          </div>

          {/* Form add value */}
          <form onSubmit={handleAddValue} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-100/40 p-4 rounded-xl border border-slate-300/50">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giá trị (VD: Đen nhám)</label>
              <input
                type="text"
                required
                placeholder="Nhập giá trị..."
                value={valName}
                onChange={(e) => setValName(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giá phụ thu (VNĐ)</label>
              <input
                type="number"
                value={valPrice}
                onChange={(e) => setValPrice(e.target.value)}
                className="w-full bg-slate-100 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm giá trị</span>
              </button>
            </div>
          </form>

          {/* Table values */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">GIÁ TRỊ</th>
                  <th className="p-3">GIÁ PHỤ THU</th>
                  <th className="p-3 text-right pr-6">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-700">
                {selectedAttr?.values.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-100/40">
                    <td className="p-3 font-bold text-slate-900 text-sm">{v.value}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      +{v.price.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-3 text-right pr-6">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditValModal(v)}
                          className="p-2.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-amber-400 rounded-xl border border-slate-300/60 transition-all cursor-pointer shadow-md"
                          title="Sửa giá trị"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVal(v.id)}
                          className="p-2.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-rose-400 rounded-xl border border-slate-300/60 transition-all cursor-pointer shadow-md"
                          title="Xóa giá trị"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* BLOCK 2: Gán Màu sắc & Độ cận cho Sản phẩm Chọn */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Glasses className="w-5 h-5 text-slate-900" />
              <span>2. Gán Tùy Chọn Màu Sắc & Độ Cận Cho Sản Phẩm Cụ Thể</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Chọn 1 mẫu kính trong shop để thiết lập các tùy chọn Màu sắc, Độ cận và Giá bán riêng</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-2xl border border-slate-300">
            <span className="text-xs font-bold text-slate-700 pl-2">Chọn sản phẩm:</span>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="bg-white text-slate-900 font-bold text-xs p-2 rounded-xl border border-slate-300 focus:outline-none"
            >
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: #{p.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form gán biến thể mới */}
        <form onSubmit={handleAssignVariantToProduct} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-100/40 p-4 rounded-2xl border border-slate-300/50 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Màu sắc gọng kính</label>
            <select
              value={assignForm.color}
              onChange={(e) => setAssignForm({ ...assignForm, color: e.target.value })}
              className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-xl border border-slate-300"
            >
              {colorList.map((c) => (
                <option key={c.id} value={c.value}>{c.value}</option>
              ))}
              <option value="Bạc Sang Trọng">Bạc Sang Trọng</option>
              <option value="Tùy chỉnh khác">Tùy chỉnh khác...</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Độ cận tròng kính</label>
            <select
              value={assignForm.degree}
              onChange={(e) => setAssignForm({ ...assignForm, degree: e.target.value })}
              className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-xl border border-slate-300"
            >
              {degreeList.map((d) => (
                <option key={d.id} value={d.value}>{d.value}</option>
              ))}
              <option value="Cận 4.00 độ">Cận 4.00 độ</option>
              <option value="Tùy chỉnh khác">Tùy chỉnh khác...</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Đơn giá biến thể (VNĐ)</label>
            <input
              type="number"
              required
              value={assignForm.price}
              onChange={(e) => setAssignForm({ ...assignForm, price: e.target.value })}
              className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Số lượng tồn kho</label>
            <input
              type="number"
              required
              value={assignForm.stockQuantity}
              onChange={(e) => setAssignForm({ ...assignForm, stockQuantity: e.target.value })}
              className="w-full bg-slate-100 text-slate-900 p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Gán cho sản phẩm</span>
            </button>
          </div>
        </form>

        {/* Danh sách biến thể hiện tại của sản phẩm được chọn */}
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
            <tbody className="divide-y divide-slate-800 text-slate-700">
              {productVariants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-100/40">
                  <td className="p-3 font-bold text-slate-900 text-sm">{v.color || 'Mặc định'}</td>
                  <td className="p-3 font-medium text-slate-700">{v.degree || '0.00 (Không độ)'}</td>
                  <td className="p-3 font-black text-slate-900">{v.price?.toLocaleString('vi-VN')} VNĐ</td>
                  <td className="p-3 font-bold text-sky-400">{v.stockQuantity || 50} chiếc</td>
                  <td className="p-3 text-right pr-6">
                    <button
                      onClick={() => handleDeleteProductVariant(v.id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-400 rounded-xl cursor-pointer transition-all"
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
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
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
