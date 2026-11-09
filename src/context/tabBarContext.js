import React, { createContext, useCallback, useContext, useRef } from 'react';
import { Animated } from 'react-native';

const TabBarContext = createContext({
  tabBarTranslateY: new Animated.Value(0),
  hideTabBar: () => {},
  showTabBar: () => {},
});

export function TabBarProvider({ children }) {
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const isHiddenRef = useRef(false);

  const hideTabBar = useCallback(() => {
    if (!isHiddenRef.current) {
      isHiddenRef.current = true;
      Animated.timing(tabBarTranslateY, {
        toValue: 140, // Move down off-screen
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [tabBarTranslateY]);

  const showTabBar = useCallback(() => {
    if (isHiddenRef.current) {
      isHiddenRef.current = false;
      Animated.timing(tabBarTranslateY, {
        toValue: 0, // Restore to visible
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [tabBarTranslateY]);

  return (
    <TabBarContext.Provider value={{ tabBarTranslateY, hideTabBar, showTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}

export default TabBarContext;

