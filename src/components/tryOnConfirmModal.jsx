import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import { apiCall } from '../api/client';
import { useTryOn } from '../context/tryOnContext';
import { tryOnOfferLine } from '../lib/text';

/**
 * TryOnConfirmModal
 *
 * Requires explicit “I Agree” consent using points loaded from GET /legal/terms.
 */
function TryOnConfirmModal({ visible = false, saree = null, onConfirm, onCancel }) {
  const navigation = useNavigation();
  const { tryOnWallet } = useTryOn();
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setAgreed(false);
      setError('');
      setConsent(null);
      setLoading(true);
      return undefined;
    }
    let live = true;
    setLoading(true);
    setError('');
    setConsent(null);
    apiCall('get', '/legal/terms').then((result) => {
      if (!live) return;
      const next = result?.data?.tryOnConsent;
      if (result.success && next?.points?.length) {
        setConsent({
          title: next.title || 'Before you Try On',
          points: next.points,
          agreeLabel: next.agreeLabel || 'I Agree & Try On',
        });
        setError('');
      } else {
        setConsent(null);
        setError(
          result.error?.message ||
            'Terms could not be loaded. Check your connection and try again.',
        );
      }
      setLoading(false);
    });
    return () => {
      live = false;
    };
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

  const canContinue = agreed && !!consent && !loading && !error;

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
              <View style={styles.iconCircle}>
                <Icon
                  name="sparkles"
                  size={24}
                  color={colours.saffron || '#BF5B21'}
                />
              </View>

              <Text style={styles.title}>Try On Saree</Text>
              <Text style={styles.subtitle}>
                Review these Terms highlights, then agree to continue to the AI Drape Studio.
              </Text>
              {tryOnWallet ? (
                <Text style={styles.walletLine}>{tryOnOfferLine(tryOnWallet)}</Text>
              ) : null}

              <View style={styles.previewBox}>
                {sareeImage ? (
                  <Image
                    source={sareeImage}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.previewImage, styles.previewPlaceholder]} />
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.sareeTitle} numberOfLines={1}>
                    {saree.title || saree.name || '-'}
                  </Text>
                  {saree.weave ? (
                    <Text style={styles.sareeSubtitle} numberOfLines={1}>
                      {saree.weave}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.consentBox}>
                {loading || (!consent && !error) ? (
                  <View style={styles.loadingBlock}>
                    <ActivityIndicator color={colours.saffron || '#BF5B21'} />
                    <Text style={styles.loadingText}>Loading Terms…</Text>
                  </View>
                ) : error || !consent ? (
                  <View>
                    <Text style={styles.errorText}>
                      {error ||
                        'Terms could not be loaded. Check your connection and try again.'}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setLoading(true);
                        setError('');
                        setConsent(null);
                        apiCall('get', '/legal/terms').then((result) => {
                          const next = result?.data?.tryOnConsent;
                          if (result.success && next?.points?.length) {
                            setConsent({
                              title: next.title || 'Before you Try On',
                              points: next.points,
                              agreeLabel: next.agreeLabel || 'I Agree & Try On',
                            });
                            setError('');
                          } else {
                            setConsent(null);
                            setError(
                              result.error?.message ||
                                'Terms could not be loaded. Check your connection and try again.',
                            );
                          }
                          setLoading(false);
                        });
                      }}>
                      <Text style={styles.termsLink}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.consentTitle}>{consent?.title}</Text>
                    <ScrollView
                      style={styles.consentScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}>
                      {(consent?.points || []).map((point, index) => (
                        <View key={index} style={styles.pointRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.pointText}>{point}</Text>
                        </View>
                      ))}
                    </ScrollView>
                    <TouchableOpacity activeOpacity={0.8} onPress={openTerms}>
                      <Text style={styles.termsLink}>Read full Terms & Conditions</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!consent}
                onPress={() => setAgreed((value) => !value)}
                style={styles.agreeRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreed }}>
                <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                  {agreed ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.agreeText}>
                  I have read and agree to the Terms (no returns, Try-On charges, photo deletion & parental consent).
                </Text>
              </TouchableOpacity>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={onCancel}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={canContinue ? 0.85 : 1}
                  disabled={!canContinue}
                  onPress={onConfirm}
                  style={[styles.confirmButton, !canContinue && styles.confirmDisabled]}>
                  <Icon
                    name="sparkles"
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.confirmText}>
                    {consent?.agreeLabel || 'I Agree & Try On'}
                  </Text>
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
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
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
    marginBottom: 12,
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
    fontSize: 12.5,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  walletLine: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: '#6B645C',
    textAlign: 'center',
    marginTop: -6,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EDE9E2',
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
  consentBox: {
    width: '100%',
    backgroundColor: '#FAFAF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    padding: 12,
    marginBottom: 12,
    minHeight: 120,
  },
  loadingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#8A8277',
  },
  errorText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#8B3A3A',
    lineHeight: 17,
    marginBottom: 8,
  },
  consentTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#161413',
    marginBottom: 8,
  },
  consentScroll: {
    maxHeight: 140,
  },
  pointRow: {
    flexDirection: 'row',
    marginBottom: 7,
    paddingRight: 4,
  },
  bullet: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: colours.saffron || '#BF5B21',
    width: 14,
  },
  pointText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#5C554B',
    lineHeight: 16.5,
  },
  termsLink: {
    marginTop: 8,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: colours.saffron || '#BF5B21',
  },
  agreeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D6CFC3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
  },
  checkboxOn: {
    backgroundColor: colours.saffron || '#BF5B21',
    borderColor: colours.saffron || '#BF5B21',
  },
  agreeText: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#4E463E',
    lineHeight: 16.5,
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
    flex: 1.35,
    height: 46,
    borderRadius: 14,
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  confirmDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default TryOnConfirmModal;
