/* eslint-disable no-void */
/**
 * ------------------------------------------------------------------
 * useMoreActions — Behavior for MoreSheet items
 * ------------------------------------------------------------------
 * The single place that resolves a `MoreActionId` (from
 * moreMenuConfig.tsx) into a real side-effect: navigation, Redux
 * dispatch, logout, etc.
 *
 * WHY THIS EXISTS:
 *   - Keeps `moreMenuConfig.tsx` as pure data (safe for anyone to edit).
 *   - All behavior — navigation targets, redux actions, keychain
 *     clears — lives in ONE spot, so changes are easy to reason about.
 *   - New actions? Add to the switch. TypeScript's exhaustiveness
 *     check will warn if you forget to handle one.
 *
 * WIRING:
 *   - Uses the imperative `navigate()` helper from NavigationService,
 *     the same one already used by the axios refresh interceptor.
 *     Works from anywhere, including inside modals/sheets that sit
 *     outside the navigation stack. As of the typing widening in
 *     NavigationService, `navigate` accepts any route declared
 *     anywhere in the app — no `as never` casts needed.
 *   - Uses `useAppDispatch()` for redux (logout).
 *
 * ACTION RESULT CONTRACT (added — read before touching this file):
 *
 *   `run()` now returns a discriminated result:
 *
 *     'navigated' — the action pushed a screen or triggered a role
 *                   flow swap. The tabs screen containing MoreSheet
 *                   will BLUR imminently. The parent (MoreSheet →
 *                   useMoreTabController) uses this signal to KEEP
 *                   the tab bar's "More is visually active" override
 *                   in place until the tabs screen actually blurs.
 *                   Releasing it any earlier causes the fixed bug:
 *                   for one frame between sheet dismiss and destination
 *                   mount, the badge/notch springs back to the
 *                   pre-More tab (e.g. Dashboard) and the destination-
 *                   less user briefly sees "wrong active tab."
 *
 *     'inline'    — the action did NOT navigate (a no-op today, or a
 *                   toggle / modal / clipboard write). The tabs screen
 *                   will stay focused. The parent must release the
 *                   visual override immediately so the badge/notch
 *                   snaps back to the real active tab.
 *
 *   Every case in the switch MUST return one of these two values.
 *   The exhaustiveness check at the bottom keeps that honest.
 *
 * TODO(future):
 *   - Some actionIds currently `noop()` because their target screens
 *     aren't declared in any ParamList yet (e.g. customer / vendor /
 *     driver entries). Once each gets a `navigate('ScreenName')`
 *     call, flip its return value from 'inline' to 'navigated'.
 * ------------------------------------------------------------------
 */

import { useCallback } from 'react';

import { navigate } from '@navigation/NavigationService';
import { useAppDispatch } from '@store/hooks';
import { logout } from '@store/slices/appSlice';
import { clearTokens } from '@services/storage/secureStorage';

import type { MoreActionId } from './moreMenuConfig';

/* -----------------------------------------------------------------
 * Public types
 * ----------------------------------------------------------------- */

/**
 * Outcome of running a More menu action. See the file header for the
 * full contract. Used by MoreSheet to decide whether to hold or
 * release the tab bar's visual "More active" override.
 */
export type MoreActionResult = 'navigated' | 'inline';

/* -----------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------- */

export function useMoreActions() {
  const dispatch = useAppDispatch();

  /**
   * `run` receives an actionId, executes the mapped behavior, and
   * returns whether the action navigated ('navigated') or stayed on
   * the current screen ('inline').
   *
   * Called by MoreSheet AFTER the sheet has finished dismissing, so
   * navigation animations don't fight the sheet's slide-out.
   */
  const run = useCallback(
    (actionId: MoreActionId): MoreActionResult => {
      switch (actionId) {
        /* ---- Shared ---- */
        //
        // NOTE (UC-only wiring): these shared routes (Profile,
        // Settings, Feedback) are currently registered ONLY in the
        // UC stack (as ComingSoon placeholders). `navigate` resolves
        // them against the currently mounted role stack — so tapping
        // Profile from a customer/vendor/driver role will silently
        // no-op until each role's navigator also declares + registers
        // these screens. This matches the current product scope:
        // build UC first, other roles later.
        //
        // We still return 'navigated' here because from the CALLER's
        // perspective the intent was to navigate. When the target is
        // not registered under the current stack and navigate silently
        // no-ops, the tabs screen won't blur — so the useMoreTab-
        // Controller has a defensive timeout fallback that clears the
        // override if no blur occurs within one frame budget.
        //
        case 'profile':
          navigate('Profile');
          return 'navigated';

        case 'notifications':
          // Every role stack declares & registers NotificationCentre
          // (as a NotImplementedScreen placeholder until the real UI
          // lands). Tapping the tile visibly navigates to the
          // placeholder, which is better UX than a silent no-op.
          navigate('NotificationCentre');
          return 'navigated';

        case 'support':
          // Support is registered in AuthParamList and in every role
          // stack. `navigate` (now widened) resolves it against the
          // currently mounted tree.
          navigate('Support');
          return 'navigated';

        case 'feedback':
          navigate('Feedback');
          return 'navigated';

        case 'settings':
          navigate('Settings');
          return 'navigated';

        case 'logout':
          // Clear secure tokens first, then dispatch redux logout —
          // RootNavigator will swap to AuthFlow automatically. That
          // swap unmounts this whole role navigator, which triggers
          // useMoreTabController's useFocusEffect cleanup and releases
          // the override anyway. Return 'navigated' so the visual
          // override holds during the swap transition.
          void clearTokens();
          dispatch(logout());
          return 'navigated';

        /* ---- Customer ---- */
        case 'customer.invoices':
        case 'customer.payment':
        case 'customer.referrals':
        case 'customer.feedback':
          // TODO: point at dedicated screens once they exist. Referral
          // & Rewards and Feedback are Engagement-section entries in
          // the customer's More sheet. Until then these are true
          // no-ops → 'inline' so the tab bar snaps back correctly.
          noop();
          return 'inline';

        /* ---- Vendor ---- */
        case 'vendor.fleet':
        case 'vendor.drivers':
        case 'vendor.payouts':
        case 'vendor.maintenance':
        case 'vendor.reports':
          noop();
          return 'inline';

        /* ---- Driver ---- */
        case 'driver.routes':
        case 'driver.fuelLog':
        case 'driver.incidents':
        case 'driver.rewards':
          noop();
          return 'inline';

        /* ---- UC ---- */
        case 'uc.customers':
          navigate('CustomersList');
          return 'navigated';

        case 'uc.vendors':
          navigate('VendorsList');
          return 'navigated';

        case 'uc.payments':
          navigate('Payments');
          return 'navigated';

        case 'uc.drivers':
          navigate('DriversList');
          return 'navigated';

        case 'uc.issues':
          navigate('Issues');
          return 'navigated';

        case 'uc.performance':
          navigate('Performance');
          return 'navigated';

        default: {
          // Exhaustiveness check — if you add a new MoreActionId
          // without handling it here, TypeScript will error on this
          // line. That's intentional: it forces you to wire behavior
          // AND declare the result kind for every new item.
          const _exhaustive: never = actionId;
          void _exhaustive;
          return 'inline';
        }
      }
    },
    [dispatch],
  );

  return { run };
}

/* -----------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------- */

/** Placeholder for actions whose target screen doesn't exist yet. */
function noop(): void {
  // Intentionally empty.
}
