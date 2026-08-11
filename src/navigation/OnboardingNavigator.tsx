/**
 * OnboardingNavigator — Onboarding slides only.
 *
 * The old role-picker screen (OnboardingDashboard) has been removed:
 * on "Get Started" / "Skip" the Onboarding screen now dispatches
 * completeOnboarding(), which causes RootNavigator to swap this stack
 * out for AuthFlow (if unauthenticated) or the role-specific home
 * stack (if authenticated).
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../features/auth/onboarding/OnboardingScreen';
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
  </Stack.Navigator>
);

export default OnboardingNavigator;
