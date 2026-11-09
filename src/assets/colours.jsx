/**
 * Tripura Sangrahah Theme Colors
 * Centralized color palette defined in colours.jsx
 *
 * Primary: Antique Temple Gold (#C5A253 / #D4AF37)
 * Accent: Burnt Saffron Silk / Terracotta (#BF5B21)
 */

export const colours = {
  // --- Screen Background Tokens (Soft cream-gold with glowing center & warm vignette) ---
  bgCenter: '#FFFDF0',                   // Buttery cream, almost white, the brightest area
  bgMid: '#F7EFCB',                      // Light champagne
  bgEdge: '#E9D7A0',                     // Warm golden beige for the top and bottom edges
  bgCorner: '#DFC688',                   // Slightly deeper gold, used only in the far corners
  baseGold: '#D4AF37',                   // Source color, used only for the faint glow

  // Backward compatibility aliases
  bgTop: '#E9D7A0',
  bgBottom: '#E9D7A0',

  primary: '#C5A253',            // Antique Temple Gold (Main Brand Theme)
  primaryDark: '#A08035',        // Deep Temple Gold
  primaryLight: '#D4AF37',       // Luminous Temple Gold
  primarySoft: '#FBF7EE',        // Soft warm gold tint
  primaryMuted: '#E8D9B5',       // Soft gold accent

  saffron: '#BF5B21',            // Burnt Saffron Silk / Terracotta
  terracotta: '#BF5B21',
  saffronLight: '#DE7335',
  saffronSoft: '#FDF2EB',

  maroon: '#6B1728',             // Deep Royal Maroon Silk (Authentic Traditional Wear Accent)
  maroonDark: '#500E1C',         // Heritage Crimson Maroon
  maroonSoft: '#FDF2F4',         // Soft blush maroon tint

  gold: '#D4AF37',
  goldAntique: '#C5A253',

  blue: '#084B87',
  brandBlue: '#084B87',

  cream: '#FDFBD4',
  creamSoft: '#FFFEEA',
  accentYellow: '#FDFBD4',

  white: '#FFFFFF',
  black: '#000000',
  background: '#eeedf2',         // Tab screens & default canvas background
  tabBackground: '#eeedf2',      // Tab screens canvas background
  screenBg: '#eeedf2',
  cardBg: '#FFFFFF',
  inputBg: '#FBF9F4',
  inputBorder: '#EFEAE1',
  borderLight: '#E8E2D5',
  borderSelected: '#C5A253',

  textPrimary: '#1E1B18',        // Rich dark charcoal
  textSecondary: '#6B5E51',      // Warm muted slate
  textMuted: '#9E8E7D',          // Subdued caption
  divider: '#F4EFE6',
};

export const colors = colours;
export default colours;
