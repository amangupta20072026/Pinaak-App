// src/navigation/tabs/CustomerTabs.tsx

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import CustomerHomeScreen from '../../features/customer/CustomerHomeScreen';

import {
  CustomTabBar,
  useTabBarFootprint,
} from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';
import type { CustomerTabParamList } from '../types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const MORE_TAB_INDEX = 4;

const CustomerTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const bottomInset = useTabBarFootprint();

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar
        {...props}
        role="customer"
        overrideActiveIndex={isMoreSheetOpen ? MORE_TAB_INDEX : undefined}
      />
    ),
    [isMoreSheetOpen],
  );

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  return (
    <>
      <Tab.Navigator screenOptions={screenOptions} tabBar={renderTabBar}>
        <Tab.Screen name="Home" component={CustomerHomeScreen} />
        <Tab.Screen name="Quotations" component={PlaceholderScreen} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen} />
        <Tab.Screen name="Payments" component={PlaceholderScreen} />
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

      <MoreSheet
        ref={moreSheetRef}
        role="customer"
        bottomInset={bottomInset}
        onOpenChange={setIsMoreSheetOpen}
      />
    </>
  );
};

export default CustomerTabs;
