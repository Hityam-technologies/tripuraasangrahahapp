import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '../../components/gradientBackground';
import colours from '../../assets/colours';
import { useAuth } from '../../context/authContext';

/**
 * SplashScreen
 *
 * Dedicated Luxury Splash Screen:
 * - For logged-in users: A single clean screen with the Tripuraa Sangrahah logo in the center.
 *   After loading finishes, the logo animates and glides smoothly to the top-left of the screen,
 *   docking into the exact position of the HomeScreen header logo for a seamless transition.
 * - For unauthenticated users: Displays the brand intro and Get Started CTA to enter Login.
 */
function SplashScreen({ navigation }) {
  const { user, ready, forceUpdate } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  // Exact target position matching HomeScreen top-left logo
  const targetWidth = isSmallDevice ? 175 : 210;
  const targetHeight = Math.round(targetWidth / (1672 / 941));
  const targetLeft = isSmallDevice ? 2 : 4;
  const targetTop = topInset + (Platform.OS === 'android' ? -20 : -2);

  // Exact screen center coordinates
  const centerX = (screenWidth - targetWidth) / 2;
  const centerY = (screenHeight - targetHeight) / 2;

  // Delta offsets for native transform translation
  const deltaX = centerX - targetLeft;
  const deltaY = centerY - targetTop;

  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onboardingFade = useRef(new Animated.Value(0)).current;
  const hasMovedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());

  const [showOnboarding, setShowOnboarding] = useState(false);

  // 1. Initial fade-in of centered logo
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 2. React to auth bootstrap / loading resolution
  useEffect(() => {
    if (!ready) return undefined;

    // Minimum display time (1100ms) to ensure comfortable brand visibility
    const elapsed = Date.now() - mountTimeRef.current;
    const wait = Math.max(0, 1100 - elapsed);

    if (user && !forceUpdate) {
      // LOGGED-IN FLOW:
      // Single screen with centered logo; upon loading finish, logo moves to top-left and enters Home
      const timer = setTimeout(() => {
        if (hasMovedRef.current) return;
        hasMovedRef.current = true;

        Animated.timing(moveAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            navigation?.reset?.({ index: 0, routes: [{ name: 'MainTabs' }] });
          }
        });
      }, wait);

      return () => clearTimeout(timer);
    }

    if (!user && ready) {
      // UN-AUTHENTICATED FLOW:
      // Move logo to top and reveal the onboarding content & Get Started CTA
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }),
          Animated.timing(onboardingFade, {
            toValue: 1,
            duration: 500,
            delay: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }, wait);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [ready, user, forceUpdate, moveAnim, onboardingFade, navigation]);

  return (
    <GradientBackground idPrefix="splash_" className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* =========================================================================
          ANIMATED BRAND LOGO
          Starts in the dead-center of the screen; upon loading finish, animates
          to top-left matching the exact HomeScreen header coordinates.
         ========================================================================= */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: targetLeft,
          top: targetTop,
          width: targetWidth,
          height: targetHeight,
          zIndex: 10,
          opacity: fadeAnim,
          transform: [
            {
              translateX: moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [deltaX, 0],
              }),
            },
            {
              translateY: moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [deltaY, 0],
              }),
            },
            {
              scale: moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1.25, 1],
              }),
            },
          ],
        }}>
        <Image
          source={require('../../assets/homeLogo.png')}
          style={{
            width: targetWidth,
            height: targetHeight,
          }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Tripuraa Sangrahah Logo"
        />
      </Animated.View>

      {/* =========================================================================
          UN-AUTHENTICATED ONBOARDING SECTION (Only shown if user is NOT logged in)
         ========================================================================= */}
      {showOnboarding && (
        <Animated.View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 28),
            opacity: onboardingFade,
          }}>
          <View style={{ marginBottom: 26 }}>
            <Text
              style={{
                fontFamily: 'Comfortaa-Bold',
                fontSize: isSmallDevice ? 22 : 26,
                color: '#161413',
                lineHeight: isSmallDevice ? 30 : 35,
                letterSpacing: -0.3,
                marginBottom: 10,
              }}>
              Timeless Silk Heritage,{'\n'}AI Virtual Try-On.
            </Text>
            <Text
              style={{
                fontFamily: 'Comfortaa-Regular',
                fontSize: 13,
                color: '#6E675D',
                lineHeight: 20,
              }}>
              Experience exquisite handcrafted Indian sarees and visualize your perfect drape with our AI studio.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Get started"
            onPress={() => {
              if (!forceUpdate) navigation?.navigate?.('Login');
            }}
            style={{
              backgroundColor: colours.saffron || '#BF5B21',
              height: 52,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colours.saffron || '#BF5B21',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.28,
              shadowRadius: 6,
              elevation: 4,
            }}>
            <Text
              style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 15.5,
                color: '#FFFFFF',
                letterSpacing: 0.3,
              }}>
              {forceUpdate ? 'Update required' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </GradientBackground>
  );
}

export default SplashScreen;
