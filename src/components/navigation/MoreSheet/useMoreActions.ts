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
 *     outside the navigation stack.
 *   - Uses `useAppDispatch()` for redux (logout).
 *
 * TODO(future):
 *   - Many actionIds currently `noop()` because those screens don't
 *     exist yet. Replace `noop()` with `navigate('ScreenName')` as
 *     each screen lands. The type system will remind you.
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
        case 'profile':
          // TODO: navigate('Profile' as never) once the screen exists.
          noop();
          return;

        case 'notifications':
          // Each role stack declares a NotificationCentre screen in
          // src/navigation/types.ts. Uncomment when the screen lands:
          // navigate('NotificationCentre' as never);
          noop();
          return;

        case 'support':
          // Support IS declared in AuthParamList and each role stack.
          // Cast is needed because `navigate` is typed against the
          // root param list only.
          navigate('Support' as never);
          return;

        case 'feedback':
          // TODO: point at a dedicated Feedback screen once it exists.
          // Routed to Support for now so the UC "More" sheet has a
          // working destination.
          noop();
          return;

        case 'settings':
          noop();
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
        case 'customer.addresses':
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
          navigate('CustomersList' as never);
          return;

        case 'uc.vendors':
        case 'uc.payments':
        case 'uc.drivers':
        case 'uc.issues':
        case 'uc.performance':
          noop();
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
