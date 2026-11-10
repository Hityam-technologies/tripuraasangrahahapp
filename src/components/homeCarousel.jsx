import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round((SCREEN_WIDTH || 390) * 0.85);
const CARD_HEIGHT = 195;

export const HOME_OFFERS = [];

function HomeCarousel({ onBannerPress, banners = HOME_OFFERS }) {
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;
  const cardWidth = Math.round(screenWidth * 0.85);
  const cardSpacing = 12;
  const snapInterval = cardWidth + cardSpacing;
  const cardHeight = 195;

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  const isInteractingRef = useRef(false);

  // Exact snap offsets array for pixel-perfect snapping without layout jumps
  const snapOffsets = useMemo(
    () => banners.map((_, index) => index * snapInterval),
    [banners, snapInterval]
  );

  // Track active index smoothly for auto-advance
  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const idx = Math.round(value / snapInterval);
      if (idx >= 0 && idx < banners.length) {
        currentIndexRef.current = idx;
      }
    });

    return () => scrollX.removeListener(listenerId);
  }, [banners.length, scrollX, snapInterval]);

  // Smooth auto-scroll every 4.5 seconds (pauses gracefully when user drags)
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      const nextIndex = (currentIndexRef.current + 1) % banners.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * snapInterval,
        animated: true,
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length, snapInterval]);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: snapInterval,
      offset: snapInterval * index,
      index,
    }),
    [snapInterval]
  );

  const handleDotPress = useCallback((targetIndex) => {
    flatListRef.current?.scrollToOffset({
      offset: targetIndex * snapInterval,
      animated: true,
    });
  }, [snapInterval]);

  const renderBannerItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.92}
        onPress={() => onBannerPress?.(item)}
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: item.bgStart,
            marginRight: cardSpacing,
          },
        ]}>
        {/* Background Gradient */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient
                id={`bgGrad_${item.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%">
                <Stop offset="0%" stopColor={item.bgStart} />
                <Stop offset="100%" stopColor={item.bgEnd} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#bgGrad_${item.id})`} />
          </Svg>
        </View>

        {/* Right-Side Featured Image */}
        {item.imageType === 'cutout' ? (
          <Image
            source={item.image}
            style={styles.cutoutImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.coverImageContainer}>
            <Image source={item.image} style={styles.coverImage} resizeMode="cover" />
            <Svg style={StyleSheet.absoluteFillObject} preserveAspectRatio="none">
              <Defs>
                <LinearGradient
                  id={`fadeGrad_${item.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%">
                  <Stop offset="0%" stopColor={item.bgStart} stopOpacity="1" />
                  <Stop offset="36%" stopColor={item.bgStart} stopOpacity="0.88" />
                  <Stop offset="76%" stopColor={item.bgStart} stopOpacity="0.16" />
                  <Stop offset="100%" stopColor={item.bgStart} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#fadeGrad_${item.id})`} />
            </Svg>
          </View>
        )}

        {/* Left-Side Offer Content */}
        <View style={[styles.contentContainer, { paddingRight: Math.round(cardWidth * 0.44) }]}>
          {/* 1. Festive Tag Badge */}
          <View
            style={[
              styles.badgeWrapper,
              { backgroundColor: item.badgeBg, borderColor: item.badgeColor },
            ]}>
            <Text style={[styles.badgeText, { color: item.badgeColor }]}>
              {item.badge}
            </Text>
          </View>

          {/* 2. Big Offer Row */}
          <View style={styles.offerRow}>
            <Text style={[styles.prefixText, { color: item.accentColor }]}>
              {item.headlinePrefix}
            </Text>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>

          {/* 3. Title Description */}
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>

          {/* 4. Dashed Voucher Coupon Code Pill */}
          <View
            style={[
              styles.codeBadge,
              { borderColor: item.accentColor },
            ]}>
            <Icon
              name="ticket-outline"
              size={12}
              color={item.accentColor}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.codeLabel}>CODE: </Text>
            <Text style={[styles.codeValue, { color: item.accentColor }]}>
              {item.couponCode}
            </Text>
          </View>

          {/* 5. Clean Floating CTA Button */}
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>{item.ctaText}</Text>
            <Icon
              name="arrow-forward"
              size={12}
              color="#14121E"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    ),
    [cardWidth, cardSpacing, cardHeight, onBannerPress]
  );

  return (
    <View style={styles.carouselWrapper}>
      {/* 60fps Butter-Smooth Animated FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id}
        renderItem={renderBannerItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onScrollBeginDrag={() => {
          isInteractingRef.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isInteractingRef.current = false;
          }, 2500);
        }}
        contentContainerStyle={styles.listContentContainer}
      />

      {/* Butter-Smooth Liquid Morphing Pagination Dots */}
      <View style={styles.paginationRow}>
        {banners.map((item, index) => {
          const inputRange = [
            (index - 1) * snapInterval,
            index * snapInterval,
            (index + 1) * snapInterval,
          ];

          // Smooth continuous width expansion / contraction tied directly to finger scroll
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 22, 6],
            extrapolate: 'clamp',
          });

          // Smooth color transition between active maroon and inactive muted gray
          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#D1CCC2', '#6B1728', '#D1CCC2'],
            extrapolate: 'clamp',
          });

          // Subtle opacity shift
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={`dot_${item.id}`}
              activeOpacity={0.8}
              onPress={() => handleDotPress(index)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
              <Animated.View
                style={[
                  styles.dotBase,
                  {
                    width: dotWidth,
                    backgroundColor: dotColor,
                    opacity: dotOpacity,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    marginHorizontal: -20,
    marginBottom: 18,
  },
  listContentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 18,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: 'Comfortaa-Bold',
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 1,
  },
  prefixText: {
    fontSize: 13,
    fontFamily: 'Comfortaa-Bold',
    fontWeight: '700',
    marginRight: 6,
    letterSpacing: 0.6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontFamily: 'Comfortaa-Bold',
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  titleText: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 11.5,
    fontFamily: 'Manrope-Medium',
    marginTop: 1,
    marginBottom: 3,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  codeLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 10,
    fontFamily: 'Manrope-Medium',
  },
  codeValue: {
    fontSize: 11,
    fontFamily: 'Comfortaa-Bold',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  ctaText: {
    color: '#14121E',
    fontSize: 11.5,
    fontFamily: 'Comfortaa-Bold',
    fontWeight: '700',
  },
  cutoutImage: {
    position: 'absolute',
    right: -8,
    bottom: -6,
    width: Math.round(CARD_WIDTH * 0.46),
    height: CARD_HEIGHT + 14,
    zIndex: 5,
  },
  coverImageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Math.round(CARD_WIDTH * 0.48),
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  dotBase: {
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 3,
  },
});

export default React.memo(HomeCarousel);
