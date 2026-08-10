/**
 * ------------------------------------------------------------------
 * NavigationService
 * ------------------------------------------------------------------
 * Enables navigation from outside React components — e.g. axios
 * interceptors handling 401, FCM notification handlers, deep-link
 * resolvers. Wire the ref onto NavigationContainer in App.tsx.
 * ------------------------------------------------------------------
 */

import {
  CommonActions,
  StackActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/** True once NavigationContainer has finished mounting. */
export const isReady = (): boolean => navigationRef.isReady();

/** Typed navigate — safe to call before ready (silently no-ops). */
export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: RootStackParamList[RouteName] extends undefined
    ? [screen: RouteName]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
): void {
  if (!navigationRef.isReady()) return;
  // The overload above narrows callers correctly; the runtime call
  // just forwards positional args.
  (navigationRef.navigate as any)(...args);
}

export function goBack(): void {
  if (!navigationRef.isReady() || !navigationRef.canGoBack()) return;
  navigationRef.goBack();
}

/** Hard-reset the whole stack — use for auth transitions from outside React. */
export function reset(routeName: keyof RootStackParamList): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName }],
    }),
  );
}

/** Replace the current screen. */
export function replace(routeName: string, params?: object): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(StackActions.replace(routeName, params));
}

export function getCurrentRoute() {
  if (!navigationRef.isReady()) return undefined;
  return navigationRef.getCurrentRoute();
}