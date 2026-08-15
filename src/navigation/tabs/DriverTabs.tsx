// src/navigation/tabs/DriverTabs.tsx

import React, { useRef } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { DriverTabParamList } from '../types';
import DriverHomeScreen from '../../features/driver/DriverHomeScreen';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';

const Tab = createBottomTabNavigator<DriverTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const renderDriverTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="driver" />
);

const DriverTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={renderDriverTabBar}
      >
        <Tab.Screen name="Home" component={DriverHomeScreen} />
        <Tab.Screen name="MyTrips" component={PlaceholderScreen} />
        <Tab.Screen name="Emergency" component={PlaceholderScreen} />
        <Tab.Screen name="Earnings" component={PlaceholderScreen} />
        <Tab.Screen
          name="More"
          component={PlaceholderScreen}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              moreSheetRef.current?.present();
            },
          }}
        />
      </Tab.Navigator>

      <MoreSheet ref={moreSheetRef} role="driver" />
    </>
  );
};

export default DriverTabs;
