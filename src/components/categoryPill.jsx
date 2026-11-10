import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';

/**
 * Relevant icon fallback mapping for traditional luxury attire categories.
 */
const RELEVANT_ICON_MAP = {
  all: 'grid-outline',
  everything: 'grid-outline',
  featured: 'sparkles',
  'new in': 'sparkles',
  sarees: 'ribbon',
  saree: 'ribbon',
  'pattu sarees': 'ribbon',
  pattu: 'ribbon',
  kanchipuram: 'ribbon',
  silk: 'ribbon',
  kurtas: 'shirt',
  kurta: 'shirt',
  'royal kurtas': 'shirt',
  men: 'shirt',
  sherwani: 'shirt',
  lehengas: 'diamond',
  lehenga: 'diamond',
  bridal: 'diamond',
  couture: 'diamond',
  banarasi: 'flower',
  brocade: 'flower',
  chanderi: 'flower',
  anarkali: 'woman',
  gowns: 'woman',
  dresses: 'woman',
  jewelry: 'sparkle',
  accessories: 'sparkle',
  dupattas: 'layers',
};

function resolveCategoryIcon(item, explicitIcon) {
  if (explicitIcon) return explicitIcon;
  if (item?.icon) return item.icon;

  const idKey = (item?.id || '').toLowerCase().trim();
  if (RELEVANT_ICON_MAP[idKey]) return RELEVANT_ICON_MAP[idKey];

  const labelKey = (item?.label || item?.name || item?.title || '').toLowerCase().trim();
  if (RELEVANT_ICON_MAP[labelKey]) return RELEVANT_ICON_MAP[labelKey];

  for (const [key, iconName] of Object.entries(RELEVANT_ICON_MAP)) {
    if (labelKey.includes(key) || idKey.includes(key)) {
      return iconName;
    }
  }

  return 'sparkles';
}

/**
 * CategoryPill (Option 1: Royal Zari Glow Ring & Tactile Spring Pop)
 *
 * Implements:
 * - Pure white background (#FFFFFF) matching image background seamlessly
 * - Crisp outer ring with gold / maroon active border
 * - Breathing pulsing glow aura around the active pill
 * - Tactile spring micro-bounce on tap for immediate luxury feedback
 * - Centered label text directly below with subtle active indicator dot
 */
function CategoryPill({
  item,
  id: propId,
  label: propLabel,
  icon: propIcon,
  image: propImage,
  isActive = false,
  activeColor = colours.maroon || '#6B1728',
  onPress,
  className = '',
  style,
}) {
  const categoryId = propId || item?.id;
  const categoryLabel = propLabel || item?.label || item?.name || item?.title || '';
  const categoryIcon = resolveCategoryIcon(item, propIcon);
  const categoryImage = propImage || item?.image;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const auraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // 1. Tactile spring bounce on selection
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.94,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Continuous breathing Zari aura pulse loop
      const breathing = Animated.loop(
        Animated.sequence([
          Animated.timing(auraAnim, {
            toValue: 1,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(auraAnim, {
            toValue: 0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ]),
      );
      breathing.start();

      return () => breathing.stop();
    } else {
      scaleAnim.setValue(1);
      auraAnim.setValue(0);
    }
  }, [isActive, scaleAnim, auraAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(categoryId, item);
    }
  };

  const ringBorderColor = isActive
    ? (activeColor || '#6B1728')
    : 'rgba(20, 18, 30, 0.3)';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Category ${categoryLabel}`}
      className={`items-center mr-4 ${className}`}
      style={style}>
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="items-center">
        {/* Relative container for the ring and outer pulsing aura */}
        <View className="relative items-center justify-center">
          {/* Animated Zari Glow Aura Ring (visible when active) */}
          {isActive && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -3.5,
                left: -3.5,
                right: -3.5,
                bottom: -3.5,
                borderRadius: 38,
                borderWidth: 1.8,
                borderColor: activeColor || '#6B1728',
                opacity: auraAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.22, 0.8],
                }),
                transform: [
                  {
                    scale: auraAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.0, 1.07],
                    }),
                  },
                ],
              }}
            />
          )}

          {/* Main Circle: Pure white background with crisp border ring */}
          <View
            className="w-[68px] h-[68px] rounded-full bg-white items-center justify-center overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: isActive ? 2.5 : 1.2,
              borderColor: ringBorderColor,
              elevation: isActive ? 3.5 : 1.5,
              shadowColor: isActive ? (activeColor || '#6B1728') : '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isActive ? 0.3 : 0.06,
              shadowRadius: isActive ? 6 : 4,
            }}>
            {categoryImage ? (
              <Image
                source={categoryImage}
                className="w-[84%] h-[84%]"
                resizeMode="contain"
              />
            ) : (
              <Icon
                name={categoryIcon}
                size={28}
                color={isActive ? (activeColor || '#6B1728') : '#14121E'}
              />
            )}
          </View>
        </View>

        {/* Category Text Label directly below the circle */}
        <Text
          numberOfLines={1}
          className={`text-[13px] text-center mt-2 ${
            isActive
              ? 'font-manrope-extrabold text-[#14121E]'
              : 'font-manrope-bold text-[#615C6B]'
          }`}
          style={{
            fontFamily: isActive ? 'Manrope-ExtraBold' : 'Manrope-Bold',
            fontSize: 13,
            color: isActive ? '#14121E' : '#615C6B',
          }}>
          {categoryLabel}
        </Text>

        {/* Subtle Luxury Active Dot Indicator */}
        {isActive && (
          <View
            className="w-1.5 h-1.5 rounded-full mt-1 self-center"
            style={{ backgroundColor: activeColor || '#6B1728' }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export const CategoryButton = CategoryPill;
export default React.memo(CategoryPill);
