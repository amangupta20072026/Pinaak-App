/**
 * DriverNavigator — post-auth home stack for Driver role.
 * Bottom tabs will land here; for now it's a single stub screen.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DriverHomeScreen from '../features/driver/DriverHomeScreen';
import type { DriverStackParamList } from './types';

const Stack = createNativeStackNavigator<DriverStackParamList>();

const DriverNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
  </Stack.Navigator>
);

export default DriverNavigator;