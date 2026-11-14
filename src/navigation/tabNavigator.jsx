import React from 'react';
import {
  createBottomTabNavigator,
  TransitionPresets,
} from '@react-navigation/bottom-tabs';
import CustomBottomTabBar from '../components/customBottomTabBar';
import HomeScreen from '../screens/private/homeTab/homeScreen';
import AccountScreen from '../screens/private/accountTab/accountScreen';
import CollectionsScreen from '../screens/private/collectionTab/collectionsScreen';
import WardrobeScreen from '../screens/private/wardrobeTab/wardrobeScreen';

const Tab = createBottomTabNavigator();

const renderCustomTabBar = (props) => <CustomBottomTabBar {...props} />;

/**
 * Built-in screen change animation for every tab.
 * Options: TransitionPresets.ShiftTransition | FadeTransition
 */
const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'shift',
  ...TransitionPresets.ShiftTransition,
  sceneStyle: { backgroundColor: '#ffffff' },
};

/**
 * TabNavigator
 * All tabs use the same built-in shift (slide) animation.
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={renderCustomTabBar}
      // Keep inactive screens mounted so shift animation can run between all tabs
      detachInactiveScreens={false}
      screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          animation: 'shift',
          ...TransitionPresets.ShiftTransition,
        }}
      />
      <Tab.Screen
        name="CollectionsTab"
        component={CollectionsScreen}
        options={{
          tabBarLabel: 'Collections',
          animation: 'shift',
          ...TransitionPresets.ShiftTransition,
        }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{
          tabBarLabel: 'Wardrobe',
          animation: 'shift',
          ...TransitionPresets.ShiftTransition,
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          animation: 'shift',
          ...TransitionPresets.ShiftTransition,
        }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;
