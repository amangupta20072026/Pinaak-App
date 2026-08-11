// src/navigation/tabs/UcTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { UcTabParamList } from '../types';

const Tab = createBottomTabNavigator<UcTabParamList>();

const PlaceholderScreen: React.FC = () => {
  return null;
};

const UcTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={PlaceholderScreen} />
      <Tab.Screen name="Bookings" component={PlaceholderScreen} />
      <Tab.Screen name="AddBooking" component={PlaceholderScreen} />
      <Tab.Screen name="Customers" component={PlaceholderScreen} />
      <Tab.Screen name="Reports" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default UcTabs;
