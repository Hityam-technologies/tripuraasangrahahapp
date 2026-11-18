import React from 'react';
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from './bottomSheet';
import { usePopup } from '../context/popupContext';
import { dash } from '../lib/text';

const GOOGLE_MAPS_ICON = require('../assets/google_maps.png');

/**
 * StoreAddressBottomSheet Component
 * 
 * Clean luxury bottom sheet presenting the flagship boutique:
 * - Direct native Google Maps app navigation (geo / maps / universal link fallback)
 * - Boutique address, landmark, and daily operating hours
 * - Pure white background (#FFFFFF)
 */
function StoreAddressBottomSheet({
  visible = false,
  onClose,
  store = {},
}) {
  const { showAlert } = usePopup();

  // Navigate directly to Google Maps app
  const handleOpenMaps = async () => {
    // Keep sheet open so when user returns from Maps, store phone, hours & landmark remain accessible
    if (store.latitude == null || store.longitude == null || !store.mapsQuery) return;
    const query = encodeURIComponent(store.mapsQuery);
    const lat = store.latitude;
    const lng = store.longitude;

    const androidGeoUrl = `geo:${lat},${lng}?q=${query}`;
    const iosMapsUrl = `maps:0,0?q=${query}&ll=${lat},${lng}`;
    const universalWebUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(androidGeoUrl);
      } catch {
        try {
          await Linking.openURL(universalWebUrl);
        } catch {
          showAlert({
            title: store.name || 'Store Location',
            message: `${store.addressLine1}, ${store.addressLine2}\n(${store.landmark})`,
          });
        }
      }
    } else if (Platform.OS === 'ios') {
      try {
        const canOpen = await Linking.canOpenURL(iosMapsUrl);
        if (canOpen) {
          await Linking.openURL(iosMapsUrl);
        } else {
          await Linking.openURL(universalWebUrl);
        }
      } catch {
        Linking.openURL(universalWebUrl).catch(() => {
          showAlert({
            title: store.name || 'Store Location',
            message: `${store.addressLine1}, ${store.addressLine2}\n(${store.landmark})`,
          });
        });
      }
    } else {
      Linking.openURL(universalWebUrl);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Store Address"
      titleStyle={{ fontFamily: 'Manrope-Bold' }}
      maxHeight="85%">
      <View style={styles.container}>
        {/* Boutique Location & Hours Card */}
        <View style={styles.storeCard}>
          <Text style={styles.storeName}>{dash(store.name)}</Text>
          <Text style={styles.addressText}>
            {dash([store.addressLine1, store.addressLine2].filter(Boolean).join(', '))}
          </Text>
          <Text style={styles.landmarkText}>{dash(store.landmark)}</Text>

          <View style={styles.divider} />

          <View style={styles.timingsRow}>
            <View style={styles.statusDot} />
            <Text style={styles.timingsText}>{dash(store.timings)}</Text>
          </View>
        </View>

        {/* Google Maps Navigation Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenMaps}
          style={styles.mapsCard}>
          <View style={styles.mapsIconWrapper}>
            <Image
              source={GOOGLE_MAPS_ICON}
              style={styles.mapsLogoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.actionTitle}>Get Directions on Google Maps</Text>
          <Icon name="chevron-forward" size={16} color="#A59B8F" />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  // Unified Location Details Card
  storeCard: {
    backgroundColor: '#FAF8F4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storeName: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: '#161413',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  addressText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12.5,
    color: '#4A433A',
    lineHeight: 18,
  },
  landmarkText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#8A7F71',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE4D8',
    marginVertical: 10,
  },
  timingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#2E7D32',
  },
  timingsText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#3E372E',
  },
  // Google Maps Themed Action Card
  mapsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E6EAE4',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 6,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mapsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F3F6F2',
    borderWidth: 1,
    borderColor: '#E3E9E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mapsLogoImage: {
    width: 20,
    height: 20,
  },
  actionTitle: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#161413',
    letterSpacing: -0.2,
  },
});

export default StoreAddressBottomSheet;
