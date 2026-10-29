'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, 
  ChevronLeft, ChevronRight, Glasses, ShieldCheck, Check, 
  RotateCcw, Award, Truck, Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/services/productService';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const { addToCart } = useCart();
  const toastCtx = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Các nhóm tùy chọn tương tác trực quan (Interactive Option Selectors)
  const [selectedColor, setSelectedColor] = useState('Đen Nhám Tròng Prizm Black');
  const [selectedMaterial, setSelectedMaterial] = useState({ name: 'Nhựa Acetate Cao Cấp', price: 0 });
  const [selectedShape, setSelectedShape] = useState('Phi Công (Aviator)');
  const [selectedSize, setSelectedSize] = useState('Tiêu Chuẩn (52-18-140mm)');
  const [selectedFeature, setSelectedFeature] = useState({ name: 'Tròng Tiêu Chuẩn CR-39 UV400', price: 0 });
  const [selectedDegree, setSelectedDegree] = useState({ name: '0.00 (Không độ / Thời trang)', price: 0 });

  // Danh mục tùy chọn có sẵn
  const defaultColors = [
    'Đen Nhám Tròng Prizm Black',
    'Xanh Navy Tròng Prizm Sapphire',
    'Đen Nhám (Matte Black)',
    'Vàng Kim (Gold)',
    'Đồi Mồi (Tortoise Havana)',
    'Bạc Sang Trọng (Silver)',
    'Xám Trong Suốt (Crystal Grey)'
  ];

  const materialOptions = [
    { name: 'Nhựa Acetate Cao Cấp', price: 0 },
    { name: 'Titanium Siêu Nhẹ (Chống gỉ sét)', price: 500000 },
    { name: 'Nhựa dẻo TR90 Siêu bền', price: 150000 },
    { name: 'Kim loại mạ Crom / Niken', price: 100000 },
    { name: 'Hợp kim Nhôm - Magie Thể Thao', price: 350000 }
  ];

  const shapeOptions = [
    'Phi Công (Aviator)',
    'Vuông (Square)',
    'Tròn (Round)',
    'Chữ Nhật (Rectangle)',
    'Mắt Mèo (Cat-Eye)',
    'Đa Giác (Polygon)'
  ];

  const sizeOptions = [
    'Tiêu Chuẩn (52-18-140mm)',
    'Cỡ Nhỏ (50-16-135mm)',
    'Cỡ Vừa (54-18-145mm)',
    'Cỡ Lớn Aviator (58-14-145mm)'
  ];

  const featureOptions = [
    { name: 'Tròng Tiêu Chuẩn CR-39 UV400', price: 0 },
    { name: 'Lọc Ánh Sáng Xanh BlueControl', price: 300000 },
    { name: 'Tròng Đổi Màu Transitions Gen 8 Khi Ra Nắng', price: 650000 },
    { name: 'Phủ Váng AR Giảm Chói Ban Đêm & UV400', price: 200000 },
    { name: 'Phân Cực Polarized Chống Chói Lóa Mắt', price: 400000 },
    { name: 'Phủ Lớp Nano Hard-Coat Chống Trầy', price: 150000 }
  ];

  const degreeOptions = [
    { name: '0.00 (Không độ / Thời trang)', price: 0 },
    { name: 'Cận 1.00 - 1.50 độ', price: 100000 },
    { name: 'Cận 2.00 - 2.50 độ', price: 150000 },
    { name: 'Cận 3.00 - 4.00 độ', price: 200000 },
    { name: 'Cắt theo toa riêng bác sĩ', price: 250000 }
  ];

  useEffect(() => {
    async function loadProductDetail() {
      // 1. Fetch from backend API
      try {
        const res = await productService.getProductById(productId);
        if (res && (res.data || res.product)) {
          const raw = res.data?.product ? res.data : (res.product ? res : res.data);
          const baseProduct = raw.product || raw;
          const imagesList = raw.images || baseProduct.images || [];
          const variantsList = raw.variants || baseProduct.variants || [];

          const fullObj = {
            ...baseProduct,
            images: imagesList,
            variants: variantsList,
          };

          setProduct(fullObj);

          if (imagesList.length > 0) {
            setSelectedImage(imagesList[0].imageUrl);
          } else if (fullObj.imageUrl) {
            setSelectedImage(fullObj.imageUrl);
          }

          if (variantsList.length > 0 && variantsList[0].color) {
            setSelectedColor(variantsList[0].color);
          }

          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Fetch product detail error:", e);
      }

      // 2. Try stored_products in localStorage
      try {
        const storedProds = JSON.parse(localStorage.getItem('stored_products') || '[]');
        const found = storedProds.find(p => p.id?.toString() === productId?.toString());
        if (found) {
          setProduct(found);
          if (found.images && found.images.length > 0) {
            setSelectedImage(found.images[0].imageUrl);
          }
          if (found.variants && found.variants.length > 0 && found.variants[0].color) {
            setSelectedColor(found.variants[0].color);
          }
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 3. Fallback demo product
      const fallback = {
        id: productId,
        name: 'Kính Râm Ray-Ban Aviator Classic RB3025 G-15',
        description: 'Mẫu kính râm huyền thoại Ray-Ban Aviator RB3025 gọng kim loại sang trọng, tròng kính G-15 chống 100% tia UV400 bảo vệ mắt tuyệt đối.',
        content: '<p>Kính Mát Ray-Ban Aviator Classic RB3025 là biểu tượng vượt thời gian mang lại phong cách lịch lãm, hiện đại cùng khả năng quang học vượt trội.</p>',
        price: 3250000,
        originalPrice: 4100000,
        brand: { name: 'Ray-Ban' },
        category: { name: 'Kính Râm' },
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', isPrimary: 1 },
          { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', isPrimary: 0 },
        ],
        variants: [
          { id: 101, color: 'Đen Nhám Tròng Prizm Black', degree: '0.00 (Không độ)', price: 3250000, stockQuantity: 50 },
          { id: 102, color: 'Xanh Navy Tròng Prizm Sapphire', degree: '0.00 (Không độ)', price: 3550000, stockQuantity: 30 },
        ]
      };
      setProduct(fallback);
      setSelectedImage(fallback.images[0].imageUrl);
      setLoading(false);
    }
    loadProductDetail();
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin kính...</span>
        </div>
      </div>
    );
  }

  // Hợp nhất danh sách màu sắc từ database và danh mục chuẩn
  const variantColors = product.variants ? product.variants.map(v => v.color).filter(Boolean) : [];
  const colorOptions = Array.from(new Set([...variantColors, ...defaultColors]));

  // Tính toán đơn giá realtime: Giá gốc sản phẩm + Phụ phí tùy chọn (Chất liệu + Tính năng tròng + Độ cận)
  const basePrice = product.price ? Number(product.price) : 1500000;
  const extraSurcharge = (selectedMaterial?.price || 0) + (selectedFeature?.price || 0) + (selectedDegree?.price || 0);
  const displayPrice = basePrice + extraSurcharge;
  const originalPrice = product.originalPrice 
    ? Number(product.originalPrice) + extraSurcharge 
    : Math.round(displayPrice * 1.25);
  const discountPercent = originalPrice > displayPrice 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0;

  const stockQuantity = product.stockQuantity ?? 50;

  // Gom đầy đủ các tùy chọn người dùng đã chọn
  const buildSelectedVariant = () => {
    return {
      id: `${product.id}-${selectedColor}-${selectedMaterial.name}-${selectedSize}-${selectedDegree.name}`.replace(/\s+/g, '-'),
      color: selectedColor,
      material: selectedMaterial.name,
      shape: selectedShape,
      size: selectedSize,
      feature: selectedFeature.name,
      degree: selectedDegree.name,
      price: displayPrice,
      variantName: `${selectedColor} • ${selectedMaterial.name} • ${selectedShape} • ${selectedSize} • ${selectedFeature.name} • ${selectedDegree.name}`
    };
  };

  const handleAddToCart = () => {
    const variantPayload = buildSelectedVariant();
    const added = addToCart(product, variantPayload, quantity);
    if (added && toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'success',
        title: 'Đã Thêm Vào Giỏ Hàng!',
        message: `${quantity}x ${product.name} (${selectedColor}, ${selectedMaterial.name}, ${selectedFeature.name})`,
        image: selectedImage || (product.images?.[0]?.imageUrl),
      });
    }
  };

  const handleBuyNow = () => {
    const variantPayload = buildSelectedVariant();
    const added = addToCart(product, variantPayload, quantity);
    if (added) {
      router.push('/checkout');
    }
  };

  const imagesList = product.images && product.images.length > 0
    ? product.images.map(img => img.imageUrl)
    : [product.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800'];

  const currentImgIndex = imagesList.indexOf(selectedImage) !== -1 ? imagesList.indexOf(selectedImage) : 0;

  const handlePrevImage = () => {
    const prevIdx = (currentImgIndex - 1 + imagesList.length) % imagesList.length;
    setSelectedImage(imagesList[prevIdx]);
  };

  const handleNextImage = () => {
    const nextIdx = (currentImgIndex + 1) % imagesList.length;
    setSelectedImage(imagesList[nextIdx]);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh mục</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* CỘT TRÁI: Thư viện hình ảnh sản phẩm */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl flex items-center justify-center p-8 group">
            <img
              src={selectedImage || imagesList[0]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 bg-black text-white font-black text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
              Chính hãng 100%
            </span>

            {/* Nút điều hướng ảnh */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-50/70 text-slate-900 hover:bg-black hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
                  title="Xem ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-50/70 text-slate-900 hover:bg-black hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
                  title="Xem ảnh kế tiếp"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {imagesList.length > 1 && (
              <span className="absolute bottom-4 right-4 bg-slate-50/80 backdrop-blur-md text-slate-900 font-extrabold text-xs px-3 py-1 rounded-full border border-slate-200">
                Góc chụp {currentImgIndex + 1} / {imagesList.length}
              </span>
            )}
          </div>

          {/* Thumbnail ảnh nhỏ chọn xem trực tiếp */}
          {imagesList.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>CHỌN XEM GÓC MẪU KÍNH ({imagesList.length} ẢNH CHỤP):</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === imgUrl ? 'border-slate-900 scale-105 shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img src={imgUrl} alt={`Mẫu góc ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-md ${
                      selectedImage === imgUrl ? 'bg-black text-white' : 'bg-slate-50/80 text-slate-900'
                    }`}>
                      Mẫu {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cam kết thương hiệu & dịch vụ */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-xs">
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">100% Chính Hãng</strong>
                <span className="text-slate-500 text-[11px]">Đầy đủ hộp, thẻ bảo hành</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">Đổi Trả 7 Ngày</strong>
                <span className="text-slate-500 text-[11px]">Miễn phí nếu không vừa ý</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">Giao Hỏa Tốc</strong>
                <span className="text-slate-500 text-[11px]">Nội thành nhận trong 2H</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 font-bold">Bảo Hành 12 Tháng</strong>
                <span className="text-slate-500 text-[11px]">Cân chỉnh gọng trọn đời</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BỘ CHỌN TÙY CHỌN ĐẶC TẢ KỸ THUẬT MẮT KÍNH TRỰC QUAN */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white border border-slate-900/30 text-slate-900 font-bold text-xs">
                {product.brand?.name || 'Ray-Ban'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Mã SKU: MK-{product.id}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 text-amber-400 text-xs">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-700 font-bold">4.9/5.0</span>
              <span className="text-slate-500">• (128 Đánh giá từ khách hàng)</span>
            </div>
          </div>

          {/* Hiển thị giá bán & Trạng thái kho */}
          <div className="bg-white/90 border border-slate-200 p-5 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-slate-900">{displayPrice.toLocaleString('vi-VN')} VNĐ</span>
              {originalPrice && originalPrice > displayPrice && (
                <>
                  <span className="text-sm text-slate-500 line-through font-medium">
                    {originalPrice.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30">
                    Tiết kiệm {discountPercent}%
                  </span>
                </>
              )}
            </div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span className="text-slate-500">Trạng thái kho hàng:</span>
              {stockQuantity > 0 ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Còn hàng trong kho ({stockQuantity} chiếc)
                </span>
              ) : (
                <span className="text-rose-400">Tạm thời hết hàng</span>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* CÁC NHÓM TÙY CHỌN ĐẶC TẢ KỸ THUẬT MẮT KÍNH CHO NGƯỜI DÙNG CHỌN */}
          {/* ========================================================== */}

          {/* 1. MÀU SẮC GỌNG & TRÒNG (FRAME & LENS COLOR) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              MÀU SẮC GỌNG: <span className="text-slate-900 font-black">{selectedColor.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHẤT LIỆU GỌNG (FRAME MATERIAL) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              CHẤT LIỆU GỌNG: <span className="text-slate-900 font-black">{selectedMaterial.name.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {materialOptions.map((mat) => {
                const isSelected = selectedMaterial.name === mat.name;
                return (
                  <button
                    key={mat.name}
                    type="button"
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{mat.name}</span>
                    {mat.price > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        +{mat.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. KIỂU DÁNG GỌNG (FRAME SHAPE) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              KIỂU DÁNG GỌNG: <span className="text-slate-900 font-black">{selectedShape.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {shapeOptions.map((shape) => {
                const isSelected = selectedShape === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setSelectedShape(shape)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {shape}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. KÍCH THƯỚC GỌNG (FRAME SIZE / DIMENSIONS) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              KÍCH THƯỚC: <span className="text-slate-900 font-black">{selectedSize.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {sizeOptions.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. TÍNH NĂNG BỔ SUNG TRÒNG (LENS & PROTECTION FEATURES) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              TÍNH NĂNG TRÒNG KÍNH: <span className="text-slate-900 font-black">{selectedFeature.name.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {featureOptions.map((feat) => {
                const isSelected = selectedFeature.name === feat.name;
                return (
                  <button
                    key={feat.name}
                    type="button"
                    onClick={() => setSelectedFeature(feat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{feat.name}</span>
                    {feat.price > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        +{feat.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. TÙY CHỌN ĐỘ CẬN (PRESCRIPTION DEGREE) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              TÙY CHỌN ĐỘ CẬN: <span className="text-slate-900 font-black">{selectedDegree.name.toUpperCase()}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {degreeOptions.map((deg) => {
                const isSelected = selectedDegree.name === deg.name;
                return (
                  <button
                    key={deg.name}
                    type="button"
                    onClick={() => setSelectedDegree(deg)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105 border border-black'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{deg.name}</span>
                    {deg.price > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        +{deg.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TÓM TẮT CẤU HÌNH KÍNH ĐANG CHỌN */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5 shadow-sm">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cấu hình bạn đang chọn:</span>
            </div>
            <p className="text-[12px] text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-900">{selectedColor}</strong> • {selectedMaterial.name} • {selectedShape} • Size {selectedSize} • {selectedFeature.name} • {selectedDegree.name}
            </p>
            {extraSurcharge > 0 && (
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phụ phí nâng cấp gọng & tròng cao cấp: +{extraSurcharge.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            )}
          </div>

          {/* Số lượng mua */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Số lượng mua</label>
            <div className="flex items-center gap-3 w-fit bg-white border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="w-10 text-center font-extrabold text-sm text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút hành động Mua hàng & Thêm giỏ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm border border-slate-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>THÊM VÀO GIỎ HÀNG</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="py-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-slate-500/25"
            >
              <CreditCard className="w-5 h-5" />
              <span>MUA NGAY (THANH TOÁN)</span>
            </button>
          </div>

          {/* Chi tiết mô tả & Giới thiệu mắt kính */}
          {product.description && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-xs leading-relaxed text-slate-600">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <Glasses className="w-4 h-4 text-slate-900" />
                <span>Giới thiệu sản phẩm</span>
              </h4>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
