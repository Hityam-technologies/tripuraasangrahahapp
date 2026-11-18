import React, { useEffect, useState } from 'react';
import {
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
 * ProfileEditBottomSheet Component
 * 
 * Modular bottom sheet for user profile details:
 * - Only Full Name is editable
 * - Phone Number & Email Address are locked, verified account credentials
 * - Pure white background (#FFFFFF) with refined luxury styling
 */
function ProfileEditBottomSheet({
  visible = false,
  onClose,
  userProfile,
  initialProfile = { name: '', email: '', phone: '' },
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
        {/* 1. Full Name (Editable) */}
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

        {/* 2. Phone Number (Non-editable / Locked Account Credential) */}
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

        {/* 3. Email Address (Non-editable / Locked Account Credential) */}
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

        {/* Save Changes Button */}
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
