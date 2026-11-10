import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  Linking,
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

function calculateMrp(priceVal, mrpVal) {
  if (mrpVal) return formatPrice(mrpVal);
  if (!priceVal) return '';
  const num = typeof priceVal === 'number'
    ? priceVal
    : Number(String(priceVal).replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(num) && num > 0) {
    const calculated = Math.round(num * 1.25);
    return `₹${calculated.toLocaleString('en-IN')}`;
  }
  return '';
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

  const { sarees, getSaree, support } = useCatalog();

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

  // Global Wishlist
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlisted = !!(currentProduct?.id && wishlist[currentProduct.id]);

  const imageList =
    Array.isArray(currentProduct?.images) && currentProduct.images.length > 0
      ? currentProduct.images
      : currentProduct?.image
      ? [currentProduct.image]
      : [];

  const craftSpecs = useMemo(() => {
    if (!currentProduct) return [];
    const list = [
      ['Weave', currentProduct.weave],
      ['Fabric', currentProduct.fabric],
      ['Zari', currentProduct.zari],
      ['Origin', currentProduct.origin],
      ['Body', currentProduct.body],
      ['Border', currentProduct.border],
      ['Pallu', currentProduct.pallu],
      ['Blouse', currentProduct.blouse],
    ];
    return list.filter(([, val]) => val && String(val).trim());
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
        {/* HEADER AREA: Centered Drag Handle + Top-Right Close Button */}
        <View style={styles.handleArea}>
          {/* Centered Drag Handle Bar */}
          <View {...panResponder.panHandlers} style={styles.dragPillWrapper}>
            <View style={styles.handleBar} />
          </View>

          {/* Close Button Top-Right */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Icon name="close" size={16} color="#5C554B" />
          </TouchableOpacity>
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
          </View>

          {/* ===================================================================
              PHOTO CONTROLS (OUTSIDE THE IMAGE)
             =================================================================== */}
          <View style={styles.outsidePhotoControlsRow}>
            {/* Photo Pagination Counter */}
            {imageList.length > 1 ? (
              <View style={styles.outsideCounterPill}>
                <Text style={styles.outsideCounterText}>
                  {activeImageIdx + 1} / {imageList.length}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {/* View Full Screen Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsFullScreenModal(true)}
              style={styles.outsideFullScreenBtn}
              accessibilityRole="button"
              accessibilityLabel="View full screen">
              <Icon name="scan-outline" size={13} color="#161413" />
              <Text style={styles.outsideFullScreenText}>View Full Screen</Text>
            </TouchableOpacity>
          </View>

          {/* Details scroll. The photo above stays fixed. */}
          <ScrollView
            style={styles.detailScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoSection}>
            {/* 1. Provenance Tag Line */}
            <Text style={styles.provenanceTag} numberOfLines={1}>
              {[
                currentProduct.brand || 'TRIPURAA HERITAGE',
                currentProduct.weave || 'HANDLOOM SILK',
                currentProduct.origin,
              ]
                .filter(Boolean)
                .join(' • ')
                .toUpperCase()}
            </Text>

            {/* 2. Product Title & Clean Code Badge */}
            <View style={styles.titleCodeRow}>
              <Text style={styles.productTitle}>
                {dash(currentProduct.title)}
              </Text>
              {currentProduct.productCode ? (
                <View style={styles.cleanCodeBadge}>
                  <Text style={styles.cleanCodeBadgeText}>
                    {currentProduct.productCode}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 3. Price, Strikethrough MRP & In-Stock Status Badge */}
            <View style={styles.priceStockRow}>
              <View style={styles.priceCluster}>
                <Text style={styles.priceValue}>
                  {formatPrice(currentProduct.price || currentProduct.numericPrice)}
                </Text>
                {calculateMrp(
                  currentProduct.price || currentProduct.numericPrice,
                  currentProduct.mrp,
                ) ? (
                  <Text style={styles.mrpText}>
                    {calculateMrp(
                      currentProduct.price || currentProduct.numericPrice,
                      currentProduct.mrp,
                    )}
                  </Text>
                ) : null}
              </View>

              <View style={styles.inStockBadge}>
                <View style={styles.inStockDot} />
                <Text style={styles.inStockText}>In Stock</Text>
              </View>
            </View>

            {/* 4. Description */}
            {currentProduct.description ? (
              <Text style={styles.descriptionText}>
                {dash(currentProduct.description)}
              </Text>
            ) : null}

            {/* 5. Clean Atelier Craft Specifications Card */}
            {craftSpecs.length > 0 ? (
              <View style={styles.specCard}>
                <View style={styles.specHeaderRow}>
                  <Icon
                    name="ribbon-outline"
                    size={13}
                    color={colours.saffron || '#BF5B21'}
                  />
                  <Text style={styles.specHeaderTitle}>CRAFT & SPECIFICATIONS</Text>
                </View>
                <View style={styles.specGrid}>
                  {craftSpecs.map(([label, value]) => (
                    <View key={label} style={styles.specItemRow}>
                      <Text style={styles.specLabel}>{label}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 6. WhatsApp Concierge Order Button */}
            {support?.whatsappPhone ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  const digits = String(support.whatsappPhone).replace(/[^0-9]/g, '');
                  const text = encodeURIComponent(
                    `Hello Tripuraa Sangrahah, I would like to order "${currentProduct.title || 'this saree'}"${currentProduct.productCode ? ` (Code: ${currentProduct.productCode})` : ''}.`,
                  );
                  Linking.openURL(`https://wa.me/${digits}?text=${text}`).catch(() => null);
                }}
                style={styles.orderBtn}>
                <Icon name="logo-whatsapp" size={17} color="#25D366" />
                <Text style={styles.orderBtnText}>Inquire & Order via WhatsApp</Text>
              </TouchableOpacity>
            ) : null}

            {/* ===================================================================
                NATURAL ACTION BUTTONS ROW (NO FIXED BOTTOM BOX!)
               =================================================================== */}
            <View style={styles.actionsRow}>
              {/* Wishlist Heart Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleWishlist(currentProduct.id)}
                style={styles.actionRoundBtn}
                accessibilityRole="button"
                accessibilityLabel="Wishlist">
                <Icon
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isWishlisted ? (colours.saffron || '#BF5B21') : '#161413'}
                />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={styles.actionRoundBtn}
                accessibilityRole="button"
                accessibilityLabel="Share saree">
                <Icon name="share-outline" size={20} color="#161413" />
              </TouchableOpacity>

              {/* Main CTA: Try On With AI Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleTryOn}
                style={styles.mainCtaBtn}
                accessibilityRole="button"
                accessibilityLabel="Try on with AI">
                <TryOnSparkleIcon size={16} color="#FFFFFF" />
                <Text style={styles.mainCtaText}>Try On With AI</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
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
  handleArea: {
    width: '100%',
    position: 'relative',
    paddingTop: 2,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragPillWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D2CC',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 2,
    paddingBottom: 16,
  },
  imageCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.2,
    borderColor: '#ECE7DE',
    alignSelf: 'center',
    marginBottom: 10,
  },
  outsidePhotoControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 1,
  },
  outsideCounterPill: {
    backgroundColor: '#F7F5F0',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ECE7DE',
  },
  outsideCounterText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9.5,
    color: '#7D7569',
  },
  outsideFullScreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E8E3DA',
    gap: 4.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  outsideFullScreenText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 9.5,
    color: '#161413',
  },
  infoSection: {
    paddingTop: 2,
  },
  provenanceTag: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: colours.saffron || '#BF5B21',
    marginBottom: 6,
  },
  titleCodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  productTitle: {
    flex: 1,
    fontFamily: 'Comfortaa-Bold',
    fontSize: 18,
    color: '#161413',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  cleanCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    backgroundColor: '#F5EFE6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8DFD1',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  cleanCodeBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#70685E',
    letterSpacing: 0.5,
  },
  priceStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4',
  },
  priceCluster: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    color: '#161413',
    letterSpacing: -0.4,
  },
  mrpText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: '#A0988E',
    textDecorationLine: 'line-through',
  },
  inStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4EED8',
  },
  inStockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2E7D32',
    marginRight: 4,
  },
  inStockText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#2E7D32',
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 12.5,
    color: '#5C554B',
    lineHeight: 19,
    marginBottom: 16,
  },
  specCard: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE4D8',
  },
  specHeaderTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A8175',
  },
  specGrid: {
    gap: 7,
  },
  specItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  specLabel: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 11.5,
    color: '#70685E',
    minWidth: 64,
  },
  specValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Comfortaa-Regular',
    fontSize: 11.5,
    color: '#161413',
    lineHeight: 16,
  },
  orderBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#E6DDD0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  orderBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: '#161413',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  actionRoundBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE9E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mainCtaBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  mainCtaText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
