import React, { useState, useEffect } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../assets/colours';
import GradientBackground from '../../components/gradientBackground';
import ScreenHeader from '../../components/screenHeader';
import CouponBottomSheet from '../../components/couponBottomSheet';
import { ButtonSpinner } from '../../components/loadingSpinner';
import { apiCall } from '../../api/client';
import { imageSource } from '../../api/media';
import { useAuth } from '../../context/authContext';
import { useCart } from '../../context/cartContext';
import { useOrders } from '../../context/ordersContext';
import { usePopup } from '../../context/popupContext';
import { dash } from '../../lib/text';

const upiLogo = require('../../assets/UPIlogo.png');

function formatPrice(val) {
  if (val == null || val === '') return '₹0';
  if (typeof val === 'number') {
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const s = String(val).trim();
  if (s.startsWith('₹') || s.startsWith('Rs')) return s;
  const num = Number(s.replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(num) && num > 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return s ? `₹${s}` : '₹0';
}

function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 14 : 18;

  const {
    cartItems,
    maxOrderQuantity,
    cartCount,
    subtotal,
    discountAmount,
    totalAmount,
    promoCode,
    setPromoCode,
    setDiscountAmount,
    changeQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  const {
    selectedAddress,
    addAddress,
    placeOrder,
  } = useOrders();

  const { user, refreshUser } = useAuth();
  const walletBalance = Math.max(0, Number(user?.walletBalance) || 0);
  const [useWallet, setUseWallet] = useState(true);
  const walletApplied = useWallet ? Math.min(walletBalance, totalAmount) : 0;
  const payable = Math.max(0, totalAmount - walletApplied);

  const { showAlert, showConfirm } = usePopup();

  // Loading states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [refreshingCart, setRefreshingCart] = useState(false);

  // Payment method: 'ONLINE' or 'COD'
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  // Coupon bottom sheet state
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Single delivery address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address form state
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPin, setNewPin] = useState('');

  const applyCouponCode = async (rawCode) => {
    Keyboard.dismiss();
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) {
      showAlert({
        title: 'Enter Coupon',
        message: 'Please enter a valid coupon code.',
      });
      return;
    }

    const result = await apiCall('post', '/promotions/validate', { code, subtotal });
    if (!result.success || !result.data?.valid) {
      showAlert({
        title: 'Coupon not applied',
        message: result.data?.message || result.error?.message || 'This coupon cannot be used on this bag.',
      });
      return;
    }

    const discount = result.data.discountAmount;
    setPromoCode(result.data.code || code);
    setDiscountAmount(discount);
    setShowCouponModal(false);

    setTimeout(() => {
      showAlert({
        title: 'Coupon Applied!',
        message: `"${result.data.code || code}" applied successfully! You saved ${formatPrice(discount)}.`,
        type: 'success',
      });
    }, 260);
  };

  const handleRemoveCoupon = () => {
    Keyboard.dismiss();
    setPromoCode('');
    setDiscountAmount(0);
  };

  const handleOpenAddressModal = () => {
    if (selectedAddress) {
      setNewFullName(selectedAddress.fullName || '');
      setNewPhone(selectedAddress.phone || '');
      setNewLine1(selectedAddress.addressLine1 || '');
      setNewCity(selectedAddress.city || '');
      setNewPin(selectedAddress.postalCode || '');
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!newFullName.trim() || !newPhone.trim() || !newLine1.trim() || !newPin.trim()) {
      showAlert({
        title: 'Missing Details',
        message: 'Please fill in Name, Phone, Address, and PIN code.',
      });
      return;
    }

    setIsSavingAddress(true);
    try {
      const saved = await addAddress({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        addressLine1: newLine1.trim(),
        addressLine2: '',
        city: newCity.trim() || 'Hyderabad',
        state: 'Telangana',
        postalCode: newPin.trim(),
      });
      if (!saved || saved.error) {
        showAlert({
          title: 'Address not saved',
          message: saved?.error?.message || 'Check the name, phone, and 6-digit PIN code.',
        });
        return;
      }
      setShowAddressModal(false);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    if (cartItems.length === 0) {
      showAlert({
        title: 'Cart is Empty',
        message: 'Please add items to your cart before placing an order.',
      });
      return;
    }

    if (!selectedAddress) {
      showAlert({
        title: 'Delivery Address Required',
        message: 'Please select or add a delivery address.',
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const newOrder = await placeOrder({
        shippingAddress: selectedAddress,
        paymentMethod,
        promoCode,
        useWallet: walletApplied > 0,
      });
      if (!newOrder || newOrder.error) {
        showAlert({
          title: 'Order not placed',
          message: newOrder?.error?.message || 'The order could not be placed.',
        });
        return;
      }

      await clearCart();
      await refreshUser?.();

      showAlert({
        title: 'Order Confirmed!',
        message: `Your order #${newOrder.orderNumber} has been placed successfully with ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'
          }.`,
        buttonText: 'View My Orders',
        type: 'success',
        onPress: () => {
          navigation?.navigate?.('Orders');
        },
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleOpenProduct = (product) => {
    if (!product) return;
    navigation?.navigate?.('CardDetail', {
      sareeId: product.id,
      product,
    });
  };

  const handleConfirmRemove = (item) => {
    showConfirm({
      title: 'Remove Item',
      message: `Remove "${item.product?.title || 'this item'}" from your cart?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      destructive: true,
      icon: 'trash-outline',
      onConfirm: () => removeFromCart(item.id),
    });
  };

  return (
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Screen Header */}
      <ScreenHeader
        title="Cart"
        onBackPress={() => navigation.goBack()}
        rightElement={
          cartCount > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                showConfirm({
                  title: 'Clear Cart',
                  message: 'Are you sure you want to remove all items from your cart?',
                  confirmText: 'Clear All',
                  cancelText: 'Cancel',
                  destructive: true,
                  icon: 'trash-outline',
                  onConfirm: clearCart,
                });
              }}
              style={styles.clearHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear cart">
              <Icon name="trash-outline" size={17} color="#7A7268" />
            </TouchableOpacity>
          ) : null
        }
      />

      {cartItems.length === 0 ? (
        /* =====================================================================
           EMPTY CART STATE
           ===================================================================== */
        <View style={styles.emptyContainer}>
          <Icon
            name="cart-outline"
            size={72}
            color={colours.saffron || '#BF5B21'}
            style={styles.emptyIcon}
          />

          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse our collection and add sarees to your cart.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              try {
                navigation?.navigate?.('MainTabs', {
                  screen: 'CollectionsTab',
                  params: { category: 'all' },
                });
              } catch {
                navigation?.navigate?.('CollectionsTab');
              }
            }}
            style={styles.discoverBtn}>
            <Text style={styles.discoverBtnText}>Explore More</Text>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* =====================================================================
           ACTIVE CART FEED
           ===================================================================== */
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshingCart}
                onRefresh={async () => {
                  setRefreshingCart(true);
                  try {
                    await refreshCart();
                  } finally {
                    setRefreshingCart(false);
                  }
                }}
                tintColor={colours.saffron || '#BF5B21'}
                colors={[colours.saffron || '#BF5B21']}
              />
            }
            contentContainerStyle={{
              paddingHorizontal: hPadding,
              paddingTop: 8,
              paddingBottom: 16,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            {/* Items List */}
            <View style={styles.itemsListContainer}>
              {cartItems.map((item) => {
                const prod = item.product || {};
                const imageSrc = imageSource(
                  (Array.isArray(prod.images) && (prod.images[0]?.url || prod.images[0]))
                  || prod.image
                  || item.image,
                );
                const atMax = item.quantity >= (maxOrderQuantity || 99);

                return (
                  <View key={item.id} style={styles.cartCard}>
                    <View style={styles.cardTopRow}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleOpenProduct(prod)}
                        style={styles.itemImageContainer}>
                        {imageSrc ? (
                          <Image
                            source={imageSrc}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Icon
                              name="image-outline"
                              size={22}
                              color="#A89F91"
                            />
                          </View>
                        )}
                      </TouchableOpacity>

                      <View style={styles.itemDetailsCol}>
                        <View style={styles.titleRow}>
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleOpenProduct(prod)}
                            style={{ flex: 1 }}>
                            <Text style={styles.itemTitle} numberOfLines={2}>
                              {dash(prod.title || 'Saree')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleConfirmRemove(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.deleteBtn}>
                            <Icon
                              name="close"
                              size={16}
                              color="#8A8277"
                            />
                          </TouchableOpacity>
                        </View>

                        {prod.productCode ? (
                          <Text style={styles.itemCode} numberOfLines={1}>
                            Code: {prod.productCode}
                          </Text>
                        ) : null}

                        <View style={styles.priceStepperRow}>
                          <Text style={styles.itemPrice}>
                            {formatPrice(prod.price || prod.numericPrice)}
                          </Text>

                          {/* Quantity Stepper */}
                          <View style={styles.quantityStepper}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                if (item.quantity <= 1) {
                                  handleConfirmRemove(item);
                                } else {
                                  changeQuantity(item.id, -1);
                                }
                              }}
                              style={styles.stepperBtn}
                              accessibilityLabel="Decrease quantity">
                              <Icon
                                name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                                size={13}
                                color={item.quantity <= 1 ? '#C0392B' : '#161413'}
                              />
                            </TouchableOpacity>

                            <Text style={styles.stepperValueText}>
                              {item.quantity}
                            </Text>

                            <TouchableOpacity
                              activeOpacity={0.7}
                              disabled={atMax}
                              onPress={() => {
                                if (!atMax) changeQuantity(item.id, 1);
                              }}
                              style={[styles.stepperBtn, atMax && { opacity: 0.35 }]}
                              accessibilityLabel="Increase quantity">
                              <Icon name="add" size={13} color="#161413" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Unified Bottom Docked Sheet: Address + Payment Options + Summary + CTA */}
          <View
            style={[
              styles.bottomDockedPanel,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}>
            {/* 1. DELIVERY ADDRESS BAR */}
            <View style={styles.addressBar}>
              <View style={styles.addressInfoCol}>
                <View style={styles.addressNameRow}>
                  <Icon
                    name="location-outline"
                    size={15}
                    color={colours.saffron || '#BF5B21'}
                  />
                  <Text style={styles.addressTitle}>Deliver to</Text>
                  {selectedAddress ? (
                    <Text style={styles.addressRecipient} numberOfLines={1}>
                      {selectedAddress.fullName}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.addressDetailText} numberOfLines={1}>
                  {selectedAddress
                    ? `${selectedAddress.addressLine1}, ${selectedAddress.city} - ${selectedAddress.postalCode}`
                    : 'Add delivery address to continue'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenAddressModal}
                style={styles.changeLink}>
                <Text style={styles.changeLinkText}>
                  {selectedAddress ? 'Change' : 'Add'}
                </Text>
                <Icon
                  name="chevron-forward"
                  size={13}
                  color={colours.saffron || '#BF5B21'}
                />
              </TouchableOpacity>
            </View>

            {/* 2. PAYMENT METHOD SELECTION (Side-by-side elegant chips) */}
            <View style={styles.paymentChipsRow}>
              {/* Pay Online */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPaymentMethod('ONLINE')}
                style={[
                  styles.paymentChip,
                  paymentMethod === 'ONLINE' && styles.paymentChipActive,
                ]}>
                <View
                  style={[
                    styles.radioDotOuter,
                    paymentMethod === 'ONLINE' && styles.radioDotOuterActive,
                  ]}>
                  {paymentMethod === 'ONLINE' && <View style={styles.radioDotInner} />}
                </View>

                <Text
                  style={[
                    styles.paymentChipText,
                    paymentMethod === 'ONLINE' && styles.paymentChipTextActive,
                  ]}>
                  Pay Online
                </Text>

                <Image
                  source={upiLogo}
                  style={[
                    styles.chipUpiLogo,
                    paymentMethod !== 'ONLINE' && { opacity: 0.4 },
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Cash on Delivery */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPaymentMethod('COD')}
                style={[
                  styles.paymentChip,
                  paymentMethod === 'COD' && styles.paymentChipActive,
                ]}>
                <View
                  style={[
                    styles.radioDotOuter,
                    paymentMethod === 'COD' && styles.radioDotOuterActive,
                  ]}>
                  {paymentMethod === 'COD' && <View style={styles.radioDotInner} />}
                </View>

                <Text
                  style={[
                    styles.paymentChipText,
                    paymentMethod === 'COD' && styles.paymentChipTextActive,
                  ]}>
                  COD
                </Text>

                <Icon
                  name="cash-outline"
                  size={18}
                  color={
                    paymentMethod === 'COD'
                      ? colours.saffron || '#BF5B21'
                      : '#948B7F'
                  }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetSectionDivider} />

            {/* 3. ORDER SUMMARY */}
            <View style={styles.summaryBreakdown}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Items ({cartCount})
                </Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.freeShippingText}>FREE</Text>
              </View>

              {walletBalance > 0 && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setUseWallet((current) => !current)}
                  style={styles.summaryRow}
                  accessibilityRole="button"
                  accessibilityLabel="Use store cash">
                  <Text style={styles.discountLabel}>
                    {useWallet ? 'Store cash applied' : 'Tap to use store cash'}
                  </Text>
                  <Text style={styles.savingsValue}>
                    {useWallet ? `- ${formatPrice(walletApplied)}` : formatPrice(walletBalance)}
                  </Text>
                </TouchableOpacity>
              )}

              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.discountLabel}>
                    Coupon Discount ({promoCode || 'Applied'})
                  </Text>
                  <Text style={styles.savingsValue}>
                    - {formatPrice(discountAmount)}
                  </Text>
                </View>
              )}

              {/* Coupon Row: Tap to open Coupons & Offers sheet */}
              <View style={styles.couponContainer}>
                {promoCode ? (
                  <View style={styles.couponAppliedRow}>
                    <View style={styles.couponAppliedLeft}>
                      <Icon name="pricetag" size={14} color="#27AE60" />
                      <Text style={styles.couponAppliedCode}>{promoCode}</Text>
                      <Text style={styles.couponAppliedSavings}>
                        (Saved {formatPrice(discountAmount)})
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleRemoveCoupon}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.couponRemoveBtn}>
                      <Text style={styles.couponRemoveBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setShowCouponModal(true)}
                    style={styles.couponTriggerRow}>
                    <View style={styles.couponTriggerLeft}>
                      <Icon
                        name="pricetag-outline"
                        size={15}
                        color={colours.saffron || '#BF5B21'}
                      />
                      <Text style={styles.couponTriggerTitle}>
                        Apply Coupon / Offers
                      </Text>
                    </View>
                    <View style={styles.couponTriggerRight}>
                      <Text style={styles.couponTriggerAction}>Select</Text>
                      <Icon
                        name="chevron-forward"
                        size={13}
                        color={colours.saffron || '#BF5B21'}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.sheetSectionDivider} />

            {/* 4. TOTAL AMOUNT & "PLACE ORDER" ACTION */}
            <View style={styles.bottomActionRow}>
              <View style={styles.bottomPriceCol}>
                <Text style={styles.bottomPriceLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.bottomPriceValue}>
                  {formatPrice(payable)}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                disabled={isPlacingOrder}
                onPress={handlePlaceOrder}
                style={[styles.placeOrderBtn, isPlacingOrder && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Place Order">
                {isPlacingOrder ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ButtonSpinner color="#FFFFFF" />
                    <Text style={styles.placeOrderBtnText}>Placing Order...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.placeOrderBtnText}>Place Order</Text>
                    <Icon name="arrow-forward" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* =====================================================================
          SINGLE DELIVERY ADDRESS EDIT / ENTRY MODAL
         ===================================================================== */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddressModal(false)}>
        <View style={styles.modalOverlay}>
          {/* Tapping anywhere on backdrop immediately dismisses modal */}
          <TouchableWithoutFeedback onPress={() => setShowAddressModal(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {selectedAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddressModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={20} color="#161413" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={newFullName}
                onChangeText={setNewFullName}
                placeholder="Receiver's name"
                placeholderTextColor="#A0998F"
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>Mobile Phone</Text>
              <TextInput
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="+91 Mobile number"
                placeholderTextColor="#A0998F"
                keyboardType="phone-pad"
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>House / Flat / Street Address</Text>
              <TextInput
                value={newLine1}
                onChangeText={setNewLine1}
                placeholder="Building, street, area"
                placeholderTextColor="#A0998F"
                style={styles.inputField}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    value={newCity}
                    onChangeText={setNewCity}
                    placeholder="City"
                    placeholderTextColor="#A0998F"
                    style={styles.inputField}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PIN Code</Text>
                  <TextInput
                    value={newPin}
                    onChangeText={setNewPin}
                    placeholder="PIN Code"
                    placeholderTextColor="#A0998F"
                    keyboardType="number-pad"
                    style={styles.inputField}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isSavingAddress}
              onPress={handleSaveAddress}
              style={[styles.addNewAddrBtn, isSavingAddress && { opacity: 0.85 }]}>
              {isSavingAddress ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ButtonSpinner color="#FFFFFF" />
                  <Text style={styles.addNewAddrBtnText}>Saving Address...</Text>
                </View>
              ) : (
                <Text style={styles.addNewAddrBtnText}>Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================================
          COUPONS & OFFERS BOTTOM SHEET (Standard App Component)
         ===================================================================== */}
      <CouponBottomSheet
        visible={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        onApplyCoupon={applyCouponCode}
        promoCode={promoCode}
        subtotal={subtotal}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  clearHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: '#161413',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13.5,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  discoverBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 8,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  discoverBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  itemsListContainer: {
    gap: 10,
    marginBottom: 14,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0ECE4',
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  itemImageContainer: {
    width: 76,
    height: 84,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailsCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#161413',
    lineHeight: 17,
  },
  deleteBtn: {
    padding: 2,
  },
  itemCode: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#7D756A',
    marginTop: 2,
  },
  priceStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  itemPrice: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15.5,
    color: '#161413',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: '#161413',
    minWidth: 22,
    textAlign: 'center',
  },
  bottomDockedPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EFEAE1',
    paddingHorizontal: 16,
    paddingTop: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginBottom: 8,
  },
  addressInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#161413',
  },
  addressRecipient: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: colours.saffron || '#BF5B21',
  },
  addressDetailText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#554E45',
    lineHeight: 17,
    marginTop: 2,
  },
  changeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  changeLinkText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: colours.saffron || '#BF5B21',
  },
  paymentChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
  },
  paymentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F4',
    borderRadius: 11,
    borderWidth: 1.2,
    borderColor: '#ECE6DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  paymentChipActive: {
    backgroundColor: '#FFF9F4',
    borderColor: colours.saffron || '#BF5B21',
    borderWidth: 1.4,
  },
  radioDotOuter: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: '#D4CDC2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  radioDotOuterActive: {
    borderColor: colours.saffron || '#BF5B21',
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colours.saffron || '#BF5B21',
  },
  paymentChipText: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: '#524A3F',
  },
  paymentChipTextActive: {
    color: '#161413',
  },
  chipUpiLogo: {
    width: 48,
    height: 16,
    marginLeft: 4,
  },
  sheetSectionDivider: {
    height: 1,
    backgroundColor: '#F3EFE7',
    marginVertical: 8,
  },
  summaryBreakdown: {
    paddingHorizontal: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: '#554E45',
  },
  summaryValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#161413',
  },
  savingsValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#27AE60',
  },
  freeShippingText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: colours.saffron || '#BF5B21',
  },
  discountLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: '#27AE60',
  },
  couponContainer: {
    marginTop: 3,
    marginBottom: 0,
  },
  couponTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  couponTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  couponTriggerTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: '#443D34',
  },
  couponTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  couponTriggerAction: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: colours.saffron || '#BF5B21',
  },
  couponAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  couponAppliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponAppliedCode: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: '#27AE60',
    letterSpacing: 0.3,
  },
  couponAppliedSavings: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#27AE60',
  },
  couponRemoveBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  couponRemoveBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#C0392B',
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    color: '#7D756A',
    letterSpacing: 0.6,
  },
  bottomPriceValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    color: '#161413',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.saffron || '#BF5B21',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 22,
    gap: 6,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  placeOrderBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16.5,
    color: '#161413',
  },
  addressPickItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    marginBottom: 8,
  },
  addressPickItemSelected: {
    borderColor: colours.saffron || '#BF5B21',
    backgroundColor: '#FFFDFB',
  },
  addressPickHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  recipientName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14.5,
    color: '#161413',
  },
  typeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F8F4EE',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  typeTagText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#6E675D',
  },
  addressLine: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: '#4E463E',
    marginTop: 2,
  },
  addressCity: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12.5,
    color: '#7D756A',
    marginTop: 2,
  },
  recipientPhone: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12.5,
    color: '#7D756A',
    marginTop: 2,
  },
  addNewAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colours.saffron || '#BF5B21',
    paddingVertical: 13,
    borderRadius: 22,
    marginTop: 10,
  },
  addNewAddrBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#5C5449',
    marginTop: 8,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1,
    borderColor: '#ECE6DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: 'Manrope-Medium',
    fontSize: 13.5,
    color: '#161413',
  },
});

export default CartScreen;
