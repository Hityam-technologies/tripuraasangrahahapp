/**
 * Tripura Sangrahah App
 *
 * @format
 */

import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/appNavigator';
import MaintenanceScreen from './src/components/maintenanceScreen';
import { AuthProvider, useAuth } from './src/context/authContext';
import { CatalogProvider } from './src/context/catalogContext';
import { WardrobeProvider } from './src/context/wardrobeContext';
import { TryOnProvider } from './src/context/tryOnContext';
import { TabBarProvider } from './src/context/tabBarContext';
import { CartProvider } from './src/context/cartContext';
import { OrdersProvider } from './src/context/ordersContext';
import { PopupProvider } from './src/context/popupContext';
import { LoadingProvider } from './src/context/loadingContext';

function AppShell() {
  const { maintenance } = useAuth();

  if (maintenance.active) {
    return <MaintenanceScreen notice={maintenance.notice} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <LoadingProvider>
        <CatalogProvider>
          <WardrobeProvider>
            <TryOnProvider>
              <TabBarProvider>
                <PopupProvider>
                  <CartProvider>
                    <OrdersProvider>
                      <NavigationContainer>
                        <AppNavigator />
                      </NavigationContainer>
                    </OrdersProvider>
                  </CartProvider>
                </PopupProvider>
              </TabBarProvider>
            </TryOnProvider>
          </WardrobeProvider>
        </CatalogProvider>
      </LoadingProvider>
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
