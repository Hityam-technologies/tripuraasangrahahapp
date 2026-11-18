import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../assets/colours';
import AuthHeader from '../../components/authHeader';
import { useAuth } from '../../context/authContext';

const OTP_LENGTH = 6;
const RESEND_TIMER_SECONDS = 30;

/**
 * OtpScreen - Email OTP verification screen with clean layout and subtle spam note above button.
 */
function OtpScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { verifyOtp, resendOtp } = useAuth();
  const {
    email = 'user@example.com',
    phone = '',
    referralCode = '',
    referrerName = '',
    instantCash = 0,
    isForgotPassword = false,
  } = route?.params || {};

  const titleText = isForgotPassword
    ? 'Reset Password Code'
    : 'Verify Your Email';

  const subtitleLead = isForgotPassword
    ? "We've sent a 6-digit password reset code to:"
    : "We've sent a 6-digit verification code to:";

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timerTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timerTimeout);
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handlePressBoxes = () => {
    inputRef.current?.focus();
  };

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    if (isForgotPassword) {
      setLoading(false);
      navigation?.navigate?.('ResetPassword', { email, code: otp });
      return;
    }
    const payload = { email, code: otp, purpose: 'registration' };
    if (referralCode) {
      payload.referralCode = referralCode;
    }
    const result = await verifyOtp(payload);
    setLoading(false);
    if (!result.success) {
      setError(result.error?.message || 'That code could not be verified.');
      return;
    }
    navigation?.reset?.({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(RESEND_TIMER_SECONDS);
    setError('');
    const result = await resendOtp({
      email,
      purpose: isForgotPassword ? 'forgot-password' : 'registration',
    });
    if (!result.success) setError(result.error?.message || 'A new code could not be sent.');
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

            {/* Header Section with Email on a Separate Line */}
            <View className="mt-2 mb-6">
              <Text className="font-manrope-extrabold text-[30px] leading-10 text-gray-900 mb-2 pr-1.5">
                {titleText}
              </Text>
              <Text className="font-manrope text-sm leading-[22px] text-gray-500 pr-1.5">
                {subtitleLead}
              </Text>
              {/* Email prominently displayed on its own line */}
              <Text className="font-manrope-bold text-base leading-6 text-gray-900 mt-1">
                {email}
              </Text>
              {referralCode ? (
                <View className="flex-row items-center bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 mt-2.5 self-start">
                  <Icon
                    name="checkmark-circle"
                    size={13}
                    color="#10B981"
                  />
                  <Text className="font-manrope-semibold text-xs ml-1.5 text-emerald-800">
                    {referrerName
                      ? `Referred by ${referrerName} (${referralCode})`
                      : `Referral code: ${referralCode}`}
                    {Number(instantCash) > 0 ? ` · ₹${Number(instantCash).toLocaleString('en-IN')} after verify` : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 6-Digit OTP Boxes */}
            <View className="mt-4 mb-2">
              <Pressable
                onPress={handlePressBoxes}
                className="relative w-full mb-3 items-center justify-center">
                <View className="flex-row justify-between w-full gap-1.5 pointer-events-none">
                  {Array(OTP_LENGTH)
                    .fill(0)
                    .map((_, index) => {
                      const digit = otp[index] || '';
                      const isCurrentDigit = index === otp.length;
                      const isLastDigit = index === OTP_LENGTH - 1;
                      const isFocused =
                        isInputFocused &&
                        (isCurrentDigit ||
                          (otp.length === OTP_LENGTH && isLastDigit));

                      const boxBorderColor = error
                        ? '#EF4444'
                        : isFocused
                          ? colours.primary
                          : '#E5E7EB';
                      const boxBorderWidth = isFocused ? 2 : 1;
                      const boxBgColor = error ? '#FEF2F2' : '#FFFFFF';

                      return (
                        <View
                          key={index}
                          className="flex-1 max-w-14 h-14 rounded-2xl border items-center justify-center"
                          style={{
                            borderColor: boxBorderColor,
                            borderWidth: boxBorderWidth,
                            backgroundColor: boxBgColor,
                          }}>
                          <Text className="font-manrope-extrabold text-xl leading-7 text-gray-900 pr-0.5">
                            {digit}
                          </Text>
                        </View>
                      );
                    })}
                </View>

                <TextInput
                  ref={inputRef}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ''));
                    if (text.length > 0) setError('');
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  maxLength={OTP_LENGTH}
                  keyboardType="number-pad"
                  autoFocus
                  caretHidden
                  className="absolute inset-0 opacity-[0.01] text-transparent bg-transparent"
                  selectionColor="transparent"
                  cursorColor="transparent"
                  underlineColorAndroid="transparent"
                  autoComplete="off"
                  importantForAutofill="no"
                  textContentType="none"
                  disableFullscreenUI
                />
              </Pressable>

              {error ? (
                <Text className="font-manrope-medium text-xs leading-[18px] text-red-500 mt-1 text-center pr-1">
                  {error}
                </Text>
              ) : null}

              {/* Resend Timer / Action */}
              <Text className="font-manrope text-sm leading-[22px] text-gray-500 text-center mt-6 pr-1">
                Didn't receive the email?{' '}
                {canResend ? (
                  <Text
                    className="font-manrope-bold text-sm leading-[22px]"
                    style={{ color: colours.saffron }}
                    onPress={handleResend}>
                    Resend Code
                  </Text>
                ) : (
                  <Text className="font-manrope-bold text-sm leading-[22px] text-gray-400">
                    Resend in {timer}s
                  </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Action CTA with plain text note above button */}
          <View className="mt-8 mb-4">
            <Text className="font-manrope text-xs leading-[18px] text-gray-400 text-center mb-3 pr-1">
              Can't find the code? Check your spam or promotions folder.
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleVerify}
              disabled={loading}
              className="w-full rounded-2xl h-14 items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: colours.primary }}>
              {loading ? (
                <ActivityIndicator color={colours.white} />
              ) : (
                <Text
                  className="font-manrope-bold text-base leading-[22px] pr-1"
                  style={{ color: colours.white }}>
                  Verify & Proceed
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default OtpScreen;
