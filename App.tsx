import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import OnboardingScreen from './src/features/auth/OnboardingScreen';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <OnboardingScreen />
    </SafeAreaProvider>
  );
};

export default App;