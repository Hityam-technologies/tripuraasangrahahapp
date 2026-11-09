import React, { useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import colours from '../assets/colours';
import { APP_CATEGORIES } from '../data';

export { APP_CATEGORIES };

/**
 * CategoryStoryBar
 * Reusable luxury horizontal story strip with prominent 70px circular sample dress avatars
 * and strictly single-word single-line Comfortaa labels.
 *
 * @param {string} activeCategory - Currently active category id
 * @param {function} onSelectCategory - Callback when a category is pressed: (id) => void
 * @param {Array} categories - Optional custom categories list, defaults to APP_CATEGORIES
 * @param {object} style - Optional style on the outer ScrollView / container
 * @param {object} contentContainerStyle - Optional style for inner scroll container
 */
export function CategoryStoryBar({
  activeCategory = 'all',
  onSelectCategory,
  categories = APP_CATEGORIES,
  style,
  contentContainerStyle,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;

  const circleSize = isSmallDevice ? 62 : 70;
  const itemWidth = isSmallDevice ? 84 : 94;
  const gap = isSmallDevice ? 8 : 12;
  const defaultHPadding = isSmallDevice ? 12 : isTablet ? 20 : 15;
  const hPad =
    contentContainerStyle &&
    typeof contentContainerStyle === 'object' &&
    'paddingHorizontal' in contentContainerStyle
      ? contentContainerStyle.paddingHorizontal
      : defaultHPadding;

  const scrollRef = useRef(null);

  // Auto-scroll the horizontal category bar so the active category is visible and centered
  useEffect(() => {
    const activeIndex = categories.findIndex((c) => c.id === activeCategory);
    if (activeIndex >= 0 && scrollRef.current) {
      const itemSpan = itemWidth + gap;
      const targetCenter = hPad + activeIndex * itemSpan + itemWidth / 2;
      const scrollX = Math.max(0, targetCenter - screenWidth / 2);

      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo?.({
          x: scrollX,
          animated: true,
        });
      }, 140);

      return () => clearTimeout(timer);
    }
  }, [activeCategory, categories, itemWidth, gap, hPad, screenWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      style={style}
      contentContainerStyle={[
        {
          paddingHorizontal: defaultHPadding,
          gap: gap,
        },
        contentContainerStyle,
      ]}>
      {categories.map((tab) => {
        const isActive = activeCategory === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onSelectCategory?.(tab.id)}
            style={{
              alignItems: 'center',
              width: itemWidth,
            }}>
            {/* Big Rounded Circular Sample Dress Image */}
            <View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                padding: 3,
                borderWidth: isActive ? 2.8 : 1.8,
                borderColor: isActive
                  ? colours.saffron || '#BF5B21'
                  : '#E8E4DC',
                backgroundColor: '#FFFFFF',
                shadowColor: isActive ? (colours.saffron || '#BF5B21') : '#000000',
                shadowOffset: { width: 0, height: isActive ? 3 : 1 },
                shadowOpacity: isActive ? 0.32 : 0.06,
                shadowRadius: isActive ? 7 : 3,
                elevation: isActive ? 4 : 1,
                marginBottom: 7.5,
              }}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: circleSize / 2,
                  overflow: 'hidden',
                  backgroundColor: '#F3EFE8',
                }}>
                <Image
                  source={tab.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Category Label: Strictly One Word on One Single Line */}
            <Text
              numberOfLines={1}
              ellipsizeMode="clip"
              style={{
                fontFamily: isActive
                  ? 'Comfortaa-Bold'
                  : 'Comfortaa-Medium',
                fontSize: isSmallDevice ? 11.5 : 12.5,
                color: isActive
                  ? colours.saffron || '#BF5B21'
                  : '#5E574E',
                textAlign: 'center',
                letterSpacing: -0.2,
              }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(CategoryStoryBar);

