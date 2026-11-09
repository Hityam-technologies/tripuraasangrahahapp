import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../../assets/colours';
import GradientBackground from '../../../components/gradientBackground';
import ScreenHeader from '../../../components/screenHeader';
import AccountMenuSection from '../../../components/accountMenuSection';
import ProfileEditBottomSheet from '../../../components/profileEditBottomSheet';
import StoreAddressBottomSheet from '../../../components/storeAddressBottomSheet';
import SupportBottomSheet from '../../../components/supportBottomSheet';
import { useTabBar } from '../../../context/tabBarContext';
import { DEFAULT_USER_PROFILE } from '../../../data';

const GOOGLE_MAPS_ICON = require('../../../assets/google_maps.png');

/**
 * AccountScreen
 * 
 * Professional real-world architecture:
 * - Reusable AccountMenuSection component powering both menu sections separately
 * - Modular StoreAddressBottomSheet and SupportBottomSheet components
 * - Clean luxury boutique styling matching Tripuraa Sangrahah brand
 */
function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;
  const hPadding = isSmallDevice ? 16 : isTablet ? 28 : 20;

  // Floating tab bar scroll controller
  const { hideTabBar, showTabBar } = useTabBar();
  const lastScrollY = useRef(0);

  // User Profile State
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);

  // Modal Sheet Visibility States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8 && currentY > 30) {
      hideTabBar?.();
    } else if (diff < -8 || currentY <= 15) {
      showTabBar?.();
    }

    lastScrollY.current = currentY;
  };

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            navigation?.reset?.({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    );
  }, [navigation]);

  // Section 1 Items: Account & Services
  const accountAndServicesItems = useMemo(() => [
    {
      id: 'profile',
      iconName: 'person-circle-outline',
      iconSize: 17,
      label: 'Profile',
      onPress: () => setIsProfileModalOpen(true),
    },
    {
      id: 'store_address',
      iconImage: GOOGLE_MAPS_ICON,
      label: 'Store Address',
      onPress: () => setIsStoreModalOpen(true),
    },
    {
      id: 'support',
      iconName: 'headset-outline',
      iconSize: 16,
      label: 'Support',
      onPress: () => setIsSupportModalOpen(true),
    },
  ], []);

  // Section 2 Items: Legal & Policies
  const legalAndPolicyItems = useMemo(() => [
    {
      id: 'faq',
      iconName: 'help-circle-outline',
      iconSize: 17,
      label: 'FAQ',
      onPress: () => navigation?.navigate?.('Faq'),
    },
    {
      id: 'terms_of_service',
      iconName: 'information-circle-outline',
      iconSize: 17,
      label: 'Terms of service',
      onPress: () => navigation?.navigate?.('TermsOfService'),
    },
    {
      id: 'user_policy',
      iconName: 'shield-checkmark-outline',
      iconSize: 16,
      label: 'User policy',
      onPress: () => navigation?.navigate?.('UserPolicy'),
    },
  ], [navigation]);

  return (
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Unified Top Header */}
      <ScreenHeader title="Account" />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: hPadding,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces={true}>
        {/* User Profile Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBorder}>
            <Image
              source={require('../../../assets/userAvatar.jpg')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.userName}>{userProfile.name}</Text>
        </View>

        {/* Section 1: Account & Services (Profile, Store Address, Support) */}
        <AccountMenuSection items={accountAndServicesItems} />

        {/* Section 2: Legal & Policies (FAQ, Terms of service, User policy) */}
        <AccountMenuSection items={legalAndPolicyItems} />

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}>
          <Icon name="log-out-outline" size={16} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Heritage Footer */}
        <Text style={styles.footerBrand}>
          Tripuraa Sangrahah • Handcrafted in Bharat
        </Text>
      </Animated.ScrollView>

      {/* Profile Edit Bottom Sheet */}
      <ProfileEditBottomSheet
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSave={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
      />

      {/* Store Address Bottom Sheet */}
      <StoreAddressBottomSheet
        visible={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />

      {/* Support Bottom Sheet */}
      <SupportBottomSheet
        visible={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 18,
    paddingTop: 4,
  },
  avatarBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colours.saffron || '#BF5B21',
    padding: 2.5,
    backgroundColor: '#FFFFFF',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  userName: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 17,
    color: '#161413',
    letterSpacing: -0.2,
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutBtnText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#DC2626',
  },
  footerBrand: {
    fontFamily: 'Comfortaa-Medium',
    fontSize: 10.5,
    color: '#A59B8F',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default AccountScreen;
