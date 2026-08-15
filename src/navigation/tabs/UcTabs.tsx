// src/navigation/tabs/UcTabs.tsx

import React, { useRef } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { UcTabParamList } from '../types';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';
import { UcDashboardScreen } from '@features/uc/dashboard';

const Tab = createBottomTabNavigator<UcTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const renderUcTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} role="uc" />
);

const UcTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={renderUcTabBar}
      >
        <Tab.Screen name="Dashboard" component={UcDashboardScreen} />
        <Tab.Screen name="Quotations" component={PlaceholderScreen} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen} />
        <Tab.Screen name="Trips" component={PlaceholderScreen} />
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

      <MoreSheet ref={moreSheetRef} role="uc" />
    </>
  );
};

export default UcTabs;
