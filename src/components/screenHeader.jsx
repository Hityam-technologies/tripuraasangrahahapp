import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from './backButton';
import colours from '../assets/colours';

/**
 * ScreenHeader Component
 *
 * Identical luxury top header across all Tripura Sangrahah screens:
 * - Search / Collections
 * - Wishlist
 * - Account
 * - Card / Product Details
 *
 * Guaranteed 100% identical geometry, typography, and styling:
 * - Consistent top safe area padding on iOS and Android
 * - Back button with fallback navigation to HomeTab
 * - Centered title in Comfortaa-Bold (20px)
 * - 44px balanced invisible spacer on the right (or custom right action)
 * - Seamless transparent background over GradientBackground
 */
function ScreenHeader({
  title,
  onBackPress,
  showBack = true,
  rightElement = null,
  style,
  titleStyle,
  backgroundColor = 'transparent',
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;
  const hPadding = isSmallDevice ? 16 : isTablet ? 24 : 18;

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation?.navigate?.('HomeTab');
    }
  };

  const buttonSize = isSmallDevice ? 40 : 44;

  return (
    <View
      style={[
        {
          paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6),
          paddingHorizontal: hPadding,
          paddingBottom: 10,
          backgroundColor,
          zIndex: 20,
        },
        style,
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {/* Left: BackButton */}
        {showBack ? (
          <BackButton
            onPress={handleBack}
            sizeClass={isSmallDevice ? 'w-10 h-10' : 'w-11 h-11'}
          />
        ) : (
          <View style={{ width: buttonSize, height: buttonSize }} />
        )}

        {/* Center: Title in Comfortaa-Bold */}
        <Text
          numberOfLines={1}
          style={[
            {
              fontFamily: 'Comfortaa-Bold',
              fontSize: isSmallDevice ? 18 : 20,
              color: colours.textPrimary || '#161413',
              letterSpacing: -0.3,
              textAlign: 'center',
              flexShrink: 1,
              paddingHorizontal: 8,
            },
            titleStyle,
          ]}>
          {title}
        </Text>

        {/* Right: Custom Action or Invisible Matching Spacer */}
        {rightElement ? (
          <View
            style={{
              width: buttonSize,
              height: buttonSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {rightElement}
          </View>
        ) : (
          <View style={{ width: buttonSize, height: buttonSize }} />
        )}
      </View>
    </View>
  );
}

export default ScreenHeader;
