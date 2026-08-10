/**
 * OnboardingNavigator — Onboarding + Role picker
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../features/auth/onboarding/OnboardingScreen';
import OnboardingDashboardScreen from '../features/auth/onboarding/OnboardingDashboardScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Onboarding"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="OnboardingDashboard" component={OnboardingDashboardScreen} />
  </Stack.Navigator>
);

export default OnboardingNavigator;