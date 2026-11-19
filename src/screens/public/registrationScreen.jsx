import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
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
import CountryPickerBottomSheet, {
  DEFAULT_COUNTRIES,
} from '../../components/countryPickerBottomSheet';
import InputBox from '../../components/inputBox';
import { ButtonSpinner, LoadingOverlay } from '../../components/loadingSpinner';
import { useAuth } from '../../context/authContext';
import { apiCall } from '../../api/client';

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
function RegistrationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const initialReferralCode = (route?.params?.referralCode || '').trim().toUpperCase();
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [tempCode, setTempCode] = useState('');
  const [modalCodeError, setModalCodeError] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Smooth keyboard tracking to lift modal above soft keyboard
  const keyboardLiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!initialReferralCode) return undefined;
    let live = true;
    (async () => {
      const res = await apiCall('get', `/referrals/validate/${encodeURIComponent(initialReferralCode)}`);
      if (!live || !res?.success || !res?.data?.valid) return;
      setAppliedReferral({
        code: res.data.code || initialReferralCode,
        referrerName: res.data.referrerName,
        instantCash: Number(res.data.instantCash) || 0,
      });
    })();
    return () => {
      live = false;
    };
  }, [initialReferralCode]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      // Lift modal card so the entire card and Redeem button are comfortably visible above keyboard
      const keyboardHeight = e?.endCoordinates?.height || 280;
      const lift = Platform.OS === 'android' ? Math.max(120, keyboardHeight * 0.42) : Math.min(keyboardHeight * 0.45, 130);
      Animated.timing(keyboardLiftAnim, {
        toValue: -lift,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardLiftAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e?.duration || 200) : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardLiftAnim]);

  const handleCloseReferralModal = () => {
    Keyboard.dismiss();
    keyboardLiftAnim.setValue(0);
    setShowReferralModal(false);
    setModalCodeError('');
  };

  const handleOpenReferralModal = (code = '') => {
    Keyboard.dismiss();
    setTempCode(code);
    setModalCodeError('');
    setShowReferralModal(true);
  };

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
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const mapRegisterError = (error) => {
    const code = error?.code || '';
    const message = error?.message || '';
    if (code === 'ACCOUNT_EXISTS' || /already exists/i.test(message)) {
      return {
        field: 'email',
        text: 'An account with that email or phone already exists. Try signing in instead.',
      };
    }
    if (code === 'EMAIL_NOT_CONFIGURED' || code === 'EMAIL_SEND_FAILED') {
      return {
        field: 'form',
        text:
          message ||
          'We could not send the verification email right now. Please try again shortly.',
      };
    }
    if (code === 'VALIDATION_ERROR') {
      const detail = error?.details?.[0]?.message;
      const path = error?.details?.[0]?.path || '';
      if (path.includes('email')) return { field: 'email', text: detail || 'Enter a valid email address.' };
      if (path.includes('phone')) return { field: 'phone', text: detail || 'Enter a valid phone number.' };
      if (path.includes('password')) return { field: 'password', text: detail || 'Password does not meet requirements.' };
      if (path.includes('fullName') || path.includes('name')) {
        return { field: 'name', text: detail || 'Please enter your full name.' };
      }
      return { field: 'form', text: detail || message || 'Please check your details and try again.' };
    }
    if (code === 'TIMEOUT') {
      return {
        field: 'form',
        text:
          message ||
          'The atelier took too long to respond. Please try again in a moment.',
      };
    }
    if (code === 'NETWORK') {
      return {
        field: 'form',
        text: 'The atelier is unreachable. Check your connection and try again.',
      };
    }
    return {
      field: 'form',
      text: message || 'The account could not be created. Please try again.',
    };
  };

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
    // Require a real domain + TLD (blocks incomplete values like user@gmail.c)
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(val.trim());
  };

  const handleRedeemCode = async () => {
    const cleaned = tempCode.trim().toUpperCase();
    if (!cleaned) {
      setModalCodeError('Please enter a referral code');
      return;
    }
    if (cleaned.length < 3) {
      setModalCodeError('Referral code must be at least 3 characters');
      return;
    }

    setRedeeming(true);
    setModalCodeError('');
    try {
      const res = await apiCall('get', `/referrals/validate/${encodeURIComponent(cleaned)}`);
      if (!res?.success || !res?.data?.valid) {
        setModalCodeError(res?.error?.message || 'Invalid referral code. Please check and try again.');
        return;
      }
      Keyboard.dismiss();
      keyboardLiftAnim.setValue(0);
      setAppliedReferral({
        code: res.data.code || cleaned,
        referrerName: res.data.referrerName,
        instantCash: Number(res.data.instantCash) || 0,
      });
      setShowReferralModal(false);
      setTempCode('');
    } finally {
      setRedeeming(false);
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setTempCode('');
  };

  const handleRegister = async () => {
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

    if (!valid || submitting) return;
    const fullPhone = `${selectedCountry.code} ${phone.trim()}`;
    setFormError('');
    setSubmitting(true);
    try {
      const cleanedRefCode = appliedReferral?.code || '';
      const payload = {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        password,
      };
      if (cleanedRefCode) {
        payload.referralCode = cleanedRefCode;
      }
      const result = await register(payload);
      if (!result.success) {
        const mapped = mapRegisterError(result.error);
        setNameError('');
        setEmailError('');
        setPhoneError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setFormError('');
        if (mapped.field === 'email') setEmailError(mapped.text);
        else if (mapped.field === 'phone') setPhoneError(mapped.text);
        else if (mapped.field === 'password') setPasswordError(mapped.text);
        else if (mapped.field === 'name') setNameError(mapped.text);
        else setFormError(mapped.text);
        return;
      }
      navigation?.navigate?.('Otp', {
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        name: name.trim(),
        referralCode: cleanedRefCode || undefined,
        referrerName: appliedReferral?.referrerName || undefined,
        instantCash: appliedReferral?.instantCash || 0,
        isRegistration: true,
        isForgotPassword: false,
      });
    } finally {
      setSubmitting(false);
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
      <LoadingOverlay visible={submitting} message="Creating your account..." />

      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={!showReferralModal}
        scrollEnabled={!showReferralModal}
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
                  setFormError('');
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
                  setFormError('');
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
                  setFormError('');
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

              {/* Referral Code Link or Added Details */}
              {appliedReferral ? (
                <View style={styles.referralSuccessCard}>
                  <Text style={styles.referralSuccessTitle}>
                    Referred by {appliedReferral.referrerName}
                  </Text>
                  {appliedReferral.code ? (
                    <Text style={styles.referralSuccessCode}>
                      Code: {appliedReferral.code}
                    </Text>
                  ) : null}
                  <Text style={styles.referralSuccessCode}>
                    {appliedReferral.instantCash > 0
                      ? `₹${Number(appliedReferral.instantCash).toLocaleString('en-IN')} store cash is added when you verify your email.`
                      : 'This code will be linked when you verify your email.'}
                  </Text>
                  <TouchableOpacity onPress={handleRemoveReferral} accessibilityRole="button">
                    <Text style={styles.referralRemoveText}>Remove code</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenReferralModal('')}
                  style={styles.referralLinkBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Have a referral code">
                  <Text style={styles.referralLinkText}>
                    Have a referral code?
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Action */}
          <View className="mt-8 mb-4">
            {formError ? (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 14,
                }}>
                <Text
                  style={{
                    fontFamily: 'Manrope-Medium',
                    fontSize: 13,
                    lineHeight: 18,
                    color: '#B91C1C',
                  }}>
                  {formError}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={submitting}
              onPress={handleRegister}
              className="w-full rounded-2xl h-14 items-center justify-center mb-4 shadow-md"
              style={{
                backgroundColor: colours.primary,
                opacity: submitting ? 0.85 : 1,
              }}>
              {submitting ? (
                <ButtonSpinner />
              ) : (
                <Text
                  className="font-manrope-bold text-base leading-[22px] pr-1"
                  style={{ color: colours.white }}>
                  Verify Email & Continue
                </Text>
              )}
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

      {/* Referral Code Popup Modal */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleCloseReferralModal}>
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseReferralModal}>
          <Animated.View
            style={[
              styles.modalCard,
              { transform: [{ translateY: keyboardLiftAnim }] },
            ]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Enter Referral Code</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCloseReferralModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Close referral modal">
                  <Icon name="close" size={20} color="#7D756A" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Enter the referral code shared by your friend to link their invitation.
              </Text>

              <View style={styles.modalInputWrap}>
                <TextInput
                  value={tempCode}
                  onChangeText={(text) => {
                    setTempCode(text.replace(/[^A-Za-z0-9]/g, '').toUpperCase());
                    if (modalCodeError) setModalCodeError('');
                  }}
                  placeholder="e.g. CHAITAN1000"
                  placeholderTextColor="#A0998F"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRedeemCode}
                  style={styles.modalInput}
                />
              </View>

              {modalCodeError ? (
                <Text style={styles.modalErrorText}>{modalCodeError}</Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.88}
                disabled={redeeming}
                onPress={handleRedeemCode}
                style={[
                  styles.redeemBtn,
                  redeeming && { opacity: 0.8 },
                ]}>
                {redeeming ? (
                  <ButtonSpinner color="#FFFFFF" />
                ) : (
                  <Text style={styles.redeemBtnText}>Redeem Code</Text>
                )}
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  referralLinkBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    marginTop: 2,
    marginBottom: 6,
  },
  referralLinkText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: colours.primary || '#BF5B21',
    textDecorationLine: 'underline',
  },
  referralSuccessCard: {
    backgroundColor: '#F3FAF5',
    borderWidth: 1,
    borderColor: '#CDEBD7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  referralSuccessTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#156F3D',
  },
  referralSuccessCode: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#348655',
    marginTop: 2,
  },
  referralRemoveText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: '#156F3D',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16.5,
    color: '#161413',
  },
  modalSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12.5,
    color: '#6E675D',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInputWrap: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1.2,
    borderColor: '#ECE6DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  modalInput: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#161413',
    paddingVertical: 10,
    letterSpacing: 0.8,
  },
  modalErrorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 2,
  },
  redeemBtn: {
    backgroundColor: colours.primary || '#BF5B21',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: colours.primary || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  redeemBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default RegistrationScreen;
