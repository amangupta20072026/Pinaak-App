// src/navigation/tabs/DriverTabs.tsx

/**
 * ==================================================================
 * DriverTabs — Tab navigator for the Driver role
 * ==================================================================
 * See UcTabs.tsx for the full one-way-data-flow contract governing
 * tab taps and the More sheet. Same rules apply here.
 * ==================================================================
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { DriverTabParamList } from '../types';
import DriverHomeScreen from '../../features/driver/DriverHomeScreen';
import {
  CustomTabBar,
  useTabBarFootprint,
} from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';

const Tab = createBottomTabNavigator<DriverTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const MORE_TAB_INDEX = 4;

const DriverTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const bottomInset = useTabBarFootprint();

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar
        {...props}
        role="driver"
        overrideActiveIndex={isMoreSheetOpen ? MORE_TAB_INDEX : undefined}
      />
    ),
    [isMoreSheetOpen],
  );

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  const openMoreListeners = useMemo(
    () => ({
      tabPress: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        moreSheetRef.current?.present();
      },
    }),
    [],
  );

  const screenListeners = useCallback(
    ({ route }: { route: { name: string } }) => ({
      tabPress: () => {
        if (route.name === 'More') return;
        moreSheetRef.current?.dismiss();
      },
    }),
    [],
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={screenOptions}
        screenListeners={screenListeners}
        tabBar={renderTabBar}
      >
        <Tab.Screen name="Home" component={DriverHomeScreen} />
        <Tab.Screen name="MyTrips" component={PlaceholderScreen} />
        <Tab.Screen name="Emergency" component={PlaceholderScreen} />
        <Tab.Screen name="Earnings" component={PlaceholderScreen} />
        <Tab.Screen
          name="More"
          component={PlaceholderScreen}
          listeners={openMoreListeners}
        />
      </Tab.Navigator>

      <MoreSheet
        ref={moreSheetRef}
        role="driver"
        bottomInset={bottomInset}
        onOpenChange={setIsMoreSheetOpen}
      />
    </>
  );
};

export default DriverTabs;
