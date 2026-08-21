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
 * TODO(future):
 *   - Some actionIds currently `noop()` because their target screens
 *     aren't declared in any ParamList yet (e.g. Profile, Settings,
 *     Feedback). Declare + register + `navigate('ScreenName')` — the
 *     type system will accept it automatically once the ParamList
 *     entry lands.
 * ------------------------------------------------------------------
 */

import { useCallback } from 'react';

import { navigate } from '@navigation/NavigationService';
import { useAppDispatch } from '@store/hooks';
import { logout } from '@store/slices/appSlice';
import { clearTokens } from '@services/storage/secureStorage';

import type { MoreActionId } from './moreMenuConfig';

/* -----------------------------------------------------------------
 * Hook
 * ----------------------------------------------------------------- */

export function useMoreActions() {
  const dispatch = useAppDispatch();

  /**
   * `run` receives an actionId and executes the mapped behavior.
   * Called by MoreSheet AFTER the sheet has finished dismissing, so
   * navigation animations don't fight the sheet's slide-out.
   */
  const run = useCallback(
    (actionId: MoreActionId): void => {
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
        case 'profile':
          navigate('Profile');
          return;

        case 'notifications':
          // Every role stack declares & registers NotificationCentre
          // (as a NotImplementedScreen placeholder until the real UI
          // lands). Tapping the tile visibly navigates to the
          // placeholder, which is better UX than a silent no-op.
          navigate('NotificationCentre');
          return;

        case 'support':
          // Support is registered in AuthParamList and in every role
          // stack. `navigate` (now widened) resolves it against the
          // currently mounted tree.
          navigate('Support');
          return;

        case 'feedback':
          navigate('Feedback');
          return;

        case 'settings':
          navigate('Settings');
          return;

        case 'logout':
          // Clear secure tokens first, then dispatch redux logout —
          // RootNavigator will swap to AuthFlow automatically.
          void clearTokens();
          dispatch(logout());
          return;

        /* ---- Customer ---- */
        case 'customer.invoices':
        case 'customer.payment':
        case 'customer.referrals':
        case 'customer.feedback':
          // TODO: point at dedicated screens once they exist. Referral
          // & Rewards and Feedback are Engagement-section entries in
          // the customer's More sheet.
          noop();
          return;

        /* ---- Vendor ---- */
        case 'vendor.fleet':
        case 'vendor.drivers':
        case 'vendor.payouts':
        case 'vendor.maintenance':
        case 'vendor.reports':
          noop();
          return;

        /* ---- Driver ---- */
        case 'driver.routes':
        case 'driver.fuelLog':
        case 'driver.incidents':
        case 'driver.rewards':
          noop();
          return;

        /* ---- UC ---- */
        case 'uc.customers':
          navigate('CustomersList');
          return;

        case 'uc.vendors':
          navigate('VendorsList');
          return;

        case 'uc.payments':
          navigate('Payments');
          return;

        case 'uc.drivers':
          navigate('DriversList');
          return;

        case 'uc.issues':
          navigate('Issues');
          return;

        case 'uc.performance':
          navigate('Performance');
          return;

        default: {
          // Exhaustiveness check — if you add a new MoreActionId
          // without handling it here, TypeScript will error on this
          // line. That's intentional: it forces you to wire behavior
          // for every new item.
          const _exhaustive: never = actionId;
          void _exhaustive;
          return;
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
