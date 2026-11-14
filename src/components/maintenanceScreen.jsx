import React, { useEffect } from 'react';
import {
  BackHandler,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colours from '../assets/colours';
import GradientBackground from './gradientBackground';
import { LOGO_ASPECT } from './brandLogo';

const LOGO_SIZE = 188;

function messageFor(notice) {
  const text = String(notice || '').trim();
  if (!text || text === '-') return 'The app is temporarily unavailable. Please try again later.';
  return text;
}

function MaintenanceScreen({ notice }) {
  const insets = useSafeAreaInsets();

  const closeApp = () => {
    BackHandler.exitApp();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeApp();
      return true;
    });
    return () => subscription.remove();
  }, []);

  return (
    <GradientBackground idPrefix="maintenance_" style={styles.fill}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 20) + 8 },
        ]}>
        <View style={styles.center}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Tripuraa Sangrahah Logo"
            />
          </View>
          <Text style={styles.title}>Under maintenance</Text>
          <Text style={styles.notice}>{messageFor(notice)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Close app"
          onPress={closeApp}
          style={styles.button}>
          <Text style={styles.buttonText}>Close app</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFrame: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: LOGO_SIZE,
    height: Math.round(LOGO_SIZE * LOGO_ASPECT),
    marginTop: -6,
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 30,
    lineHeight: 36,
    color: colours.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  notice: {
    fontFamily: 'Manrope-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: colours.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colours.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    color: colours.white,
  },
});

export default MaintenanceScreen;
