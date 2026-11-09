import React from 'react';
import { Image } from 'react-native';

/** Source asset: 1167 x 1600 - keep this ratio everywhere. */
export const LOGO_ASPECT = 1600 / 1167;

/** Consistent size for splash, auth headers, and app screens. */
export const LOGO_SIZE = 64;

/**
 * BrandLogo - Tripura Sangrahah brand mark.
 */
function BrandLogo({
  size = LOGO_SIZE,
  borderRadius,
  style,
  accessibilityLabel = 'Tripura Sangrahah logo',
}) {
  const width = size;
  const height = Math.round(size * LOGO_ASPECT);
  const radius = borderRadius ?? Math.round(size * 0.18);

  return (
    <Image
      source={require('../assets/logo.png')}
      style={[{ width, height, borderRadius: radius }, style]}
      resizeMode="contain"
      resizeMethod="resize"
      fadeDuration={0}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export default BrandLogo;
