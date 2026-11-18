import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import { dash } from '../lib/text';

/**
 * TryOnConfirmModal
 *
 * Clean, lightweight, and elegant Try-On confirmation modal:
 * - Saree preview thumbnail and title
 * - Simple agreement checkbox
 * - Link to read full Terms & Conditions
 * - "Cancel" and "Continue to Try On" buttons
 */
function TryOnConfirmModal({ visible = false, saree = null, onConfirm, onCancel }) {
  const navigation = useNavigation();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setAgreed(false);
    }
  }, [visible]);

  if (!visible || !saree) {
    return null;
  }

  const sareeImage =
    saree.image ||
    (Array.isArray(saree.images) && saree.images.length > 0 ? saree.images[0] : null);

  const openTerms = () => {
    onCancel?.();
    setTimeout(() => {
      navigation?.navigate?.('TermsOfService');
    }, 180);
  };

  const handleConfirm = () => {
    if (!agreed) return;
    onConfirm?.();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.card}>
              {/* Title & Subtitle */}
              <Text style={styles.title}>Try On Saree</Text>
              <Text style={styles.subtitle}>
                Preview this heirloom weave with our AI Drape Studio.
              </Text>

              {/* Saree Preview Card */}
              <View style={styles.previewBox}>
                {sareeImage ? (
                  <Image
                    source={sareeImage}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.previewImage, styles.previewPlaceholder]}>
                    <Icon name="image-outline" size={20} color="#A89F91" />
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.sareeTitle} numberOfLines={1}>
                    {dash(saree.title || saree.name || 'Pure Silk Saree')}
                  </Text>
                  {saree.weave || saree.fabric ? (
                    <Text style={styles.sareeSubtitle} numberOfLines={1}>
                      {[saree.weave, saree.fabric].filter(Boolean).join(' • ')}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Simple Agreement Checkbox */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAgreed((val) => !val)}
                style={styles.agreeRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreed }}>
                <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                  {agreed ? <Icon name="checkmark" size={13} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.agreeText}>
                  I agree to the Terms of Service & Virtual Try-On Policy.
                </Text>
              </TouchableOpacity>

              {/* Read Terms Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openTerms}
                style={styles.readTermsBtn}
                accessibilityRole="button"
                accessibilityLabel="Read terms and conditions">
                <Text style={styles.readTermsText}>Read Terms & Conditions</Text>
                <Icon
                  name="chevron-forward"
                  size={13}
                  color={colours.saffron || '#BF5B21'}
                />
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={onCancel}
                  style={styles.cancelButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel">
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={agreed ? 0.85 : 1}
                  disabled={!agreed}
                  onPress={handleConfirm}
                  style={[styles.confirmButton, !agreed && styles.confirmDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel="Continue to Try On">
                  <Text style={styles.confirmText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 24, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  title: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 17.5,
    color: '#161413',
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 12,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  previewBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    marginBottom: 14,
  },
  previewImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ECE7DE',
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  sareeTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#161413',
    lineHeight: 17,
  },
  sareeSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#8A8277',
    marginTop: 2,
  },
  agreeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D4CDC2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  checkboxOn: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderColor: colours.saffron || '#BF5B21',
  },
  agreeText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#4E463E',
    lineHeight: 17,
  },
  readTermsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 29,
    marginBottom: 18,
    gap: 2,
    paddingVertical: 2,
  },
  readTermsText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: colours.saffron || '#BF5B21',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#6E675D',
  },
  confirmButton: {
    flex: 1.4,
    height: 44,
    borderRadius: 22,
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});

export default React.memo(TryOnConfirmModal);
