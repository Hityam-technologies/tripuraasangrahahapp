import React, { useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';

const ALL_CATEGORY = [{ id: 'all', label: 'All', image: null, icon: 'grid-outline' }];

const CATEGORY_ICON_MAP = {
  all: 'grid-outline',
  saree: 'ribbon-outline',
  sarees: 'ribbon-outline',
  kanchipuram: 'ribbon-outline',
  banarasi: 'flower-outline',
  bridal: 'diamond-outline',
  wedding: 'diamond-outline',
  handloom: 'shirt-outline',
  silk: 'ribbon-outline',
  chanderi: 'flower-outline',
};

function resolveCategoryIcon(tab) {
  if (tab?.icon) return tab.icon;
  const key = (tab?.id || tab?.label || '').toLowerCase().trim();
  if (key === 'all') return 'grid-outline';
  if (CATEGORY_ICON_MAP[key]) return CATEGORY_ICON_MAP[key];
  for (const [k, v] of Object.entries(CATEGORY_ICON_MAP)) {
    if (key.includes(k)) return v;
  }
  return 'grid-outline';
}

/**
 * CategoryStoryBar
 * Reusable luxury horizontal story strip with prominent 70px circular sample dress avatars
 * and strictly single-word single-line Comfortaa labels.
 *
 * @param {string} activeCategory - Currently active category id
 * @param {function} onSelectCategory - Callback when a category is pressed: (id) => void
 * @param {Array} categories - Category list from the catalog API (includes All)
 * @param {object} style - Optional style on the outer ScrollView / container
 * @param {object} contentContainerStyle - Optional style for inner scroll container
 */
export function CategoryStoryBar({
  activeCategory = 'all',
  onSelectCategory,
  categories = ALL_CATEGORY,
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
                  backgroundColor: tab.image
                    ? '#F3EFE8'
                    : isActive
                    ? '#FFF5EB'
                    : '#FAF7F2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {tab.image ? (
                  <Image
                    source={tab.image}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon
                    name={resolveCategoryIcon(tab)}
                    size={isSmallDevice ? 24 : 27}
                    color={
                      isActive
                        ? colours.saffron || '#BF5B21'
                        : '#5C554B'
                    }
                  />
                )}
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

