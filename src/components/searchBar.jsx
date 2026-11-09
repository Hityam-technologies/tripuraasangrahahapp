import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../assets/colours';

/**
 * SearchBar
 * Luxury branded search bar component with:
 * - Rounded search pill input with search icon and clear 'X' button
 * - Comfortaa-Medium typography and placeholder
 * - Optional Saffron circular View Changer button (albums-outline / grid-outline)
 * - Custom right action slot support
 *
 * @param {string} value - Current search text value
 * @param {function} onChangeText - Callback when text changes: (text) => void
 * @param {string} placeholder - Input placeholder text (default: "Find your Style")
 * @param {object} inputRef - React ref attached to the TextInput
 * @param {function} onFocus - Callback when input is focused
 * @param {function} onBlur - Callback when input loses focus
 * @param {function} onClear - Callback when clear button is pressed
 * @param {boolean} showViewChanger - Whether to render the saffron circular view changer button (default: true)
 * @param {string} cardLayout - Current layout: 'grid' or 'wide' (default: 'grid')
 * @param {function} onToggleLayout - Callback when view changer button is pressed
 * @param {ReactNode} rightAction - Custom action button to render instead of the view changer
 * @param {object} style - Optional outer container style
 * @param {string} inputBgColor - Optional background color of search pill (default: '#FFFFFF')
 */
export function SearchBar({
  value = '',
  onChangeText,
  placeholder = 'Find your Style',
  inputRef,
  onFocus,
  onBlur,
  onClear,
  showViewChanger = true,
  cardLayout = 'grid',
  onToggleLayout,
  rightAction,
  style,
  inputBgColor = '#FFFFFF',
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText?.('');
    }
  };

  const pillHeight = isSmallDevice ? 46 : 50;
  const pillRadius = isSmallDevice ? 23 : 25;
  const buttonSize = isSmallDevice ? 46 : 50;

  return (
    <View style={[styles.container, style]}>
      {/* Search Input Pill */}
      <View
        style={[
          styles.pill,
          {
            height: pillHeight,
            borderRadius: pillRadius,
            backgroundColor: inputBgColor,
            paddingHorizontal: isSmallDevice ? 14 : 16,
          },
        ]}>
        <Icon
          name="search-outline"
          size={isSmallDevice ? 18 : 20}
          color="#8F8B98"
          style={styles.searchIcon}
        />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#8F8B98"
          style={[
            styles.input,
            {
              fontSize: isSmallDevice ? 13 : 14,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search text">
            <Icon name="close-circle" size={17} color="#9E9AA6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Right Action Button (Custom action or Saffron Circular View Changer) */}
      {rightAction ? (
        rightAction
      ) : showViewChanger ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleLayout}
          style={[
            styles.viewChangerButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: colours.saffron || '#BF5B21',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${cardLayout === 'grid' ? 'wide showcase' : 'compact grid'} view`}>
          <Icon
            name={cardLayout === 'grid' ? 'albums-outline' : 'grid-outline'}
            size={isSmallDevice ? 20 : 22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EDE9E2',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontFamily: 'Comfortaa-Medium',
    color: '#14121E',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  viewChangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    elevation: 4,
  },
});

export default React.memo(SearchBar);

