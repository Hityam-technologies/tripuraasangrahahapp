import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import { useCart } from '../context/cartContext';

/**
 * CartHeaderButton Component
 *
 * Symmetrically balanced with BackButton in ScreenHeader:
 * - Rounded luxury ivory/white button with delicate border and soft shadow
 * - Bag/Cart icon in rich charcoal
 * - High-contrast Saffron pill badge with live item count
 */
function CartHeaderButton({ onPress, style }) {
  const navigation = useNavigation();
  const { cartCount } = useCart();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const buttonSize = isSmallDevice ? 40 : 44;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation?.navigate?.('Cart');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Shopping cart, ${cartCount} items`}
      style={[
        styles.button,
        isSmallDevice ? styles.smallButton : styles.largeButton,
        style,
      ]}>
      <Icon
        name="bag-handle-outline"
        size={isSmallDevice ? 19 : 21}
        color={colours.textPrimary || '#161413'}
      />

      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE7DE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  largeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    lineHeight: 12,
    textAlign: 'center',
  },
});

export default React.memo(CartHeaderButton);
