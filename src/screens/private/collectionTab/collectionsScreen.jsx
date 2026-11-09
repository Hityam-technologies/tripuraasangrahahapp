import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../../assets/colours';
import GradientBackground from '../../../components/gradientBackground';
import BackButton from '../../../components/backButton';
import ScreenHeader from '../../../components/screenHeader';
import BottomSheet from '../../../components/bottomSheet';
import SareeProductCard from '../../../components/sareeProductCard';
import CategoryStoryBar from '../../../components/categoryStoryBar';
import SearchBar from '../../../components/searchBar';
import TryOnConfirmModal from '../../../components/tryOnConfirmModal';
import { useTabBar } from '../../../context/tabBarContext';
import { useWishlist } from '../../../context/wishlistContext';
import {
  APP_CATEGORIES,
  MASTER_COLLECTIONS,
  SORT_OPTIONS,
  QUICK_CHIPS,
} from '../../../data';



function CollectionsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;

  // Tab Bar Visibility Controller
  const { hideTabBar, showTabBar } = useTabBar();
  const lastScrollY = useRef(0);

  // Layout View Mode: 2-column Compact Grid as default on phones, matching HomeScreen
  const [cardLayout, setCardLayout] = useState('grid');
  const [tryOnConfirmSaree, setTryOnConfirmSaree] = useState(null);
  const hPadding = isSmallDevice ? 12 : isTablet ? 20 : 15;
  const cardGap = isSmallDevice ? 12 : 14;

  const responsiveColumns = useMemo(() => {
    if (screenWidth >= 1200) {
      return cardLayout === 'grid' ? 4 : 3;
    }
    if (screenWidth >= 900) {
      return cardLayout === 'grid' ? 3 : 2;
    }
    if (screenWidth >= 600) {
      return 2;
    }
    return cardLayout === 'grid' ? 2 : 1;
  }, [screenWidth, cardLayout]);

  const cardWidth = useMemo(() => {
    const totalGap = cardGap * (responsiveColumns - 1);
    const availableWidth = screenWidth - hPadding * 2 - totalGap;
    return Math.floor(availableWidth / responsiveColumns);
  }, [screenWidth, hPadding, cardGap, responsiveColumns]);

  const isWide = responsiveColumns === 1;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    route?.params?.category || 'all',
  );
  const [activeQuickChip, setActiveQuickChip] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const { wishlist, toggleWishlist } = useWishlist();

  // Selected Product Detail Sheet
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const mainScrollRef = useRef(null);

  // Sync route params when navigated with a product or category
  useEffect(() => {
    if (route?.params?.category !== undefined) {
      setActiveCategory(route.params.category);
      setSearchQuery('');
      setActiveQuickChip('all');
      mainScrollRef.current?.scrollTo?.({ y: 0, animated: true });
    }
    if (route?.params?.product) {
      setSelectedProduct(route.params.product);
      setQuickViewImageIndex(0);
    }
  }, [route?.params]);

  // Show tab bar on focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      showTabBar?.();
    });
    return unsubscribe;
  }, [navigation, showTabBar]);



  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = MASTER_COLLECTIONS.filter((item) => {
      // Category Filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Quick Chips Filter
      if (activeQuickChip === 'pure_zari') {
        if (!item.zari.toLowerCase().includes('pure') && !item.zari.toLowerCase().includes('gold')) {
          return false;
        }
      } else if (activeQuickChip === 'handloom') {
        if (!item.weave.toLowerCase().includes('handloom') && !item.fabric.toLowerCase().includes('handloom')) {
          return false;
        }
      } else if (activeQuickChip === 'wedding') {
        if (item.category !== 'bridal' && !item.title.toLowerCase().includes('bridal')) {
          return false;
        }
      } else if (activeQuickChip === 'under_30k') {
        if (item.numericPrice >= 30000) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesWeave = item.weave?.toLowerCase().includes(query);
        const matchesFabric = item.fabric?.toLowerCase().includes(query);
        const matchesZari = item.zari?.toLowerCase().includes(query);
        const matchesOrigin = item.origin?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand && !matchesWeave && !matchesFabric && !matchesZari && !matchesOrigin) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.numericPrice - a.numericPrice);
    }

    return result;
  }, [activeCategory, activeQuickChip, searchQuery, sortBy]);

  // Handle Scroll to hide/show bottom tab bar
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

  const handleShareProduct = async (product) => {
    try {
      await Share.share({
        message: `Discover ${product.title} from Tripuraa Sangrahah - ${product.price}. Handcrafted luxury saree.`,
      });
    } catch (err) {
      // silent handle
    }
  };

  return (
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* =========================================================================
          1. LUXURY FIXED TOP HEADER (Identical ScreenHeader across Collections, Wishlist, Account)
         ========================================================================= */}
      <ScreenHeader title="Collections" />

      {/* Search Bar & Saffron View Changer Component */}
      <View style={{ paddingHorizontal: hPadding, paddingBottom: 10 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search weaves, silks, zaris..."
          cardLayout={cardLayout}
          onToggleLayout={() => setCardLayout((prev) => (prev === 'grid' ? 'wide' : 'grid'))}
        />
      </View>

      {/* =========================================================================
          2. SCROLLABLE CATALOG FEED WITH STICKY 2ND FILTER BAR
         ========================================================================= */}
      <Animated.ScrollView
        ref={mainScrollRef}
        style={{ flex: 1 }}
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        overScrollMode="always"
        contentContainerStyle={{
          paddingBottom: 130, // Clearance for floating bottom navigation bar
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces={true}>
        {/* =====================================================================
            [CHILD 0] CATEGORY STORY BUTTONS (Shared Identical Component with HomeScreen)
           ===================================================================== */}
        <View style={{ paddingTop: 8, marginBottom: 14 }}>
          <CategoryStoryBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            contentContainerStyle={{
              paddingHorizontal: hPadding,
            }}
          />
        </View>

        {/* =====================================================================
            [CHILD 1] 2ND FILTER BAR & SORT STRIP (STICKY: GETS FIXED ON TOP WHEN SCROLLED)
           ===================================================================== */}
        <View
          style={{
            paddingTop: 6,
            paddingBottom: 8,
            zIndex: 10,
          }}>
          <ScrollView
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: hPadding,
              gap: 8,
            }}>
            {/* Sort Pill */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                setSortBy((prev) => {
                  if (prev === 'featured') return 'price_asc';
                  if (prev === 'price_asc') return 'price_desc';
                  return 'featured';
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6.5,
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E8E4DC',
                gap: 5,
              }}>
              <Icon name="swap-vertical" size={13} color={colours.saffron || '#BF5B21'} />
              <Text
                style={{
                  fontFamily: 'Comfortaa-Bold',
                  fontSize: 11.5,
                  color: '#161413',
                }}>
                {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
              </Text>
            </TouchableOpacity>

            {/* Quick Filter Chips */}
            {QUICK_CHIPS.map((chip) => {
              const isChipActive = activeQuickChip === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  activeOpacity={0.75}
                  onPress={() => setActiveQuickChip(chip.id)}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 6.5,
                    borderRadius: 20,
                    backgroundColor: isChipActive
                      ? colours.saffronSoft || '#FDF2EB'
                      : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isChipActive
                      ? colours.saffron || '#BF5B21'
                      : '#E8E4DC',
                  }}>
                  <Text
                    style={{
                      fontFamily: isChipActive ? 'Comfortaa-Bold' : 'Comfortaa-Medium',
                      fontSize: 11.5,
                      color: isChipActive
                        ? colours.saffron || '#BF5B21'
                        : '#5E574E',
                    }}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* =====================================================================
            [CHILD 2] SCROLLABLE CONTENT (Results Counter & Products Grid Below)
           ===================================================================== */}
        <View style={{ paddingTop: 8 }}>
          {/* Results Counter & Active Category Subhead */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: hPadding,
              marginBottom: 12,
            }}>
            <Text
              style={{
                fontFamily: 'Comfortaa-Bold',
                fontSize: 13,
                color: '#38322B',
                letterSpacing: -0.2,
              }}>
              {filteredProducts.length} Heirloom {filteredProducts.length === 1 ? 'Weave' : 'Weaves'}
            </Text>

            {(activeCategory !== 'all' || activeQuickChip !== 'all' || searchQuery.length > 0) && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setActiveCategory('all');
                  setActiveQuickChip('all');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 11.5,
                    color: colours.saffron || '#BF5B21',
                  }}>
                  Reset All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* =====================================================================
              PRODUCT FEED (Clean Responsive Saree Grid with Generous Gaps)
             ===================================================================== */}
          <View
            style={{
              paddingHorizontal: hPadding,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: responsiveColumns > 1 ? 'space-between' : 'flex-start',
              rowGap: isSmallDevice ? 12 : 14,
            }}>
            {filteredProducts.map((item) => (
              <SareeProductCard
                key={`${item.id}-${cardLayout}`}
                product={item}
                cardWidth={cardWidth}
                isWishlisted={!!wishlist[item.id]}
                onPress={(prod) => {
                  navigation?.navigate?.('CardDetail', {
                    product: prod,
                    sareeId: prod.id,
                  });
                }}
                onTryOn={(prod) => {
                  setTryOnConfirmSaree(prod);
                }}
                onToggleWishlist={toggleWishlist}
                style={{
                  marginBottom: isWide ? 18 : (isSmallDevice ? 14 : 16),
                }}
              />
            ))}
          </View>

          {/* =====================================================================
              EMPTY SEARCH / FILTER STATE
             ===================================================================== */}
          {filteredProducts.length === 0 && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 50,
                paddingHorizontal: 24,
              }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: '#F4EFE6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                <Icon name="search-outline" size={32} color="#8F8B98" />
              </View>
              <Text
                style={{
                  fontFamily: 'Comfortaa-Bold',
                  fontSize: 16,
                  color: '#161413',
                  marginBottom: 6,
                  textAlign: 'center',
                }}>
                No Weaves Found
              </Text>
              <Text
                style={{
                  fontFamily: 'Comfortaa-Medium',
                  fontSize: 12.5,
                  color: '#7C756B',
                  textAlign: 'center',
                  lineHeight: 18,
                  marginBottom: 20,
                }}>
                We couldn't find matching sarees for your current search or filters. Try adjusting your selections.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveCategory('all');
                  setActiveQuickChip('all');
                  setSearchQuery('');
                }}
                style={{
                  backgroundColor: colours.saffron || '#BF5B21',
                  paddingHorizontal: 22,
                  paddingVertical: 10,
                  borderRadius: 22,
                }}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 12.5,
                    color: '#FFFFFF',
                  }}>
                  Clear All Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* =========================================================================
          3. PRODUCT QUICK VIEW BOTTOM SHEET
         ========================================================================= */}
      <BottomSheet
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        maxHeight="88%">
        {selectedProduct && (
          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Saree Multi-Photo Carousel */}
              <View
                style={{
                  width: '100%',
                  height: 230,
                  backgroundColor: '#FFFFFF',
                  position: 'relative',
                }}>
                {selectedProduct.images && selectedProduct.images.length > 1 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(
                        e.nativeEvent.contentOffset.x / screenWidth,
                      );
                      setQuickViewImageIndex(idx);
                    }}>
                    {selectedProduct.images.map((img, idx) => (
                      <View
                        key={idx}
                        style={{ width: screenWidth, height: 230 }}>
                        <Image
                          source={img}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Image
                    source={selectedProduct.image || selectedProduct.images?.[0]}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )}

                {/* Close Pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedProduct(null)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 14,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 2,
                  }}>
                  <Icon name="close" size={18} color="#161413" />
                </TouchableOpacity>

                {/* Photo Indicators */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 0,
                      right: 0,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 4,
                    }}>
                    {selectedProduct.images.map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: quickViewImageIndex === i ? 12 : 4,
                          height: 3,
                          borderRadius: 1.5,
                          backgroundColor:
                            quickViewImageIndex === i
                              ? colours.saffron || '#BF5B21'
                              : 'rgba(255, 255, 255, 0.7)',
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Saree Metadata & Provenance */}
              <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa-Bold',
                      fontSize: 12,
                      color: colours.saffron || '#BF5B21',
                      letterSpacing: 0.5,
                    }}>
                    {selectedProduct.brand?.toUpperCase()}
                  </Text>

                  <Text
                    style={{
                      fontFamily: 'Manrope-Bold',
                      fontSize: 20,
                      color: '#161413',
                    }}>
                    {selectedProduct.price}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 16.5,
                    color: '#161413',
                    marginBottom: 8,
                    lineHeight: 22,
                  }}>
                  {selectedProduct.title}
                </Text>

                {/* Provenance Pills Grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 12,
                  }}>
                  <View
                    style={{
                      backgroundColor: '#F7F5F0',
                      paddingHorizontal: 10,
                      paddingVertical: 4.5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#EDE9E2',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Comfortaa-Medium',
                        fontSize: 10.5,
                        color: '#5E574E',
                      }}>
                      Weave: {selectedProduct.weave}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: '#F7F5F0',
                      paddingHorizontal: 10,
                      paddingVertical: 4.5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#EDE9E2',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Comfortaa-Medium',
                        fontSize: 10.5,
                        color: '#5E574E',
                      }}>
                      Fabric: {selectedProduct.fabric}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: '#F7F5F0',
                      paddingHorizontal: 10,
                      paddingVertical: 4.5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#EDE9E2',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Comfortaa-Medium',
                        fontSize: 10.5,
                        color: '#5E574E',
                      }}>
                      Zari: {selectedProduct.zari}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Regular',
                    fontSize: 12,
                    color: '#6E675D',
                    lineHeight: 18,
                    marginBottom: 16,
                  }}>
                  {selectedProduct.description}
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 10,
                gap: 10,
                borderTopWidth: 1,
                borderTopColor: '#F0ECE4',
              }}>
              {/* Wishlist Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleWishlist(selectedProduct.id)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#EDE9E2',
                }}>
                <Icon
                  name={wishlist[selectedProduct.id] ? 'heart' : 'heart-outline'}
                  size={20}
                  color={wishlist[selectedProduct.id] ? (colours.saffron || '#BF5B21') : '#161413'}
                />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleShareProduct(selectedProduct)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#EDE9E2',
                }}>
                <Icon name="share-outline" size={20} color="#161413" />
              </TouchableOpacity>

              {/* Main AI Try On Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  const prod = selectedProduct;
                  setTryOnConfirmSaree(prod);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colours.saffron || '#BF5B21',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 7,
                  shadowColor: colours.saffron || '#BF5B21',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.35,
                  shadowRadius: 6,
                  elevation: 3,
                }}>
                <Icon name="camera-outline" size={17} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 13,
                    color: '#FFFFFF',
                    letterSpacing: 0.3,
                  }}>
                  Try On With AI
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheet>

      {/* Try-On Confirmation Modal */}
      <TryOnConfirmModal
        visible={!!tryOnConfirmSaree}
        saree={tryOnConfirmSaree}
        onConfirm={() => {
          const target = tryOnConfirmSaree;
          setTryOnConfirmSaree(null);
          navigation?.navigate?.('TryOnTab', { product: target });
        }}
        onCancel={() => setTryOnConfirmSaree(null)}
      />
    </GradientBackground>
  );
}

export default CollectionsScreen;
