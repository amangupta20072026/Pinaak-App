// src/navigation/tabs/DriverTabs.tsx

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { DriverTabParamList } from '../types';
import DriverHomeScreen from '../../features/driver/DriverHomeScreen';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator<DriverTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const renderDriverTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="driver" />
);

const DriverTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderDriverTabBar}
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
