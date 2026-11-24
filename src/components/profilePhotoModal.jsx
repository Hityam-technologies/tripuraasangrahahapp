import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { useAuth } from '../context/authContext';
import { useLoading } from '../context/loadingContext';
import { usePopup } from '../context/popupContext';
import { friendlyPhotoError, openAppSettings, pickPhoto } from '../lib/pickPhoto';

/**
 * ProfilePhotoModal — change account profile picture (camera or gallery).
 * Uses shared pickPhoto helper so permission / library errors stay customer-friendly.
 */
function ProfilePhotoModal({ visible = false, onClose }) {
  const { uploadAvatar } = useAuth();
  const { showAlert } = usePopup();
  const { runWithLoading } = useLoading();

  const showPhotoIssue = (message, openSettings = false) => {
    showAlert({
      title: 'Photo',
      message,
      icon: 'camera-outline',
      buttonText: openSettings ? 'Open Settings' : 'OK',
      onPress: openSettings ? () => openAppSettings() : undefined,
    });
  };

  const handlePick = async (source) => {
    const picked = await pickPhoto(source);
    if (picked.cancelled) return;
    if (picked.error) {
      showPhotoIssue(picked.error, picked.openSettings);
      return;
    }

    onClose?.();

    const uploaded = await runWithLoading(
      () => uploadAvatar(picked.asset),
      'Updating profile photo...',
    );

    if (!uploaded?.success) {
      showPhotoIssue(
        friendlyPhotoError(
          uploaded?.error?.message || 'Your profile photo could not be saved. Please try again.',
          source,
        ),
      );
      return;
    }

    showAlert({
      title: 'Profile Photo',
      message: 'Your profile picture has been updated.',
      type: 'success',
    });
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Change Profile Photo"
      maxHeight="45%">
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePick('camera')}
          style={styles.optionButton}>
          <View style={styles.iconContainer}>
            <Icon
              name="camera-outline"
              size={22}
              color={colours.saffron || '#BF5B21'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>Capture a new photo with camera</Text>
          </View>
          <Icon name="chevron-forward" size={18} color="#A39A8F" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePick('library')}
          style={styles.optionButton}>
          <View style={styles.iconContainer}>
            <Icon
              name="images-outline"
              size={22}
              color={colours.saffron || '#BF5B21'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>Choose Photo</Text>
            <Text style={styles.optionSubtitle}>Select from your gallery</Text>
          </View>
          <Icon name="chevron-forward" size={18} color="#A39A8F" />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9E2',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 14.5,
    color: '#161413',
  },
  optionSubtitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11.5,
    color: '#8A8277',
    marginTop: 2,
  },
});

export default ProfilePhotoModal;
