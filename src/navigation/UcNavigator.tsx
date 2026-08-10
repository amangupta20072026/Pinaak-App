/**
 * UcNavigator — post-auth home stack for Uc role.
 * Bottom tabs will land here; for now it's a single stub screen.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UcHomeScreen from '../features/uc/UcHomeScreen';
import type { UcStackParamList } from './types';

const Stack = createNativeStackNavigator<UcStackParamList>();

const UcNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="UcHome" component={UcHomeScreen} />
  </Stack.Navigator>
);

export default UcNavigator;