import React, { useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colours from '../../assets/colours';
import AuthHeader from '../../components/authHeader';
import InputBox from '../../components/inputBox';
import { ButtonSpinner, LoadingOverlay } from '../../components/loadingSpinner';
import { useAuth } from '../../context/authContext';

function ResetPasswordScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const email = route?.params?.email || '';
  const code = route?.params?.code || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Use at least 8 characters and one special character.');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const result = await resetPassword({ email, code, newPassword: password });
      if (!result.success) {
        setError(result.error?.message || 'The password could not be updated.');
        return;
      }
      navigation?.reset?.({ index: 0, routes: [{ name: 'Login' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LoadingOverlay visible={loading} message="Updating password..." />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} enableOnAndroid keyboardShouldPersistTaps="handled">
        <View className="grow px-6" style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) }}>
          <AuthHeader navigation={navigation} />
          <Text className="font-manrope-extrabold text-[30px] text-gray-900 mb-2">New password</Text>
          <Text className="font-manrope text-sm text-gray-500 mb-6">Choose a new password for {email}.</Text>
          <InputBox
            label="New password"
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            error={!!error}
            errorMessage={error}
          />
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="w-full rounded-2xl h-14 items-center justify-center mt-6"
            style={{ backgroundColor: colours.primary, opacity: loading ? 0.85 : 1 }}>
            {loading ? (
              <ButtonSpinner />
            ) : (
              <Text className="font-manrope-bold text-base" style={{ color: colours.white }}>
                Update password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default ResetPasswordScreen;
