import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../../assets/colours';
import GradientBackground from '../../../components/gradientBackground';
import BackButton from '../../../components/backButton';
import { FAQ_DATA } from '../../../data';

function FaqScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 16 : 20;

  const [expandedId, setExpandedId] = useState('1');

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
              fontSize: isSmallDevice ? 18 : 20,
              color: '#161413',
              letterSpacing: -0.3,
            }}>
            FAQ
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
          Frequently asked questions about our heritage handlooms, pure zari certifications, and boutique services.
        </Text>

        {/* FAQ Accordion List */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#EDE9E2',
            paddingVertical: 6,
            paddingHorizontal: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}>
          {FAQ_DATA.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const isLast = index === FAQ_DATA.length - 1;

            return (
              <View key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: 'Comfortaa-Bold',
                      fontSize: 13.5,
                      color: isExpanded ? (colours.saffron || '#BF5B21') : '#161413',
                      lineHeight: 19,
                      paddingRight: 10,
                    }}>
                    {item.question}
                  </Text>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={17}
                    color={isExpanded ? (colours.saffron || '#BF5B21') : '#A59B8F'}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ paddingBottom: 14, paddingTop: 2 }}>
                    <Text
                      style={{
                        fontFamily: 'Comfortaa-Medium',
                        fontSize: 12.5,
                        color: '#635B50',
                        lineHeight: 18,
                      }}>
                      {item.answer}
                    </Text>
                  </View>
                )}

                {!isLast && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#F0ECE4',
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Footer Helpline Pill */}
        <View
          style={{
            marginTop: 22,
            backgroundColor: '#FAF8F4',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#EAE1CE',
            padding: 16,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Comfortaa-Bold',
              fontSize: 13,
              color: '#161413',
              marginBottom: 4,
            }}>
            Have more questions?
          </Text>
          <Text
            style={{
              fontFamily: 'Comfortaa-Medium',
              fontSize: 11.5,
              color: '#70685E',
              textAlign: 'center',
              lineHeight: 16,
            }}>
            Our master weave concierge is available 7 days a week for personalized guidance.
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

export default FaqScreen;

