/**
 * ------------------------------------------------------------------
 * MoreSheet — Per-role menu config (PURE DATA)
 * ------------------------------------------------------------------
 * Single source of truth for what the "More" bottom-sheet shows in
 * each role. Consumed by MoreSheet.tsx.
 *
 * DESIGN RULE:
 *   This file holds ONLY data — labels, icons, colors, and a string
 *   `actionId`. It NEVER imports navigation, redux, or side-effects.
 *   Behavior lives in `useMoreActions.ts`, which maps actionId → real
 *   action. This keeps config editable by anyone (product, design)
 *   without pulling in behavior concerns.
 *
 * To add a new item:
 *   1. Add its id to the MoreActionId union below.
 *   2. Add a row to the appropriate per-role array.
 *   3. Handle the id in useMoreActions.ts.
 *
 * Same shape/spirit as ../CustomTabBar/tabConfig.ts.
 * ------------------------------------------------------------------
 */

import type { ComponentType } from 'react';
import {
  Bell,
  LifeBuoy,
  Settings,
  User,
  FileText,
  CreditCard,
  MapPin,
  ClipboardList,
  Truck,
  UserCheck,
  Wrench,
  BadgeIndianRupee,
  Route,
  Fuel,
  ShieldAlert,
  Award,
  Users,
  Building2,
  Wallet,
  BarChart3,
  Boxes,
  LogOut,
  type LucideProps,
} from 'lucide-react-native';

import { Colors } from '@theme';

/* -----------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------- */

export type MoreRole = 'customer' | 'vendor' | 'driver' | 'uc';

/**
 * Every possible action a More item can trigger.
 * Handled centrally in useMoreActions.ts.
 */
export type MoreActionId =
  // Shared across roles
  | 'profile'
  | 'notifications'
  | 'support'
  | 'settings'
  | 'logout'
  // Customer
  | 'customer.invoices'
  | 'customer.payment'
  | 'customer.addresses'
  // Vendor
  | 'vendor.fleet'
  | 'vendor.drivers'
  | 'vendor.payouts'
  | 'vendor.maintenance'
  | 'vendor.reports'
  // Driver
  | 'driver.routes'
  | 'driver.fuelLog'
  | 'driver.incidents'
  | 'driver.rewards'
  // UC
  | 'uc.customers'
  | 'uc.vendors'
  | 'uc.staff'
  | 'uc.finance'
  | 'uc.reports'
  | 'uc.inventory';

export type MoreItem = {
  key: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  /** Accent color applied to the icon. */
  color: string;
  /** Which action to run when tapped — resolved in useMoreActions.ts. */
  actionId: MoreActionId;
};

/* -----------------------------------------------------------------
 * Small semantic palette (reused from tabConfig.ts)
 * ----------------------------------------------------------------- */

const Palette = {
  green: Colors.primary,
  amber: Colors.warning,
  blue: Colors.info,
  orange: Colors.accent,
  red: Colors.error,
  purple: '#7C3AED',
  pink: '#EC4899',
  slate: Colors.textPrimary,
} as const;

/* -----------------------------------------------------------------
 * Per-role menus (data only)
 * ----------------------------------------------------------------- */

const customerMore: MoreItem[] = [
  {
    key: 'profile',
    label: 'Profile',
    Icon: User,
    color: Palette.pink,
    actionId: 'profile',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    Icon: Bell,
    color: Palette.amber,
    actionId: 'notifications',
  },
  {
    key: 'invoices',
    label: 'Invoices',
    Icon: FileText,
    color: Palette.blue,
    actionId: 'customer.invoices',
  },
  {
    key: 'payment',
    label: 'Payment',
    Icon: CreditCard,
    color: Palette.purple,
    actionId: 'customer.payment',
  },
  {
    key: 'addresses',
    label: 'Addresses',
    Icon: MapPin,
    color: Palette.green,
    actionId: 'customer.addresses',
  },
  {
    key: 'support',
    label: 'Support',
    Icon: LifeBuoy,
    color: Palette.orange,
    actionId: 'support',
  },
  {
    key: 'settings',
    label: 'Settings',
    Icon: Settings,
    color: Palette.slate,
    actionId: 'settings',
  },
  {
    key: 'logout',
    label: 'Logout',
    Icon: LogOut,
    color: Palette.red,
    actionId: 'logout',
  },
];

const vendorMore: MoreItem[] = [
  {
    key: 'profile',
    label: 'Profile',
    Icon: User,
    color: Palette.pink,
    actionId: 'profile',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    Icon: Bell,
    color: Palette.amber,
    actionId: 'notifications',
  },
  {
    key: 'fleet',
    label: 'Fleet',
    Icon: Truck,
    color: Palette.orange,
    actionId: 'vendor.fleet',
  },
  {
    key: 'drivers',
    label: 'Drivers',
    Icon: UserCheck,
    color: Palette.blue,
    actionId: 'vendor.drivers',
  },
  {
    key: 'payouts',
    label: 'Payouts',
    Icon: BadgeIndianRupee,
    color: Palette.green,
    actionId: 'vendor.payouts',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    Icon: Wrench,
    color: Palette.purple,
    actionId: 'vendor.maintenance',
  },
  {
    key: 'reports',
    label: 'Reports',
    Icon: ClipboardList,
    color: Palette.slate,
    actionId: 'vendor.reports',
  },
  {
    key: 'support',
    label: 'Support',
    Icon: LifeBuoy,
    color: Palette.orange,
    actionId: 'support',
  },
  {
    key: 'settings',
    label: 'Settings',
    Icon: Settings,
    color: Palette.slate,
    actionId: 'settings',
  },
  {
    key: 'logout',
    label: 'Logout',
    Icon: LogOut,
    color: Palette.red,
    actionId: 'logout',
  },
];

const driverMore: MoreItem[] = [
  {
    key: 'profile',
    label: 'Profile',
    Icon: User,
    color: Palette.pink,
    actionId: 'profile',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    Icon: Bell,
    color: Palette.amber,
    actionId: 'notifications',
  },
  {
    key: 'routes',
    label: 'My Routes',
    Icon: Route,
    color: Palette.blue,
    actionId: 'driver.routes',
  },
  {
    key: 'fuelLog',
    label: 'Fuel Log',
    Icon: Fuel,
    color: Palette.orange,
    actionId: 'driver.fuelLog',
  },
  {
    key: 'incidents',
    label: 'Incidents',
    Icon: ShieldAlert,
    color: Palette.red,
    actionId: 'driver.incidents',
  },
  {
    key: 'rewards',
    label: 'Rewards',
    Icon: Award,
    color: Palette.green,
    actionId: 'driver.rewards',
  },
  {
    key: 'support',
    label: 'Support',
    Icon: LifeBuoy,
    color: Palette.purple,
    actionId: 'support',
  },
  {
    key: 'settings',
    label: 'Settings',
    Icon: Settings,
    color: Palette.slate,
    actionId: 'settings',
  },
  {
    key: 'logout',
    label: 'Logout',
    Icon: LogOut,
    color: Palette.red,
    actionId: 'logout',
  },
];

const ucMore: MoreItem[] = [
  {
    key: 'customers',
    label: 'Customers',
    Icon: Users,
    color: Palette.blue,
    actionId: 'uc.customers',
  },
  {
    key: 'profile',
    label: 'Profile',
    Icon: User,
    color: Palette.pink,
    actionId: 'profile',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    Icon: Bell,
    color: Palette.amber,
    actionId: 'notifications',
  },
  {
    key: 'vendors',
    label: 'Vendors',
    Icon: Building2,
    color: Palette.orange,
    actionId: 'uc.vendors',
  },
  {
    key: 'staff',
    label: 'Staff',
    Icon: Users,
    color: Palette.blue,
    actionId: 'uc.staff',
  },
  {
    key: 'finance',
    label: 'Finance',
    Icon: Wallet,
    color: Palette.green,
    actionId: 'uc.finance',
  },
  {
    key: 'reports',
    label: 'Reports',
    Icon: BarChart3,
    color: Palette.purple,
    actionId: 'uc.reports',
  },
  {
    key: 'inventory',
    label: 'Inventory',
    Icon: Boxes,
    color: Palette.slate,
    actionId: 'uc.inventory',
  },
  {
    key: 'support',
    label: 'Support',
    Icon: LifeBuoy,
    color: Palette.red,
    actionId: 'support',
  },
  {
    key: 'settings',
    label: 'Settings',
    Icon: Settings,
    color: Palette.slate,
    actionId: 'settings',
  },
  {
    key: 'logout',
    label: 'Logout',
    Icon: LogOut,
    color: Palette.red,
    actionId: 'logout',
  },
];

const MORE_MAP: Record<MoreRole, MoreItem[]> = {
  customer: customerMore,
  vendor: vendorMore,
  driver: driverMore,
  uc: ucMore,
};

export const getMoreMenu = (role: MoreRole): MoreItem[] => MORE_MAP[role];
