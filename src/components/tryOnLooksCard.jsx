import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import { useTryOn } from '../context/tryOnContext';
import { MASTER_COLLECTIONS, getSareeById } from '../data';

const CARD_WIDTH = 124;
const CARD_HEIGHT = 160;
const IMAGE_HEIGHT = 104;

/**
 * TryOnLooksCard Component
 *
 * Compact & resilient luxury card showcasing saved 3D virtual fittings:
 * - Fixed, bounded dimensions so images can never overflow or stretch
 * - Direct 1-tap navigation to open AI Drape Studio for any saved look
 */
function TryOnLooksCard({
  navigation,
  title = 'Your Try-On Looks',
  subtitle = 'Virtual fittings saved to your profile',
  className = '',
  style,
  onOpenStudio,
}) {
  const { tryOnLooks, userPhoto } = useTryOn();

  const handleOpenLook = (look) => {
    const fullSaree =
      getSareeById(look.sareeId) ||
      MASTER_COLLECTIONS.find((s) => s.id === look.sareeId) || {
        id: look.sareeId,
        title: look.sareeTitle,
        price: look.sareePrice,
        image: look.flatImage,
        tryOnImage: look.drapeImage,
      };

    if (onOpenStudio) {
      onOpenStudio(fullSaree);
    } else {
      navigation?.navigate?.('TryOnTab', {
        product: fullSaree,
        sareeId: look.sareeId,
      });
    }
  };

  const handleTryNew = () => {
    if (navigation?.navigate) {
      navigation.navigate('TryOnTab', {
        product: MASTER_COLLECTIONS[0],
      });
    }
  };

  return (
    <View
      className={`bg-white rounded-2xl py-3 px-3 border border-stone-200 shadow-sm ${className}`}
      style={style}>
      {/* Header Row */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center flex-1">
          <View className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 items-center justify-center">
            <Icon name="sparkles" size={13} color={colours.saffron || '#BF5B21'} />
          </View>
          <View className="ml-2 flex-1">
            <Text className="font-comfortaa-bold text-xs text-stone-900 tracking-tight">
              {title}
            </Text>
            <Text className="font-manrope text-[10.5px] text-stone-500 mt-0.5">
              {subtitle}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleTryNew}
          className="flex-row items-center px-1.5 py-0.5">
          <Text className="font-comfortaa-bold text-[11px] text-saffron mr-0.5">Studio</Text>
          <Icon name="chevron-forward" size={12} color={colours.saffron || '#BF5B21'} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Looks Slider with strictly bounded height */}
      {tryOnLooks && tryOnLooks.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}>
          {tryOnLooks.map((look) => (
            <TouchableOpacity
              key={look.id}
              activeOpacity={0.85}
              onPress={() => handleOpenLook(look)}
              style={styles.lookCard}>
              {/* Image Box - Strictly bounded dimensions */}
              <View style={styles.imageHolder}>
                <Image
                  source={look.drapeImage || userPhoto}
                  style={styles.lookImage}
                  resizeMode="cover"
                />
              </View>

              {/* Look Info */}
              <View style={styles.infoBox}>
                <Text style={styles.lookTitle} numberOfLines={1}>
                  {look.sareeTitle}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.lookPrice}>{look.sareePrice}</Text>
                  <View style={styles.tryOnPill}>
                    <Text style={styles.tryOnPillText}>Try On</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* "+ New Drape" Tile */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTryNew}
            style={styles.addTile}>
            <View style={styles.addCircle}>
              <Icon name="add" size={18} color={colours.saffron || '#BF5B21'} />
            </View>
            <Text style={styles.addTileText}>
              Try More Sarees
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="items-center py-2 px-2">
          <Text className="font-manrope text-xs text-gray-500 text-center mb-2">
            No fittings saved yet. Try on any saree in 3D to see your look!
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTryNew}
            className="flex-row items-center bg-saffron px-3 py-1.5 rounded-xl">
            <Icon name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text className="font-comfortaa-bold text-xs text-white">Open Studio</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    height: CARD_HEIGHT + 4,
  },
  scrollContent: {
    paddingRight: 4,
    gap: 10,
    alignItems: 'center',
  },
  lookCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  imageHolder: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#F5F2EB',
    position: 'relative',
    overflow: 'hidden',
  },
  lookImage: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  badgePill: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(191, 91, 33, 0.92)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  badgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  infoBox: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    flex: 1,
    justifyContent: 'center',
  },
  lookTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#1F2937',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lookPrice: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    color: '#161413',
  },
  tryOnPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tryOnPillText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 8.5,
    color: colours.saffron || '#BF5B21',
  },
  addTile: {
    width: 95,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addTileText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    color: colours.saffron || '#BF5B21',
    textAlign: 'center',
    lineHeight: 13,
  },
});

export default TryOnLooksCard;
