import React, { useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';
import BottomSheet from './bottomSheet';
import { DEFAULT_COUNTRIES } from '../data';

export { DEFAULT_COUNTRIES };

/**
 * CountryPickerBottomSheet Component
 * Reusable animated bottom sheet for country selection:
 * - Powered by standard BottomSheet with pure white background (#FFFFFF)
 * - Smooth backdrop fade + bottom sheet slide-up animation
 * - Search filter for country name and code
 */
const CountryPickerBottomSheet = ({
  visible,
  onClose,
  onSelectCountry,
  selectedCountry,
  countries = DEFAULT_COUNTRIES,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery),
  );

  const handleSelect = (item) => {
    onSelectCountry?.(item);
    onClose?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setSearchQuery('');
        onClose?.();
      }}
      title="Select Country Code"
      maxHeight="82%">
      {/* Search Filter Input Box */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 16,
          paddingHorizontal: 14,
          height: 48,
          marginBottom: 14,
        }}>
        <Icon
          name="search-outline"
          size={18}
          color="#9CA3AF"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={{
            flex: 1,
            fontFamily: 'Manrope-Medium',
            fontSize: 14,
            color: '#111827',
            paddingVertical: 0,
            backgroundColor: 'transparent',
          }}
          placeholder="Search country name or code"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={colours.primary}
          cursorColor={colours.primary}
          underlineColorAndroid="transparent"
          autoComplete="off"
          importantForAutofill="no"
          textContentType="none"
          disableFullscreenUI={true}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Icon name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Countries FlatList */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item, index) => item.code + item.name + index}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isSelected =
            selectedCountry &&
            item.name === selectedCountry.name &&
            item.code === selectedCountry.code;

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSelect(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 13,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
                backgroundColor: isSelected ? (colours.primarySoft || '#FDF9F0') : '#FFFFFF',
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{item.flag}</Text>
                <Text
                  style={{
                    fontFamily: isSelected ? 'Manrope-Bold' : 'Manrope-Medium',
                    fontSize: 15,
                    color: isSelected ? colours.textPrimary : '#1F2937',
                  }}>
                  {item.name}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Manrope-Bold',
                  fontSize: 15,
                  color: colours.primary || '#BF5B21',
                }}>
                {item.code}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </BottomSheet>
  );
};

export default CountryPickerBottomSheet;
