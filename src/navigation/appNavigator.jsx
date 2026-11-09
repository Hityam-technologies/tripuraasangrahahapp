import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/public/splashScreen';
import LoginScreen from '../screens/public/loginScreen';
import RegistrationScreen from '../screens/public/registrationScreen';
import OtpScreen from '../screens/public/otpScreen';
import FaqScreen from '../screens/private/accountTab/faqScreen';
import TermsOfServiceScreen from '../screens/private/accountTab/termsOfServiceScreen';
import UserPolicyScreen from '../screens/private/accountTab/userPolicyScreen';
import CardDetailScreen from '../screens/private/cardDetailScreen';
import TryOnScreen from '../screens/private/wardrobeTab/tryOnScreen';
import TabNavigator from './tabNavigator';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * Public authentication stack + Private MainTabs (floating rounded bottom tabs).
 */
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
        animation: 'slide_from_right',
        animationDuration: 350,
        orientation: 'portrait',
      }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Register"
        component={RegistrationScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ animation: 'fade_from_bottom', animationDuration: 400 }}
      />
      <Stack.Screen
        name="Faq"
        component={FaqScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UserPolicy"
        component={UserPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CardDetail"
        component={CardDetailScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'none',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="TryOnTab"
        component={TryOnScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
