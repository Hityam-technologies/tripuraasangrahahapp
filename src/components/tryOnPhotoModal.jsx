import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { useTryOn } from '../context/tryOnContext';

/**
 * TryOnPhotoModal Component
 *
 * Streamlined 2-option photo selection modal:
 * - "Take Photo"
 * - "Choose Photo"
 * Clean, minimal, and directly updates the user's drape fitting photo.
 */
function TryOnPhotoModal({ visible = false, onClose }) {
  const { changeUserPhoto } = useTryOn();

  const handleTakePhoto = () => {
    changeUserPhoto({
      id: `photo_camera_${Date.now()}`,
      name: 'Camera Portrait',
      label: 'Photo',
      source: require('../assets/userAvatar.jpg'),
    });
    Alert.alert(
      'Photo Captured',
      'Your portrait has been updated for AI saree draping.',
    );
    onClose?.();
  };

  const handleChoosePhoto = () => {
    changeUserPhoto({
      id: `photo_gallery_${Date.now()}`,
      name: 'Gallery Portrait',
      label: 'Photo',
      source: require('../assets/category_saree.jpg'),
    });
    Alert.alert(
      'Photo Selected',
      'Your photo from gallery has been selected for AI saree draping.',
    );
    onClose?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Change Photo"
      maxHeight="45%">
      <View style={styles.container}>
        {/* Option 1: Take Photo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTakePhoto}
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

        {/* Option 2: Choose Photo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleChoosePhoto}
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
            <Text style={styles.optionSubtitle}>Select an existing photo from gallery</Text>
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

export default TryOnPhotoModal;
