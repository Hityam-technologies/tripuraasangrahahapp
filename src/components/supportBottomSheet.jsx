import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { usePopup } from '../context/popupContext';
import { dash } from '../lib/text';

const INSTAGRAM_LOGO = require('../assets/Instagramlogo.jpg');

/**
 * SupportBottomSheet Component
 * 
 * Clean & minimal client support bottom sheet:
 * - Direct app navigation for WhatsApp, Instagram, and Phone dialer
 * - Dedicated themed button styling for each platform
 * - Official Instagram logo asset from assets/instagramlogo.jpg
 * - Pure white background (#FFFFFF)
 */
function SupportBottomSheet({
  visible = false,
  onClose,
  config = {},
}) {
  const { showAlert } = usePopup();

  // Navigate directly to WhatsApp app
  const handleWhatsApp = async () => {
    const phone = config.whatsappPhone;
    if (!phone) return;
    const text = encodeURIComponent(config.whatsappMessage);
    const appUrl = `whatsapp://send?phone=${phone}&text=${text}`;
    const webUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;

    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Linking.openURL(webUrl).catch(() => {
        showAlert({
          title: 'WhatsApp',
          message: 'Unable to open WhatsApp on this device.',
        });
      });
    }
  };

  // Navigate directly to Instagram app
  const handleInstagram = async () => {
    const username = config.instagramUsername;
    if (!username) return;
    const appUrl = `instagram://user?username=${username}`;
    const webUrl = `https://www.instagram.com/${username}/`;

    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Linking.openURL(webUrl).catch(() => {
        showAlert({
          title: 'Instagram',
          message: 'Unable to open Instagram on this device.',
        });
      });
    }
  };

  // Navigate directly to Phone dialer
  const handleCallHelpline = async () => {
    if (!config.helplinePhone) return;
    const telUrl = `tel:${config.helplinePhone}`;

    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        await Linking.openURL(telUrl);
      } else {
        showAlert({
          title: 'Customer Helpline',
          message: `Toll Free: ${config.helplineDisplay}`,
        });
      }
    } catch {
      showAlert({
        title: 'Customer Helpline',
        message: `Toll Free: ${config.helplineDisplay}`,
      });
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Support"
      titleStyle={{ fontFamily: 'Manrope-Bold' }}
      maxHeight="85%">
      <View style={styles.container}>
        {/* 1. WhatsApp Button (WhatsApp Theme) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleWhatsApp}
          style={styles.whatsappCard}>
          <View style={styles.whatsappIconCircle}>
            <Icon name="logo-whatsapp" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.channelTitle}>WhatsApp</Text>
          <Icon name="chevron-forward" size={16} color="#A59B8F" />
        </TouchableOpacity>

        {/* 2. Instagram Button (Instagram Theme with Assets Logo) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleInstagram}
          style={styles.instagramCard}>
          <View style={styles.instagramIconWrapper}>
            <Image
              source={INSTAGRAM_LOGO}
              style={styles.instagramLogoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.channelTitle}>Instagram</Text>
          <Icon name="chevron-forward" size={16} color="#A59B8F" />
        </TouchableOpacity>

        {/* 3. Customer Helpline Button (Saffron Theme) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCallHelpline}
          style={styles.helplineCard}>
          <View style={styles.phoneIconCircle}>
            <Icon name="call" size={17} color="#FFFFFF" />
          </View>
          <Text style={styles.channelTitle}>Customer Helpline</Text>
          <Icon name="chevron-forward" size={16} color="#A59B8F" />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  // WhatsApp Themed Card
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#D4EED9',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  whatsappIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  // Instagram Themed Card
  instagramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#F6DCE6',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#E1306C',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  instagramIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#FAF5F7',
    borderWidth: 1,
    borderColor: '#F2D7E0',
    marginRight: 14,
  },
  instagramLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  // Helpline Themed Card
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#F4E2D7',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  phoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  channelTitle: {
    flex: 1,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#161413',
    letterSpacing: -0.2,
  },
});

export default SupportBottomSheet;
