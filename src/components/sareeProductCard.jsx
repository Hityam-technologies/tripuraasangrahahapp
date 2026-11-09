import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import colours from '../assets/colours';

/**
 * TryOnSparkleIcon
 * Refined camera viewfinder brackets with centered sparkle star.
 */
function TryOnSparkleIcon({ size = 11, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M 3 6.5 V 4.5 C 3 3.7 3.7 3 4.5 3 H 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 13.5 3 H 15.5 C 16.3 3 17 3.7 17 4.5 V 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 3 13.5 V 15.5 C 3 16.3 3.7 17 4.5 17 H 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 13.5 17 H 15.5 C 16.3 17 17 16.3 17 15.5 V 13.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 10 5.5 C 10 7.8 11.8 10 14.5 10 C 11.8 10 10 12.2 10 14.5 C 10 12.2 8.2 10 5.5 10 C 8.2 10 10 7.8 10 5.5 Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * AnimatedTryOnButton
 *
 * Compact & Animated Luxury AI Action Button:
 * 1. Gentle ambient breathing pulse (scale 1.0 -> 1.035)
 * 2. Twinkling / rotating AI sparkle camera icon
 * 3. Shimmer sheen light reflection sweep
 * 4. Crisp tactile spring bounce on press
 */
function AnimatedTryOnButton({ onPress, isCompact }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const sheenAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Gentle breathing pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Sparkle icon twinkle & rotation loop
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Shimmer sheen light sweep loop
    const sheenLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheenAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    sparkleLoop.start();
    sheenLoop.start();

    return () => {
      pulseLoop.stop();
      sparkleLoop.stop();
      sheenLoop.stop();
    };
  }, [pulseAnim, sparkleAnim, sheenAnim]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.92,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 26,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  const combinedScale = Animated.multiply(pressScale, pulseScale);

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.92, 1.2, 0.92],
  });

  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-8deg', '12deg', '-8deg'],
  });

  const sheenTranslateX = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 90],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: combinedScale }],
        shadowColor: colours.saffron || '#BF5B21',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.28,
        shadowRadius: 5,
        elevation: 3,
      }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colours.saffron || '#BF5B21',
          paddingHorizontal: isCompact ? 8 : 11,
          paddingVertical: isCompact ? 4.5 : 6,
          borderRadius: 13,
          overflow: 'hidden',
          position: 'relative',
        }}>
        {/* Shimmer Sheen Reflection Sweep */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -10,
            bottom: -10,
            width: 18,
            transform: [
              { translateX: sheenTranslateX },
              { rotate: '22deg' },
            ],
          }}>
          <Svg width="18" height="50">
            <Defs>
              <LinearGradient id="tryOnSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect width="18" height="50" fill="url(#tryOnSheen)" />
          </Svg>
        </Animated.View>

        {/* Animated Twinkling Sparkle Camera Icon */}
        <Animated.View
          style={{
            transform: [
              { scale: sparkleScale },
              { rotate: sparkleRotate },
            ],
          }}>
          <TryOnSparkleIcon size={isCompact ? 10 : 11.5} color="#FFFFFF" />
        </Animated.View>

        {/* Try On Label in Manrope-Bold */}
        <Text
          style={{
            fontFamily: 'Manrope-Bold',
            fontSize: isCompact ? 10 : 11.5,
            color: '#FFFFFF',
            marginLeft: 4.5,
            letterSpacing: 0.2,
          }}>
          Try On
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * SareeProductCard
 *
 * Compact Haute-Couture Saree Exhibition Card:
 * 1. Clean, seamless white canvas matching the screen palette (no heavy double-box framing).
 * 2. Top-bleed landscape image with concentric rounded top corners.
 * 3. Multi-image horizontal swipe gallery for all saree photos.
 * 4. Saree title in Comfortaa-Bold.
 * 5. Provenance details (fabric & zari) in Comfortaa-Medium.
 * 6. Price number in Manrope-Bold.
 * 7. Animated "Try On" CTA in Royal Saffron with sparkle icon and Manrope-Bold text.
 * 8. Optimized for 2-column grid on phones and multi-column on tablets.
 */
function SareeProductCard({
  product,
  cardWidth,
  isWishlisted = false,
  onPress,
  onTryOn,
  onToggleWishlist,
  onRemoveFromWishlist,
  showRemoveButton = false,
  style,
}) {
  if (!product) return null;

  const imageList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageWidth, setImageWidth] = useState(cardWidth || 0);
  const scrollRef = useRef(null);

  // Compact layout detection for 2-column grid mode (cards < 240px)
  const isCompact = typeof cardWidth === 'number' && cardWidth < 240;

  // Real-world production view-switch synchronizer:
  // Instantly resets scroll offset to slide 0 when cardWidth / view mode changes,
  // preventing images from getting stuck in between slides.
  useEffect(() => {
    if (cardWidth && Math.abs(cardWidth - imageWidth) > 1) {
      setImageWidth(cardWidth);
    }
    setActiveImageIndex(0);
    scrollRef.current?.scrollTo?.({ x: 0, animated: false });
  }, [cardWidth]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const targetWidth = imageWidth || cardWidth || 0;
    if (targetWidth > 0) {
      const index = Math.round(offsetX / targetWidth);
      if (index !== activeImageIndex && index >= 0 && index < imageList.length) {
        setActiveImageIndex(index);
      }
    }
  };

  return (
    <View
      style={[
        {
          width: cardWidth || '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#F0ECE4',
          overflow: 'hidden',
          marginBottom: isCompact ? 12 : 14,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}>
      {/* =========================================================================
          1. TOP-BLEED HORIZONTAL SAREE PHOTO GALLERY
         ========================================================================= */}
      <View
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w > 0 && Math.abs(w - imageWidth) > 1) {
            setImageWidth(w);
          }
        }}
        style={{
          width: '100%',
          aspectRatio: isCompact ? 16 / 11.5 : 16 / 7.5,
          backgroundColor: '#F8F6F2',
          position: 'relative',
        }}>
        {imageList.length > 1 ? (
          /* Multi-image horizontal swipe gallery with key-bound view switch */
          <ScrollView
            key={`gallery-${product.id}-${isCompact ? 'grid' : 'wide'}`}
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            contentOffset={{ x: 0, y: 0 }}
            style={{ width: '100%', height: '100%' }}>
            {imageList.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.96}
                onPress={() => onPress?.(product)}
                style={{
                  width: imageWidth || cardWidth || '100%',
                  height: '100%',
                }}>
                <Image
                  source={img}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          /* Single image view */
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={() => onPress?.(product)}
            style={StyleSheet.absoluteFillObject}>
            <Image
              source={imageList[0] || product.image}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Floating Image Counter Badge (when multiple photos exist) */}
        {imageList.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              backgroundColor: 'rgba(20, 18, 24, 0.62)',
              paddingHorizontal: 5.5,
              paddingVertical: 2,
              borderRadius: 6,
            }}>
            <Text
              style={{
                fontFamily: 'Comfortaa-Bold',
                fontSize: isCompact ? 8 : 9,
                color: '#FFFFFF',
                letterSpacing: 0.2,
              }}>
              {activeImageIndex + 1} / {imageList.length}
            </Text>
          </View>
        )}

        {/* Floating Pagination Indicators */}
        {imageList.length > 1 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 6,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
            }}>
            {imageList.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: activeImageIndex === idx ? (isCompact ? 10 : 12) : 3,
                  height: 2.5,
                  borderRadius: 1.5,
                  backgroundColor:
                    activeImageIndex === idx
                      ? colours.saffron || '#BF5B21'
                      : 'rgba(255, 255, 255, 0.65)',
                }}
              />
            ))}
          </View>
        )}

        {/* Floating Wishlist Heart Badge on the Upper-Right (hidden when showRemoveButton is true on Saved Sarees card) */}
        {!showRemoveButton && (
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => onToggleWishlist?.(product.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: isCompact ? 26 : 28,
              height: isCompact ? 26 : 28,
              borderRadius: isCompact ? 13 : 14,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2.5,
              elevation: 2,
            }}>
            <Icon
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={isCompact ? 13 : 14.5}
              color={
                isWishlisted
                  ? colours.saffron || '#BF5B21'
                  : '#1A1715'
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {/* =========================================================================
          2. COMPACT CONTENT SECTION (Title, Provenance, Price & Try On)
         ========================================================================= */}
      <View
        style={{
          paddingHorizontal: isCompact ? 8 : 10,
          paddingTop: isCompact ? 6 : 8,
          paddingBottom: isCompact ? 8 : 10,
        }}>
        {/* Full Saree Title - Comfortaa-Bold */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPress?.(product)}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'Comfortaa-Bold',
              fontSize: isCompact ? 12 : 14,
              color: '#161413',
              letterSpacing: -0.2,
              lineHeight: isCompact ? 16 : 18.5,
              minHeight: isCompact ? 32 : 19,
            }}>
            {product.title}
          </Text>
        </TouchableOpacity>

        {/* Fabric & Zari Provenance - Comfortaa-Medium */}
        {(product.fabric || product.zari || product.weave) && (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Comfortaa-Medium',
              fontSize: isCompact ? 9.5 : 10.5,
              color: '#7C756B',
              marginTop: 2,
              marginBottom: isCompact ? 6 : 7,
              letterSpacing: 0.1,
            }}>
            {[product.fabric || product.weave, product.zari]
              .filter(Boolean)
              .join('  •  ')}
          </Text>
        )}

        {/* Action Bar: Quiet Luxury Price & Saffron "Try On" Pill */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: product.fabric || product.zari ? 0 : 4,
          }}>
          {/* Price Number - Manrope-Bold */}
          <Text
            style={{
              fontFamily: 'Manrope-Bold',
              fontSize: isCompact ? 14 : 16.5,
              color: '#161413',
              letterSpacing: -0.3,
            }}>
            {product.price}
          </Text>

          {/* Animated Saffron "Try On" CTA Pill */}
          <AnimatedTryOnButton
            isCompact={isCompact}
            onPress={() => onTryOn?.(product)}
          />
        </View>

        {/* Dedicated "Remove from Wishlist" Action */}
        {showRemoveButton && onRemoveFromWishlist && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onRemoveFromWishlist(product.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: isCompact ? 5.5 : 7,
              marginTop: isCompact ? 8 : 10,
              borderTopWidth: 1,
              borderTopColor: '#F5EFEB',
              backgroundColor: '#FAFAF8',
              borderRadius: 8,
              gap: 5,
            }}>
            <Icon
              name="trash-outline"
              size={isCompact ? 12 : 13.5}
              color="#8A8277"
            />
            <Text
              style={{
                fontFamily: 'Comfortaa-SemiBold',
                fontSize: isCompact ? 10 : 11.5,
                color: '#6E675D',
              }}>
              Remove from Wishlist
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const ProductCard = React.memo(SareeProductCard);
export default React.memo(SareeProductCard);
