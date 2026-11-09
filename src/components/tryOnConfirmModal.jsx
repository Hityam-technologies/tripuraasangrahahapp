import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';

/**
 * TryOnConfirmModal
 *
 * Confirmation dialog before entering the AI Drape Studio:
 * "Are you sure you want to try this?"
 * Prevents accidental / instant transitions and gives intentional user confirmation.
 */
function TryOnConfirmModal({ visible = false, saree = null, onConfirm, onCancel }) {
  if (!visible || !saree) {
    return null;
  }

  const sareeImage =
    saree.image ||
    (Array.isArray(saree.images) && saree.images.length > 0 ? saree.images[0] : null);

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
              {/* Top Sparkle Badge */}
              <View style={styles.iconCircle}>
                <Icon
                  name="sparkles"
                  size={24}
                  color={colours.saffron || '#BF5B21'}
                />
              </View>

              {/* Title & Question */}
              <Text style={styles.title}>Try On Saree</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to try this in the AI Drape Studio?
              </Text>

              {/* Saree Preview Card */}
              <View style={styles.previewBox}>
                {sareeImage && (
                  <Image
                    source={sareeImage}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.sareeTitle} numberOfLines={1}>
                    {saree.title || saree.name}
                  </Text>
                  {saree.weave ? (
                    <Text style={styles.sareeSubtitle} numberOfLines={1}>
                      {saree.weave}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Actions: Cancel vs Confirm */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={onCancel}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onConfirm}
                  style={styles.confirmButton}>
                  <Icon
                    name="sparkles"
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.confirmText}>Yes, Try On</Text>
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
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 18,
    color: '#161413',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  previewBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    marginBottom: 20,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EDE9E2',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sareeTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 13,
    color: '#161413',
  },
  sareeSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#8A8277',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#6E675D',
  },
  confirmButton: {
    flex: 1.2,
    height: 46,
    borderRadius: 14,
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default TryOnConfirmModal;

