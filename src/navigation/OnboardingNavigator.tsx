// src/navigation/OnboardingNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashIntroScreen from '../features/auth/onboarding/SplashIntroScreen';
import OnboardingScreen from '../features/auth/onboarding/OnboardingScreen';
import type { OnboardingParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashIntroScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;