import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Platform,
  ScrollView,
  Share,
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
import { apiCall } from '../../../api/client';
import { useAuth } from '../../../context/authContext';

function rupee(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function ReferralScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 16 : 20;

  const { user, refreshUser, referralOffer } = useAuth();
  const [copied, setCopied] = useState(false);
  const [feed, setFeed] = useState(null);
  const [codeReady, setCodeReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      (async () => {
        const [res] = await Promise.all([
          apiCall('get', '/referrals/me'),
          refreshUser?.(),
        ]);
        if (!live) return;
        if (res?.success && res.data) setFeed(res.data);
        setCodeReady(true);
      })();
      return () => {
        live = false;
      };
    }, [refreshUser]),
  );

  const referralCode = feed?.referralCode || user?.referralCode || '';
  const signupBonus = feed?.refereeSignupBonus ?? referralOffer?.refereeSignupBonus;
  const orderReward = feed?.referrerOrderReward ?? referralOffer?.referrerOrderReward;
  const rewardKnown = Number.isFinite(Number(orderReward));
  const signupKnown = Number.isFinite(Number(signupBonus));
  const referrals = feed?.referrals || [];
  const shareMessage = feed?.shareMessage
    || `Shop handcrafted pure silk handloom sarees at Tripuraa Sangrahah! Use my referral code ${referralCode} to get instant cash on signup: https://tripuraa.com`;
  const howItWorks = [
    { id: 'step-1', icon: 'gift-outline', text: 'Invite your friend to sign up with your code' },
    { id: 'step-2', icon: 'wallet-outline', text: signupKnown ? `They get ${rupee(signupBonus)} store cash as soon as they verify` : 'They get store cash as soon as they verify' },
    { id: 'step-3', icon: 'bag-handle-outline', text: rewardKnown ? `You get ${rupee(orderReward)} when they place their first order` : 'You get store cash when they place their first order' },
  ];

  const handleCopy = async () => {
    if (!referralCode) return;
    const clipboard = require('react-native').Clipboard;
    if (clipboard?.setString && referralCode) {
      clipboard.setString(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }
    try {
      await Share.share({ message: referralCode });
    } catch {
      // The customer closed the share sheet.
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Tripuraa Sangrahah Rewards',
        message: shareMessage,
      });
    } catch {
      // User cancelled share
    }
  };

  return (
    <GradientBackground idPrefix="referral_" className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Unified Screen Header */}
      <ScreenHeader
        title="Refer & Earn"
        onBackPress={() => navigation?.goBack?.()}
        backgroundColor="transparent"
        titleStyle={{ fontFamily: 'Manrope-Bold' }}
      />

      {/* ===================================================================
          SCROLLABLE CONTENT
          =================================================================== */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: hPadding,
            paddingBottom: Math.max(insets.bottom + 24, 36),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* ===================================================================
            2. MAIN HEADLINE (Left Aligned)
            =================================================================== */}
        <View style={styles.headlineSection}>
          <Text style={styles.headlineText}>
            Refer Your Friend &{'\n'}Earn {rewardKnown ? rupee(orderReward) : '…'}
          </Text>
        </View>

        {/* ===================================================================
            3. CODE & SHARE CARD
            =================================================================== */}
        <View style={styles.shareCard}>
          {/* Unique Referral Code Box */}
          <View style={styles.codeBox}>
            <Text style={styles.codeText} numberOfLines={1} selectable={true}>
              {referralCode || (codeReady ? 'Code unavailable' : 'Loading code…')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleCopy}
              style={styles.copyTrigger}
              accessibilityRole="button"
              accessibilityLabel="Copy referral code">
              <Text
                style={[
                  styles.copyLabel,
                  copied && styles.copyLabelSuccess,
                ]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
              <Icon
                name={copied ? 'checkmark' : 'copy'}
                size={18}
                color={copied ? '#16A34A' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          {/* Share & Earn Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleShare}
            style={styles.shareEarnBtn}
            accessibilityRole="button"
            accessibilityLabel="Share and earn">
            <Text style={styles.shareEarnBtnText}>Share & Earn</Text>
          </TouchableOpacity>
        </View>

        {/* ===================================================================
            4. RUPEE REWARDS BANNER
            =================================================================== */}
        <View style={styles.rewardBanner}>
          <View style={styles.rewardBannerLeft}>
            <View style={styles.rewardBadgeRow}>
              <Icon name="wallet-outline" size={15} color="#FFFFFF" />
              <Text style={styles.rewardBadgeText}>Total Rewards</Text>
            </View>

            <Text style={styles.rewardPointsValue}>{rupee(feed?.totalRewards || 0)}</Text>
          </View>

          <View style={styles.rewardBannerRight}>
            <Icon name="trophy" size={56} color="#FFD15C" />
          </View>
        </View>

        {/* ===================================================================
            5. HOW IT WORKS CARD
            =================================================================== */}
        <View style={styles.howItWorksCard}>
          {howItWorks.map((stepItem, index) => {
            const isLast = index === howItWorks.length - 1;
            return (
              <View key={stepItem.id} style={styles.stepItemWrapper}>
                <View style={styles.stepRow}>
                  {/* Icon Column with Connecting Line */}
                  <View style={styles.stepIconCol}>
                    <View style={styles.stepCircleIcon}>
                      <Icon
                        name={stepItem.icon}
                        size={17}
                        color="#FFFFFF"
                      />
                    </View>
                    {!isLast && <View style={styles.stepConnectorDotted} />}
                  </View>

                  {/* Step Description */}
                  <View
                    style={[
                      styles.stepTextContainer,
                      !isLast && { paddingBottom: 22 },
                    ]}>
                    <Text style={styles.stepDescription}>
                      {stepItem.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ===================================================================
            6. YOUR REFERRALS LIST
            =================================================================== */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.recentSectionTitle}>Your Referrals</Text>
            <View style={styles.referralCountBadge}>
              <Text style={styles.referralCountText}>
                {referrals.length} {referrals.length === 1 ? 'Friend' : 'Friends'}
              </Text>
            </View>
          </View>

          <View style={styles.recentCard}>
            {referrals.length === 0 ? (
              <Text style={styles.emptyReferrals}>
                Friends who use your code will show up here.
              </Text>
            ) : null}
            {referrals.map((item, idx) => {
              const isLast = idx === referrals.length - 1;
              const isCompleted = item.status === 'Completed';
              const isCancelled = item.status === 'Cancelled';

              return (
                <View key={item.id}>
                  <View style={styles.recentRow}>
                    {/* Modern Avatar with Saffron Tint */}
                    <View style={styles.recentAvatar}>
                      <Text style={styles.recentAvatarText}>
                        {item.name.charAt(0)}
                      </Text>
                    </View>

                    {/* Friend Details */}
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>{item.name}</Text>
                      <Text style={styles.recentDate}>{item.date}</Text>
                    </View>

                    {/* Reward & Status Capsule Tag */}
                    <View style={styles.recentRight}>
                      <Text style={styles.recentPoints}>{item.points}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted
                            ? styles.statusBadgeCompleted
                            : isCancelled
                              ? styles.statusBadgeCancelled
                              : styles.statusBadgePending,
                        ]}>
                        <Icon
                          name={isCompleted ? 'checkmark-circle' : isCancelled ? 'close-circle' : 'time-outline'}
                          size={11}
                          color={isCompleted ? '#15803D' : isCancelled ? '#6B7280' : '#B45309'}
                        />
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCompleted
                              ? styles.statusTextCompleted
                              : isCancelled
                                ? styles.statusTextCancelled
                                : styles.statusTextPending,
                          ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!isLast && <View style={styles.recentDivider} />}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
  },

  /* -------------------------------------------------------------------------
     Headline
     ------------------------------------------------------------------------- */
  headlineSection: {
    marginBottom: 18,
  },
  headlineText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    lineHeight: 30,
    color: '#161413',
    letterSpacing: -0.3,
  },

  /* -------------------------------------------------------------------------
     Link & Share Card
     ------------------------------------------------------------------------- */
  shareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEAE4',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5DFD7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  codeText: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    color: '#161413',
    letterSpacing: 0.5,
    marginRight: 10,
  },
  copyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  copyLabel: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 15,
    color: '#000000',
    letterSpacing: -0.2,
  },
  copyLabelSuccess: {
    color: '#16A34A',
  },
  shareEarnBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  shareEarnBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },

  /* -------------------------------------------------------------------------
     Reward Points Banner
     ------------------------------------------------------------------------- */
  rewardBanner: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardBannerLeft: {
    flex: 1,
  },
  rewardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rewardBadgeText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  rewardPointsValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  rewardBannerRight: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* -------------------------------------------------------------------------
     How It Works Card
     ------------------------------------------------------------------------- */
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEAE4',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItemWrapper: {
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconCol: {
    alignItems: 'center',
    width: 36,
    marginRight: 12,
  },
  stepCircleIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  stepConnectorDotted: {
    width: 1.5,
    flex: 1,
    minHeight: 24,
    backgroundColor: '#F0D4C2',
    marginVertical: 4,
  },
  stepTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 6,
  },
  stepDescription: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: '#161413',
  },

  /* -------------------------------------------------------------------------
     Your Referrals Section
     ------------------------------------------------------------------------- */
  recentSection: {
    marginBottom: 10,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentSectionTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    color: '#161413',
    letterSpacing: -0.2,
  },
  referralCountBadge: {
    backgroundColor: '#FAF5ED',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  referralCountText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: colours.saffron || '#BF5B21',
  },
  emptyReferrals: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12.5,
    color: '#8A8277',
    paddingVertical: 16,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEAE4',
    paddingHorizontal: 16,
    paddingVertical: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentAvatarText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: colours.saffron || '#BF5B21',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#161413',
  },
  recentDate: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#8A8277',
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recentPoints: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14.5,
    color: '#15803D',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 7.5,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  statusBadgeCompleted: {
    backgroundColor: '#EDFDF2',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
  },
  statusBadgeCancelled: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
  },
  statusTextCompleted: {
    color: '#15803D',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextCancelled: {
    color: '#6B7280',
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#F5F3EF',
  },
});

export default ReferralScreen;
