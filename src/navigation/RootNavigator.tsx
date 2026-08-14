/**
 * ------------------------------------------------------------------
 * RootNavigator
 * ------------------------------------------------------------------
 * Single stack, conditional groups — React Navigation v7's officially
 * recommended auth-flow pattern. Rendering exactly one group at a time
 * guarantees:
 *   - Users cannot gesture back into a stack they shouldn't be in.
 *   - Role transitions can't race with in-flight animations.
 *   - Fade animations between groups look intentional.
 *
 * Branch selection ladder (top wins):
 *
 *   !bootstrapped                    → SplashIntro (bootstrap runs in parallel)
 *   !hasSeenOnboardingThisSession    → OnboardingFlow (shows EVERY launch)
 *   !isAuthenticated                 → AuthFlow
 *   userRole === 'customer'          → CustomerFlow
 *   userRole === 'vendor'            → VendorFlow
 *   userRole === 'driver'            → DriverFlow
 *   userRole === 'uc'                → UcFlow
 *   (fallback — auth glitch)         → AuthFlow
 *
 * ONBOARDING BEHAVIOR:
 *   `hasSeenOnboardingThisSession` is a session-only flag. Every cold
 *   start it resets to false, so onboarding shows on every launch —
 *   regardless of login status. Tapping Skip / Get Started flips it
 *   to true for the current session only.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashIntroScreen from '../features/auth/SplashIntroScreen';
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
  const bootstrapped = useAppSelector(s => s.app.bootstrapped);
  const hasSeenOnboardingThisSession = useAppSelector(
    s => s.app.hasSeenOnboardingThisSession,
  );
  const isAuthenticated = useAppSelector(s => s.app.isAuthenticated);
  const userRole = useAppSelector(s => s.app.userRole);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      {!bootstrapped ? (
        <Stack.Screen name="SplashIntro" component={SplashIntroScreen} />
      ) : !hasSeenOnboardingThisSession ? (
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
        // Defensive: authenticated but no role. Route back to auth.
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
