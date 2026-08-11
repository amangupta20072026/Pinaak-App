// src/navigation/VendorNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VendorTabs from './tabs/VendorTabs';
import type { VendorStackParamList } from './types';

const Stack = createNativeStackNavigator<VendorStackParamList>();

const VendorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="VendorTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="VendorTabs" component={VendorTabs} />
    </Stack.Navigator>
  );
};

export default VendorNavigator;
