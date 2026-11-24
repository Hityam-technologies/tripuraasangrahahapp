import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { apiCall } from '../api/client';
import { presentSaree } from '../api/media';
import { useAuth } from './authContext';
import { usePopup } from './popupContext';

const CartContext = createContext(null);

function fromApi(data) {
  return (data?.items || []).map((item) => ({
    id: item.productId || item.id,
    quantity: item.quantity || 1,
    stockQuantity: null,
    addedAt: Date.now(),
    product: presentSaree(item.product || {
      id: item.productId,
      title: item.title,
      numericPrice: item.price,
      price: item.price,
      image: item.image,
      productCode: item.productCode,
      fabric: item.fabric,
      weave: item.weave,
    }),
  }));
}

export function CartProvider({ children }) {
  const { user, maxOrderQuantity = 99 } = useAuth();
  const { showAlert } = usePopup();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // The latest number the shopper tapped, until the server agrees.
  // A slow cart reload must not paint an older count over this.
  const pendingQty = useRef(new Map());
  const syncingIds = useRef(new Set());

  const withPending = useCallback((items) => items
    .map((item) => {
      const pending = pendingQty.current.get(item.id);
      if (pending == null || pending <= 0) return item;
      return { ...item, quantity: pending };
    })
    .filter((item) => pendingQty.current.get(item.id) !== 0), []);

  const applyCart = useCallback((data) => {
    if (data) setCartItems(withPending(fromApi(data)));
  }, [withPending]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      pendingQty.current.clear();
      setCartItems([]);
      setPromoCode('');
      setDiscountAmount(0);
      return;
    }
    const result = await apiCall('get', '/cart');
    if (result.success) applyCart(result.data);
  }, [user, applyCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const fail = useCallback((result) => {
    showAlert({
      title: 'Bag',
      message: result?.error?.message || 'The bag could not be updated.',
    });
  }, [showAlert]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product?.id) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        const cap = Math.max(1, Number(maxOrderQuantity) || 99);
        next[idx] = { ...next[idx], quantity: Math.min(cap, next[idx].quantity + quantity) };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          quantity: Math.max(1, quantity),
          addedAt: Date.now(),
          product: presentSaree(product),
        },
      ];
    });

    if (!user) return;

    try {
      const result = await apiCall('post', '/cart/items', { productId: product.id, quantity });
      if (result.success && result.data) {
        applyCart(result.data);
      } else if (!result.success) {
        fail(result);
        refreshCart();
      }
    } catch {
      // Keep optimistic
    }
  }, [user, applyCart, refreshCart, maxOrderQuantity, fail]);

  const removeFromCart = useCallback(async (productId) => {
    if (!productId) return;
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    if (!user) return;
    try {
      const result = await apiCall('delete', `/cart/items/${productId}`);
      if (result.success && result.data) {
        applyCart(result.data);
      } else if (!result.success) {
        fail(result);
        refreshCart();
      }
    } catch {
      // Keep optimistic
    }
  }, [user, applyCart, refreshCart, fail]);

  const updateQuantity = useCallback(async (productId, newQty) => {
    if (!productId) return;
    const qty = Math.max(0, Math.round(Number(newQty) || 0));
    pendingQty.current.set(productId, qty);
    setCartItems((prev) => {
      if (qty <= 0) return prev.filter((item) => item.id !== productId);
      return prev.map((item) => (item.id === productId ? { ...item, quantity: qty } : item));
    });
    if (!user) {
      pendingQty.current.delete(productId);
      return;
    }
    if (syncingIds.current.has(productId)) return;
    syncingIds.current.add(productId);
    try {
      while (pendingQty.current.has(productId)) {
        const target = pendingQty.current.get(productId);
        const result = await apiCall('put', `/cart/items/${encodeURIComponent(productId)}`, { quantity: target });
        if (pendingQty.current.get(productId) !== target) continue;
        pendingQty.current.delete(productId);
        if (result.success && result.data) {
          applyCart(result.data);
          const saved = (result.data.items || []).find((item) => (item.productId || item.id) === productId);
          if (saved && target > saved.quantity) {
            fail({ error: { message: `You can choose up to ${saved.quantity} on one order.` } });
          }
        } else if (!result.success) {
          fail(result);
          const refresh = await apiCall('get', '/cart');
          if (pendingQty.current.has(productId)) continue;
          if (refresh.success) applyCart(refresh.data);
        }
      }
    } finally {
      syncingIds.current.delete(productId);
      if (pendingQty.current.has(productId)) {
        const leftover = pendingQty.current.get(productId);
        updateQuantity(productId, leftover);
      }
    }
  }, [user, applyCart, fail]);

  const changeQuantity = useCallback((productId, delta) => {
    const item = cartItems.find((entry) => entry.id === productId);
    const current = pendingQty.current.has(productId)
      ? pendingQty.current.get(productId)
      : (item?.quantity || 1);
    const cap = Math.max(1, Number(maxOrderQuantity) || 99);
    const next = Math.min(cap, current + delta);
    if (delta > 0 && next === current) {
      fail({ error: { message: `An order can include up to ${cap} of one item.` } });
      return;
    }
    if (next === current) return;
    updateQuantity(productId, next);
  }, [cartItems, updateQuantity, maxOrderQuantity, fail]);

  const clearCart = useCallback(async () => {
    setPromoCode('');
    setDiscountAmount(0);
    if (!user) {
      setCartItems([]);
      return;
    }
    const result = await apiCall('delete', '/cart');
    if (result.success) applyCart(result.data);
    else setCartItems([]);
  }, [user, applyCart]);

  const isInCart = useCallback((productId) => cartItems.some((item) => item.id === productId), [cartItems]);
  const getCartItem = useCallback((productId) => cartItems.find((item) => item.id === productId) || null, [cartItems]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => {
    const price = Number(item.product?.numericPrice ?? item.product?.price) || 0;
    return sum + price * (item.quantity || 1);
  }, 0), [cartItems]);
  const shippingFee = 0;
  const totalAmount = useMemo(() => Math.max(0, subtotal - discountAmount + shippingFee), [subtotal, discountAmount]);

  const value = useMemo(() => ({
    cartItems,
    maxOrderQuantity,
    cartCount,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    promoCode,
    setPromoCode,
    setDiscountAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    changeQuantity,
    clearCart,
    isInCart,
    getCartItem,
    refreshCart,
  }), [
    cartItems, maxOrderQuantity, cartCount, subtotal, discountAmount, totalAmount, promoCode,
    addToCart, removeFromCart, updateQuantity, changeQuantity, clearCart, isInCart, getCartItem, refreshCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export default CartContext;
