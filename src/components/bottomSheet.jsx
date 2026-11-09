import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * BottomSheet Component
 * 
 * Production real-world bottom sheet:
 * - Edge-to-edge full width (100% width, 0 margin/gaps on left, right, or bottom)
 * - Deep dark backdrop scrim covers the WHOLE screen behind the sheet
 * - Silky smooth, unified 60fps entrance and exit (bezier curve, no stutter, no re-trigger glitch)
 * - Coordinated simultaneous fade + glide: backdrop fades in (0 -> 1) while sheet card
 *   fades in (0 -> 1) and glides up (240 -> 0)
 * - Outer backdrop tap immediately dismisses
 * - Handle drag-down dismiss gesture
 * - Pure white sheet background (#FFFFFF)
 */
function BottomSheet({
  visible = false,
  onClose,
  title,
  children,
  maxHeight = '85%',
  showHandle = true,
  contentContainerStyle,
}) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenHeight = Dimensions.get('screen').height || windowHeight || 800;

  // Track if Modal is active in the native tree
  const [modalVisible, setModalVisible] = useState(visible);
  const isClosingRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Single unified animation progress value (0 = closed, 1 = fully open)
  const animProgress = useRef(new Animated.Value(0)).current;

  // Synchronized interpolations:
  // 1. Dark backdrop scrim smoothly fades in (0 -> 1) covering the whole screen
  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 2. Sheet card opacity smoothly blooms into view (0 -> 1)
  const sheetOpacity = animProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.85, 1],
    extrapolate: 'clamp',
  });

  // 3. Sheet card glides up from bottom (220px -> 0px) in perfect sync
  const sheetTranslateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
    extrapolate: 'clamp',
  });

  // Unified entrance animation
  const animateOpen = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    isClosingRef.current = false;
    animProgress.setValue(0);

    Animated.timing(animProgress, {
      toValue: 1,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      isAnimatingRef.current = false;
    });
  };

  // Unified exit animation
  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    isAnimatingRef.current = false;

    Animated.timing(animProgress, {
      toValue: 0,
      duration: 230,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        isClosingRef.current = false;
        setModalVisible(false);
        onClose?.();
      }
    });
  };

  // Watch visible prop
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      requestAnimationFrame(() => {
        animateOpen();
      });
    } else if (modalVisible && !isClosingRef.current) {
      handleClose();
    }
  }, [visible]);

  // PanResponder for smooth drag-down dismissal
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
    }),
  ).current;

  if (!visible && !modalVisible) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      supportedOrientations={['portrait']}
      onRequestClose={handleClose}
      onShow={() => {
        if (!isAnimatingRef.current && !isClosingRef.current) {
          animateOpen();
        }
      }}>
      <View style={styles.modalOverlay}>
        {/* 1. Full-screen Deep Dark Fading Backdrop Scrim covering the WHOLE screen */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.backdropScrim,
            { opacity: backdropOpacity },
          ]}>
          {/* Tapping anywhere on the dark backdrop immediately closes the sheet */}
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* 2. Unified Sliding & Fading Bottom Sheet Card (Full Width, Zero Gaps) */}
        <Animated.View
          style={[
            styles.sheetCard,
            {
              backgroundColor: '#FFFFFF',
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 24),
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            },
            contentContainerStyle,
          ]}
          onStartShouldSetResponder={() => true}>
          {/* Header Area */}
          {showHandle && (
            <View style={styles.handleArea}>
              {/* Drag Handle Bar */}
              <View {...panResponder.panHandlers} style={styles.dragPillWrapper}>
                <View style={styles.handleBar} />
              </View>

              {/* Title & Close Button Row */}
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>{title || ''}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.closeBtn}>
                  <Icon name="close" size={16} color="#5C554B" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sheet Body Content */}
          {children}
        </Animated.View>
      </View>
    </Modal>
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
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 24,
  },
  handleArea: {
    width: '100%',
    marginBottom: 8,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 4,
  },
  titleText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 16,
    color: '#161413',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomSheet;
