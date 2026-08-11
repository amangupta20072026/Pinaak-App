// src/navigation/DriverNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverTabs from './tabs/DriverTabs';

import type { DriverStackParamList } from './types';

const Stack = createNativeStackNavigator<DriverStackParamList>();

const DriverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DriverTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
    </Stack.Navigator>
  );
};

export default DriverNavigator;
