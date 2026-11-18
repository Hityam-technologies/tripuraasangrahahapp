import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { apiCall } from '../api/client';
import { useAuth } from './authContext';

const OrdersContext = createContext(null);

const DEFAULT_ADDRESSES = [
  {
    id: 'addr-1',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43210',
    addressLine1: 'Plot No. 42, Road No. 10',
    addressLine2: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500034',
    isDefault: true,
  },
];

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setSavedAddresses(DEFAULT_ADDRESSES);
      setSelectedAddressId('addr-1');
      return;
    }
    const [orderResult, addressResult] = await Promise.all([
      apiCall('get', '/orders'),
      apiCall('get', '/users/me/addresses'),
    ]);
    if (orderResult.success) setOrders(orderResult.data || []);
    if (addressResult.success) {
      const rows = addressResult.data || [];
      if (rows.length > 0) {
        setSavedAddresses(rows);
        const selected = rows.find((row) => row.isDefault) || rows[0];
        setSelectedAddressId(selected?.id || null);
      }
    }
  }, [user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const selectedAddress = useMemo(() => {
    return savedAddresses.find((row) => row.id === selectedAddressId) || savedAddresses[0] || null;
  }, [savedAddresses, selectedAddressId]);

  const addAddress = useCallback(async (newAddress) => {
    if (user) {
      const result = await apiCall('post', '/users/me/addresses', {
        ...newAddress,
        state: newAddress.state || 'Telangana',
        isDefault: true,
      });
      if (!result.success) return { error: result.error };
      await refreshOrders();
      return result.data;
    }
    const created = {
      id: `addr-${Date.now()}`,
      ...newAddress,
      isDefault: true,
    };
    setSavedAddresses([created]);
    setSelectedAddressId(created.id);
    return created;
  }, [user, refreshOrders]);

  const updateDeliveryAddress = addAddress;
  const selectAddress = useCallback((id) => setSelectedAddressId(id), []);

  const placeOrder = useCallback(async ({ shippingAddress, paymentMethod, promoCode, useWallet, items, totalAmount, subtotal, discountAmount }) => {
    if (user) {
      const result = await apiCall('post', '/orders', {
        paymentMethod: paymentMethod || 'COD',
        promoCode: promoCode || '',
        useWallet: Boolean(useWallet),
        shippingAddress,
      });
      if (!result.success) return { error: result.error };
      setOrders((prev) => [result.data, ...prev.filter((order) => order.id !== result.data.id)]);
      return result.data;
    }
    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber: `TS-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: Date.now(),
      dateFormatted: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'CONFIRMED',
      statusLabel: 'Order Confirmed',
      items: items || [],
      totalAmount: totalAmount || 0,
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      shippingFee: 0,
      shippingAddress: shippingAddress || selectedAddress,
      paymentMethod: paymentMethod || 'ONLINE',
      paymentStatus: paymentMethod === 'COD' ? 'PAY_ON_DELIVERY' : 'PAID',
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [user, selectedAddress]);

  const getOrderById = useCallback((orderId) => {
    return orders.find((order) => order.id === orderId || order.orderNumber === orderId) || null;
  }, [orders]);

  const value = useMemo(() => ({
    orders,
    ordersCount: orders.length,
    savedAddresses,
    selectedAddress,
    selectAddress,
    addAddress,
    updateDeliveryAddress,
    placeOrder,
    getOrderById,
    refreshOrders,
  }), [
    orders, savedAddresses, selectedAddress, selectAddress, addAddress,
    updateDeliveryAddress, placeOrder, getOrderById, refreshOrders,
  ]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within an OrdersProvider');
  return context;
}

export default OrdersContext;
