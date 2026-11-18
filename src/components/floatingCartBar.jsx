import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import { useCart } from '../context/cartContext';

/**
 * FloatingCartBar
 * A luxury floating rounded pill button that appears above the bottom tab bar
 * whenever there are items in the user's cart, inviting them to checkout.
 * Includes a dismiss 'X' button on the right to close it.
 */
export function FloatingCartBar({ navigation }) {
  const { cartCount, totalAmount, subtotal } = useCart();
  const [dismissed, setDismissed] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Re-open if cart count changes (e.g. user adds another item)
  useEffect(() => {
    setDismissed(false);
  }, [cartCount]);

  useEffect(() => {
    if (cartCount > 0 && !dismissed) {
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [cartCount, dismissed, anim]);

  if (!cartCount || cartCount <= 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
    });
  };

  const amount = totalAmount || subtotal || 0;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.pillContainer}>
        {/* Main Pressable Area to Navigate to Cart */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation?.navigate?.('Cart')}
          style={styles.mainTouchable}
          accessibilityRole="button"
          accessibilityLabel="View Cart and Checkout">
          {/* Left: Bag Icon & Item Count / Total */}
          <View style={styles.leftSection}>
            <View style={styles.iconCircle}>
              <Icon name="bag-handle" size={17} color="#FFFFFF" />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemCountText} numberOfLines={1}>
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Bag
              </Text>
              <Text style={styles.priceText} numberOfLines={1}>
                ₹{Number(amount).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Right: Checkout CTA Capsule */}
          <View style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>Checkout</Text>
            <Icon name="arrow-forward" size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Standalone White X Close Button (No round background container) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 14, bottom: 14, left: 8, right: 14 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss cart notification">
          <Icon name="close" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '92%',
    maxWidth: 420,
    marginBottom: 8,
    alignSelf: 'center',
    zIndex: 1000,
  },
  pillContainer: {
    backgroundColor: '#181512',
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#2D2721',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
  mainTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCountText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  priceText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#E8DED1',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  checkoutBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
  },
  checkoutText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  closeBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(FloatingCartBar);
