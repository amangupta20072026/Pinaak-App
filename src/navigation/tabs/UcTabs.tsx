// src/navigation/tabs/UcTabs.tsx

/**
 * ==================================================================
 * UcTabs — Tab navigator for the UC (admin) role
 * ==================================================================
 *
 * SHEET / NAVIGATION CONTRACT (must not be violated):
 *   One-way data flow:  navigation state change → sheet dismiss.
 *
 *   1. Non-More tabs have NO tabPress listener. When tapped, react-
 *      navigation navigates normally — nothing interferes with it.
 *   2. The More tab has a per-screen listener that preventDefaults
 *      and calls `moreSheetRef.current?.present()`. Nothing else.
 *   3. `SheetDismissOnRouteChange` is mounted inside the tabBar
 *      renderer. It watches `state.index` and calls dismiss() when
 *      the focused tab changes. This is what closes the sheet after
 *      a Bookings / Quotations / Trips tap — AFTER navigation has
 *      already completed successfully.
 *
 *   This eliminates the class of bugs where dismiss() and navigate()
 *   fight inside the same synchronous tap handler (previously seen
 *   as "tap Bookings while sheet open → app jumps to Dashboard").
 * ==================================================================
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type { UcTabParamList } from '../types';
import {
  CustomTabBar,
  useTabBarFootprint,
} from '../../components/navigation/CustomTabBar';
import {
  MoreSheet,
  SheetDismissOnRouteChange,
  type MoreSheetRef,
} from '../../components/navigation/MoreSheet';
import { UcDashboardScreen } from '@features/uc/dashboard';

const Tab = createBottomTabNavigator<UcTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const MORE_TAB_INDEX = 4;

const UcTabs: React.FC = () => {
  const moreSheetRef = useRef<MoreSheetRef>(null);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const bottomInset = useTabBarFootprint();

  /**
   * tabBar renderer — includes the invisible SheetDismissOnRouteChange
   * observer as a sibling of CustomTabBar so it re-renders whenever
   * the tab bar does and reacts to state.index changes.
   */
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <>
        <SheetDismissOnRouteChange
          tabIndex={props.state.index}
          sheetRef={moreSheetRef}
        />
        <CustomTabBar
          {...props}
          role="uc"
          overrideActiveIndex={isMoreSheetOpen ? MORE_TAB_INDEX : undefined}
        />
      </>
    ),
    [isMoreSheetOpen],
  );

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  /**
   * The ONLY per-screen listener in the whole navigator: the More
   * tab's preventDefault + present(). Stable via useMemo so React
   * Navigation attaches once and never re-registers.
   */
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
        <Tab.Screen name="Dashboard" component={UcDashboardScreen} />
        <Tab.Screen name="Quotations" component={PlaceholderScreen} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen} />
        <Tab.Screen name="Trips" component={PlaceholderScreen} />
        <Tab.Screen
          name="More"
          component={PlaceholderScreen}
          listeners={openMoreListeners}
        />
      </Tab.Navigator>

      <MoreSheet
        ref={moreSheetRef}
        role="uc"
        bottomInset={bottomInset}
        onOpenChange={setIsMoreSheetOpen}
      />
    </>
  );
};

export default UcTabs;
