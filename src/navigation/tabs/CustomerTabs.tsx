// src/navigation/tabs/CustomerTabs.tsx
/**
 * CustomerTabs — Tab navigator for the Customer role.
 * See `./shared/useMoreTabController.tsx` for the sheet/nav contract.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerHomeScreen from '../../features/customer/CustomerHomeScreen';

import type { CustomerTabParamList } from '../types';
import { MORE_ROUTE_NAME, useMoreTabController } from './shared';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const PlaceholderScreen: React.FC = () => null;

const CustomerTabs: React.FC = () => {
  const {
    screenOptions,
    screenListeners,
    openMoreListeners,
    renderTabBar,
    MoreSheetElement,
  } = useMoreTabController('customer');

  return (
    <>
      <Tab.Navigator
        screenOptions={screenOptions}
        screenListeners={screenListeners}
        tabBar={renderTabBar}
      >
        <Tab.Screen name="Home" component={CustomerHomeScreen} />
        <Tab.Screen name="Quotations" component={PlaceholderScreen} />
        <Tab.Screen name="Bookings" component={PlaceholderScreen} />
        <Tab.Screen name="Payments" component={PlaceholderScreen} />
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

export default CustomerTabs;
