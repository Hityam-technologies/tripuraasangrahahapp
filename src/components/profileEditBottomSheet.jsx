import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { dash } from '../lib/text';

/**
 * ProfileEditBottomSheet
 *
 * Edit name + change profile photo.
 * Phone and email stay locked (verified account credentials).
 */
function ProfileEditBottomSheet({
  visible = false,
  onClose,
  userProfile,
  initialProfile = { name: '', email: '', phone: '' },
  photoSource = null,
  nameInitial = '-',
  onChangePhoto,
  onSave,
}) {
  const current = userProfile || initialProfile || {};
  const [name, setName] = useState(current.name || '');

  const email = dash(current.email);
  const phone = dash(current.phone);

  useEffect(() => {
    if (visible) {
      const active = userProfile || initialProfile || {};
      setName(active.name || '');
    }
  }, [visible, userProfile, initialProfile]);

  const handleSave = () => {
    const active = userProfile || initialProfile || {};
    onSave?.({
      ...active,
      name: name.trim() || active.name,
    });
    onClose?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="My Profile"
      titleStyle={{ fontFamily: 'Manrope-Bold' }}
      maxHeight="85%">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile photo — tap to change (uploads to ImageKit /profile-pics) */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onChangePhoto}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.photoTap}>
            <View style={styles.photoCircle}>
              {photoSource ? (
                <Image source={photoSource} style={styles.photoImage} resizeMode="cover" />
              ) : (
                <Text style={styles.photoInitial}>{nameInitial}</Text>
              )}
            </View>
            <View style={styles.photoBadge}>
              <Icon name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Change profile photo</Text>
        </View>

        {/* Full Name (Editable) */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <Text style={styles.editableHint}>Tap to edit</Text>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.textInput}
            placeholder="Enter your name"
            placeholderTextColor="#A39A8F"
            autoCapitalize="words"
            autoCorrect={false}
            selectionColor={colours.saffron || '#BF5B21'}
          />
        </View>

        {/* Phone Number (locked) */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={13} color="#2E7D32" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{phone}</Text>
            <Icon name="lock-closed-outline" size={15} color="#A39A8F" />
          </View>
        </View>

        {/* Email Address (locked) */}
        <View style={styles.emailFieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={13} color="#2E7D32" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{email}</Text>
            <Icon name="lock-closed-outline" size={15} color="#A39A8F" />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  photoTap: {
    position: 'relative',
    marginBottom: 8,
  },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: colours.saffron || '#BF5B21',
    padding: 2.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  photoInitial: {
    fontFamily: 'Manrope-Bold',
    fontSize: 34,
    color: colours.saffron || '#BF5B21',
  },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colours.saffron || '#BF5B21',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: colours.saffron || '#BF5B21',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  emailFieldGroup: {
    marginBottom: 22,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#5E574E',
  },
  editableHint: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10.5,
    color: colours.saffron || '#BF5B21',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: '#2E7D32',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2DDD4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10.5,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13.5,
    color: '#161413',
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EDE8E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11.5,
  },
  readOnlyText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 13,
    color: '#6E675D',
  },
  saveButton: {
    backgroundColor: colours.saffron || '#BF5B21',
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ProfileEditBottomSheet;
