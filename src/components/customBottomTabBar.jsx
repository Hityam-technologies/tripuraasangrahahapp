import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Path,
} from 'react-native-svg';
import { useTabBar } from '../context/tabBarContext';

/**
 * Home Icon
 * Exact match: rounded house silhouette with peaked roof and gentle smile mouth cutout.
 */
function HomeIcon({ size = 26, isFocused = true, color = '#000000' }) {
  if (isFocused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
        {/* Solid rounded house body */}
        <Path
          d="M 13 2.6 C 11.8 3.4 4.5 8.8 4 12.8 V 20 C 4 21.8 5.4 23.4 7.2 23.4 H 18.8 C 20.6 23.4 22 21.8 22 20 V 12.8 C 21.5 8.8 14.2 3.4 13 2.6 Z"
          fill={color}
        />
        {/* Curved smile cutout */}
        <Path
          d="M 9.6 16.2 C 10.4 18.8 15.6 18.8 16.4 16.2"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M 13 3.2 C 11.9 4 5.2 9 4.8 12.8 V 19.8 C 4.8 21.2 5.9 22.5 7.4 22.5 H 18.6 C 20.1 22.5 21.2 21.2 21.2 19.8 V 12.8 C 20.8 9 14.1 4 13 3.2 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 10 16.5 C 10.8 18.5 15.2 18.5 16 16.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/**
 * Search Icon
 * Exact match: circle lens with diagonal straight handle.
 */
function SearchIcon({ size = 25, isFocused = false, color = '#787B86' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Circle
        cx="11.5"
        cy="11"
        r="7.2"
        stroke={color}
        strokeWidth={isFocused ? 2.4 : 2}
      />
      <Path
        d="M 16.8 16.3 L 21.8 21.3"
        stroke={color}
        strokeWidth={isFocused ? 2.4 : 2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Wardrobe Icon
 * Luxury clothes hanger with curved hook and triangular drape base.
 */
function WardrobeIcon({ size = 25, isFocused = false, color = '#787B86' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      {/* Top hook */}
      <Path
        d="M 13 8 C 13 6.3 14.1 5 15.4 5 C 16.7 5 17.6 6 17.4 7.2 C 17.1 8.4 15.6 9.5 14 10.3 L 13 11"
        stroke={color}
        strokeWidth={isFocused ? 2.4 : 2}
        strokeLinecap="round"
      />
      {/* Triangle hanger frame */}
      <Path
        d="M 13 11 L 4.2 16.8 C 3.6 17.2 3.9 18.2 4.7 18.2 H 21.3 C 22.1 18.2 22.4 17.2 21.8 16.8 L 13 11 Z"
        stroke={color}
        strokeWidth={isFocused ? 2.4 : 2}
        strokeLinejoin="round"
        fill={isFocused ? color : 'none'}
      />
      {/* Lower horizontal drape bar accent */}
      <Path
        d="M 7 18.2 V 19.5 C 7 20.3 7.7 21 8.5 21 H 17.5 C 18.3 21 19 20.3 19 19.5 V 18.2"
        stroke={color}
        strokeWidth={isFocused ? 2 : 1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Wishlist Icon
 * Exact match: elegant heart outline.
 */
function WishlistIcon({ size = 25, isFocused = false, color = '#787B86' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M 13 22 C 12.6 22 12.2 21.8 11.9 21.5 C 6.8 16.8 3.5 13.7 3.5 9.8 C 3.5 6.6 6 4 9.2 4 C 11 4 12.5 4.8 13 5.9 C 13.5 4.8 15 4 16.8 4 C 20 4 22.5 6.6 22.5 9.8 C 22.5 13.7 19.2 16.8 14.1 21.5 C 13.8 21.8 13.4 22 13 22 Z"
        stroke={color}
        strokeWidth={isFocused ? 2.4 : 2}
        strokeLinejoin="round"
        fill={isFocused ? color : 'none'}
      />
    </Svg>
  );
}

/**
 * Account Icon
 * Exact match: circle outline with circular head and curved shoulder arc.
 */
function AccountIcon({ size = 25, isFocused = false, color = '#787B86' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      {/* Outer circle */}
      <Circle
        cx="13"
        cy="13"
        r="10"
        stroke={color}
        strokeWidth={isFocused ? 2.2 : 1.9}
      />
      {/* Head */}
      <Circle
        cx="13"
        cy="9.8"
        r="3.5"
        stroke={color}
        strokeWidth={isFocused ? 2.2 : 1.9}
        fill={isFocused ? color : 'none'}
      />
      {/* Shoulders */}
      <Path
        d="M 6.8 19.5 C 7.8 16.8 10.2 15.2 13 15.2 C 15.8 15.2 18.2 16.8 19.2 19.5"
        stroke={color}
        strokeWidth={isFocused ? 2.2 : 1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * CustomBottomTabBar
 * Spacious 4-tab white bottom bar: Home, Search, Wishlist, Account
 */
/**
 * TabBarButton with subtle spring bounce animation when activated
 */
function TabBarButton({
  isFocused,
  config,
  options,
  onPress,
  onLongPress,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 110,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, scaleAnim]);

  const activeColor = '#000000';
  const inactiveColor = '#8E8E93';
  const itemColor = isFocused ? activeColor : inactiveColor;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 h-full items-center justify-center pt-1">
      {/* Animated Tab Icon */}
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
        className="items-center justify-center h-[28px]">
        {config.renderIcon(isFocused, itemColor)}
      </Animated.View>

      {/* Tab Label with Comfortaa font */}
      <Text
        numberOfLines={1}
        style={{
          color: itemColor,
          fontSize: 11.5,
          fontFamily: 'Comfortaa-Bold',
          letterSpacing: -0.2,
          marginTop: 3.5,
          ...(Platform.OS === 'ios' ? { fontWeight: '700' } : {}),
        }}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

function CustomBottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  const tabMap = {
    HomeTab: {
      label: 'Home',
      renderIcon: (isFocused, color) => (
        <HomeIcon size={26} isFocused={isFocused} color={color} />
      ),
    },
    CollectionsTab: {
      label: 'Collections',
      renderIcon: (isFocused, color) => (
        <SearchIcon size={25} isFocused={isFocused} color={color} />
      ),
    },
    WardrobeTab: {
      label: 'Wardrobe',
      renderIcon: (isFocused, color) => (
        <WardrobeIcon size={25} isFocused={isFocused} color={color} />
      ),
    },
    WishlistTab: {
      label: 'Wardrobe',
      renderIcon: (isFocused, color) => (
        <WardrobeIcon size={25} isFocused={isFocused} color={color} />
      ),
    },
    CommunityTab: {
      label: 'Account',
      renderIcon: (isFocused, color) => (
        <AccountIcon size={25} isFocused={isFocused} color={color} />
      ),
    },
  };

  const { tabBarTranslateY } = useTabBar();

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        alignItems: 'center',
        transform: [{ translateY: tabBarTranslateY }],
      }}>
      {/* Spacious White Tab Bar Body with Gentle Top Corner Radius */}
      <View
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          paddingBottom: bottomPadding,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
          borderTopWidth: 1,
          borderColor: '#EFEFEF',
        }}>
        <View className="flex-row items-center h-[62px]">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const config = tabMap[route.name] || {
              label: options.tabBarLabel || route.name,
              renderIcon: () => null,
            };

            const activeColor = '#000000';
            const inactiveColor = '#8E8E93';
            const itemColor = isFocused ? activeColor : inactiveColor;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // jumpTo triggers the built-in tab screen animation for every tab
                if (typeof navigation.jumpTo === 'function') {
                  navigation.jumpTo(route.name);
                } else {
                  navigation.navigate(route.name);
                }
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabBarButton
                key={route.key}
                isFocused={isFocused}
                config={config}
                options={options}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

export default CustomBottomTabBar;
