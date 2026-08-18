// src/navigation/UcNavigator.tsx
/**
 * ------------------------------------------------------------------
 * UcNavigator — see CustomerNavigator for the ghost-route policy.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UcTabs from './tabs/UcTabs';
import { CustomersListScreen } from '@features/uc/customers';
import type { UcStackParamList } from './types';
import { NotImplementedScreen } from '@features/shared/screens';
import SupportScreen from '@features/shared/support/screens/SupportScreen';

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
      {/* Real screens */}
      <Stack.Screen name="UcTabs" component={UcTabs} />
      <Stack.Screen name="CustomersList" component={CustomersListScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />

      {/* Registered ghost routes — real screens land later. */}
      <Stack.Screen name="EnquiryDetail" component={NotImplementedScreen} />
      <Stack.Screen name="CreateEnquiry" component={NotImplementedScreen} />
      <Stack.Screen name="QuotationBuilder" component={NotImplementedScreen} />
      <Stack.Screen name="QuotationRevision" component={NotImplementedScreen} />
      <Stack.Screen name="CustomerDetail" component={NotImplementedScreen} />
      <Stack.Screen name="VendorDetail" component={NotImplementedScreen} />
      <Stack.Screen
        name="VendorApprovalQueue"
        component={NotImplementedScreen}
      />
      <Stack.Screen name="AssignVendor" component={NotImplementedScreen} />
      <Stack.Screen name="TripMonitor" component={NotImplementedScreen} />
      <Stack.Screen
        name="ChangeVehicleApproval"
        component={NotImplementedScreen}
      />
      <Stack.Screen name="PayinDetail" component={NotImplementedScreen} />
      <Stack.Screen name="PayoutDetail" component={NotImplementedScreen} />
      <Stack.Screen
        name="NotificationCentre"
        component={NotImplementedScreen}
      />
    </Stack.Navigator>
  );
};

export default UcNavigator;
