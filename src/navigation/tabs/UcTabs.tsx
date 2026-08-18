// src/navigation/tabs/UcTabs.tsx
/**
 * ==================================================================
 * UcTabs — Tab navigator for the UC (admin) role
 * ==================================================================
 * All sheet/navigation plumbing lives in `useMoreTabController`.
 * See `./shared/useMoreTabController.tsx` for the full one-way
 * data-flow contract (user tap → sheet reacts) and why we listen
 * to `tabPress` rather than `state.index`.
 * ==================================================================
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UcDashboardScreen } from '@features/uc/dashboard';

import type { UcTabParamList } from '../types';
import { MORE_ROUTE_NAME, useMoreTabController } from './shared';

const Tab = createBottomTabNavigator<UcTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const UcTabs: React.FC = () => {
  const {
    screenOptions,
    screenListeners,
    openMoreListeners,
    renderTabBar,
    MoreSheetElement,
  } = useMoreTabController('uc');

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
          name={MORE_ROUTE_NAME}
          component={PlaceholderScreen}
          listeners={openMoreListeners}
        />
      </Tab.Navigator>

      {MoreSheetElement}
    </>
  );
};

export default UcTabs;
