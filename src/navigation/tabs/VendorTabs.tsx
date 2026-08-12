// src/navigation/tabs/VendorTabs.tsx

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { VendorTabParamList } from '../types';
import VendorHomeScreen from '../../features/vendor/VendorHomeScreen';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator<VendorTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const renderVendorTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="vendor" />
);

const VendorTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderVendorTabBar}
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
