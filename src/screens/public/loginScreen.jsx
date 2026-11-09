import React, { useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../assets/colours';
import AuthHeader from '../../components/authHeader';
import InputBox from '../../components/inputBox';

/**
 * LoginScreen
 * Authentication screen with email login and email-based password reset OTP.
 */
function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setEmailError('Please enter your email to reset password');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    navigation?.navigate?.('Otp', {
      email: email.trim(),
      isForgotPassword: true,
      isRegistration: false,
    });
  };

  const handleLogin = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      console.log('Signing in with email & password:', email.trim());
      navigation?.reset?.({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}>
        <View
          className="grow justify-between px-6"
          style={{
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 24),
          }}>
          <View>
            <AuthHeader navigation={navigation} />

            <View className="mt-2 mb-6">
              <Text className="font-manrope-extrabold text-[30px] text-gray-900 mb-2 pr-1.5">
                Sign In
              </Text>
              <Text className="font-manrope text-sm leading-[22px] text-gray-500 pr-1.5">
                Welcome back! Enter your email and password to continue.
              </Text>
            </View>

            <View className="mt-2">
              <InputBox
                label="Email Address"
                placeholder="Enter your email address"
                iconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text.length > 0) setEmailError('');
                }}
                error={!!emailError}
                errorMessage={emailError}
              />

              <InputBox
                label="Password"
                placeholder="Enter your password"
                iconName="lock-closed-outline"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text) setPasswordError('');
                }}
                error={!!passwordError}
                errorMessage={passwordError}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
                rightComponent={
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleForgotPassword}
                className="self-end mt-1 mb-2">
                <Text
                  className="font-manrope-bold text-xs leading-[18px] underline pr-1"
                  style={{ color: colours.saffron }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-8 mb-4">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleLogin}
              className="w-full rounded-2xl h-14 items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: colours.primary }}>
              <Text
                className="font-manrope-bold text-base leading-[22px] pr-1"
                style={{ color: colours.white }}>
                Sign In
              </Text>
            </TouchableOpacity>

            <Text className="font-manrope text-sm leading-[22px] text-gray-500 text-center pr-1">
              Don't have an account?{' '}
              <Text
                className="font-manrope-bold text-sm leading-[22px]"
                style={{ color: colours.primary }}
                onPress={() => navigation?.navigate?.('Register')}>
                Create Account
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default LoginScreen;
