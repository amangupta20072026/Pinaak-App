// src/navigation/tabs/VendorTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { VendorTabParamList } from '../types';
import VendorHomeScreen from '../../features/vendor/VendorHomeScreen';

const Tab = createBottomTabNavigator<VendorTabParamList>();

const PlaceholderScreen: React.FC = () => {
  return null;
};

const VendorTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={VendorHomeScreen} />
      <Tab.Screen name="Bookings" component={PlaceholderScreen} />
      <Tab.Screen name="Fleet" component={PlaceholderScreen} />
      <Tab.Screen name="Drivers" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default VendorTabs;
