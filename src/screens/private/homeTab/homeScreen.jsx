import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Video, { ViewType } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../../../components/gradientBackground';
import { useTabBar } from '../../../context/tabBarContext';
import { useWishlist } from '../../../context/wishlistContext';
import SareeProductCard from '../../../components/sareeProductCard';
import CategoryStoryBar from '../../../components/categoryStoryBar';
import SearchBar from '../../../components/searchBar';
import TryOnConfirmModal from '../../../components/tryOnConfirmModal';
import { SectionLoader } from '../../../components/loadingSpinner';
import colours from '../../../assets/colours';
import { HERO_VIDEO } from '../../../assets/videos';
import { useCatalog } from '../../../context/catalogContext';
import { useLoading } from '../../../context/loadingContext';

/**
 * Build a source react-native-video can actually open.
 * Important (Android): do NOT use android.resource:// — this library's
 * isValidScheme() rejects it and the player stays blank. Use either:
 * - Metro http(s) URL in __DEV__
 * - bare raw name "kausalya_edit" so native looks up res/raw/kausalya_edit
 */
function getHeroVideoSource() {
  const resolved = Image.resolveAssetSource(HERO_VIDEO);

  if (__DEV__ && resolved?.uri && /^https?:\/\//i.test(resolved.uri)) {
    return { uri: resolved.uri };
  }

  if (Platform.OS === 'android') {
    return { uri: 'kausalya_edit' };
  }

  return HERO_VIDEO;
}

const HERO_VIDEO_SOURCE = getHeroVideoSource();

function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );

  // Dynamic responsive screen dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;
  const numColumns = isTablet ? 3 : 2;

  // Responsive Hero Height (balanced golden ratio: spacious hero showcase while keeping catalog prominent)
  const heroHeight = Math.round(
    Math.min(Math.max(screenHeight * 0.34, 260), 320)
  );
  // Extend hero backdrop underneath the sheet so rounded corners never cut the video
  const heroBackdropHeight = heroHeight + 140;

  // Sheet Positions:
  // 1. Resting: sits right below the hero with 16px curve overlap
  const RESTING_Y = heroHeight - 16;
  // 2. Docked: fixed at the top right below the status bar
  const DOCKED_Y = topInset + 6;
  // Sheet container total height: aligns bottom of sheet cleanly with screen height
  const sheetHeight = screenHeight - DOCKED_Y;

  // Dynamic horizontal padding & card sizing
  const hPadding = isSmallDevice ? 12 : isTablet ? 20 : 15;
  const cardGap = isSmallDevice ? 12 : 14;
  const [cardLayout, setCardLayout] = useState('grid'); // 2 cards per row default on phones!
  const [tryOnConfirmSaree, setTryOnConfirmSaree] = useState(null);

  // Device-Responsive Column Calculation:
  // Dynamically adapts based on viewport width:
  // - Large Tablets / Desktop (>= 1200px): 3 to 4 cards in a row
  // - Medium Tablets / iPad (900px - 1199px): 3 cards in a row
  // - Small Tablets / Foldables (600px - 899px): 2 cards in a row
  // - Phones (< 600px): 1 card per row in 'wide' mode; 2 in 'grid' mode
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
    // Mobile phones (< 600px)
    return cardLayout === 'grid' ? 2 : 1;
  }, [screenWidth, cardLayout]);

  const cardWidth = useMemo(() => {
    const totalGap = cardGap * (responsiveColumns - 1);
    const availableWidth = screenWidth - hPadding * 2 - totalGap;
    return Math.floor(availableWidth / responsiveColumns);
  }, [screenWidth, hPadding, cardGap, responsiveColumns]);

  const isWide = responsiveColumns === 1;

  const { hideTabBar, showTabBar } = useTabBar();
  const isFocused = useIsFocused();
  const [isDocked, setIsDocked] = useState(false);
  const isDockedRef = useRef(false);

  // Simple hero video: muted autoplay loop, no controls / overlays
  const videoRef = useRef(null);
  const [videoSource, setVideoSource] = useState(HERO_VIDEO_SOURCE);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  const handleVideoError = useCallback(
    (err) => {
      console.warn('Hero video load error:', err);
      if (hasTriedFallback) {
        return;
      }
      setHasTriedFallback(true);
      const remote = typeof videoSource?.uri === 'string' && /^https?:\/\//i.test(videoSource.uri);
      if (remote) {
        setVideoSource(HERO_VIDEO_SOURCE);
        return;
      }
      if (Platform.OS === 'android' && videoSource?.uri === 'kausalya_edit') {
        const resolved = Image.resolveAssetSource(HERO_VIDEO);
        if (resolved?.uri) {
          setVideoSource({ uri: resolved.uri });
        }
      } else {
        setVideoSource({ uri: 'kausalya_edit' });
      }
    },
    [hasTriedFallback, videoSource],
  );

  useEffect(() => {
    const remote = hero?.isActive !== false
      && typeof hero?.videoUrl === 'string'
      && /^https?:\/\//i.test(hero.videoUrl);
    if (remote) {
      setVideoSource({ uri: hero.videoUrl });
      setHasTriedFallback(false);
      return;
    }
    if (hero) setVideoSource(HERO_VIDEO_SOURCE);
  }, [hero]);

  const handleVideoEnd = useCallback(() => {
    // Extra safety so the runway clip always loops
    videoRef.current?.seek(0);
  }, []);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { wishlist, toggleWishlist } = useWishlist();

  const innerScrollRef = useRef(null);
  const searchInputRef = useRef(null);
  const lastScrollY = useRef(0);

  // sheetAnim: 0 = Resting, 1 = Docked at top
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const dockSheet = useCallback(() => {
    setIsDocked(true);
    isDockedRef.current = true;
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  const undockSheet = useCallback(() => {
    setIsDocked(false);
    isDockedRef.current = false;
    showTabBar();
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetAnim, showTabBar]);

  // Sheet container translateY
  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RESTING_Y, DOCKED_Y],
  });

  const TRAVEL_DISTANCE = RESTING_Y - DOCKED_Y;

  // Smooth parallax translation on the hero logo & details
  const heroTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -TRAVEL_DISTANCE * 0.35],
  });

  // Soft fade on the hero logo & details when the overlay sheet docks
  const heroOpacity = sheetAnim.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [1, 0.45, 0],
  });

  // PanResponder for Header Handle & Search Bar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 7 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20) {
          // Swiped up -> dock
          dockSheet();
        } else if (gestureState.dy > 20) {
          // Swiped down -> undock
          undockSheet();
        }
      },
    })
  ).current;

  // Keep bottom tab bar reliably visible on HomeScreen
  useEffect(() => {
    if (isFocused) {
      showTabBar?.();
    }
  }, [isFocused, showTabBar]);

  // Inner Scroll Handler: hides bottom tab bar on scroll down, shows on scroll up or top
  const handleInnerScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 6 && currentY > 20) {
      // Scrolling down -> hide tab bar (goes down off-screen)
      hideTabBar?.();
    } else if (diff < -6 || currentY <= 10) {
      // Scrolling up or at top -> show tab bar
      showTabBar?.();
    }

    lastScrollY.current = currentY;
  };

  const handleInnerScrollEndDrag = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    // Pulling down past top while docked undocks back to resting
    if (currentY <= -20 && isDockedRef.current) {
      undockSheet();
    }
  };

  // Uses built-in tab `shift` animation from TabNavigator
  const goToCollections = useCallback(
    (categoryId = 'all') => {
      navigation?.navigate?.({
        name: 'CollectionsTab',
        params: {
          category: categoryId,
          timestamp: Date.now(),
        },
        merge: true,
      });
    },
    [navigation],
  );

  const handleSelectCategory = useCallback(
    (categoryId) => {
      goToCollections(categoryId);
    },
    [goToCollections],
  );

  // Top Picks: imported strictly from data file (renders any number of items given in data)
  const { sarees, categories, hero, loading, error, refresh } = useCatalog();
  const { navigateWithLoading } = useLoading();

  const openProduct = useCallback(
    (prod) => {
      navigateWithLoading(navigation, 'CardDetail', {
        sareeId: prod.id,
        product: prod,
      });
    },
    [navigation, navigateWithLoading],
  );

  const topPicksProducts = useMemo(() => {
    const featured = sarees.filter((item) => item.isFeatured);
    const list = featured.length ? featured : sarees;

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (item.weave && item.weave.toLowerCase().includes(q)) ||
        (item.fabric && item.fabric.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, sarees]);

  const filteredProducts = topPicksProducts;

  return (
    <GradientBackground idPrefix="homeOuter_" className="flex-1">
      <StatusBar
        barStyle={isDocked ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      {/* =========================================================================
          1. TOP HERO BACKDROP (Full-bleed rectangle without bottom curves)
         ========================================================================= */}
      {/* Video only — no text/controls. TextureView so it paints under the elevated sheet. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: screenWidth,
          height: heroBackdropHeight,
          zIndex: 1,
          backgroundColor: '#000000',
          overflow: 'hidden',
        }}
        pointerEvents="none">
        <Video
          ref={videoRef}
          source={videoSource}
          style={{
            width: screenWidth,
            height: heroBackdropHeight,
          }}
          resizeMode="cover"
          repeat
          muted
          paused={!isFocused}
          controls={false}
          poster={hero?.posterUrl || undefined}
          posterResizeMode="cover"
          disableFocus
          shutterColor="#000000"
          viewType={ViewType.TEXTURE}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          preventsDisplaySleepDuringVideoPlayback={false}
          onError={handleVideoError}
          onEnd={handleVideoEnd}
        />
      </View>

      {/* =========================================================================
          Top Left Brand Logo (Positioned in the top hero section)
         ========================================================================= */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: topInset + (Platform.OS === 'android' ? -20 : -2),
          left: isSmallDevice ? 2 : 4,
          zIndex: 5,
          opacity: heroOpacity,
          transform: [{ translateY: heroTranslateY }],
        }}>
        <Image
          source={
            hero?.logoUrl && /^https?:\/\//i.test(hero.logoUrl)
              ? { uri: hero.logoUrl }
              : require('../../../assets/homeLogo.png')
          }
          style={{
            width: isSmallDevice ? 175 : 210,
            height: Math.round((isSmallDevice ? 175 : 210) / (1672 / 941)),
          }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Tripuraa Sangrahah Logo"
        />
      </Animated.View>

      {/* =========================================================================
          2. BOTTOM OVERLAY SHEET (Fixed Search Bar, Scrollable Inner Content)
         ========================================================================= */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: sheetHeight,
          transform: [{ translateY: sheetTranslateY }],
          zIndex: 10,
          backgroundColor: colours.bgCenter || '#FAF7F2',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 10,
        }}>
        <GradientBackground
          idPrefix="homeSheet_"
          style={{
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            overflow: 'hidden',
          }}>
          {/* =====================================================================
              FIXED SHEET HEADER (Drag Handle + Search Bar & Filter Row)
              Stays permanently pinned at top of the sheet when docked!
             ===================================================================== */}
          <View
            {...panResponder.panHandlers}
            style={{
              backgroundColor: 'transparent',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingTop: isSmallDevice ? 10 : 12,
              paddingBottom: isSmallDevice ? 10 : 12,
            }}>
            {/* Subtle Top Drag Pill Handle */}
            <TouchableOpacity
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 30, right: 30 }}
              onPress={() => (isDockedRef.current ? undockSheet() : dockSheet())}
              style={{ alignItems: 'center', marginBottom: isSmallDevice ? 8 : 10 }}>
              <View
                style={{
                  width: 40,
                  height: 4.5,
                  borderRadius: 3,
                  backgroundColor: '#C7BCAE',
                }}
              />
            </TouchableOpacity>

            {/* Search Bar & View Changer Row */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              inputRef={searchInputRef}
              placeholder="Find your Style"
              cardLayout={cardLayout}
              onFocus={() => {
                if (!isDockedRef.current) {
                  dockSheet();
                }
              }}
              onToggleLayout={() => {
                if (!isDockedRef.current) {
                  dockSheet();
                }
                setCardLayout((prev) => (prev === 'grid' ? 'wide' : 'grid'));
              }}
              style={{
                paddingHorizontal: hPadding,
              }}
            />
          </View>

          {/* =====================================================================
            SCROLLABLE INNER CONTENT (For You + Category Tabs + Products Grid)
            Scrolls freely while the header above remains fixed!
           ===================================================================== */}
          <Animated.ScrollView
            ref={innerScrollRef}
            style={{ flex: 1 }}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: hPadding,
              paddingTop: 4,
              paddingBottom: 110, // Full clearance so last cards scroll comfortably above floating bottom tab bar
            }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleInnerScroll}
            onScrollBeginDrag={() => {
              if (!isDockedRef.current) {
                dockSheet();
              }
            }}
            onScrollEndDrag={handleInnerScrollEndDrag}
            bounces={true}
            overScrollMode="always">
            {/* =====================================================================
              CATEGORY SECTION HEADER (Heading: Category, Action: See all)
             ===================================================================== */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Comfortaa-Bold',
                  fontSize: isSmallDevice ? 19 : 21,
                  color: '#161413',
                  letterSpacing: -0.3,
                }}>
                Category
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => goToCollections('all')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 13,
                    color: colours.saffron || '#BF5B21',
                  }}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {/* =====================================================================
              CATEGORY STORY BAR (Tap category -> navigates directly to Search/Collections)
             ===================================================================== */}
            {error && !loading ? (
              <Text className="font-manrope text-sm text-blue-600 mb-3" onPress={refresh}>
                {`${error} Tap to retry.`}
              </Text>
            ) : null}
            <CategoryStoryBar
              categories={categories}
              activeCategory="all"
              onSelectCategory={handleSelectCategory}
              style={{
                marginHorizontal: -hPadding,
                marginBottom: 16,
              }}
              contentContainerStyle={{
                paddingHorizontal: hPadding,
              }}
            />

            {/* =====================================================================
              SECTION HEADER: TOP PICKS (Fixed Curated Selection)
             ===================================================================== */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <Text
                style={{
                  fontFamily: 'Comfortaa-Bold',
                  fontSize: isSmallDevice ? 19 : 21,
                  color: '#161413',
                  letterSpacing: -0.3,
                }}>
                Top Picks
              </Text>
            </View>

            {/* =====================================================================
              RESPONSIVE HORIZONTAL SAREE CARDS (Fixed Curated 4 Items)
              Specially designed for landscape saree photos with color-adaptive styling
             ===================================================================== */}
            {loading && sarees.length === 0 ? (
              <SectionLoader message="Loading collection..." minHeight={220} />
            ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: responsiveColumns > 1 ? 'space-between' : 'flex-start',
                rowGap: isSmallDevice ? 12 : 14,
              }}>
              {topPicksProducts.map((item) => (
                <SareeProductCard
                  key={`${item.id}-${cardLayout}`}
                  product={item}
                  cardWidth={cardWidth}
                  isWishlisted={!!wishlist[item.id]}
                  onPress={openProduct}
                  onTryOn={(prod) => setTryOnConfirmSaree(prod)}
                  onToggleWishlist={toggleWishlist}
                  style={{
                    marginBottom: isWide ? 18 : (isSmallDevice ? 14 : 16),
                  }}
                />
              ))}
            </View>
            )}

            {/* Empty Search State */}
            {!loading && filteredProducts.length === 0 && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 40,
                }}>
                <Icon name="search-outline" size={38} color="#BFB8AF" />
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 16,
                    color: '#1E1B18',
                    marginTop: 12,
                  }}>
                  No sarees found
                </Text>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Medium',
                    fontSize: 13,
                    color: '#8F8B98',
                    marginTop: 4,
                    textAlign: 'center',
                  }}>
                  Try exploring another weave or collection
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: colours.saffron || '#BF5B21',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa-Bold',
                      fontSize: 12,
                      color: '#FFFFFF',
                    }}>
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.ScrollView>
        </GradientBackground>
      </Animated.View>

      {/* Try-On Confirmation Modal */}
      <TryOnConfirmModal
        visible={!!tryOnConfirmSaree}
        saree={tryOnConfirmSaree}
        onConfirm={() => {
          const target = tryOnConfirmSaree;
          setTryOnConfirmSaree(null);
          navigateWithLoading(navigation, 'TryOnTab', { product: target });
        }}
        onCancel={() => setTryOnConfirmSaree(null)}
      />
    </GradientBackground>
  );
}

export default HomeScreen;
