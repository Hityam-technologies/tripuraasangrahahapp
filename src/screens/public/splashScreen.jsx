import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import GradientBackground from '../../components/gradientBackground';
import { useAuth } from '../../context/authContext';

/**
 * SplashScreen
 *
 * Dedicated Luxury Splash Screen:
 * - Displays the centered Tripuraa Sangrahah logo while the app initializes.
 * - Shows the logo until loading completes (with a smooth, comfortable brand presence).
 * - Smoothly fades away into the destination screen (MainTabs for authenticated users, Login otherwise).
 */
function SplashScreen({ navigation }) {
  const { user, ready, forceUpdate } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;

  const logoWidth = isSmallDevice ? 250 : 290;
  const logoHeight = Math.round(logoWidth / (1672 / 941));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const hasNavigatedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());

  // 1. Initial fade-in & subtle breathing scale of centered logo
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // 2. Keep displaying until loading is ready (with a smooth minimum duration), then fade away
  useEffect(() => {
    if (!ready) return undefined;

    // Minimum display time (1600ms) to ensure comfortable brand visibility
    const elapsed = Date.now() - mountTimeRef.current;
    const wait = Math.max(0, 1600 - elapsed);

    const timer = setTimeout(() => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      // Smooth fade-away animation
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 550,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 550,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          const targetScreen = user && !forceUpdate ? 'MainTabs' : 'Login';
          navigation?.reset?.({ index: 0, routes: [{ name: targetScreen }] });
        }
      });
    }, wait);

    return () => clearTimeout(timer);
  }, [ready, user, forceUpdate, containerOpacity, scaleAnim, navigation]);

  return (
    <GradientBackground idPrefix="splash_" className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* =========================================================================
          CENTERED BRAND LOGO & FADE-AWAY CONTAINER
         ========================================================================= */}
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: containerOpacity,
        }}>
        <Animated.View
          style={{
            width: logoWidth,
            height: logoHeight,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}>
          <Image
            source={require('../../assets/homeLogo.png')}
            style={{
              width: logoWidth,
              height: logoHeight,
            }}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Tripuraa Sangrahah Logo"
          />
        </Animated.View>
      </Animated.View>
    </GradientBackground>
  );
}

export default SplashScreen;
