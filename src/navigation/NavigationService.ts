/**
 * ------------------------------------------------------------------
 * NavigationService
 * ------------------------------------------------------------------
 * Enables navigation from outside React components — e.g. axios
 * interceptors handling 401, FCM notification handlers, deep-link
 * resolvers. Wire the ref onto NavigationContainer in App.tsx.
 *
 * TYPING CONTRACT:
 *   - `navigate` and `replace` are typed against `RootStackParamList`.
 *     From outside React, only top-level routes can be targeted; nested
 *     navigation should go through the normal `navigation` prop inside
 *     screens, which is fully typed by React Navigation.
 *   - `getCurrentRoute` returns a DISCRIMINATED UNION across every
 *     param list in the app, so callers get `route.params` narrowed
 *     correctly by `route.name` without any casts. This is what
 *     closed the "as never" escape hatch that used to leak into
 *     useMoreActions.
 * ------------------------------------------------------------------
 */

import {
  CommonActions,
  StackActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import type {
  AuthParamList,
  CustomerStackParamList,
  CustomerTabParamList,
  DriverStackParamList,
  DriverTabParamList,
  OnboardingParamList,
  RootStackParamList,
  UcStackParamList,
  UcTabParamList,
  VendorStackParamList,
  VendorTabParamList,
} from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** True once NavigationContainer has finished mounting. */
export const isReady = (): boolean => navigationRef.isReady();

/* =================================================================
 * navigate
 * ================================================================= */

/**
 * Typed navigate. The overload requires params exactly when the
 * target route needs them and forbids them otherwise. Safe to call
 * before the container is ready — silently no-ops.
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: RootStackParamList[RouteName] extends undefined
    ? [screen: RouteName]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
): void {
  if (!navigationRef.isReady()) return;
  // The overload above narrows callers correctly; the runtime call
  // just forwards positional args. The cast is confined here — no
  // caller sees `any`.
  (navigationRef.navigate as (...a: unknown[]) => void)(...args);
}

/* =================================================================
 * goBack
 * ================================================================= */

export function goBack(): void {
  if (!navigationRef.isReady() || !navigationRef.canGoBack()) return;
  navigationRef.goBack();
}

/* =================================================================
 * reset — hard-reset the whole root stack
 * ================================================================= */

/**
 * Use for auth transitions from outside React (e.g. axios 401 refresh
 * failure). Only accepts a top-level RootStackParamList route because
 * that's the level a reset makes sense at.
 */
export function reset(routeName: keyof RootStackParamList): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName }],
    }),
  );
}

/* =================================================================
 * replace — replace the current screen (typed)
 * ================================================================= */

/**
 * Typed replace. Same shape as `navigate` — requires params exactly
 * when the target route needs them, forbids them otherwise. Closes
 * the previous `routeName: string, params?: object` escape hatch.
 *
 * Replace dispatches to the currently focused stack, which may be
 * nested. Typing against `RootStackParamList` keeps the imperative
 * surface consistent with `navigate` and `reset`; nested-stack
 * replacements should be done from inside a screen using the fully
 * typed `navigation` prop rather than through this service.
 */
export function replace<RouteName extends keyof RootStackParamList>(
  ...args: RootStackParamList[RouteName] extends undefined
    ? [screen: RouteName]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
): void {
  if (!navigationRef.isReady()) return;
  const [screen, params] = args as [
    keyof RootStackParamList,
    object | undefined,
  ];
  navigationRef.dispatch(StackActions.replace(screen as string, params));
}

/* =================================================================
 * getCurrentRoute — typed with a discriminated union
 * ================================================================= */

/**
 * Maps a ParamList `L` to the union `{ name; params; key }` for every
 * entry in it. Concatenating one of these per app-wide param list
 * gives us `CurrentRoute` — a discriminated union that lets callers
 * write:
 *
 *   const r = getCurrentRoute();
 *   if (r?.name === 'BookingDetail') {
 *     r.params.bookingId; // typed as BookingId — no cast
 *   }
 */
type ParamListToRouteUnion<L> = {
  [K in keyof L]: { name: K & string; params: L[K]; key: string };
}[keyof L];

export type CurrentRoute =
  | ParamListToRouteUnion<RootStackParamList>
  | ParamListToRouteUnion<OnboardingParamList>
  | ParamListToRouteUnion<AuthParamList>
  | ParamListToRouteUnion<CustomerStackParamList>
  | ParamListToRouteUnion<CustomerTabParamList>
  | ParamListToRouteUnion<VendorStackParamList>
  | ParamListToRouteUnion<VendorTabParamList>
  | ParamListToRouteUnion<DriverStackParamList>
  | ParamListToRouteUnion<DriverTabParamList>
  | ParamListToRouteUnion<UcStackParamList>
  | ParamListToRouteUnion<UcTabParamList>;

/**
 * Returns the deepest currently focused route, typed as a
 * discriminated union across every app-wide param list. Returns
 * `undefined` when the container isn't ready or no route is active.
 *
 * The single `as CurrentRoute` cast is confined here — it's the
 * boundary between React Navigation's structurally-typed `Route`
 * and our declared union. Every registered route name in the app
 * is a variant of the union, so the runtime value is guaranteed to
 * match one; the cast just informs the compiler.
 */
export function getCurrentRoute(): CurrentRoute | undefined {
  if (!navigationRef.isReady()) return undefined;
  const route = navigationRef.getCurrentRoute();
  if (!route) return undefined;
  return {
    name: route.name,
    params: route.params,
    key: route.key,
  } as CurrentRoute;
}

/**
 * Convenience helper — returns just the current route name, narrowed
 * to the union of all known route names. Cheaper to use in feature
 * code that only cares about "am I on X?" checks.
 */
export function getCurrentRouteName(): CurrentRoute['name'] | undefined {
  return getCurrentRoute()?.name;
}
