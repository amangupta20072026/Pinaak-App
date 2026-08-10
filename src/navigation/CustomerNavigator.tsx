/**
 * CustomerNavigator — post-auth home stack for Customer role.
 * Bottom tabs will land here; for now it's a single stub screen.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerHomeScreen from '../features/customer/CustomerHomeScreen';
import type { CustomerStackParamList } from './types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
  </Stack.Navigator>
);

export default CustomerNavigator;