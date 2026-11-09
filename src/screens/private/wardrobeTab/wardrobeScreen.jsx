import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
import ScreenHeader from '../../../components/screenHeader';
import BottomSheet from '../../../components/bottomSheet';
import SareeProductCard from '../../../components/sareeProductCard';
import TryOnConfirmModal from '../../../components/tryOnConfirmModal';
import { useWardrobe } from '../../../context/wardrobeContext';
import { useTryOn } from '../../../context/tryOnContext';
import { useTabBar } from '../../../context/tabBarContext';
import { getSareeById, MASTER_COLLECTIONS } from '../../../data';

/**
 * WardrobeScreen
 *
 * Luxury Haute-Couture Wardrobe:
 * - Segmented Top Toggle:
 *     1. "Saved Sarees (N)" - Curated handlooms bookmarked by user
 *     2. "Try-On Looks (M)" - High-fashion personal lookbook of user's 3D virtual fittings
 * - Responsive Grid & Wide showcase view mode
 * - 1-tap jump to AI 3D Drape Studio and full saree details
 */
function WardrobeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  );
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 24 : 16,
  );

  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const isTablet = screenWidth >= 600;

  // Active Wardrobe Section: 'saved' (Wishlisted Sarees) | 'tryon' (Saved Try-On Looks)
  const [wardrobeSection, setWardrobeSection] = useState('saved');

  // View Layout Changer: 'grid' (2 columns) or 'wide' (1 full-width column)
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

  const isWide = responsiveColumns === 1;

  const cardWidth = useMemo(() => {
    const totalGap = cardGap * (responsiveColumns - 1);
    const availableWidth = screenWidth - hPadding * 2 - totalGap;
    return Math.floor(availableWidth / responsiveColumns);
  }, [screenWidth, hPadding, cardGap, responsiveColumns]);

  // Global Wardrobe & TryOn Contexts
  const { wishlist, wishlistItems, toggleWishlist, removeFromWishlist } =
    useWardrobe();
  const { tryOnLooks, removeTryOnLook, userPhoto } = useTryOn();
  const { hideTabBar, showTabBar } = useTabBar();
  const lastScrollY = useRef(0);

  // Restore tab bar on screen focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      showTabBar?.();
    });
    return unsubscribe;
  }, [navigation, showTabBar]);

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 6 && currentY > 20) {
      hideTabBar?.();
    } else if (diff < -6 || currentY <= 10) {
      showTabBar?.();
    }

    lastScrollY.current = currentY;
  };

  // Selected Saree for Product Details BottomSheet
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);

  const hasItems =
    wardrobeSection === 'saved'
      ? wishlistItems.length > 0
      : tryOnLooks.length > 0;

  const handleRemoveLook = (sareeId, title) => {
    Alert.alert(
      'Remove Look',
      `Remove "${title}" from your saved try-on looks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTryOnLook(sareeId),
        },
      ],
    );
  };

  return (
    <GradientBackground>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Unified ScreenHeader with View Changer in top right */}
      <ScreenHeader
        title="My Wardrobe"
        rightElement={
          hasItems ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setCardLayout((prev) => (prev === 'grid' ? 'wide' : 'grid'))
              }
              style={{
                width: isSmallDevice ? 40 : 44,
                height: isSmallDevice ? 40 : 44,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#EDE9E2',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${cardLayout === 'grid' ? 'wide showcase' : 'compact grid'
                } view`}>
              <Icon
                name={cardLayout === 'grid' ? 'albums-outline' : 'grid-outline'}
                size={isSmallDevice ? 18 : 20}
                color={colours.saffron || '#BF5B21'}
              />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* =========================================================================
          1. SEGMENTED SECTION TOGGLE: SAVED SAREES VS TRY-ON LOOKS
         ========================================================================= */}
      <View
        style={{
          paddingHorizontal: hPadding,
          marginBottom: 14,
        }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#EFEBE3',
            borderRadius: 16,
            padding: 3,
          }}>
          {/* Tab 1: Saved Sarees */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setWardrobeSection('saved')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                wardrobeSection === 'saved' ? '#FFFFFF' : 'transparent',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: wardrobeSection === 'saved' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: wardrobeSection === 'saved' ? 2 : 0,
            }}>
            <Text
              style={{
                fontFamily:
                  wardrobeSection === 'saved'
                    ? 'Comfortaa-Bold'
                    : 'Comfortaa-Medium',
                fontSize: isSmallDevice ? 11.5 : 12.5,
                color:
                  wardrobeSection === 'saved'
                    ? (colours.saffron || '#BF5B21')
                    : '#6B5E51',
              }}>
              Saved Sarees ({wishlistItems.length})
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Try-On Looks */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setWardrobeSection('tryon')}
            style={{
              flex: 1,
              flexDirection: 'row',
              paddingVertical: 9,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                wardrobeSection === 'tryon' ? '#FFFFFF' : 'transparent',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: wardrobeSection === 'tryon' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: wardrobeSection === 'tryon' ? 2 : 0,
            }}>
            <Icon
              name="sparkles"
              size={12}
              color={
                wardrobeSection === 'tryon'
                  ? (colours.saffron || '#BF5B21')
                  : '#8A8275'
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontFamily:
                  wardrobeSection === 'tryon'
                    ? 'Comfortaa-Bold'
                    : 'Comfortaa-Medium',
                fontSize: isSmallDevice ? 11.5 : 12.5,
                color:
                  wardrobeSection === 'tryon'
                    ? (colours.saffron || '#BF5B21')
                    : '#6B5E51',
              }}>
              Try-On Looks ({tryOnLooks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================================
          2. MAIN CONTENT SCROLLVIEW
         ========================================================================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingBottom: bottomInset + 88,
          paddingTop: 2,
        }}>
        {/* =====================================================================
            VIEW 1: SAVED SAREES (Wishlist Grid)
           ===================================================================== */}
        {wardrobeSection === 'saved' && (
          <>
            {wishlistItems.length > 0 ? (
              <View
                style={{
                  paddingHorizontal: hPadding,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent:
                    responsiveColumns > 1 ? 'space-between' : 'flex-start',
                  rowGap: isSmallDevice ? 12 : 14,
                }}>
                {wishlistItems.map((item) => (
                  <SareeProductCard
                    key={`${item.id}-${cardLayout}`}
                    product={item}
                    cardWidth={cardWidth}
                    isWishlisted={!!wishlist[item.id]}
                    showRemoveButton={true}
                    onRemoveFromWishlist={removeFromWishlist}
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
                      marginBottom: isWide ? 18 : (isSmallDevice ? 12 : 14),
                    }}
                  />
                ))}
              </View>
            ) : (
              /* Clean Empty State for Saved Sarees */
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 70,
                  paddingHorizontal: 24,
                }}>
                <View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: '#EFEBE3',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                    marginBottom: 18,
                  }}>
                  <Icon
                    name="heart-outline"
                    size={38}
                    color={colours.saffron || '#BF5B21'}
                  />
                </View>

                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 19,
                    color: colours.textPrimary || '#1E1B18',
                    textAlign: 'center',
                  }}>
                  Your Saved Sarees is Empty
                </Text>

                <Text
                  style={{
                    fontFamily: 'Comfortaa-Regular',
                    fontSize: 12.5,
                    color: '#6B5E51',
                    textAlign: 'center',
                    marginTop: 8,
                    lineHeight: 19,
                    maxWidth: 290,
                  }}>
                  Explore our authentic handloom collections and tap the heart icon on any saree to curate your wardrobe.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation?.navigate?.('CollectionsTab')}
                  style={{
                    backgroundColor: colours.saffron || '#BF5B21',
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 24,
                    marginTop: 24,
                    shadowColor: colours.saffron || '#BF5B21',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa-Bold',
                      fontSize: 13.5,
                      color: '#FFFFFF',
                      letterSpacing: 0.3,
                    }}>
                    Explore Collections
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* =====================================================================
            VIEW 2: MY TRY-ON LOOKS (Personal Haute-Couture Lookbook)
           ===================================================================== */}
        {wardrobeSection === 'tryon' && (
          <>
            {tryOnLooks.length > 0 ? (
              <View
                style={{
                  paddingHorizontal: hPadding,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent:
                    responsiveColumns > 1 ? 'space-between' : 'flex-start',
                  rowGap: isSmallDevice ? 12 : 14,
                }}>
                {tryOnLooks.map((look) => {
                  const fullSaree =
                    getSareeById(look.sareeId) ||
                    MASTER_COLLECTIONS.find((s) => s.id === look.sareeId) || {
                      id: look.sareeId,
                      title: look.sareeTitle,
                      price: look.sareePrice,
                      image: look.flatImage,
                      tryOnImage: look.drapeImage,
                      weave: look.weave,
                    };

                  return (
                    <View
                      key={look.id}
                      style={{
                        width: cardWidth,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 18,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#EFECE6',
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                        marginBottom: isWide ? 18 : (isSmallDevice ? 12 : 14),
                      }}>
                      {/* Lookbook Drape Portrait - Tap to View Details */}
                      <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() => {
                          navigation?.navigate?.('TryOnTab', {
                            product: fullSaree,
                            sareeId: look.sareeId,
                          });
                        }}
                        style={{
                          width: '100%',
                          aspectRatio: isWide ? 16 / 11 : 3 / 4,
                          backgroundColor: '#F8F6F2',
                          position: 'relative',
                        }}>
                        <Image
                          source={look.drapeImage || userPhoto}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>

                      {/* Card Actions: Studio & Details */}
                      <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', gap: 6 }}>
                        {/* Open in Studio Button */}
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => {
                            navigation?.navigate?.('TryOnTab', {
                              product: fullSaree,
                              sareeId: look.sareeId,
                            });
                          }}
                          style={{
                            flex: 1,
                            height: 32,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colours.saffron || '#BF5B21',
                            borderRadius: 10,
                          }}>
                          <Icon
                            name="sparkles"
                            size={11}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={{
                              fontFamily: 'Manrope-Bold',
                              fontSize: 11,
                              color: '#FFFFFF',
                            }}>
                            Studio
                          </Text>
                        </TouchableOpacity>

                        {/* View Saree Details Button */}
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => {
                            navigation?.navigate?.('CardDetail', {
                              product: fullSaree,
                              sareeId: look.sareeId,
                            });
                          }}
                          style={{
                            flex: 1,
                            height: 32,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F5F2EB',
                            borderWidth: 1,
                            borderColor: '#E7E2D7',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Manrope-Bold',
                              fontSize: 11,
                              color: '#44403C',
                            }}>
                            Details
                          </Text>
                          <Icon
                            name="chevron-forward"
                            size={11}
                            color="#78716C"
                            style={{ marginLeft: 2 }}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Dedicated "Remove Look" Action matching saved sarees card */}
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() =>
                          handleRemoveLook(look.sareeId, look.sareeTitle)
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: isSmallDevice ? 6 : 7.5,
                          borderTopWidth: 1,
                          borderTopColor: '#F5EFEB',
                          backgroundColor: '#FAFAF8',
                          gap: 5,
                        }}>
                        <Icon
                          name="trash-outline"
                          size={isSmallDevice ? 12 : 13.5}
                          color="#8A8277"
                        />
                        <Text
                          style={{
                            fontFamily: 'Manrope-SemiBold',
                            fontSize: isSmallDevice ? 10.5 : 11.5,
                            color: '#6E675D',
                          }}>
                          Remove Look
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              /* Clean Empty State for Try-On Looks */
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 70,
                  paddingHorizontal: 24,
                }}>
                <View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: '#EFEBE3',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                    marginBottom: 18,
                  }}>
                  <Icon
                    name="sparkles-outline"
                    size={38}
                    color={colours.saffron || '#BF5B21'}
                  />
                </View>

                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 19,
                    color: colours.textPrimary || '#1E1B18',
                    textAlign: 'center',
                  }}>
                  No Try-On Looks Saved Yet
                </Text>

                <Text
                  style={{
                    fontFamily: 'Comfortaa-Regular',
                    fontSize: 12.5,
                    color: '#6B5E51',
                    textAlign: 'center',
                    marginTop: 8,
                    lineHeight: 19,
                    maxWidth: 290,
                  }}>
                  Try on any saree from your saved list or collections to see it virtually fitted on your photo in 3D!
                </Text>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation?.navigate?.('CollectionsTab')}
                  style={{
                    backgroundColor: colours.saffron || '#BF5B21',
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 24,
                    marginTop: 24,
                    shadowColor: colours.saffron || '#BF5B21',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Comfortaa-Bold',
                      fontSize: 13.5,
                      color: '#FFFFFF',
                      letterSpacing: 0.3,
                    }}>
                    Explore Handlooms to Try On
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* =========================================================================
          3. PRODUCT QUICK VIEW BOTTOM SHEET
         ========================================================================= */}
      <BottomSheet
        visible={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setQuickViewImageIndex(0);
        }}
        title="Quick Look"
        maxHeight="88%">
        {selectedProduct && (
          <View style={{ paddingBottom: 16 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}>
              {/* Photo Showcase */}
              <View
                style={{
                  width: '100%',
                  aspectRatio: 16 / 11,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: '#F8F6F2',
                  marginBottom: 14,
                }}>
                <Image
                  source={
                    selectedProduct.images?.[quickViewImageIndex] ||
                    selectedProduct.image
                  }
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>

              {/* Saree Details */}
              <View style={{ paddingHorizontal: 4 }}>
                <Text
                  style={{
                    fontFamily: 'Comfortaa-Bold',
                    fontSize: 17,
                    color: '#161413',
                    marginBottom: 4,
                  }}>
                  {selectedProduct.title}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 16,
                    color: colours.saffron || '#BF5B21',
                    marginBottom: 10,
                  }}>
                  {selectedProduct.price}
                </Text>

                {/* Fabric & Origin tags */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 12,
                  }}>
                  <View
                    style={{
                      backgroundColor: '#F7F5F0',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
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
                      paddingVertical: 5,
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
                      Origin: {selectedProduct.origin}
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

            {/* Bottom Actions Row: Heart Toggle + Try On Drape */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 12,
                gap: 12,
                borderTopWidth: 1,
                borderTopColor: '#F0ECE4',
                backgroundColor: '#FFFFFF',
              }}>
              {/* Wishlist Heart Toggle Button */}
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
                  color={
                    wishlist[selectedProduct.id]
                      ? (colours.saffron || '#BF5B21')
                      : '#161413'
                  }
                />
              </TouchableOpacity>

              {/* Try On Drape Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  const prod = selectedProduct;
                  setTryOnConfirmSaree(prod);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colours.saffron || '#BF5B21',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colours.saffron || '#BF5B21',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.28,
                  shadowRadius: 5,
                  elevation: 3,
                }}>
                <Icon name="sparkles" size={15} color="#FFFFFF" />
                <Text
                  style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 13,
                    color: '#FFFFFF',
                    marginLeft: 6,
                  }}>
                  Try On Drape
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Try-On Confirmation Modal */}
      <TryOnConfirmModal
        visible={!!tryOnConfirmSaree}
        saree={tryOnConfirmSaree}
        onConfirm={() => {
          const target = tryOnConfirmSaree;
          setTryOnConfirmSaree(null);
          navigation?.navigate?.('TryOnTab', {
            product: target,
            sareeId: target.id,
          });
        }}
        onCancel={() => setTryOnConfirmSaree(null)}
      />
    </GradientBackground>
  );
}

export default WardrobeScreen;
