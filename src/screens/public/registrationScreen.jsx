import React, { useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../assets/colours';
import AuthHeader from '../../components/authHeader';
import CountryPickerBottomSheet, {
  DEFAULT_COUNTRIES,
} from '../../components/countryPickerBottomSheet';
import InputBox from '../../components/inputBox';

const Requirement = ({ ok, label }) => (
  <View className="flex-row items-center w-[48%]">
    <Icon
      name={ok ? 'checkmark-circle' : 'ellipse-outline'}
      size={14}
      color={ok ? colours.primary : '#9CA3AF'}
      style={{ marginRight: 4 }}
    />
    <Text
      className={`font-manrope-medium text-xs leading-4 ${
        ok ? 'text-gray-900 font-manrope-semibold' : 'text-gray-400'
      }`}>
      {label}
    </Text>
  </View>
);

/**
 * RegistrationScreen
 * Sign up screen collecting Name, Email (for OTP verification), Phone (for profile/data), and Password.
 */
function RegistrationScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [selectedCountry, setSelectedCountry] = useState(
    DEFAULT_COUNTRIES.find((c) => c.name === 'India') || DEFAULT_COUNTRIES[0],
  );
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const securityScore = [
    hasMinLength,
    hasUpper && hasLower,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleRegister = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Please enter your full name');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!phone.trim()) {
      setPhoneError('Please enter your phone number');
      valid = false;
    } else if (phone.trim().length < 6) {
      setPhoneError('Please enter a valid phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!password) {
      setPasswordError('Please create a password');
      valid = false;
    } else if (!hasMinLength) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else if (!hasSpecial) {
      setPasswordError(
        'Password must include at least one special character (!@#$)',
      );
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (valid) {
      const fullPhone = `${selectedCountry.code} ${phone.trim()}`;
      console.log('Registering user with email verification:', {
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
      });
      navigation?.navigate?.('Otp', {
        email: email.trim(),
        phone: fullPhone,
        name: name.trim(),
        isRegistration: true,
        isForgotPassword: false,
      });
    }
  };

  const strengthColor =
    securityScore <= 1
      ? '#EF4444'
      : securityScore <= 3
        ? colours.saffron
        : colours.primary;

  const strengthLabel =
    securityScore <= 1 ? 'Weak' : securityScore <= 3 ? 'Medium' : 'Strong';

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
              <Text className="font-manrope-extrabold text-[30px] leading-10 text-gray-900 mb-2 pr-1.5">
                Create Account
              </Text>
              <Text className="font-manrope text-sm leading-[22px] text-gray-500 pr-1.5">
                Join Tripuraa Sangrahah for bespoke sarees & AI virtual try-on.
              </Text>
            </View>

            <View>
              {/* Full Name */}
              <InputBox
                label="Full Name"
                placeholder="Enter your full name"
                iconName="person-outline"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text) setNameError('');
                }}
                error={!!nameError}
                errorMessage={nameError}
              />

              {/* Email Address (Receives OTP) */}
              <InputBox
                label="Email Address (OTP will be sent here)"
                placeholder="Enter your email address"
                iconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text) setEmailError('');
                }}
                error={!!emailError}
                errorMessage={emailError}
              />

              {/* Phone Number (For Profile/Data) */}
              <InputBox
                label="Phone Number"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (text) setPhoneError('');
                }}
                error={!!phoneError}
                errorMessage={phoneError}
                leftComponent={
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsPickerVisible(true)}
                    className="flex-row items-center justify-center rounded-2xl bg-white px-3.5 h-14 border border-gray-200">
                    <Text className="text-xl mr-1.5">{selectedCountry.flag}</Text>
                    <Text className="font-manrope-semibold text-xs leading-4 text-gray-800 mr-1 pr-1">
                      ({selectedCountry.code})
                    </Text>
                    <Icon name="chevron-down" size={14} color="#6B7280" />
                  </TouchableOpacity>
                }
              />

              {/* Password */}
              <InputBox
                label="Password"
                placeholder="Create a strong password"
                iconName="lock-closed-outline"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text) setPasswordError('');
                  if (confirmPassword && text === confirmPassword) {
                    setConfirmPasswordError('');
                  }
                }}
                error={!!passwordError}
                errorMessage={passwordError}
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

              {/* Password Strength Meter */}
              {password.length > 0 ? (
                <View className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-manrope-semibold text-xs leading-[18px] text-gray-700 shrink pr-1.5">
                      Password Security Strength:
                    </Text>
                    <Text
                      className="font-manrope-extrabold text-xs leading-[18px] pr-1"
                      style={{ color: strengthColor }}>
                      {strengthLabel}
                    </Text>
                  </View>

                  <View className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${(securityScore / 4) * 100}%`,
                        backgroundColor: strengthColor,
                      }}
                    />
                  </View>

                  <View className="flex-row flex-wrap justify-between gap-y-2">
                    <Requirement ok={hasMinLength} label="8+ Characters" />
                    <Requirement
                      ok={hasUpper && hasLower}
                      label="Upper & Lower case"
                    />
                    <Requirement ok={hasNumber} label="1+ Number" />
                    <Requirement ok={hasSpecial} label="1+ Symbol (!@#$)" />
                  </View>
                </View>
              ) : null}

              {/* Confirm Password */}
              <InputBox
                label="Confirm Password"
                placeholder="Confirm your password"
                iconName="lock-closed-outline"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (text === password) setConfirmPasswordError('');
                }}
                error={!!confirmPasswordError}
                errorMessage={confirmPasswordError}
                rightComponent={
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                }
              />
            </View>
          </View>

          {/* Submit Action */}
          <View className="mt-8 mb-4">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleRegister}
              className="w-full rounded-2xl h-14 items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: colours.primary }}>
              <Text
                className="font-manrope-bold text-base leading-[22px] pr-1"
                style={{ color: colours.white }}>
                Verify Email & Continue
              </Text>
            </TouchableOpacity>

            <Text
              className="font-manrope text-sm leading-[22px] text-gray-500 text-center pr-1"
              onPress={() => navigation?.goBack?.()}>
              Already have an account?{' '}
              <Text
                className="font-manrope-bold text-sm leading-[22px]"
                style={{ color: colours.primary }}>
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <CountryPickerBottomSheet
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelectCountry={(country) => setSelectedCountry(country)}
        selectedCountry={selectedCountry}
      />
    </View>
  );
}

export default RegistrationScreen;
