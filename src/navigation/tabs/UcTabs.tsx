// src/navigation/tabs/UcTabs.tsx

/**
 * ==================================================================
 * UcTabs — Tab navigator for the UC (admin) role
 * ==================================================================
 *
 * SHEET / NAVIGATION CONTRACT (must not be violated):
 *   One-way data flow:  user tap → sheet reacts.
 *
 *   The signal we react to is React Navigation's `tabPress` event,
 *   NOT a change in `state.index`. React Navigation v7 guarantees
 *   `tabPress` fires on every tap of a tab — including the tab that
 *   is already focused — which is the exact case that was broken
 *   when the observer watched `state.index` (a re-tap of the focused
 *   tab produces no index change, so the sheet never dismissed and
 *   the tap was swallowed). See docs:
 *   https://reactnavigation.org/docs/bottom-tab-navigator/#tabpress
 *
 *   1. Non-More tabs have NO per-screen tabPress listener. When
 *      tapped, react-navigation navigates normally.
 *   2. The More tab's per-screen listener preventDefaults and calls
 *      `moreSheetRef.current?.present()`. That is the ONLY place
 *      the sheet is opened.
 *   3. `screenListeners.tabPress` on the Tab.Navigator is attached
 *      to every screen. For each firing it inspects the tapped
 *      route's name; if it is NOT the More tab, it dismisses the
 *      sheet. Dismiss is idempotent (guarded by the state machine
 *      inside MoreSheet), so it is safe when the sheet is already
 *      closed.
 *
 *   This eliminates the "tap the currently focused tab → nothing
 *   happens" bug without introducing a synchronous fight between
 *   dismiss and navigate — the More tab's presenter and the other
 *   tabs' dismisser are disambiguated by `route.name`, so they can
 *   never both fire for the same tap.
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

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar
        {...props}
        role="uc"
        overrideActiveIndex={isMoreSheetOpen ? MORE_TAB_INDEX : undefined}
      />
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

  /**
   * Global tab-tap dismiss handler — the React Navigation-sanctioned
   * pattern (`screenListeners` on Tab.Navigator, function form) for
   * cross-cutting tab-tap logic. Runs for every tapped tab.
   *
   * We skip the More tab (owned by `openMoreListeners` above) and
   * dismiss the sheet on every other tap. Because dismiss is
   * idempotent and the check is by `route.name` — not by focus state
   * — the "re-tap the currently focused tab" case is finally covered.
   */
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
