import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomTabBar from '../components/customBottomTabBar';
import HomeScreen from '../screens/private/homeTab/homeScreen';
import AccountScreen from '../screens/private/accountTab/accountScreen';
import CollectionsScreen from '../screens/private/collectionTab/collectionsScreen';
import WardrobeScreen from '../screens/private/wardrobeTab/wardrobeScreen';

const Tab = createBottomTabNavigator();

const renderCustomTabBar = (props) => <CustomBottomTabBar {...props} />;

/**
 * TabNavigator
 * Floating rounded bottom navigation bar with elevated center AI Try-On button.
 * Uses official React Navigation native 'shift' tab animation (butter-smooth, zero glitch).
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={renderCustomTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#ffffff' },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CollectionsTab"
        component={CollectionsScreen}
        options={{ tabBarLabel: 'Collections' }}
      />
      <Tab.Screen
        name="WardrobeTab"
        component={WardrobeScreen}
        options={{ tabBarLabel: 'Wardrobe' }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={AccountScreen}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;
