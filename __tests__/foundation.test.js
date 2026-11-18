import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CartProvider, useCart } from '../src/context/cartContext';
import { PopupProvider, usePopup } from '../src/context/popupContext';
import { OrdersProvider, useOrders } from '../src/context/ordersContext';

describe('Cart Foundation and Context', () => {
  const mockSaree1 = {
    id: 'saree-101',
    title: 'Kanjeevaram Crimson Silk',
    numericPrice: 42000,
    price: '₹42,000',
    productCode: 'KAN-101',
  };

  const mockSaree2 = {
    id: 'saree-102',
    title: 'Banarasi Gold Brocade',
    numericPrice: 58000,
    price: '₹58,000',
    productCode: 'BAN-102',
  };

  let cartApi;

  function TestConsumer() {
    cartApi = useCart();
    return null;
  }

  test('initializes with empty cart and supports add, update, remove, clear', () => {
    act(() => {
      renderer.create(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    expect(cartApi.cartItems).toEqual([]);
    expect(cartApi.cartCount).toBe(0);
    expect(cartApi.subtotal).toBe(0);
    expect(cartApi.totalAmount).toBe(0);

    // Add saree 1
    act(() => {
      cartApi.addToCart(mockSaree1, 1);
    });

    expect(cartApi.cartCount).toBe(1);
    expect(cartApi.subtotal).toBe(42000);
    expect(cartApi.isInCart('saree-101')).toBe(true);

    // Add saree 2 with quantity 2
    act(() => {
      cartApi.addToCart(mockSaree2, 2);
    });

    expect(cartApi.cartCount).toBe(3);
    expect(cartApi.subtotal).toBe(42000 + 58000 * 2);
    expect(cartApi.isInCart('saree-102')).toBe(true);

    // Update quantity: saree 1 becomes 4, saree 2 is 2 -> total is 6
    act(() => {
      cartApi.updateQuantity('saree-101', 4);
    });

    expect(cartApi.cartCount).toBe(6);

    // Remove item when quantity set to 0
    act(() => {
      cartApi.updateQuantity('saree-101', 0);
    });

    expect(cartApi.cartCount).toBe(2);
    expect(cartApi.isInCart('saree-101')).toBe(false);

    // Clear cart
    act(() => {
      cartApi.clearCart();
    });

    expect(cartApi.cartCount).toBe(0);
    expect(cartApi.cartItems).toEqual([]);
  });
});

describe('Popup Foundation and Context', () => {
  let popupApi;

  function PopupConsumer() {
    popupApi = usePopup();
    return null;
  }

  test('supports showAlert, showConfirm, and hidePopup', () => {
    act(() => {
      renderer.create(
        <PopupProvider>
          <PopupConsumer />
        </PopupProvider>,
      );
    });

    expect(typeof popupApi.showAlert).toBe('function');
    expect(typeof popupApi.showConfirm).toBe('function');
    expect(typeof popupApi.showPopup).toBe('function');
    expect(typeof popupApi.hidePopup).toBe('function');

    // Trigger alert
    act(() => {
      popupApi.showAlert({
        title: 'Information',
        message: 'Order placed successfully.',
      });
    });

    // Trigger confirm with destructive action
    act(() => {
      popupApi.showConfirm({
        title: 'Remove Item',
        message: 'Are you sure?',
        destructive: true,
        onConfirm: () => {},
      });
    });

    act(() => {
      popupApi.hidePopup();
    });
  });
});

describe('Orders Foundation and Context', () => {
  let ordersApi;

  function OrdersConsumer() {
    ordersApi = useOrders();
    return null;
  }

  test('manages addresses and successfully places orders', () => {
    act(() => {
      renderer.create(
        <OrdersProvider>
          <OrdersConsumer />
        </OrdersProvider>,
      );
    });

    expect(ordersApi.orders).toEqual([]);
    expect(ordersApi.ordersCount).toBe(0);
    expect(ordersApi.selectedAddress).toBeTruthy();

    let newOrder;
    act(() => {
      newOrder = ordersApi.placeOrder({
        items: [
          {
            id: 'saree-1',
            quantity: 1,
            product: {
              id: 'saree-1',
              title: 'Kanjeevaram Silk',
              price: '₹42,000',
              numericPrice: 42000,
            },
          },
        ],
        totalAmount: 42000,
        subtotal: 42000,
        paymentMethod: 'ONLINE',
      });
    });

    expect(ordersApi.ordersCount).toBe(1);
    expect(ordersApi.orders[0].orderNumber).toBeTruthy();
    expect(ordersApi.orders[0].status).toBe('CONFIRMED');
    expect(ordersApi.orders[0].paymentMethod).toBe('ONLINE');

    // Test add address
    act(() => {
      ordersApi.addAddress({
        fullName: 'Anita Desai',
        phone: '+91 99887 76655',
        addressLine1: 'Villa 12, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        type: 'Home',
      });
    });

    expect(ordersApi.selectedAddress.fullName).toBe('Anita Desai');
  });
});
