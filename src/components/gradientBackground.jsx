import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import colours from '../assets/colours';

/**
 * GradientBackground
 * Soft cream-gold background with a glowing center and warmer edges:
 * - Base layer: vertical linear gradient (bgEdge -> bgMid -> bgCenter 35-60% -> bgMid -> bgEdge)
 * - Vignette layer: soft radial gradient from transparent center to bgCorner at corners (26% opacity)
 * - Optional bottom glow: faint baseGold glow (13% opacity) near bottom for subtle warmth
 * - Fills whole screen edge-to-edge behind all content, extending under the status bar.
 * - Safe-area aware when wrapping content, lightweight via react-native-svg.
 * - Implemented with Tailwind CSS utility classes.
 */
function GradientBackground({ children, className = '', style, idPrefix = '' }) {
  const linearId = `${idPrefix}creamGoldLinear`;
  const vignetteId = `${idPrefix}vignetteRadial`;
  const glowId = `${idPrefix}bottomGoldGlow`;

  return (
    <View
      className={`flex-1 ${className}`}
      style={[{ backgroundColor: colours.bgCenter || '#FAF7F2' }, style]}>
      {/* Background Layer: Fills the entire screen edge-to-edge behind all content */}
      <View className="absolute inset-0" pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 900"
          preserveAspectRatio="none">
          <Defs>
            {/* 1. Base Layer: Vertical linear gradient from bgEdge (0%) -> bgCenter (35-60%) -> bgEdge (100%) */}
            <LinearGradient
              id={linearId}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor={colours.bgEdge} />
              <Stop offset="18%" stopColor={colours.bgMid} />
              <Stop offset="35%" stopColor={colours.bgCenter} />
              <Stop offset="60%" stopColor={colours.bgCenter} />
              <Stop offset="82%" stopColor={colours.bgMid} />
              <Stop offset="100%" stopColor={colours.bgEdge} />
            </LinearGradient>

            {/* 2. Vignette Layer: Centered slightly above middle, transparent in center to bgCorner at corners */}
            <RadialGradient
              id={vignetteId}
              cx="50%"
              cy="44%"
              rx="75%"
              ry="65%">
              <Stop offset="0%" stopColor={colours.bgCorner} stopOpacity="0" />
              <Stop offset="42%" stopColor={colours.bgCorner} stopOpacity="0" />
              <Stop offset="70%" stopColor={colours.bgCorner} stopOpacity="0.08" />
              <Stop offset="88%" stopColor={colours.bgCorner} stopOpacity="0.18" />
              <Stop offset="100%" stopColor={colours.bgCorner} stopOpacity="0.26" />
            </RadialGradient>

            {/* 3. Faint Warm BaseGold Glow near bottom (10-15% opacity, heavily blurred) */}
            <RadialGradient
              id={glowId}
              cx="50%"
              cy="96%"
              rx="60%"
              ry="35%">
              <Stop offset="0%" stopColor={colours.baseGold} stopOpacity="0.13" />
              <Stop offset="45%" stopColor={colours.baseGold} stopOpacity="0.06" />
              <Stop offset="80%" stopColor={colours.baseGold} stopOpacity="0.015" />
              <Stop offset="100%" stopColor={colours.baseGold} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Layer 1: Base Linear Gradient with Glowing Cream Center */}
          <Rect width="100%" height="100%" fill={`url(#${linearId})`} />

          {/* Layer 2: Soft Golden Vignette Creating Warm Edges & Corners */}
          <Rect width="100%" height="100%" fill={`url(#${vignetteId})`} />

          {/* Layer 3: Faint Warm Bottom Gold Glow */}
          <Rect width="100%" height="100%" fill={`url(#${glowId})`} />
        </Svg>
      </View>

      {/* Screen Content Layer */}
      {children}
    </View>
  );
}

export default React.memo(GradientBackground);
