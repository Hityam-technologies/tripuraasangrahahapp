/**
 * Tripura Sangrahah App
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/appNavigator';
import { WardrobeProvider } from './src/context/wardrobeContext';
import { TryOnProvider } from './src/context/tryOnContext';
import { TabBarProvider } from './src/context/tabBarContext';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <WardrobeProvider>
        <TryOnProvider>
          <TabBarProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </TabBarProvider>
        </TryOnProvider>
      </WardrobeProvider>
    </SafeAreaProvider>
  );
}

export default App;
