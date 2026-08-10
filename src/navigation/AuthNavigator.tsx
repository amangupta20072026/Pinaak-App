/**
 * AuthNavigator — Login + placeholders for signup / otp / forgot.
 *
 * Reads `selectedRole` from Redux to seed Login's initial params.
 * Once real signup/otp/forgot screens land, swap the Placeholder
 * component out for each.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/auth/LoginScreen';
import { Colors, Spacing, Typography } from '../theme';
import { useAppSelector } from '../store/hooks';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{label} — coming soon</Text>
  </View>
);

const OtpScreen = () => <Placeholder label="OTP" />;

const AuthNavigator: React.FC = () => {
  // Fall back to 'customer' if we somehow reach auth without a
  // selected role — shouldn't happen, but safer than crashing.
  const selectedRole =
    useAppSelector((s) => s.app.selectedRole) ?? 'customer';

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={{ role: selectedRole }}
      />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  placeholderText: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
  },
});