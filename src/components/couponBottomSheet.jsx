import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { apiCall } from '../api/client';

export const AVAILABLE_COUPONS = [
  {
    code: 'UTSAV10',
    title: '10% OFF on Heirloom Sarees',
    subtitle: 'Save 10% on your entire cart subtotal',
    type: 'percent',
    value: 0.10,
    icon: 'pricetag',
  },
  {
    code: 'TRIPURAA',
    title: 'Flat ₹5,000 OFF',
    subtitle: 'Exclusive celebration discount on bridal wear',
    type: 'flat',
    value: 5000,
    icon: 'ribbon',
  },
  {
    code: 'WELCOME',
    title: 'Flat ₹2,000 OFF',
    subtitle: 'Welcome gift for your first Tripuraa Sangrahah drape',
    type: 'flat',
    value: 2000,
    icon: 'gift',
  },
  {
    code: 'FESTIVE15',
    title: '15% Grand Festive Savings',
    subtitle: 'Valid on authentic handloom silks',
    type: 'percent',
    value: 0.15,
    icon: 'flame',
  },
];

function formatPrice(val) {
  if (val == null || val === '') return '₹0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '₹0';
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * CouponBottomSheet Component
 * 
 * Reusable slide-up drawer for Tripuraa Sangrahah promotional offers & coupons:
 * - 1-tap instant coupon apply buttons
 * - Live savings preview based on cart subtotal
 * - Manual coupon entry box
 * - Backed by canonical BottomSheet with automatic backdrop dismiss on tap
 */
function CouponBottomSheet({
  visible = false,
  onClose,
  onApplyCoupon,
  promoCode = '',
  subtotal = 0,
  coupons = AVAILABLE_COUPONS,
}) {
  const [couponInput, setCouponInput] = useState('');
  const [liveCoupons, setLiveCoupons] = useState(null);
  const shownCoupons = liveCoupons?.length ? liveCoupons : coupons;
  const couponCount = shownCoupons?.length || 0;
  const isMultiOffer = couponCount >= 3;

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    apiCall('get', '/promotions/coupons').then((result) => {
      if (!cancelled && result.success && Array.isArray(result.data)) setLiveCoupons(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const handleApply = (codeToApply) => {
    Keyboard.dismiss();
    const finalCode = (codeToApply || couponInput || '').trim().toUpperCase();
    if (finalCode) {
      onApplyCoupon?.(finalCode);
      setCouponInput('');
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Coupons & Offers"
      maxHeight={isMultiOffer ? '75%' : undefined}>
      <View style={styles.container}>
        {/* Manual Coupon Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            value={couponInput}
            onChangeText={setCouponInput}
            placeholder="Enter coupon code"
            placeholderTextColor="#A0998F"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleApply(couponInput)}
            style={styles.textInput}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleApply(couponInput)}
            style={[
              styles.applyBtn,
              !couponInput.trim() && styles.applyBtnDisabled,
            ]}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Available Offers Header */}
        <View style={styles.sectionHeader}>
          <Icon
            name="ticket-outline"
            size={14}
            color={colours.saffron || '#BF5B21'}
          />
          <Text style={styles.sectionHeaderText}>AVAILABLE OFFERS</Text>
        </View>

        {/* Coupon Cards List - Dynamic height and scrolling */}
        <ScrollView
          style={[
            styles.scrollList,
            isMultiOffer && styles.scrollListMulti,
          ]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={true}
          overScrollMode="always"
          keyboardShouldPersistTaps="handled">
          {shownCoupons.map((coupon) => {
            const isCurrent = promoCode === coupon.code;
            const savingsPreview =
              coupon.type === 'percent'
                ? Math.round(subtotal * coupon.value)
                : Math.min(coupon.value, subtotal);

            return (
              <View
                key={coupon.code}
                style={[
                  styles.offerCard,
                  isCurrent && styles.offerCardCurrent,
                ]}>
                <View style={styles.offerCardTop}>
                  <View
                    style={[
                      styles.offerBadge,
                      isCurrent && styles.offerBadgeCurrent,
                    ]}>
                    <Text
                      style={[
                        styles.offerBadgeText,
                        isCurrent && styles.offerBadgeTextCurrent,
                      ]}>
                      {coupon.code}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleApply(coupon.code)}
                    style={[
                      styles.cardApplyBtn,
                      isCurrent && styles.cardApplyBtnCurrent,
                    ]}>
                    {isCurrent ? (
                      <View style={styles.appliedRow}>
                        <Icon name="checkmark-circle" size={11.5} color="#FFFFFF" />
                        <Text style={styles.cardApplyBtnTextCurrent}>APPLIED</Text>
                      </View>
                    ) : (
                      <Text style={styles.cardApplyBtnText}>APPLY</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.offerTitle}>{coupon.title}</Text>
                <Text style={styles.offerSubtitle}>{coupon.subtitle}</Text>

                {savingsPreview > 0 && (
                  <Text
                    style={[
                      styles.savingsText,
                      isCurrent && styles.savingsTextCurrent,
                    ]}>
                    Save {formatPrice(savingsPreview)} on this order
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#ECE5DA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13.5,
    color: '#161413',
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  applyBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: '#6E665A',
    letterSpacing: 0.8,
  },
  scrollList: {
    maxHeight: 340,
  },
  scrollListMulti: {
    height: 330,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE5D8',
    borderLeftWidth: 3.5,
    borderLeftColor: colours.saffron || '#BF5B21',
    borderRadius: 12,
    padding: 11,
    marginBottom: 9,
    shadowColor: '#161413',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  offerCardCurrent: {
    backgroundColor: '#FFFDF9',
    borderColor: colours.saffron || '#BF5B21',
    borderLeftColor: '#27AE60',
  },
  offerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerBadge: {
    backgroundColor: '#FFF8F2',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: '#F0C9AA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerBadgeCurrent: {
    backgroundColor: '#FFF2E6',
    borderColor: colours.saffron || '#BF5B21',
  },
  offerBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: '#8A3E14',
    letterSpacing: 0.8,
  },
  offerBadgeTextCurrent: {
    color: colours.saffron || '#BF5B21',
  },
  cardApplyBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    paddingHorizontal: 14,
    paddingVertical: 5.5,
    borderRadius: 16,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  cardApplyBtnCurrent: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
    shadowColor: '#27AE60',
  },
  cardApplyBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardApplyBtnTextCurrent: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  offerTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#181512',
    marginTop: 5,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  offerSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#655E53',
    lineHeight: 15.5,
  },
  savingsText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: '#27AE60',
    marginTop: 5,
  },
  savingsTextCurrent: {
    color: colours.saffron || '#BF5B21',
  },
});

export default CouponBottomSheet;
