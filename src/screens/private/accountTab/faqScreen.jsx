import React, { useMemo, useState } from 'react';
import {
  Linking,
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
import { useCatalog } from '../../../context/catalogContext';

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'weaves', label: 'Silks & Craft' },
  { id: 'orders', label: 'Orders & Dispatch' },
  { id: 'try_on', label: 'Virtual Try-On' },
];

function categorizeItem(item) {
  const text = `${item.question || ''} ${item.answer || ''}`.toLowerCase();
  if (text.includes('try-on') || text.includes('try on') || text.includes('virtual') || text.includes('photo')) {
    return 'try_on';
  }
  if (text.includes('shipping') || text.includes('timeline') || text.includes('return') || text.includes('exchange') || text.includes('deliver') || text.includes('order')) {
    return 'orders';
  }
  return 'weaves';
}

function FaqScreen({ navigation }) {
  const { faq, loading } = useCatalog();
  const items = Array.isArray(faq) ? faq : [];
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 16 : 20;

  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => categorizeItem(item) === activeCategory);
  }, [items, activeCategory]);

  return (
    <GradientBackground topOnly={true} className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Screen Header */}
      <ScreenHeader
        title="FAQ"
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
            1. INTRO
            =================================================================== */}
        <View style={styles.introSection}>
          <Text style={styles.introHeading}>Frequently Asked Questions</Text>
          <Text style={styles.introSubtitle}>
            Everything you need to know about our certified pure zari weaves,
            handloom certifications, virtual try-ons, and customer care.
          </Text>
        </View>

        {/* ===================================================================
            2. CATEGORY PILLS FILTER (Edge-to-Edge full screen scroll)
            =================================================================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.categoryPillsScroll, { marginHorizontal: -hPadding }]}
          contentContainerStyle={[
            styles.categoryPillsTrack,
            { paddingHorizontal: hPadding },
          ]}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ===================================================================
            3. ACCORDION CARDS (Individual, Non-Boxy Cards)
            =================================================================== */}
        <View style={styles.cardsList}>
          {loading && items.length === 0 ? (
            <SectionLoader message="Loading FAQs..." minHeight={160} />
          ) : null}

          {!loading && filteredItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="help-circle-outline" size={32} color="#B5AC9F" />
              <Text style={styles.emptyCardText}>
                No questions found in this category.
              </Text>
            </View>
          ) : null}

          {filteredItems.map((item, index) => {
            const itemId = item.id || item.question || String(index);
            const isExpanded = expandedId === itemId;

            return (
              <TouchableOpacity
                key={itemId}
                activeOpacity={0.88}
                onPress={() => toggleExpand(itemId)}
                style={[
                  styles.faqCard,
                  isExpanded && styles.faqCardExpanded,
                ]}>
                <View style={styles.questionRow}>
                  <Text
                    style={[
                      styles.questionText,
                      isExpanded && styles.questionTextExpanded,
                    ]}>
                    {item.question}
                  </Text>
                  <View
                    style={[
                      styles.chevronCircle,
                      isExpanded && styles.chevronCircleExpanded,
                    ]}>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={15}
                      color={isExpanded ? '#FFFFFF' : '#8A7F73'}
                    />
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===================================================================
            4. CONCIERGE HELP CARD (No round background, big black icon)
            =================================================================== */}
        <View style={styles.conciergeCard}>
          <Icon
            name="headset-outline"
            size={38}
            color="#161413"
            style={styles.conciergeIcon}
          />
          <View style={styles.conciergeContent}>
            <Text style={styles.conciergeTitle}>Have a unique question?</Text>
            <Text style={styles.conciergeDesc}>
              Connect directly with our master drapers for personal styling and guidance.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL('tel:6374174404')}
            style={styles.conciergeBtn}>
            <Icon name="call-outline" size={14} color="#FFFFFF" />
            <Text style={styles.conciergeBtnText}>Call Concierge</Text>
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
  introHeading: {
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
    color: '#161413',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  introSubtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12.5,
    color: '#6E675D',
    lineHeight: 18.5,
  },
  categoryPillsScroll: {
    marginBottom: 16,
  },
  categoryPillsTrack: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6DC',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryPillActive: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderColor: colours.saffron || '#BF5B21',
  },
  categoryPillText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: '#5C5449',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  cardsList: {
    gap: 10,
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
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE8E1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  faqCardExpanded: {
    borderColor: 'rgba(191, 91, 33, 0.45)',
    backgroundColor: '#FFFFFF',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#161413',
    lineHeight: 19,
    paddingRight: 10,
  },
  questionTextExpanded: {
    color: colours.saffron || '#BF5B21',
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCircleExpanded: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderColor: colours.saffron || '#BF5B21',
  },
  answerContainer: {
    marginTop: 10,
  },
  answerDivider: {
    height: 1,
    backgroundColor: '#F3EFE9',
    marginBottom: 10,
  },
  answerText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12.5,
    color: '#5C5449',
    lineHeight: 19,
  },
  conciergeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7DC',
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

export default FaqScreen;
