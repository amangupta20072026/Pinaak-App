/**
 * ------------------------------------------------------------------
 * Navigation Types
 * ------------------------------------------------------------------
 * One param list per navigator. The RootParamList augmentation gives
 * autocomplete + type-safety to bare `useNavigation()` calls.
 * ------------------------------------------------------------------
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '../store/slices/appSlice';

/* -------- Onboarding stack -------- */
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

/* -------- Auth stack -------- */
export type AuthStackParamList = {
  Login: { role: UserRole };
  SignUp: { role: UserRole };
  Otp: { role: UserRole; phone: string };
  ForgotPassword: { role: UserRole };
};

/* -------- Role-specific stacks (stubs for now) -------- */
export type CustomerStackParamList = {
  CustomerHome: undefined;
};
export type VendorStackParamList = {
  VendorHome: undefined;
};
export type DriverStackParamList = {
  DriverHome: undefined;
};
export type UcStackParamList = {
  UcHome: undefined;
};

/* -------- Root -------- */
export type RootStackParamList = {
  OnboardingFlow: NavigatorScreenParams<OnboardingStackParamList>;
  AuthFlow: NavigatorScreenParams<AuthStackParamList>;
  CustomerFlow: NavigatorScreenParams<CustomerStackParamList>;
  VendorFlow: NavigatorScreenParams<VendorStackParamList>;
  DriverFlow: NavigatorScreenParams<DriverStackParamList>;
  UcFlow: NavigatorScreenParams<UcStackParamList>;
};

/* Global augmentation — enables typed `useNavigation()` without params. */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
