import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import colours from '../../assets/colours';
import { dash } from '../../lib/text';
import TryOnConfirmModal from '../../components/tryOnConfirmModal';
import { ButtonSpinner, SectionLoader } from '../../components/loadingSpinner';
import { useWishlist } from '../../context/wishlistContext';
import { useCart } from '../../context/cartContext';
import { useCatalog } from '../../context/catalogContext';
import { apiCall } from '../../api/client';
import { presentSaree } from '../../api/media';

/**
 * TryOnSparkleIcon Component
 */
function TryOnSparkleIcon({ size = 16, color = '#FFFFFF' }) {
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

function formatPrice(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'number') {
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const s = String(val).trim();
  if (s.startsWith('₹') || s.startsWith('Rs')) return s;
  const num = Number(s.replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(num) && num > 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return s ? `₹${s}` : '';
}

/**
 * ZoomableImage Component
 *
 * Real-world 2-finger pinch-to-zoom image viewer:
 * - Capture phase handlers guarantee native Android ScrollView doesn't steal 2-finger pinch
 * - Dynamic touch baseline captures distance regardless of which millisecond fingers land
 * - Scales smoothly between 1.0x and 4.0x
 * - 1-finger pan allowed when zoomed in to explore fine weave and zari
 * - Tap to reset when zoomed in; pinch back to 1.0x smoothly resets
 * - When at 1.0x, 1-finger horizontal swipes pass 100% to ScrollView to change photos
 * - 60fps hardware accelerated with Animated native driver
 */
function ZoomableImage({ source, width, height, isActive, onZoomChange }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const currentScale = useRef(1);
  const currentPan = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const startPinchDist = useRef(0);
  const pinchStartScale = useRef(1);
  const pinchStartCenter = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive) {
      resetZoom(false);
    }
  }, [isActive]);

  const resetZoom = (animated = true) => {
    currentScale.current = 1;
    currentPan.current = { x: 0, y: 0 };
    isPinching.current = false;
    startPinchDist.current = 0;
    onZoomChange?.(1);

    if (animated) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(1);
      pan.setValue({ x: 0, y: 0 });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: (evt) => {
        // Capture touch if 2 fingers or already zoomed
        return evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.05;
      },
      onMoveShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.05;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        // Disallow native ScrollView from stealing touch moves when pinching or zoomed!
        return evt.nativeEvent.touches.length >= 2 || currentScale.current > 1.05;
      },
      onPanResponderGrant: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinching.current = true;
          startPinchDist.current = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY,
          );
          pinchStartScale.current = currentScale.current;
          pinchStartCenter.current = {
            x: (touches[0].pageX + touches[1].pageX) / 2,
            y: (touches[0].pageY + touches[1].pageY) / 2,
          };
        } else if (touches && touches.length === 1 && currentScale.current > 1.05) {
          panStart.current = {
            x: currentPan.current.x - gestureState.dx,
            y: currentPan.current.y - gestureState.dy,
          };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        // 1. PINCH ZOOM WITH 2 FINGERS
        if (touches && touches.length >= 2) {
          const currentDist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY,
          );

          if (!isPinching.current || startPinchDist.current === 0) {
            isPinching.current = true;
            startPinchDist.current = currentDist;
            pinchStartScale.current = currentScale.current;
            pinchStartCenter.current = {
              x: (touches[0].pageX + touches[1].pageX) / 2,
              y: (touches[0].pageY + touches[1].pageY) / 2,
            };
            return;
          }

          if (startPinchDist.current > 0) {
            const factor = currentDist / startPinchDist.current;
            const newScale = Math.min(Math.max(pinchStartScale.current * factor, 1), 4.0);
            currentScale.current = newScale;
            scale.setValue(newScale);
            onZoomChange?.(newScale);

            const currentCenterX = (touches[0].pageX + touches[1].pageX) / 2;
            const currentCenterY = (touches[0].pageY + touches[1].pageY) / 2;
            const nextPanX = (currentCenterX - pinchStartCenter.current.x) * 0.7;
            const nextPanY = (currentCenterY - pinchStartCenter.current.y) * 0.7;
            pan.setValue({ x: nextPanX, y: nextPanY });
          }
        }
        // 2. PAN ZOOMED IMAGE WITH 1 FINGER
        else if (touches && touches.length === 1 && currentScale.current > 1.05) {
          if (isPinching.current) {
            isPinching.current = false;
            startPinchDist.current = 0;
            panStart.current = {
              x: currentPan.current.x - gestureState.dx,
              y: currentPan.current.y - gestureState.dy,
            };
          }
          const maxPanX = ((currentScale.current - 1) * width) / 2;
          const maxPanY = ((currentScale.current - 1) * height) / 2;
          const nextX = Math.min(Math.max(panStart.current.x + gestureState.dx, -maxPanX), maxPanX);
          const nextY = Math.min(Math.max(panStart.current.y + gestureState.dy, -maxPanY), maxPanY);
          currentPan.current = { x: nextX, y: nextY };
          pan.setValue({ x: nextX, y: nextY });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isPinching.current = false;
        startPinchDist.current = 0;

        // If tap while zoomed, smoothly reset to 1.0
        if (
          Math.abs(gestureState.dx) < 6 &&
          Math.abs(gestureState.dy) < 6 &&
          currentScale.current > 1.08
        ) {
          resetZoom(true);
          return;
        }

        // If pinched below threshold, snap back to normal
        if (currentScale.current <= 1.08) {
          resetZoom(true);
        } else {
          // Clamp pan bounds so image stays nicely framed
          const maxPanX = ((currentScale.current - 1) * width) / 2;
          const maxPanY = ((currentScale.current - 1) * height) / 2;
          const clampedX = Math.min(Math.max(currentPan.current.x, -maxPanX), maxPanX);
          const clampedY = Math.min(Math.max(currentPan.current.y, -maxPanY), maxPanY);
          currentPan.current = { x: clampedX, y: clampedY };
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        isPinching.current = false;
        startPinchDist.current = 0;
        if (currentScale.current <= 1.08) {
          resetZoom(true);
        }
      },
    }),
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
      <Animated.Image
        source={source}
        style={{
          width: '100%',
          height: '100%',
          transform: [
            { scale },
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * CardDetailScreen
 *
 * Production-ready Saree Detail Bottom Sheet & Full-Screen Lightbox:
 * - Silky smooth up and down animation identical to SupportBottomSheet (300ms/230ms bezier)
 * - Interactive drag-down PanResponder with spring physics
 * - Android BackHandler integration
 * - Header: Centered drag handle bar and top-right close button (clean, no redundant top text)
 * - Horizontal uncropped 3:2 saree photo carousel (clean & unobstructed, NO buttons, just smooth swiping)
 * - Photo Controls Row (outside the image):
 *   - Saree photo counter
 *   - "View Full Screen" lightbox button
 * - Clean Product Info: Saree title, price, MRP strikethrough, in-stock badge, and description
 * - Action buttons row inside content flow (NO fixed bottom box): Wishlist heart, Share, and "Try On With AI" CTA
 * - Interactive Full-Screen Lightbox:
 *   - Full horizontal swipe/slide between all saree photos (same as card, no extra buttons)
 *   - Standard 2-finger pinch-to-zoom with spring recovery & pan inspection
 *   - Tappable bottom thumbnails synced with both viewers
 */
function CardDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;
  const screenHeight = windowHeight || Dimensions.get('window').height || 844;

  const { sarees, getSaree } = useCatalog();

  const passedProduct = route?.params?.product;
  const sareeId = route?.params?.sareeId || passedProduct?.id || '';

  const initialFallback =
    passedProduct ||
    (sareeId ? getSaree(sareeId) || (Array.isArray(sarees) ? sarees.find((s) => s.id === sareeId) : null) : null);

  const [currentProduct, setCurrentProduct] = useState(() =>
    initialFallback ? presentSaree(initialFallback) : null,
  );
  const [detailLoading, setDetailLoading] = useState(() => !initialFallback && !!sareeId);
  const [detailError, setDetailError] = useState('');
  const [fetchKey, setFetchKey] = useState(0);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [modalZoomScale, setModalZoomScale] = useState(1);
  const [showTryOnConfirm, setShowTryOnConfirm] = useState(false);

  // Carousel refs for programmatic scrolling & synchronization
  const bottomSheetCarouselRef = useRef(null);
  const modalScrollRef = useRef(null);

  // Global Wishlist & Cart
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlisted = !!(currentProduct?.id && wishlist[currentProduct.id]);
  const { addToCart, isInCart } = useCart();
  const alreadyInCart = !!(currentProduct?.id && isInCart(currentProduct.id));
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const imageList =
    Array.isArray(currentProduct?.images) && currentProduct.images.length > 0
      ? currentProduct.images
      : currentProduct?.image
      ? [currentProduct.image]
      : [];

  const craftSpecs = useMemo(() => {
    if (!currentProduct) return [];
    const fixed = [
      ['Weave', currentProduct.weave],
      ['Fabric', currentProduct.fabric],
      ['Zari', currentProduct.zari],
      ['Origin', currentProduct.origin],
    ].filter(([, val]) => val && String(val).trim());
    const custom = Array.isArray(currentProduct.features) && currentProduct.features.length
      ? currentProduct.features
        .map((item) => [item.key, item.value])
        .filter(([key, val]) => key && String(val || '').trim())
      : [
        ['Body', currentProduct.body],
        ['Border', currentProduct.border],
        ['Pallu', currentProduct.pallu],
        ['Blouse', currentProduct.blouse],
      ].filter(([, val]) => val && String(val).trim());
    return [...fixed, ...custom];
  }, [currentProduct]);

  // Fetch full saree details only when this detail screen opens
  useEffect(() => {
    let live = true;
    if (!sareeId && !initialFallback) {
      setDetailLoading(false);
      setDetailError('This saree could not be found.');
      return undefined;
    }

    if (!currentProduct) {
      setDetailLoading(true);
    }
    setDetailError('');

    if (sareeId) {
      apiCall('get', `/sarees/${encodeURIComponent(sareeId)}`)
        .then((result) => {
          if (!live) return;
          const row =
            result?.data?.saree ||
            result?.data?.item ||
            (result?.data && !Array.isArray(result.data.items) ? result.data : null);
          if (result.success && row) {
            setCurrentProduct(presentSaree(row));
            setDetailError('');
          } else if (!currentProduct) {
            setDetailError(
              result.error?.message || 'Saree details could not be loaded.',
            );
          }
          setDetailLoading(false);
        })
        .catch(() => {
          if (live && !currentProduct) {
            setDetailError('Saree details could not be loaded.');
            setDetailLoading(false);
          }
        });
    } else {
      setDetailLoading(false);
    }

    return () => {
      live = false;
    };
  }, [sareeId, fetchKey]);

  // 3:2 landscape aspect ratio matching authentic 1600x1066 saree photos
  // sheetCard has paddingHorizontal: 20 -> card width is screenWidth - 40
  const imageCardWidth = Math.max(280, screenWidth - 40);
  const imageCardHeight = Math.round(imageCardWidth / 1.5);

  // BottomSheet Animations
  const animProgress = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Synchronized interpolations matching bottomSheet.jsx
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const sheetOpacity = animProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.85, 1],
    extrapolate: 'clamp',
  });

  const sheetTranslateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
    extrapolate: 'clamp',
  });

  // Exit animation (230ms bezier) with bulletproof safety timeout
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    isAnimatingRef.current = false;

    // Safety fallback timer to prevent app freezing if animation is cancelled
    const safetyTimer = setTimeout(() => {
      if (isClosingRef.current) {
        isClosingRef.current = false;
        if (navigation?.canGoBack?.()) {
          navigation.goBack();
        }
      }
    }, 280);

    Animated.timing(animProgress, {
      toValue: 0,
      duration: 230,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      clearTimeout(safetyTimer);
      isClosingRef.current = false;
      if (navigation?.canGoBack?.()) {
        navigation.goBack();
      }
    });
  }, [animProgress, navigation]);

  // Entrance & focus restoration effect
  // - Handles initial mount animation
  // - Preserves bottom sheet when returning from TryOnTab or another screen
  // - Hardware back button ONLY active when CardDetailScreen is currently focused
  useFocusEffect(
    useCallback(() => {
      isClosingRef.current = false;
      isAnimatingRef.current = false;

      // Smoothly ensure bottom sheet is at 100% visible and interactive
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();

      const onBackPress = () => {
        if (isFullScreenModal) {
          setIsFullScreenModal(false);
          return true;
        }
        handleClose();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [isFullScreenModal, handleClose, animProgress]),
  );

  // Sync scroll position when opening full-screen modal
  useEffect(() => {
    if (isFullScreenModal) {
      setModalZoomScale(1);
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({
          x: activeImageIdx * screenWidth,
          animated: false,
        });
      }, 50);
    }
  }, [isFullScreenModal]);

  // Reset image carousel to first image when product changes
  useEffect(() => {
    setActiveImageIdx(0);
    bottomSheetCarouselRef.current?.scrollTo({ x: 0, animated: false });
  }, [currentProduct?.id]);

  // PanResponder for smooth drag-down dismissal matching bottomSheet.jsx
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 4,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const progress = Math.max(0, 1 - gestureState.dy / 240);
          animProgress.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 65 || gestureState.vy > 0.45) {
          handleClose();
        } else {
          Animated.spring(animProgress, {
            toValue: 1,
            damping: 24,
            stiffness: 260,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(animProgress, {
          toValue: 1,
          damping: 24,
          stiffness: 260,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const handleShare = async () => {
    if (!currentProduct) return;
    try {
      await Share.share({
        message: `Discover ${currentProduct.title} from Tripuraa Sangrahah${currentProduct.productCode ? ` (${currentProduct.productCode})` : ''}.`,
      });
    } catch {
      // silent handle
    }
  };

  const handleTryOn = () => {
    if (!currentProduct) return;
    setShowTryOnConfirm(true);
  };

  const handleRetryFetch = () => {
    setFetchKey((key) => key + 1);
  };

  return (
    <View
      style={styles.modalOverlay}
      pointerEvents={isClosingRef.current ? 'none' : 'auto'}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* 1. FULL-SCREEN DEEP DARK FADING BACKDROP SCRIM */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.backdropScrim,
          { opacity: backdropOpacity },
        ]}>
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Dismiss bottom sheet"
        />
      </Animated.View>

      {/* 2. UNIFIED SLIDING & FADING BOTTOM SHEET CARD */}
      <Animated.View
        style={[
          styles.sheetCard,
          {
            height: Math.round(screenHeight * 0.88),
            paddingBottom: Math.max(insets.bottom, 12),
            opacity: sheetOpacity,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}>
        {/* ===================================================================
            HEADER AREA: Close 'X' (left) + Centered Drag Pill + Share & Like (right)
           =================================================================== */}
        <View style={styles.topHeaderBar}>
          {/* Close Button Top-Left with proper spacing */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.topRoundBtn}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Icon name="close" size={17} color="#161413" />
          </TouchableOpacity>

          {/* Centered Drag Handle Bar */}
          <View
            {...panResponder.panHandlers}
            style={styles.centerDragPill}
            pointerEvents="box-none">
            <View style={styles.handleBar} />
          </View>

          {/* Top-Right: Share & Like Buttons */}
          <View style={styles.topActionsRow}>
            {/* Share Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShare}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.topRoundBtn}
              accessibilityRole="button"
              accessibilityLabel="Share saree">
              <Icon name="share-outline" size={17} color="#161413" />
            </TouchableOpacity>

            {/* Like (Wishlist) Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => currentProduct?.id && toggleWishlist(currentProduct.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.topRoundBtn}
              accessibilityRole="button"
              accessibilityLabel="Wishlist">
              <Icon
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={17}
                color={isWishlisted ? (colours.saffron || '#BF5B21') : '#161413'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {detailLoading ? (
            <SectionLoader message="Loading saree details..." minHeight={280} />
          ) : detailError || !currentProduct ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontFamily: 'Manrope-Medium',
                  fontSize: 13,
                  color: '#70685E',
                  textAlign: 'center',
                  marginBottom: 14,
                }}>
                {detailError || 'Saree details could not be loaded.'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRetryFetch}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: colours.primary,
                  minWidth: 120,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 13,
                    color: colours.white,
                  }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
          <>
          {/* ===================================================================
              SAREE HORIZONTAL PHOTO CAROUSEL (3:2 UNcropped LUXURY CARD)
              Pure natural finger swiping - NO extra buttons!
             =================================================================== */}
          <View
            style={[
              styles.imageCardContainer,
              { width: imageCardWidth, height: imageCardHeight },
            ]}>
            <ScrollView
              ref={bottomSheetCarouselRef}
              horizontal
              pagingEnabled
              nestedScrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                if (imageCardWidth > 0) {
                  const idx = Math.round(offsetX / imageCardWidth);
                  if (idx !== activeImageIdx && idx >= 0 && idx < imageList.length) {
                    setActiveImageIdx(idx);
                  }
                }
              }}
              style={{ width: imageCardWidth, height: imageCardHeight }}>
              {imageList.length === 0 ? (
                <View style={{ width: imageCardWidth, height: imageCardHeight, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.productTitle}>-</Text>
                </View>
              ) : imageList.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.95}
                  onPress={() => setIsFullScreenModal(true)}
                  style={{ width: imageCardWidth, height: imageCardHeight }}>
                  <Image
                    source={img}
                    style={{ width: imageCardWidth, height: imageCardHeight }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ===================================================================
                PHOTO CONTROLS (INSIDE / OVERLAYING THE IMAGE AT THE BOTTOM)
               =================================================================== */}
            <View
              pointerEvents="box-none"
              style={styles.imageOverlayControlsRow}>
              {/* Photo Pagination Counter */}
              {imageList.length > 1 ? (
                <View style={styles.imageOverlayCounterPill}>
                  <Text style={styles.imageOverlayCounterText}>
                    {activeImageIdx + 1} / {imageList.length}
                  </Text>
                </View>
              ) : (
                <View />
              )}

              {/* View Full Screen Button */}
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setIsFullScreenModal(true)}
                style={styles.imageOverlayFullScreenBtn}
                accessibilityRole="button"
                accessibilityLabel="View full screen">
                <Icon name="scan-outline" size={13} color="#161413" />
                <Text style={styles.imageOverlayFullScreenText}>View Full Screen</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===================================================================
              FIXED PRODUCT HEADER: Title, Price, Code Badge & "Try On With AI"
              Fixed directly below the saree photo, above the specs scroll.
             =================================================================== */}
          <View style={styles.fixedInfoSection}>
            {/* Title on the left, the exact price on the right. */}
            <View style={styles.titleCodeRow}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {dash(currentProduct.title)}
              </Text>
              <Text style={styles.priceValue}>
                {formatPrice(currentProduct.price || currentProduct.numericPrice) || '-'}
              </Text>
            </View>

            {/* Below Price: Code on the left, Try On With AI on the right */}
            <View style={styles.codeTryOnRow}>
              {currentProduct.productCode ? (
                <View style={styles.codeRow}>
                  <Text style={styles.codeLabel}>Code</Text>
                  <View style={styles.cleanCodeBadge}>
                    <Text style={styles.cleanCodeBadgeText}>
                      {currentProduct.productCode}
                    </Text>
                  </View>
                </View>
              ) : (
                <View />
              )}

              {/* Try On With AI Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleTryOn}
                style={styles.fixedTryOnBtn}
                accessibilityRole="button"
                accessibilityLabel="Try on with AI">
                <TryOnSparkleIcon size={14} color="#FFFFFF" />
                <Text style={styles.fixedTryOnText}>Try On With AI</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===================================================================
              SCROLLABLE ATELIER CRAFT SPECIFICATIONS & DESCRIPTION
              Only this middle section (weave, fabric, zari, etc.) scrolls!
             =================================================================== */}
          <ScrollView
            style={styles.detailScroll}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled
            contentContainerStyle={styles.scrollContent}>
            {/* Description */}
            {currentProduct.description ? (
              <Text style={styles.descriptionText}>
                {dash(currentProduct.description)}
              </Text>
            ) : null}

            {/* Clean Atelier Craft Specifications (Weave, Fabric, Zari, etc.) */}
            {craftSpecs.length > 0 ? (
              <View style={styles.specList}>
                {craftSpecs.map(([label, value]) => (
                  <View key={label} style={styles.specItemRow}>
                    <Text style={styles.specLabel}>{label}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {/* ===================================================================
              FIXED BOTTOM ACTION: Single "Add to Cart" CTA
             =================================================================== */}
          <View style={styles.fixedBottomContainer}>
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isAddingToCart || alreadyInCart}
              onPress={async () => {
                setIsAddingToCart(true);
                try {
                  await addToCart(currentProduct);
                } finally {
                  setIsAddingToCart(false);
                }
              }}
              style={[
                styles.addToCartBtn,
                alreadyInCart && styles.alreadyInCartBtn,
                isAddingToCart && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={alreadyInCart ? 'Added to cart' : 'Add to cart'}>
              {isAddingToCart ? (
                <>
                  <ButtonSpinner color="#FFFFFF" />
                  <Text style={styles.addToCartBtnText}>Adding...</Text>
                </>
              ) : (
                <>
                  <Icon
                    name={alreadyInCart ? 'cart' : 'cart-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text
                    style={[
                      styles.addToCartBtnText,
                      alreadyInCart && styles.alreadyInCartBtnText,
                    ]}>
                    {alreadyInCart ? 'Added to Cart' : 'Add to Cart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          </>
          )}
      </Animated.View>

      {/* =========================================================================
          FULL-SCREEN INTERACTIVE LIGHTBOX MODAL WITH 2-FINGER ZOOM & SLIDING
         ========================================================================= */}
      <Modal
        visible={isFullScreenModal}
        transparent={true}
        animationType="fade"
        supportedOrientations={['portrait']}
        onRequestClose={() => setIsFullScreenModal(false)}>
        <View style={styles.modalBackdrop}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />

          {/* Top Modal Header Controls */}
          <View
            style={[
              styles.modalTopBar,
              { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12) + 8 },
            ]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text numberOfLines={1} style={styles.modalTitle}>
                {currentProduct?.title || 'Saree'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Photo {activeImageIdx + 1} of {imageList.length} • Authentic Handloom Weave
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFullScreenModal(false)}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close full screen view">
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Full Screen Image Canvas with Horizontal Sliding and 2-Finger Pinch Zoom */}
          <View style={styles.modalImageContainer}>
            <ScrollView
              ref={modalScrollRef}
              horizontal
              pagingEnabled
              scrollEnabled={modalZoomScale <= 1.05}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                if (screenWidth > 0) {
                  const idx = Math.round(offsetX / screenWidth);
                  if (idx !== activeImageIdx && idx >= 0 && idx < imageList.length) {
                    setActiveImageIdx(idx);
                    bottomSheetCarouselRef.current?.scrollTo({
                      x: idx * imageCardWidth,
                      animated: false,
                    });
                  }
                }
              }}
              style={{ flex: 1, width: screenWidth }}>
              {imageList.map((img, idx) => (
                <ZoomableImage
                  key={idx}
                  source={img}
                  width={screenWidth}
                  height={screenHeight * 0.72}
                  isActive={activeImageIdx === idx}
                  onZoomChange={setModalZoomScale}
                />
              ))}
            </ScrollView>
          </View>

          {/* Bottom Thumbnails Strip in Modal */}
          {imageList.length > 1 && (
            <View style={{ paddingBottom: Math.max(insets.bottom, 20) + 8 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalThumbsScroll}>
                {imageList.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveImageIdx(idx);
                      modalScrollRef.current?.scrollTo({
                        x: idx * screenWidth,
                        animated: true,
                      });
                      bottomSheetCarouselRef.current?.scrollTo({
                        x: idx * imageCardWidth,
                        animated: false,
                      });
                    }}
                    style={[
                      styles.modalThumbItem,
                      activeImageIdx === idx && styles.modalThumbItemActive,
                    ]}>
                    <Image source={img} style={styles.modalThumbImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* Try-On Confirmation Modal */}
      <TryOnConfirmModal
        visible={showTryOnConfirm && !!currentProduct}
        saree={currentProduct}
        onConfirm={() => {
          if (!currentProduct?.id) return;
          setShowTryOnConfirm(false);
          navigation?.navigate?.('TryOnTab', {
            product: currentProduct,
            sareeId: currentProduct.id,
          });
        }}
        onCancel={() => setShowTryOnConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  backdropScrim: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetCard: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 24,
    overflow: 'hidden',
  },
  detailScroll: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 8,
    width: '100%',
    position: 'relative',
    minHeight: 40,
  },
  centerDragPill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D2CC',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  topRoundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE7DE',
    zIndex: 2,
    position: 'relative',
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  imageCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: '#ECE7DE',
    alignSelf: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  imageOverlayControlsRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  imageOverlayCounterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE7DE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  imageOverlayCounterText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    color: '#161413',
    letterSpacing: 0.2,
  },
  imageOverlayFullScreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E3DA',
    gap: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.09,
    shadowRadius: 3,
    elevation: 2,
  },
  imageOverlayFullScreenText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 10,
    color: '#161413',
  },
  fixedInfoSection: {
    paddingTop: 2,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE4',
    marginBottom: 6,
  },
  titleCodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  productTitle: {
    flex: 1,
    fontFamily: 'Comfortaa-Bold',
    fontSize: 15,
    color: '#161413',
    lineHeight: 20,
    letterSpacing: -0.2,
    marginRight: 10,
  },
  priceValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16.5,
    color: '#161413',
    letterSpacing: -0.3,
  },
  codeTryOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: '#70685E',
  },
  cleanCodeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ECE7DE',
    backgroundColor: '#F5F2EC',
  },
  cleanCodeBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: '#161413',
    letterSpacing: 0.3,
  },
  fixedTryOnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colours.saffron || '#BF5B21',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedTryOnText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 12,
    color: '#5C554B',
    lineHeight: 18,
    marginBottom: 10,
  },
  specList: {
    marginBottom: 8,
  },
  specItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE4',
  },
  specLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#161413',
    minWidth: 64,
  },
  specValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#161413',
    lineHeight: 17,
  },
  fixedBottomContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE4',
    backgroundColor: '#FFFFFF',
  },
  addToCartBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  alreadyInCartBtn: {
    backgroundColor: '#161413',
    shadowColor: '#161413',
  },
  addToCartBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  alreadyInCartBtnText: {
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0A090D',
    justifyContent: 'space-between',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: 'rgba(10, 9, 13, 0.85)',
    zIndex: 20,
  },
  modalTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 11,
    color: '#A09CA8',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalThumbsScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 6,
  },
  modalThumbItem: {
    width: 62,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    opacity: 0.55,
  },
  modalThumbItemActive: {
    borderColor: colours.saffron || '#BF5B21',
    opacity: 1,
  },
  modalThumbImage: {
    width: '100%',
    height: '100%',
  },
});

export default CardDetailScreen;
