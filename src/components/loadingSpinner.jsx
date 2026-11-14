import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colours from '../assets/colours';

/**
 * Standard circular loader used across the app.
 * size: 'small' | 'large' | number
 */
export function LoadingSpinner({
  size = 'large',
  color = colours.primary,
  style,
}) {
  return <ActivityIndicator size={size} color={color} style={style} />;
}

/**
 * Inline spinner for primary buttons (white on brand gold).
 */
export function ButtonSpinner({ color = colours.white, style }) {
  return <ActivityIndicator size="small" color={color} style={style} />;
}

/**
 * Centered block for screen / section loading (lists, catalog, etc.).
 */
export function ScreenLoader({
  message = 'Loading...',
  fullScreen = false,
  style,
}) {
  return (
    <View
      style={[
        styles.screenCenter,
        fullScreen && styles.fullScreen,
        style,
      ]}>
      <LoadingSpinner />
      {message ? (
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Soft card-style loader used inside scroll content.
 */
export function SectionLoader({ message = 'Loading...', minHeight = 180 }) {
  return (
    <View style={[styles.sectionBox, { minHeight }]}>
      <LoadingSpinner />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

/**
 * Full-screen modal overlay — covers navigation lag / long actions.
 */
export function LoadingOverlay({
  visible,
  message = 'Please wait...',
  transparent = true,
}) {
  return (
    <Modal
      visible={!!visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.overlayCard}>
          <LoadingSpinner />
          {message ? (
            <Text style={styles.overlayMessage} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,253,240,0.92)',
    zIndex: 50,
  },
  sectionBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  message: {
    marginTop: 12,
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: colours.textSecondary,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 24, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  overlayCard: {
    minWidth: 132,
    maxWidth: 260,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: colours.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  overlayMessage: {
    marginTop: 12,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: colours.textPrimary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
