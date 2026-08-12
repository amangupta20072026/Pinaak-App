// src/navigation/tabs/DriverTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { DriverTabParamList } from '../types';
import DriverHomeScreen from '../../features/driver/DriverHomeScreen';

const Tab = createBottomTabNavigator<DriverTabParamList>();

const PlaceholderScreen: React.FC = () => {
  return null;
};

const DriverTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DriverHomeScreen} />
      <Tab.Screen name="MyTrips" component={PlaceholderScreen} />
      <Tab.Screen name="Emergency" component={PlaceholderScreen} />
      <Tab.Screen name="Earnings" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default DriverTabs;
