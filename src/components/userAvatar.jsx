import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import colours from '../assets/colours';
import { imageSource } from '../api/media';

/**
 * UserAvatar
 *
 * Circular profile image used anywhere we show the signed-in user (or a friend).
 * Falls back to the first letter of their name when no photo is set.
 */
function UserAvatar({
  uri = '',
  name = '',
  size = 40,
  borderWidth = 0,
  borderColor = colours.saffron || '#BF5B21',
  backgroundColor = '#FFF7ED',
  textColor = colours.saffron || '#BF5B21',
  style,
}) {
  const source = imageSource(uri && uri !== '-' ? uri : '');
  const initial = String(name || '').trim().charAt(0).toUpperCase() || '·';
  const radius = size / 2;
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth,
          borderColor,
          backgroundColor: source ? '#FFFFFF' : backgroundColor,
        },
        style,
      ]}>
      {source ? (
        <Image
          source={source}
          style={{ width: size - borderWidth * 2, height: size - borderWidth * 2, borderRadius: radius - borderWidth }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initial, { fontSize, color: textColor, lineHeight: fontSize + 4 }]}>
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
});

export default React.memo(UserAvatar);
