/**
 * ==================================================================
 * useMoreTabController — shared controller for role-specific tab
 * navigators that host the More bottom sheet.
 * ==================================================================
 *
 * SHEET / NAVIGATION CONTRACT (must not be violated):
 *   One-way data flow:  user tap → sheet reacts.
 *
 *   The signal we react to is React Navigation's `tabPress` event,
 *   NOT a change in `state.index`. React Navigation v7 guarantees
 *   `tabPress` fires on every tap of a tab — including the tab that
 *   is already focused — which is the exact case that was broken
 *   when the previous observer watched `state.index` (re-tapping the
 *   focused tab produces no index change, so the sheet never
 *   dismissed and the tap was swallowed). See docs:
 *   https://reactnavigation.org/docs/bottom-tab-navigator/#tabpress
 *
 *   1. Non-More tabs have NO per-screen tabPress listener. When
 *      tapped, react-navigation navigates normally.
 *   2. The More tab's per-screen listener (`openMoreListeners`)
 *      preventDefaults and calls `moreSheetRef.current?.present()`.
 *      That is the ONLY place the sheet is opened.
 *   3. `screenListeners.tabPress` on the Tab.Navigator is attached
 *      to every screen. For each firing it inspects the tapped
 *      route's name; if it is NOT the More tab, it dismisses the
 *      sheet. Dismiss is idempotent (guarded by the state machine
 *      inside MoreSheet), so it is safe when the sheet is already
 *      closed.
 *
 *   The presenter (More per-screen listener) and the dismisser
 *   (Navigator-level screenListeners for every other route) are
 *   disambiguated by `route.name === MORE_ROUTE_NAME`, so they
 *   cannot both fire for the same tap. `MORE_ROUTE_NAME` is a
 *   typed constant so rename drift is caught by TypeScript.
 *
 * WHY A HOOK — role scalability:
 *   Every role-specific tab navigator (UcTabs, CustomerTabs,
 *   VendorTabs, DriverTabs, ...future) needs identical plumbing:
 *   stable refs, memoised handlers, the MoreSheet element, and a
 *   custom tab bar renderer that reacts to sheet-open state.
 *   Duplicating that across roles is how bugs like the one this
 *   file exists to fix get reintroduced. Centralising it into
 *   `useMoreTabController(role)` collapses each tab file to a
 *   screen list plus one hook call.
 *
 *   Adding a fifth role becomes:
 *
 *     const {
 *       screenOptions, screenListeners, openMoreListeners,
 *       renderTabBar, MoreSheetElement,
 *     } = useMoreTabController('newRole');
 *
 * ==================================================================
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import {
  CustomTabBar,
  useTabBarFootprint,
} from '@components/navigation/CustomTabBar';
import {
  MoreSheet,
  type MoreSheetRef,
  type MoreRole,
} from '@components/navigation/MoreSheet';

import { MORE_ROUTE_NAME } from './routeNames';

/* -----------------------------------------------------------------
 * Public surface
 * ----------------------------------------------------------------- */

/**
 * Minimal shape of the `route` object we need. We deliberately don't
 * import RouteProp<...> here because this hook is role-agnostic and
 * each caller's ParamList is different; a structural type keeps the
 * hook reusable while still catching the common typo (`.name`).
 */
type TabRouteMinimal = { name: string };

export type MoreTabController = {
  /** Spread as `screenOptions` on the Tab.Navigator. */
  screenOptions: { headerShown: false };
  /** Pass as `screenListeners` on the Tab.Navigator. Dismisses the sheet on any non-More tabPress. */
  screenListeners: (args: { route: TabRouteMinimal }) => {
    tabPress: () => void;
  };
  /** Pass as `listeners` on the More `<Tab.Screen>`. preventDefaults + presents the sheet. */
  openMoreListeners: {
    tabPress: (e: { preventDefault: () => void }) => void;
  };
  /** Pass as `tabBar` on the Tab.Navigator. */
  renderTabBar: (props: BottomTabBarProps) => React.ReactElement;
  /**
   * Render as a SIBLING of the Tab.Navigator (typically inside a
   * fragment: `<><Tab.Navigator … />{MoreSheetElement}</>`).
   * The hook owns the ref used by the listeners above, so this
   * element MUST be mounted for the listeners to have any effect.
   */
  MoreSheetElement: React.ReactElement;
};

/* -----------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------- */

export function useMoreTabController(role: MoreRole): MoreTabController {
  const moreSheetRef = useRef<MoreSheetRef>(null);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const bottomInset = useTabBarFootprint();

  const screenOptions = useMemo(() => ({ headerShown: false as const }), []);

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
    ({ route }: { route: TabRouteMinimal }) => ({
      tabPress: () => {
        // Presenter's territory — do not touch. Any dismiss here
        // would race with openMoreListeners.present() and collapse
        // the sheet instantly on every open.
        if (route.name === MORE_ROUTE_NAME) return;
        // Idempotent thanks to MoreSheet's internal state machine.
        moreSheetRef.current?.dismiss();
      },
    }),
    [],
  );

  const renderTabBar = useCallback(
    (props: BottomTabBarProps): React.ReactElement => {
      // Derive the More tab's index from the live navigation state
      // instead of hardcoding it. If tabs are reordered or a role
      // uses a different layout, this stays correct with no edits.
      const moreIndex = props.state.routes.findIndex(
        r => r.name === MORE_ROUTE_NAME,
      );
      return (
        <CustomTabBar
          {...props}
          role={role}
          overrideActiveIndex={
            isMoreSheetOpen && moreIndex >= 0 ? moreIndex : undefined
          }
        />
      );
    },
    [isMoreSheetOpen, role],
  );

  const MoreSheetElement = (
    <MoreSheet
      ref={moreSheetRef}
      role={role}
      bottomInset={bottomInset}
      onOpenChange={setIsMoreSheetOpen}
    />
  );

  return {
    screenOptions,
    screenListeners,
    openMoreListeners,
    renderTabBar,
    MoreSheetElement,
  };
}
