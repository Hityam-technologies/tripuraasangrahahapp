module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets|@react-navigation|react-native-screens|react-native-vector-icons|react-native-keyboard-aware-scroll-view|react-native-iphone-x-helper|react-native-svg)/)',
  ],
  moduleNameMapper: {
    '\\.css$': require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
  },
};
