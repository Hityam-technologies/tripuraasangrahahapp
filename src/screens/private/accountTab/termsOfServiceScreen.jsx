import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colours from '../../../assets/colours';
import GradientBackground from '../../../components/gradientBackground';
import BackButton from '../../../components/backButton';
import { TERMS_SECTIONS } from '../../../data';

function TermsOfServiceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 16 : 20;

  return (
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header */}
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
              fontSize: isSmallDevice ? 17 : 19,
              color: '#161413',
              letterSpacing: -0.3,
            }}>
            Terms of Service
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
        {/* Intro */}
        <Text
          style={{
            fontFamily: 'Comfortaa-Medium',
            fontSize: 12.5,
            color: '#70685E',
            lineHeight: 18,
            marginBottom: 16,
            marginLeft: 2,
          }}>
          Effective Date: November 2026 • Please read these terms carefully before commissioning or purchasing our heirloom weaves.
        </Text>

        {/* Terms Card Container */}
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
          {TERMS_SECTIONS.map((section, index) => {
            const isLast = index === TERMS_SECTIONS.length - 1;

            return (
              <View key={section.title} style={{ marginBottom: isLast ? 0 : 18 }}>
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
      </ScrollView>
    </GradientBackground>
  );
}

export default TermsOfServiceScreen;

