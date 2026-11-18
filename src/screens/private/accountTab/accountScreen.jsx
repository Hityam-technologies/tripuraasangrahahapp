import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useAuth } from '../../../context/authContext';
import { useLoading } from '../../../context/loadingContext';
import { usePopup } from '../../../context/popupContext';
import { dash } from '../../../lib/text';
import { useCatalog } from '../../../context/catalogContext';

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
  const { navigateWithLoading, runWithLoading } = useLoading();
  const { showConfirm } = usePopup();
  const lastScrollY = useRef(0);

  // User Profile State
  const { user, signOut, updateProfile, refreshUser } = useAuth();
  const { store, support } = useCatalog();
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    setUserProfile({
      name: user.fullName || user.name,
      email: user.email,
      phone: user.phone,
    });
  }, [user]);

  const photoUrl = user?.avatarUrl && user.avatarUrl !== '-' ? user.avatarUrl : '';
  const nameInitial = (userProfile.name || '').trim().charAt(0).toUpperCase() || '-';

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
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        await runWithLoading(async () => {
          await signOut();
          navigation?.reset?.({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 'Signing out...');
      },
    });
  }, [navigation, signOut, runWithLoading, showConfirm]);

  // Section 1 Items: Account & Services
  const accountAndServicesItems = useMemo(() => [
    {
      id: 'profile',
      iconName: 'person-outline',
      iconSize: 22,
      label: 'Profile',
      onPress: () => setIsProfileModalOpen(true),
    },
    {
      id: 'orders',
      iconName: 'receipt-outline',
      iconSize: 21,
      label: 'My Orders',
      onPress: () => navigation?.navigate?.('Orders'),
    },
    {
      id: 'referral',
      iconName: 'gift-outline',
      iconSize: 21,
      label: 'Refer & Earn',
      badgeText: 'Earn cash',
      onPress: () => navigation?.navigate?.('Referral'),
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
      iconSize: 21,
      label: 'Support',
      onPress: () => setIsSupportModalOpen(true),
    },
  ], [navigation]);

  // Section 2 Items: Legal & Policies
  const legalAndPolicyItems = useMemo(() => [
    {
      id: 'faq',
      iconName: 'help-circle-outline',
      iconSize: 21,
      label: 'FAQ',
      onPress: () => navigateWithLoading(navigation, 'Faq', undefined, 'Opening FAQ...'),
    },
    {
      id: 'terms_of_service',
      iconName: 'information-circle-outline',
      iconSize: 21,
      label: 'Terms & Conditions',
      onPress: () =>
        navigateWithLoading(navigation, 'TermsOfService', undefined, 'Opening terms...'),
    },
    {
      id: 'user_policy',
      iconName: 'shield-checkmark-outline',
      iconSize: 20,
      label: 'Privacy Policy',
      onPress: () =>
        navigateWithLoading(navigation, 'UserPolicy', undefined, 'Opening policy...'),
    },
  ], [navigation, navigateWithLoading]);

  return (
    <GradientBackground idPrefix="account_" className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Unified Top Header */}
      <ScreenHeader
        title="Account"
      />

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
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarInitial}>{nameInitial}</Text>
            )}
          </View>

          <Text style={styles.userName}>{dash(userProfile.name)}</Text>
          {Number(user?.walletBalance) > 0 ? (
            <Text style={styles.walletLine}>
              Store cash ₹{Number(user.walletBalance).toLocaleString('en-IN')}
            </Text>
          ) : null}
        </View>

        {/* Section 1: Account & Services (Profile, Store Address, Support) */}
        <AccountMenuSection items={accountAndServicesItems} />

        {/* Section 2: Legal & Policies (FAQ, Terms of service, User policy) */}
        <AccountMenuSection items={legalAndPolicyItems} />

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={styles.logoutBtn}>
          <Icon name="log-out-outline" size={18} color="#FFFFFF" />
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
        onSave={async (updated) => {
          const result = await updateProfile({
            fullName: updated.name || updated.fullName,
            phone: updated.phone,
          });
          if (result.success) {
            setUserProfile((prev) => ({ ...prev, ...updated, name: result.data.fullName, phone: result.data.phone }));
          }
        }}
      />

      {/* Store Address Bottom Sheet */}
      <StoreAddressBottomSheet
        visible={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        store={store || undefined}
      />

      {/* Support Bottom Sheet */}
      <SupportBottomSheet
        visible={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        config={support || undefined}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarBorder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2.5,
    borderColor: colours.saffron || '#BF5B21',
    padding: 2.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  avatarInitial: {
    fontFamily: 'Manrope-Bold',
    fontSize: 32,
    color: colours.saffron || '#BF5B21',
    textAlign: 'center',
  },
  userName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 21,
    color: '#161413',
    letterSpacing: -0.3,
    lineHeight: 28,
    textAlign: 'center',
  },
  walletLine: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    color: '#BF5B21',
    marginTop: 4,
    textAlign: 'center',
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutBtnText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  footerBrand: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10.5,
    color: '#A59B8F',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default AccountScreen;
