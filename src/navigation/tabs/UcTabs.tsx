// src/navigation/tabs/UcTabs.tsx

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { UcTabParamList } from '../types';
import UcHomeScreen from '../../features/uc/UcHomeScreen';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator<UcTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const renderUcTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="uc" />
);

const UcTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderUcTabBar}
    >
      <Tab.Screen name="Dashboard" component={UcHomeScreen} />
      <Tab.Screen name="Bookings" component={PlaceholderScreen} />
      <Tab.Screen name="AddBooking" component={PlaceholderScreen} />
      <Tab.Screen name="Customers" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default UcTabs;
