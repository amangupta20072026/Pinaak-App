// src/navigation/CustomerNavigator.tsx
/**
 * ------------------------------------------------------------------
 * CustomerNavigator
 * ------------------------------------------------------------------
 * All routes declared in CustomerStackParamList are registered here.
 * Screens that don't have a real implementation yet are wired to
 * NotImplementedScreen — this eliminates the "declared in types /
 * missing at runtime" class of bug where `navigate('SomeRoute', …)`
 * type-checks but throws at runtime.
 *
 * SWAP PROCEDURE:
 *   When a real screen lands, replace `component={NotImplementedScreen}`
 *   with the real component import. Route name and typing don't change.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerTabs from './tabs/CustomerTabs';
import type { CustomerStackParamList } from './types';
import { NotImplementedScreen } from '@features/shared/screens';
import SupportScreen from '@features/shared/support/screens/SupportScreen';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CustomerTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Real screens */}
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="Support" component={SupportScreen} />

      {/* Registered ghost routes — real screens land later. */}
      <Stack.Screen name="QuotationDetail" component={NotImplementedScreen} />
      <Stack.Screen name="BookingDetail" component={NotImplementedScreen} />
      <Stack.Screen name="PassengerList" component={NotImplementedScreen} />
      <Stack.Screen name="TripLive" component={NotImplementedScreen} />
      <Stack.Screen
        name="ModificationRequest"
        component={NotImplementedScreen}
      />
      <Stack.Screen name="AddRemark" component={NotImplementedScreen} />
      <Stack.Screen name="PayBalance" component={NotImplementedScreen} />
      <Stack.Screen name="GstInvoice" component={NotImplementedScreen} />
      <Stack.Screen name="Feedback" component={NotImplementedScreen} />
      <Stack.Screen
        name="NotificationCentre"
        component={NotImplementedScreen}
      />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
