import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/public/splashScreen';
import LoginScreen from '../screens/public/loginScreen';
import RegistrationScreen from '../screens/public/registrationScreen';
import OtpScreen from '../screens/public/otpScreen';
import ResetPasswordScreen from '../screens/public/resetPasswordScreen';
import FaqScreen from '../screens/private/accountTab/faqScreen';
import TermsOfServiceScreen from '../screens/private/accountTab/termsOfServiceScreen';
import UserPolicyScreen from '../screens/private/accountTab/userPolicyScreen';
import CardDetailScreen from '../screens/private/cardDetailScreen';
import TryOnScreen from '../screens/private/wardrobeTab/tryOnScreen';
import CartScreen from '../screens/private/cartScreen';
import OrdersScreen from '../screens/private/ordersScreen';
import ReferralScreen from '../screens/private/accountTab/referralScreen';
import TabNavigator from './tabNavigator';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * Public authentication stack + Private MainTabs (floating rounded bottom tabs).
 */
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
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
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ animation: 'fade', animationDuration: 350 }}
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
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
