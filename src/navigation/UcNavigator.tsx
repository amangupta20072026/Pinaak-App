// src/navigation/UcNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UcTabs from './tabs/UcTabs';
import { CustomersListScreen } from '@features/uc/customers';
import type { UcStackParamList } from './types';

const Stack = createNativeStackNavigator<UcStackParamList>();

const UcNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="UcTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="UcTabs" component={UcTabs} />
      <Stack.Screen name="CustomersList" component={CustomersListScreen} />
    </Stack.Navigator>
  );
};

export default UcNavigator;
