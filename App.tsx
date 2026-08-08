import React from 'react';
import { StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import SplashScreen from './src/features/auth/SplashScreen';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <SplashScreen />
    </SafeAreaProvider>
  );
};

export default App;