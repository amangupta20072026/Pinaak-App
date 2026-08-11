// src/navigation/AuthNavigator.tsx

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/LoginScreen';
import { Colors, Spacing, Typography } from '../theme';
import { useAppSelector } from '../store/hooks';
import type { AuthParamList } from './types';

const Stack = createNativeStackNavigator<AuthParamList>();

const Placeholder: React.FC<{ label: string }> = ({ label }) => {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{label} — coming soon</Text>
    </View>
  );
};

const OtpVerifyScreen: React.FC = () => {
  return <Placeholder label="OTP Verification" />;
};

const AuthNavigator: React.FC = () => {
  const selectedRole = useAppSelector(s => s.app.selectedRole) ?? 'customer';

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
        initialParams={{
          role: selectedRole,
        }}
      />

      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
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
