import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colours from '../../../assets/colours';
import GradientBackground from '../../../components/gradientBackground';
import BackButton from '../../../components/backButton';
import { SectionLoader } from '../../../components/loadingSpinner';
import { apiCall } from '../../../api/client';

function UserPolicyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

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
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View
        style={{
          paddingTop: topInset + 6,
          paddingHorizontal: hPadding,
          paddingBottom: 12,
          zIndex: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <BackButton
            onPress={() => navigation.goBack()}
            sizeClass={isSmallDevice ? 'w-10 h-10' : 'w-11 h-11'}
          />

          <Text
            style={{
              fontFamily: 'Comfortaa-Bold',
              fontSize: isSmallDevice ? 16 : 18,
              color: '#161413',
              letterSpacing: -0.3,
            }}>
            Privacy Policy
          </Text>

          <View style={{ width: isSmallDevice ? 40 : 44 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: hPadding,
          paddingTop: 8,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontFamily: 'Comfortaa-Medium',
            fontSize: 12.5,
            color: '#70685E',
            lineHeight: 18,
            marginBottom: 6,
            marginLeft: 2,
          }}>
          {doc?.subtitle || 'Privacy & Data Protection — Very Important'}
        </Text>
        <Text
          style={{
            fontFamily: 'Comfortaa-Medium',
            fontSize: 12.5,
            color: '#70685E',
            lineHeight: 18,
            marginBottom: 16,
            marginLeft: 2,
          }}>
          Last updated: {doc?.effectiveDate || 'November 2026'}
          {doc?.intro ? `\n\n${doc.intro}` : ''}
        </Text>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#EDE9E2',
            padding: 18,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}>
          {loading && sections.length === 0 ? (
            <SectionLoader message="Loading policy..." minHeight={140} />
          ) : null}
          {!loading && sections.length === 0 ? (
            <Text style={{ color: '#70685E' }}>Policy is unavailable right now.</Text>
          ) : null}
          {sections.map((section, index) => {
            const isLast = index === sections.length - 1;
            return (
              <View key={section.title || String(index)} style={{ marginBottom: isLast ? 0 : 18 }}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 14,
                    color: colours.saffron || '#BF5B21',
                    marginBottom: 6,
                  }}>
                  {section.title}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Medium',
                    fontSize: 12.5,
                    color: '#4E463E',
                    lineHeight: 18.5,
                  }}>
                  {section.content}
                </Text>
                {!isLast && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#F0ECE4',
                      marginTop: 16,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {doc?.closing ? (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#F8F5EF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E8E2D5',
              padding: 14,
            }}>
            <Text
              style={{
                fontFamily: 'Manrope-Medium',
                fontSize: 12.5,
                color: '#5C4633',
                lineHeight: 18,
              }}>
              {doc.closing}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Linking.openURL(`tel:${phone}`)}
          style={{ marginTop: 14, alignSelf: 'flex-start' }}>
          <Text
            style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 13,
              color: colours.saffron || '#BF5B21',
            }}>
            Call / WhatsApp: {phone}
          </Text>
        </TouchableOpacity>
        {doc?.contactNote ? (
          <Text
            style={{
              marginTop: 6,
              fontFamily: 'Manrope-Medium',
              fontSize: 11.5,
              color: '#8A8277',
            }}>
            {doc.contactNote}
          </Text>
        ) : null}
      </ScrollView>
    </GradientBackground>
  );
}

export default UserPolicyScreen;
