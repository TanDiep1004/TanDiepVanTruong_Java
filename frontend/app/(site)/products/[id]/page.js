'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, 
  ChevronLeft, ChevronRight, Glasses, Ruler, ShieldCheck, Check, Layers 
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
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeSpecTab, setActiveSpecTab] = useState('SPECS'); // 'SPECS', 'DIMENSIONS', 'FEATURES'

  useEffect(() => {
    async function loadProductDetail() {
      // 1. Fetch from backend API
      try {
        const res = await productService.getProductById(productId);
        if (res.data) {
          const raw = res.data;
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

          if (variantsList.length > 0) {
            if (variantsList[0].color) setSelectedColor(variantsList[0].color);
            if (variantsList[0].degree) setSelectedDegree(variantsList[0].degree);
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
        const found = storedProds.find(p => p.id.toString() === productId.toString());
        if (found) {
          setProduct(found);
          if (found.images && found.images.length > 0) {
            setSelectedImage(found.images[0].imageUrl);
          }
          if (found.variants && found.variants.length > 0) {
            if (found.variants[0].color) setSelectedColor(found.variants[0].color);
            if (found.variants[0].degree) setSelectedDegree(found.variants[0].degree);
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
        content: 'Chất liệu gọng: Titanium mạ vàng, Kích thước: 58-14-135, Xuất xứ: Ý',
        price: 3250000,
        originalPrice: 4100000,
        brand: { name: 'Ray-Ban' },
        category: { name: 'Kính Râm' },
        images: [
          { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', isPrimary: 1 },
          { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', isPrimary: 0 },
        ],
        variants: [
          { id: 101, color: 'Đen Nhám', degree: '0.00 (Không độ)', price: 3250000, stockQuantity: 50 },
          { id: 102, color: 'Vàng Kim', degree: '0.00 (Không độ)', price: 3550000, stockQuantity: 30 },
          { id: 103, color: 'Đen Nhám', degree: '1.50 độ', price: 3450000, stockQuantity: 15 },
        ]
      };
      setProduct(fallback);
      setSelectedImage(fallback.images[0].imageUrl);
      setSelectedColor(fallback.variants[0].color);
      setSelectedDegree(fallback.variants[0].degree);
      setLoading(false);
    }
    loadProductDetail();
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin chi tiết kính...</span>
        </div>
      </div>
    );
  }

  // Danh sách màu sắc thực tế từ biến thể sản phẩm
  const colorOptions = Array.from(
    new Set(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => v.color).filter(Boolean)
        : ['Đen Nhám', 'Vàng Kim', 'Bạc Sang Trọng']
    )
  );

  // Danh sách độ cận thực tế từ biến thể sản phẩm
  const degreeOptions = Array.from(
    new Set(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => v.degree).filter(Boolean)
        : ['0.00 (Không độ)', '1.50 độ', '2.00 độ', '3.00 độ']
    )
  );

  const activeColor = selectedColor || colorOptions[0] || 'Đen Nhám';
  const activeDegree = selectedDegree || degreeOptions[0] || '0.00 (Không độ)';

  // Tìm biến thể khớp với màu sắc và độ cận đang chọn
  const matchedVariant = product.variants?.find(
    (v) => (v.color || colorOptions[0]) === activeColor && (v.degree || degreeOptions[0]) === activeDegree
  );

  // Đơn giá thay đổi realtime theo biến thể chọn
  const displayPrice = matchedVariant?.price ? Number(matchedVariant.price) : (product.price ? Number(product.price) : 1500000);
  const originalPrice = product.originalPrice && product.originalPrice > displayPrice ? Number(product.originalPrice) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  
  const stockQuantity = matchedVariant?.stockQuantity ?? 50;

  const handleAddToCart = () => {
    const added = addToCart(product, matchedVariant || { color: activeColor, degree: activeDegree, price: displayPrice }, quantity);
    if (added && toastCtx?.showToast) {
      toastCtx.showToast({
        type: 'success',
        title: 'Đã Thêm Vào Giỏ Hàng!',
        message: `${quantity}x ${product.name} (${activeColor}, ${activeDegree})`,
        image: selectedImage || (product.images?.[0]?.imageUrl),
      });
    }
  };

  const handleBuyNow = () => {
    const added = addToCart(product, matchedVariant || { color: activeColor, degree: activeDegree, price: displayPrice }, quantity);
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
        {/* Left Column: Image Gallery with Interactive Thumbnails */}
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

            {/* Navigation Arrows for Images */}
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

            {/* Image Indicator Badge */}
            {imagesList.length > 1 && (
              <span className="absolute bottom-4 right-4 bg-slate-50/80 backdrop-blur-md text-slate-900 font-extrabold text-xs px-3 py-1 rounded-full border border-slate-200">
                Góc chụp {currentImgIndex + 1} / {imagesList.length}
              </span>
            )}
          </div>

          {/* Interactive Thumbnails list with buttons */}
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
        </div>

        {/* Right Product Information */}
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

          {/* Price & Stock Display */}
          <div className="bg-white/90 border border-slate-200 p-5 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-slate-900">{displayPrice.toLocaleString('vi-VN')} VNĐ</span>
              {originalPrice && (
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

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Màu sắc gọng: <span className="text-slate-900 font-black">{activeColor}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeColor === col
                      ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Degree Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Tùy chọn độ cận / Tròng: <span className="text-slate-900 font-black">{activeDegree}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {degreeOptions.map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setSelectedDegree(deg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDegree === deg
                      ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Counter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Số lượng mua</label>
            <div className="flex items-center gap-3 w-fit bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="w-10 text-center font-extrabold text-sm text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm border border-slate-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>THÊM VÀO GIỎ HÀNG</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="py-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-slate-500/25"
            >
              <CreditCard className="w-5 h-5" />
              <span>MUA NGAY (THANH TOÁN)</span>
            </button>
          </div>

          {/* BẢNG ĐẶC TẢ KỸ THUẬT MẮT KÍNH TOÀN DIỆN (Eyewear Specifications, Dimensions & Features) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm uppercase flex items-center gap-2">
                <Glasses className="w-4 h-4 text-slate-900" />
                <span>Bảng Đặc Tả Kỹ Thuật Chi Tiết</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500">Tiêu chuẩn quốc tế</span>
            </div>

            {/* 3 Tabs thông số */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveSpecTab('SPECS')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeSpecTab === 'SPECS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Đặc tả gọng & tròng
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecTab('DIMENSIONS')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeSpecTab === 'DIMENSIONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Kích thước chuẩn
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecTab('FEATURES')}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeSpecTab === 'FEATURES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Tính năng bảo vệ
              </button>
            </div>

            {/* Nội dung Tab 1: Đặc tả kỹ thuật */}
            {activeSpecTab === 'SPECS' && (
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Thương hiệu (Brand)</span>
                  <span className="font-bold text-slate-900">{product.brand?.name || 'Ray-Ban'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Giới tính (Gender)</span>
                  <span className="font-bold text-slate-900">
                    {(product.name?.toLowerCase().includes('nam') && !product.name?.toLowerCase().includes('nữ')) ? 'Nam (Men)' : 
                     (product.name?.toLowerCase().includes('nữ')) ? 'Nữ (Women)' : 'Unisex (Cả Nam & Nữ)'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Kiểu dáng gọng (Frame Shape)</span>
                  <span className="font-bold text-slate-900">
                    {product.name?.toLowerCase().includes('aviator') ? 'Phi công (Aviator)' :
                     product.name?.toLowerCase().includes('square') ? 'Vuông (Square)' :
                     product.name?.toLowerCase().includes('round') ? 'Tròn (Round)' :
                     product.name?.toLowerCase().includes('cat') ? 'Mắt mèo (Cat-eye)' : 'Chữ nhật (Rectangle)'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Chất liệu gọng (Frame Material)</span>
                  <span className="font-bold text-slate-900">Titanium Siêu Nhẹ & Nhựa Acetate</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Chất liệu tròng (Lens Material)</span>
                  <span className="font-bold text-slate-900">Polycarbonate Chống Vỡ / Thủy tinh khoáng</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Màu sắc gọng (Frame Color)</span>
                  <span className="font-bold text-slate-900">{activeColor}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Màu sắc tròng (Lens Color)</span>
                  <span className="font-bold text-slate-900">Xanh rêu Classic G-15 / Trong suốt</span>
                </div>
              </div>
            )}

            {/* Nội dung Tab 2: Kích thước */}
            {activeSpecTab === 'DIMENSIONS' && (
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Chiều rộng tròng kính (Lens Width)</span>
                  <span className="font-bold text-slate-900">54 mm (Cỡ tiêu chuẩn người lớn)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Chiều rộng cầu kính (Bridge Width)</span>
                  <span className="font-bold text-slate-900">18 mm (Vừa vặn sống mũi Á Đông)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Chiều dài càng kính (Temple Length)</span>
                  <span className="font-bold text-slate-900">140 mm (Ôm sát vành tai êm ái)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Trọng lượng gọng (Weight)</span>
                  <span className="font-bold text-emerald-600">18.5 g (Siêu nhẹ không hằn sống mũi)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Độ cong cơ bản (Base Curve)</span>
                  <span className="font-bold text-slate-900">Curve 6 (Tầm nhìn quang học sắc nét)</span>
                </div>
              </div>
            )}

            {/* Nội dung Tab 3: Tính năng bảo vệ */}
            {activeSpecTab === 'FEATURES' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chống tia UV: Chuẩn UV400</span>
                    <p className="text-[11px] text-emerald-700">Ngăn chặn 100% tia bức xạ mặt trời UVA & UVB gây hại giác mạc</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-200/60 flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lọc ánh sáng xanh (Blue Light Filter)</span>
                    <p className="text-[11px] text-sky-700">Bảo vệ mắt tối ưu khi làm việc máy tính, điện thoại liên tục</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chống chói / Phản quang (Anti-reflective)</span>
                    <p className="text-[11px] text-amber-700">Lớp phủ váng AR loại bỏ hiện tượng lóa sáng đèn xe khi lái xe ban đêm</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Chống trầy Nano & Đổi màu Photochromic</span>
                    <p className="text-[11px] text-purple-700">Lớp phủ Hard-Coat hạn chế trầy xước, hỗ trợ tròng Transitions tự đổi màu ra nắng</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
