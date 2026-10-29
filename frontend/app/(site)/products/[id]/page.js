'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Image Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="aspect-square bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative group">
            <img src={selectedImage || imagesList[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            
            <span className="absolute top-4 left-4 bg-black text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase shadow-md">
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

          {/* Price & Stock Display - Tự động thay đổi giá khi chọn màu sắc & độ cận khác */}
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
                <span className="text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Còn hàng ({stockQuantity} chiếc)
                </span>
              ) : (
                <span className="text-rose-400">Hết hàng</span>
              )}
            </div>
          </div>

          {/* Selectors: Color */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Màu sắc gọng kính</label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeColor === color
                      ? 'bg-black text-white shadow-lg shadow-slate-500/20 scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Selectors: Degree */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Độ cận tròng kính</label>
            <div className="flex flex-wrap gap-3">
              {degreeOptions.map((deg) => (
                <button
                  key={deg}
                  onClick={() => setSelectedDegree(deg)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
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

          {/* Specs box */}
          <div className="bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">Thông số kỹ thuật sản phẩm</h4>
            <p className="text-slate-700 leading-relaxed">{product.content || product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
