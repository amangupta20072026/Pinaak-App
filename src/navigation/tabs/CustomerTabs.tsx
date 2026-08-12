// src/navigation/tabs/CustomerTabs.tsx

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import CustomerHomeScreen from '../../features/customer/CustomerHomeScreen';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';
import type { CustomerTabParamList } from '../types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const PlaceholderScreen: React.FC = () => null;

// Hoisted out of CustomerTabs so it isn't re-created on every render.
// React Navigation gets a stable reference and the tab bar's subtree
// state is preserved across parent renders.
const renderCustomerTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="customer" />
);

const CustomerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderCustomerTabBar}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Quotations" component={PlaceholderScreen} />
      <Tab.Screen name="Bookings" component={PlaceholderScreen} />
      <Tab.Screen name="Payments" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default CustomerTabs;
