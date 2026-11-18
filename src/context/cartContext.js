import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { apiCall } from '../api/client';
import { presentSaree } from '../api/media';
import { useAuth } from './authContext';

const CartContext = createContext(null);

function fromApi(data) {
  return (data?.items || []).map((item) => ({
    id: item.productId || item.id,
    quantity: item.quantity || 1,
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
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const applyCart = useCallback((data) => {
    if (data) setCartItems(fromApi(data));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
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

  const fail = (result) => {
    try {
      Alert?.alert?.('Bag', result?.error?.message || 'The bag could not be updated.');
    } catch {
      // ignore
    }
  };

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product?.id) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
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
  }, [user, applyCart, refreshCart]);

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
  }, [user, applyCart, refreshCart]);

  const updateQuantity = useCallback(async (productId, newQty) => {
    if (!productId) return;
    setCartItems((prev) => {
      if (newQty <= 0) return prev.filter((item) => item.id !== productId);
      return prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item));
    });
    if (!user) return;
    try {
      const result = await apiCall('put', `/cart/items/${productId}`, { quantity: newQty });
      if (result.success && result.data) {
        applyCart(result.data);
      } else if (!result.success) {
        fail(result);
        refreshCart();
      }
    } catch {
      // Keep optimistic
    }
  }, [user, applyCart, refreshCart]);

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
    clearCart,
    isInCart,
    getCartItem,
    refreshCart,
  }), [
    cartItems, cartCount, subtotal, discountAmount, totalAmount, promoCode,
    addToCart, removeFromCart, updateQuantity, clearCart, isInCart, getCartItem, refreshCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export default CartContext;
