// src/navigation/tabs/VendorTabs.tsx

/**
 * ==================================================================
 * VendorTabs — Tab navigator for the Vendor role
 * ==================================================================
 * See UcTabs.tsx for the one-way-data-flow contract governing tab
 * taps and the More sheet. Same rules apply here.
 * ==================================================================
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { VendorTabParamList } from '../types';
import VendorHomeScreen from '../../features/vendor/VendorHomeScreen';
import {
  CustomTabBar,
  useTabBarFootprint,
} from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  SheetDismissOnRouteChange,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';

const Tab = createBottomTabNavigator<VendorTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const MORE_TAB_INDEX = 4;

const VendorTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const bottomInset = useTabBarFootprint();

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <>
        <SheetDismissOnRouteChange
          tabIndex={props.state.index}
          sheetRef={moreSheetRef}
        />
        <CustomTabBar
          {...props}
          role="vendor"
          overrideActiveIndex={isMoreSheetOpen ? MORE_TAB_INDEX : undefined}
        />
      </>
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

  return (
    <>
      <Tab.Navigator screenOptions={screenOptions} tabBar={renderTabBar}>
        <Tab.Screen name="Dashboard" component={VendorHomeScreen} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen} />
        <Tab.Screen name="Fleet" component={PlaceholderScreen} />
        <Tab.Screen name="Drivers" component={PlaceholderScreen} />
        <Tab.Screen
          name="More"
          component={PlaceholderScreen}
          listeners={openMoreListeners}
        />
      </Tab.Navigator>

      <MoreSheet
        ref={moreSheetRef}
        role="vendor"
        bottomInset={bottomInset}
        onOpenChange={setIsMoreSheetOpen}
      />
    </>
  );
};

export default VendorTabs;
