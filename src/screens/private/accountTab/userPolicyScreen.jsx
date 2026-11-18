import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
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
import { SectionLoader } from '../../../components/loadingSpinner';
import { apiCall } from '../../../api/client';

function UserPolicyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 16 : 20;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    apiCall('get', '/legal/policy').then((result) => {
      if (!live) return;
      if (result.success && result.data) setDoc(result.data);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const sections = Array.isArray(doc?.sections) ? doc.sections : [];
  const phone = doc?.contactPhone || '6374174404';

  return (
    <GradientBackground topOnly={true} className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Screen Header */}
      <ScreenHeader
        title="Privacy Policy"
        onBackPress={() => navigation.goBack()}
        backgroundColor="transparent"
        titleStyle={{ fontFamily: 'Manrope-Bold' }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: hPadding,
            paddingBottom: Math.max(insets.bottom + 28, 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* ===================================================================
            1. LAST UPDATED & INTRO
            =================================================================== */}
        <View style={styles.introSection}>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Icon name="time-outline" size={13} color="#8A7F73" />
              <Text style={styles.metaText}>
                Last updated {doc?.effectiveDate || 'November 2026'}
              </Text>
            </View>
          </View>

          {doc?.intro ? (
            <View style={styles.introCard}>
              <View style={styles.introAccentBar} />
              <Text style={styles.introText}>{doc.intro}</Text>
            </View>
          ) : null}
        </View>

        {/* ===================================================================
            2. INDIVIDUAL SECTION CARDS (No duplicate 1 2 badges)
            =================================================================== */}
        <View style={styles.sectionsContainer}>
          {loading && sections.length === 0 ? (
            <SectionLoader message="Loading privacy policy..." minHeight={160} />
          ) : null}

          {!loading && sections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="shield-outline" size={32} color="#B5AC9F" />
              <Text style={styles.emptyCardText}>Privacy policy is unavailable right now.</Text>
            </View>
          ) : null}

          {sections.map((section, index) => {
            return (
              <View
                key={section.title || String(index)}
                style={styles.sectionCard}>
                {/* Section Title (no duplicate 01 / 02 badge) */}
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {/* Section Content */}
                <View style={styles.sectionBody}>
                  <Text style={styles.sectionContentText}>{section.content}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ===================================================================
            3. CLOSING CARD
            =================================================================== */}
        {doc?.closing ? (
          <View style={styles.closingCard}>
            <View style={styles.closingContent}>
              <Text style={styles.closingTitle}>Your Data Rights & Control</Text>
              <Text style={styles.closingText}>{doc.closing}</Text>
            </View>
          </View>
        ) : null}

        {/* ===================================================================
            4. PRIVACY DESK / ASSISTANCE CARD
            =================================================================== */}
        <View style={styles.conciergeCard}>
          <Icon
            name="shield-outline"
            size={38}
            color="#161413"
            style={styles.conciergeIcon}
          />
          <View style={styles.conciergeContent}>
            <Text style={styles.conciergeTitle}>Have a privacy or deletion request?</Text>
            <Text style={styles.conciergeDesc}>
              {doc?.contactNote ||
                'To request export, modification, or immediate permanent deletion of your data or photos, reach out directly.'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`tel:${phone}`)}
            style={styles.conciergeBtn}>
            <Icon name="call-outline" size={14} color="#FFFFFF" />
            <Text style={styles.conciergeBtnText}>Call / WhatsApp {phone}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  introSection: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F2EC',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  metaText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#7A7267',
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    padding: 14,
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  introAccentBar: {
    width: 3.5,
    backgroundColor: '#16A34A',
    borderRadius: 2,
    marginRight: 12,
  },
  introText: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 12.5,
    color: '#5C5449',
    lineHeight: 18.5,
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEAE4',
  },
  emptyCardText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: '#8A8277',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE8E1',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionCardHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14.5,
    color: '#161413',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  sectionBody: {
    paddingLeft: 2,
  },
  sectionContentText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12.5,
    color: '#524B43',
    lineHeight: 19.5,
  },
  closingCard: {
    backgroundColor: '#F7FCF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7EFE2',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  closingContent: {
    flex: 1,
  },
  closingTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#15803D',
    marginBottom: 4,
  },
  closingText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: '#476353',
    lineHeight: 18,
  },
  conciergeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EFE8',
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  conciergeIcon: {
    marginBottom: 10,
  },
  conciergeContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  conciergeTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14.5,
    color: '#161413',
    marginBottom: 4,
  },
  conciergeDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: '#70685E',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  conciergeBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  conciergeBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});

export default UserPolicyScreen;
