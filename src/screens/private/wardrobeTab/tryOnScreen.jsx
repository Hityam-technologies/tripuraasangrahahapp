import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../../../components/screenHeader';
import GradientBackground from '../../../components/gradientBackground';
import colours from '../../../assets/colours';
import { tryOnOfferLine } from '../../../lib/text';
import { useTabBar } from '../../../context/tabBarContext';
import { useTryOn } from '../../../context/tryOnContext';
import { useCatalog } from '../../../context/catalogContext';
import { usePopup } from '../../../context/popupContext';
import TryOnPhotoModal from '../../../components/tryOnPhotoModal';

/**
 * TryOnScreen
 *
 * Dedicated Luxury AI Drape Studio:
 * - Unified ScreenHeader with Top-Right Save Look Bookmark Icon
 * - Clean user photo bar: displays user photo with simple "Change" option (no clutter)
 * - Photorealistic AI Virtual Drape and Flat Handloom Weave switcher
 * - Minimal, elegant bottom section: Saree title, weave details, and "View Details" button
 * - No price or duplicate buttons at bottom; clean and luxurious
 */
function TryOnScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth || Dimensions.get('window').width || 390;
  const isSmallDevice = screenWidth < 375;

  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 24 : 16,
  );

  const { hideTabBar, showTabBar } = useTabBar();
  const { getSaree, sarees } = useCatalog();
  const { userPhoto, saveTryOnLook, removeTryOnLook, isLookSaved, generateDrape, drapeStatus, tryOnWallet } = useTryOn();
  const { showAlert } = usePopup();
  const alive = useRef(true);
  const [drapeOverride, setDrapeOverride] = useState(null);

  const [selectedSaree, setSelectedSaree] = useState(
    () => route?.params?.product || null,
  );

  // View Mode: 'drape' (AI Virtual Fitting) or 'flat' (Flat Handloom photo)
  const [viewMode, setViewMode] = useState('drape');
  const [isScanning, setIsScanning] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  // React to incoming saree navigation params when route changes
  useEffect(() => {
    const targetProduct = route?.params?.product;
    const targetId = targetProduct?.id || route?.params?.sareeId;
    if (targetId) {
      const found = getSaree(targetId) || sarees.find((s) => s.id === targetId);
      if (found) {
        setSelectedSaree(found);
        setViewMode('drape');
        triggerDrapeScan();
      } else if (targetProduct) {
        setSelectedSaree(targetProduct);
        setViewMode('drape');
        triggerDrapeScan();
      }
    }
  }, [route?.params, getSaree, sarees]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSaree && sarees[0]) setSelectedSaree(sarees[0]);
  }, [selectedSaree, sarees]);

  // Hide tab bar on entry, restore on exit, handle hardware back
  useFocusEffect(
    useCallback(() => {
      hideTabBar?.();

      const onBackPress = () => {
        if (navigation?.canGoBack?.()) {
          navigation.goBack();
        } else {
          navigation?.navigate?.('HomeTab');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => {
        subscription.remove();
        showTabBar?.();
      };
    }, [hideTabBar, showTabBar, navigation]),
  );

  // Trigger simulated AI drape laser scanning animation
  const triggerDrapeScan = useCallback(() => {
    setIsScanning(true);
    scanAnim.setValue(0);
    Animated.timing(scanAnim, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
    });
  }, [scanAnim]);

  useEffect(() => {
    if (viewMode !== 'drape' || !selectedSaree?.id) return undefined;
    let active = true;
    setDrapeOverride(null);
    setIsScanning(true);
    generateDrape(selectedSaree.id, () => active && alive.current).then((source) => {
      if (!active || !alive.current) return;
      if (source) setDrapeOverride(source);
      setIsScanning(false);
    });
    return () => {
      active = false;
    };
  }, [viewMode, selectedSaree?.id, generateDrape]);

  // Trigger scan when changing modes
  const handleToggleViewMode = useCallback(
    (newMode) => {
      if (newMode === viewMode) return;

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.15,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      setViewMode(newMode);
      if (newMode === 'drape') {
        triggerDrapeScan();
      }
    },
    [viewMode, fadeAnim, triggerDrapeScan],
  );

  const isSavedInLooks = isLookSaved(selectedSaree?.id);

  // Toggle Save Look to profile from header save icon
  const handleSaveLook = useCallback(() => {
    if (!selectedSaree) return;

    if (isSavedInLooks) {
      removeTryOnLook(selectedSaree.id);
      showAlert({
        title: 'Look Removed',
        message: 'This drape fitting has been removed from Your Try-On Looks.',
      });
    } else {
      saveTryOnLook({
        id: `look-${selectedSaree.id}`,
        sareeId: selectedSaree.id,
        sareeTitle: selectedSaree.title || selectedSaree.name,
        sareePrice: selectedSaree.price,
        weave: selectedSaree.weave,
        drapeImage: selectedSaree.tryOnImage || selectedSaree.image,
        flatImage: selectedSaree.image,
        userPhotoSource: userPhoto,
      });

      showAlert({
        title: 'Look Saved!',
        message: 'This drape fitting has been saved to "Your Try-On Looks". You can view it anytime on Home and Wardrobe.',
        type: 'success',
      });
    }
  }, [selectedSaree, userPhoto, saveTryOnLook, removeTryOnLook, isSavedInLooks, showAlert]);

  // Active image to display
  const currentImageSource =
    viewMode === 'drape'
      ? drapeOverride || selectedSaree?.tryOnImage || selectedSaree?.image
      : selectedSaree?.image;

  const headerButtonSize = isSmallDevice ? 40 : 44;

  return (
    <GradientBackground idPrefix="tryOnStudio_" className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* =========================================================================
          1. SAME HEADER WITH SAVE ICON IN TOP RIGHT OVER GRADIENT BG
         ========================================================================= */}
      <ScreenHeader
        title="AI Drape Studio"
        onBackPress={() => {
          if (navigation?.canGoBack?.()) {
            navigation.goBack();
          } else {
            navigation?.navigate?.('HomeTab');
          }
        }}
        backgroundColor="transparent"
        rightElement={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveLook}
            accessibilityLabel={isSavedInLooks ? 'Remove from saved looks' : 'Save try on look'}
            style={[
              styles.headerSaveButton,
              {
                width: headerButtonSize,
                height: headerButtonSize,
                backgroundColor: isSavedInLooks ? '#FFF7ED' : '#FFFFFF',
                borderColor: isSavedInLooks ? (colours.saffron || '#BF5B21') : '#EDE9E2',
              },
            ]}>
            <Icon
              name={isSavedInLooks ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSavedInLooks ? (colours.saffron || '#BF5B21') : '#161413'}
            />
          </TouchableOpacity>
        }
      />

      {tryOnWallet ? (
        <Text style={styles.walletLine}>{tryOnOfferLine(tryOnWallet)}</Text>
      ) : null}

      {/* =========================================================================
          2. MINIMAL USER PHOTO BAR: PHOTO + CHANGE OPTION ONLY
         ========================================================================= */}
      <View style={styles.userPhotoRow}>
        <View style={styles.photoLeft}>
          {userPhoto ? (
            <Image
              source={userPhoto}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.photoLabel}>-</Text>
          )}
          <Text style={styles.photoLabel}>Your Drape Photo</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsPhotoModalOpen(true)}
          style={styles.changeButton}>
          <Icon
            name="camera-outline"
            size={13}
            color={colours.saffron || '#BF5B21'}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>
      {drapeStatus ? (
        <Text style={styles.photoLabel}>{drapeStatus}</Text>
      ) : null}

      {/* =========================================================================
          3. MAIN SHOWCASE CANVAS: FULL SCREEN LUXURY DRAPE STAGE
         ========================================================================= */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvasCard}>
          <Animated.View style={[{ flex: 1, width: '100%', height: '100%' }, { opacity: fadeAnim }]}>
            {currentImageSource ? (
              <Image
                source={currentImageSource}
                style={{ width: '100%', height: '100%' }}
                resizeMode={viewMode === 'drape' ? 'cover' : 'contain'}
              />
            ) : (
              <Text style={styles.photoLabel}>-</Text>
            )}
          </Animated.View>

          {/* AI Scan Beam Effect */}
          {isScanning && viewMode === 'drape' && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.scanBeam,
                {
                  transform: [
                    {
                      translateY: scanAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 360],
                      }),
                    },
                  ],
                  opacity: scanAnim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 0.95, 0.95, 0],
                  }),
                },
              ]}>
              <View style={styles.scanGlow} />
            </Animated.View>
          )}

          {/* Top-Right Sparkle Watermark Badge */}
          <View style={styles.watermarkBadge}>
            <Icon name="sparkles" size={11} color="#BF5B21" style={{ marginRight: 4 }} />
            <Text style={styles.watermarkText}>Tripuraa AI Drape</Text>
          </View>

          {/* Floating Canvas Mode Switcher: AI Virtual Drape vs Flat Handloom */}
          <View style={styles.switcherContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleToggleViewMode('drape')}
              style={[
                styles.switcherTab,
                viewMode === 'drape' ? styles.switcherTabActive : styles.switcherTabInactive,
              ]}>
              <Icon
                name="sparkles"
                size={12}
                color={viewMode === 'drape' ? '#FFFFFF' : '#6B7280'}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.switcherText,
                  viewMode === 'drape' ? styles.switcherTextActive : styles.switcherTextInactive,
                ]}>
                Virtual Drape
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleToggleViewMode('flat')}
              style={[
                styles.switcherTab,
                viewMode === 'flat' ? styles.switcherTabActive : styles.switcherTabInactive,
              ]}>
              <Icon
                name="image-outline"
                size={12}
                color={viewMode === 'flat' ? '#FFFFFF' : '#6B7280'}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.switcherText,
                  viewMode === 'flat' ? styles.switcherTextActive : styles.switcherTextInactive,
                ]}>
                Flat Weave
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================================
          4. SHORT BOTTOM DETAILS CARD: TEXT TO LEFT, VIEW DETAILS TO RIGHT
         ========================================================================= */}
      <View
        style={[
          styles.bottomCard,
          { paddingBottom: Math.max(bottomInset, 10) },
        ]}>
        <View style={styles.bottomCardRow}>
          {/* Left: Provenance and Saree Title */}
          <View style={styles.sareeTextLeft}>
            {(selectedSaree.brand || selectedSaree.weave) && (
              <Text style={styles.sareeProvenance} numberOfLines={1}>
                {[selectedSaree?.brand, selectedSaree?.weave].filter(Boolean).join(' • ') || '-'}
              </Text>
            )}
            <Text style={styles.sareeTitle} numberOfLines={1}>
              {selectedSaree.title || selectedSaree.name}
            </Text>
          </View>

          {/* Right: View Details Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              navigation?.navigate?.('CardDetail', {
                sareeId: selectedSaree.id,
                product: selectedSaree,
              });
            }}
            style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="arrow-forward" size={13} color="#FFFFFF" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2-Option Photo Selector Modal */}
      <TryOnPhotoModal
        visible={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          triggerDrapeScan();
        }}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSaveButton: {
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  walletLine: {
    textAlign: 'center',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: '#6B645C',
    marginTop: 4,
    marginBottom: 2,
  },
  userPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: 'transparent',
  },
  photoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colours.saffron || '#BF5B21',
  },
  photoLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: '#161413',
    marginLeft: 9,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9E2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  changeButtonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: colours.saffron || '#BF5B21',
  },
  canvasContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  canvasCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE9E2',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colours.saffron || '#BF5B21',
    zIndex: 10,
  },
  scanGlow: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(191, 91, 33, 0.18)',
  },
  watermarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    zIndex: 10,
  },
  watermarkText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    color: '#7C2D12',
    letterSpacing: 0.3,
  },
  switcherContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switcherTabActive: {
    backgroundColor: colours.saffron || '#BF5B21',
  },
  switcherTabInactive: {
    backgroundColor: 'transparent',
  },
  switcherText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
  },
  switcherTextActive: {
    color: '#FFFFFF',
  },
  switcherTextInactive: {
    color: '#4B5563',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EDE9E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  bottomCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sareeTextLeft: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  sareeProvenance: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9.5,
    color: '#8A8277',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  sareeTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 14.5,
    color: '#161413',
    letterSpacing: -0.2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161413',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewDetailsText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default TryOnScreen;
