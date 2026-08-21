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
 * FOCUS RECONCILIATION (self-healing invariant):
 *   When the tabs screen loses focus (a stack push from anywhere in
 *   the app — including "user tapped a menu item that navigates"),
 *   we force-close the sheet and clear `isMoreSheetOpen`. Rationale:
 *
 *     - Without this, if the sheet stays visually open across a
 *       navigation event (e.g. because handleDismiss ran but a
 *       re-render was skipped due to freezeOnBlur), the tab bar's
 *       `overrideActiveIndex` sticks at the More index. On return,
 *       the notch is stuck on More even though the real active tab
 *       is Dashboard.
 *     - `MoreSheet.dismiss()` is idempotent — safe to call even if
 *       already closed.
 *     - Setting `isMoreSheetOpen` false is idempotent too — React
 *       bails on same-value setState.
 *
 *   Combined with the UI-thread animation reaction inside
 *   CustomTabBar, this guarantees that after ANY navigation, the
 *   next focus of the tabs screen lands with the notch at the real
 *   active tab. See CustomTabBar's header comment for the other
 *   half of the fix.
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
import { useFocusEffect } from '@react-navigation/native';

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
  screenOptions: { headerShown: false; freezeOnBlur: true };
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

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      /**
       * freezeOnBlur — react-navigation v7 + react-freeze integration.
       *
       * When a tab is not focused, React reconciliation for its subtree
       * is paused. TanStack Query keeps updating its cache; Redux keeps
       * dispatching; UI-thread animations (Reanimated, gesture-handler)
       * keep running — only JSX re-rendering is deferred until the tab
       * is focused again.
       *
       * Real-world impact for this app:
       *   - UC dashboard's charts and revenue queries stop redrawing
       *     while the user is on Bookings/Trips/Quotations. CPU + GPU
       *     saved on every state tick that would have caused an
       *     invisible re-render.
       *   - When the user returns to Dashboard, it re-renders once
       *     with the latest cached data — no stale UI, no re-fetch.
       *
       * Safe here because no tab in this app relies on background
       * setState-driven animation (i.e. `setInterval` that ticks a
       * useState counter to move a UI element). If such a screen is
       * added later, hoist the animation to Reanimated (UI thread)
       * or override this option per-screen with `freezeOnBlur: false`.
       */
      freezeOnBlur: true as const,
    }),
    [],
  );

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

  /* ---------------------------------------------------------------
   * Focus reconciliation — see file header. Runs whenever the tabs
   * screen (the one that hosts this hook) transitions in/out of
   * focus. Both the initial focus run AND the cleanup on blur do
   * the same thing: force the sheet closed and reset the
   * open-state flag, so no stack push can leave us with an orphan
   * "sheet visually open, real navigation elsewhere" mismatch.
   *
   * useCallback with empty deps is intentional — the effect only
   * needs to run on focus/blur transitions, never on prop changes.
   * ---------------------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      // On focus: ensure the sheet is closed. If we're re-focusing
      // after a stack pop, the sheet should have already been closed
      // by handleItemPress → dismiss(), but this is defence-in-depth
      // against edge cases (deep links, notification-driven nav,
      // programmatic navigate calls that bypass the sheet).
      moreSheetRef.current?.dismiss();
      setIsMoreSheetOpen(false);

      return () => {
        // On blur: same idempotent close. This is what guarantees the
        // notch snaps back to the real active tab on re-focus — with
        // isMoreSheetOpen=false, overrideActiveIndex is undefined, so
        // CustomTabBar tracks state.index directly.
        moreSheetRef.current?.dismiss();
        setIsMoreSheetOpen(false);
      };
    }, []),
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
