import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * LuxeProductCard
 * Elegant luxury product card implemented with Tailwind CSS:
 * - Pastel tinted rounded canvas (30px radius)
 * - Top-left circular wishlist heart badge
 * - Right-aligned fashion model cutout / product visual
 * - Bottom-left brand, title, and price hierarchy
 */
function LuxeProductCard({
  item,
  isWishlisted = false,
  onToggleWishlist,
  onPress,
  className = '',
  style,
}) {
  if (!item) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`w-full h-[220px] rounded-[30px] mb-4 overflow-hidden relative ${className}`}
      style={[
        {
          backgroundColor: item.bgColor || '#FCE7F0',
          elevation: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        style,
      ]}>
      {/* Top-Left Circular Heart Wishlist Badge */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggleWishlist?.(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-white items-center justify-center"
        style={{
          elevation: 3,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}>
        <Icon
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={20}
          color={isWishlisted ? item.heartColor || '#FF5C8A' : '#14121E'}
        />
      </TouchableOpacity>

      {/* Right-Side Model / Garment Image */}
      <View
        className="absolute right-0 top-0 bottom-0 w-[54%] items-center justify-end overflow-hidden"
        pointerEvents="none">
        <Image
          source={item.image}
          className={
            item.isCutout
              ? 'w-full h-[110%] absolute right-[2px] -bottom-[6px]'
              : 'w-full h-full rounded-r-[30px]'
          }
          resizeMode={item.isCutout ? 'contain' : 'cover'}
        />
      </View>

      {/* Bottom-Left Details: Brand, Title, Price */}
      <View className="absolute bottom-[18px] left-[18px] w-[46%] z-[5]" pointerEvents="none">
        <Text
          numberOfLines={1}
          className="font-manrope-semibold text-[15px] leading-5 text-[#14121E]"
          style={{
            fontFamily: 'Manrope-SemiBold',
            fontSize: 15,
            lineHeight: 20,
            color: '#14121E',
          }}>
          {item.brand}
        </Text>
        <Text
          numberOfLines={2}
          className="font-manrope-bold text-lg leading-[23px] text-[#14121E] mt-0.5 mb-2"
          style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 18,
            lineHeight: 23,
            color: '#14121E',
          }}>
          {item.title}
        </Text>
        <Text
          className="font-manrope-extrabold text-xl text-[#14121E]"
          style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 20,
            color: '#14121E',
          }}>
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(LuxeProductCard);
