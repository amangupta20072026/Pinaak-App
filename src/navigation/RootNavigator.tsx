/**
 * ------------------------------------------------------------------
 * RootNavigator
 * ------------------------------------------------------------------
 * Conditional branch rendering — the React Navigation v7 recommended
 * auth-flow pattern. Only the branch matching current app state is
 * mounted, so users can't gesture back into a stack they shouldn't
 * be in, and role transitions can't race with animations.
 *
 * Branch selection:
 *   !hasSeenOnboardingThisSession  → OnboardingFlow
 *   !isAuthenticated               → AuthFlow
 *   userRole === 'customer'        → CustomerFlow
 *   userRole === 'vendor'          → VendorFlow
 *   userRole === 'driver'          → DriverFlow
 *   userRole === 'uc'              → UcFlow
 * ------------------------------------------------------------------
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import VendorNavigator from './VendorNavigator';
import DriverNavigator from './DriverNavigator';
import UcNavigator from './UcNavigator';

import { useAppSelector } from '../store/hooks';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const hasSeenOnboarding = useAppSelector(
    (s) => s.app.hasSeenOnboardingThisSession,
  );
  const isAuthenticated = useAppSelector((s) => s.app.isAuthenticated);
  const userRole = useAppSelector((s) => s.app.userRole);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      {!hasSeenOnboarding ? (
        <Stack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : userRole === 'customer' ? (
        <Stack.Screen name="CustomerFlow" component={CustomerNavigator} />
      ) : userRole === 'vendor' ? (
        <Stack.Screen name="VendorFlow" component={VendorNavigator} />
      ) : userRole === 'driver' ? (
        <Stack.Screen name="DriverFlow" component={DriverNavigator} />
      ) : userRole === 'uc' ? (
        <Stack.Screen name="UcFlow" component={UcNavigator} />
      ) : (
        // Defensive fallback — authenticated but no role. Send them
        // back through auth rather than crashing.
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;