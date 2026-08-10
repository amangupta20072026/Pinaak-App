/**
 * VendorNavigator — post-auth home stack for Vendor role.
 * Bottom tabs will land here; for now it's a single stub screen.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import VendorHomeScreen from '../features/vendor/VendorHomeScreen';
import type { VendorStackParamList } from './types';

const Stack = createNativeStackNavigator<VendorStackParamList>();

const VendorNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="VendorHome" component={VendorHomeScreen} />
  </Stack.Navigator>
);

export default VendorNavigator;