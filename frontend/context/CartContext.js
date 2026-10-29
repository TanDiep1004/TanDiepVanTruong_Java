'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';

const CartContext = createContext();

const getCartStorageKey = () => {
  if (typeof window === 'undefined') return 'ntd_cart_guest';
  const user = getUser();
  if (user) {
    const rawId = user.email || user.id || user.userId || user.username || 'user';
    const identifier = rawId.toString().toLowerCase().trim();
    if (identifier) return `ntd_cart_user_${identifier}`;
  }
  return 'ntd_cart_guest';
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [activeKey, setActiveKey] = useState('ntd_cart_guest');
  const [isLoaded, setIsLoaded] = useState(false);
  const [promotion, setPromotion] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // 1. Tải dữ liệu giỏ hàng tương ứng với người dùng hiện tại
  const loadCartForCurrentUser = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentKey = getCartStorageKey();
    setActiveKey(currentKey);

    let saved = localStorage.getItem(currentKey);

    // Fallback migration
    if (!saved && currentKey !== 'ntd_cart_guest') {
      const legacyCart = localStorage.getItem('ntd_cart');
      if (legacyCart) {
        saved = legacyCart;
        localStorage.setItem(currentKey, legacyCart);
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setIsLoaded(true);
  }, []);

  // 2. Đăng ký sự kiện lắng nghe Đăng nhập / Đăng xuất realtime
  useEffect(() => {
    loadCartForCurrentUser();

    const handleAuthChange = () => {
      loadCartForCurrentUser();
    };

    window.addEventListener('auth_state_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth_state_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadCartForCurrentUser]);

  // 3. Tự động đồng bộ giỏ hàng vào localStorage khi cartItems thay đổi
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    const currentKey = getCartStorageKey();
    if (currentKey === activeKey) {
      localStorage.setItem(currentKey, JSON.stringify(cartItems));
    }
  }, [cartItems, activeKey, isLoaded]);

  const addToCart = (product, variant, quantity = 1) => {
    const token = getToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }

    const currentKey = getCartStorageKey();

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          ((variant?.id && item.variant?.id === variant.id) ||
            (item.variant?.color === variant?.color &&
              item.variant?.degree === variant?.degree &&
              item.variant?.material === variant?.material &&
              item.variant?.feature === variant?.feature &&
              item.variant?.size === variant?.size))
      );

      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [...prev, { product, variant, quantity }];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      }
      return updated;
    });

    return true;
  };

  const removeFromCart = (index) => {
    const currentKey = getCartStorageKey();
    setCartItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof window !== 'undefined') {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const removeSelectedFromCart = (itemsToRemove) => {
    if (!Array.isArray(itemsToRemove) || itemsToRemove.length === 0) return;
    const currentKey = getCartStorageKey();
    setCartItems((prev) => {
      const updated = prev.filter((item) => {
        return !itemsToRemove.some(
          (rem) => rem.product.id === item.product.id && rem.variant?.id === item.variant?.id
        );
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateQuantity = (index, delta) => {
    const currentKey = getCartStorageKey();
    setCartItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) return prev;
      updated[index].quantity = newQty;
      if (typeof window !== 'undefined') {
        localStorage.setItem(currentKey, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearCart = () => {
    const currentKey = getCartStorageKey();
    setCartItems([]);
    setPromotion(null);
    setDiscountAmount(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(currentKey);
      localStorage.removeItem('ntd_cart');
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.variant?.price || item.product.price || 1500000;
    return acc + price * item.quantity;
  }, 0);

  const applyCouponCode = async (code, customSubtotal = null, customItems = null) => {
    const subtotal = customSubtotal !== null ? customSubtotal : cartSubtotal;
    const targetItems = customItems || cartItems;
    const productIds = targetItems.map((item) => item.product.id);

    try {
      const res = await fetchApi('/public/promotions/apply', {
        method: 'POST',
        body: JSON.stringify({
          code,
          productIds,
          orderSubtotal: subtotal,
        }),
      });

      if (res.data && res.data.valid) {
        setPromotion(res.data);
        setDiscountAmount(res.data.calculatedDiscountAmount || 0);
        return { success: true, message: res.data.message };
      } else {
        throw new Error(res.message || 'Mã ưu đãi không hợp lệ.');
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        discountAmount,
        cartTotal,
        promotion,
        addToCart,
        removeFromCart,
        removeSelectedFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
