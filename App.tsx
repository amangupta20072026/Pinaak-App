/**
 * ------------------------------------------------------------------
 * App root
 * ------------------------------------------------------------------
 * Provider stack (outermost → innermost):
 *   GestureHandlerRootView   — required by react-native-gesture-handler
 *   Provider (redux)         — dispatch / selector everywhere
 *   PersistGate              — waits for MMKV rehydration before render
 *   SafeAreaProvider         — insets available to every screen
 *   BottomSheetModalProvider — enables imperative bottom sheets anywhere
 *   NavigationContainer      — with navigationRef for imperative nav
 *     RootNavigator          — branches on Redux state
 * ------------------------------------------------------------------
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { store, persistor } from './src/store';
import { navigationRef } from './src/navigation/NavigationService';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

const SplashLoader: React.FC = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <PersistGate loading={<SplashLoader />} persistor={persistor}>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={Colors.background}
                translucent={false}
              />
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});