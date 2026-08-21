/**
 * ------------------------------------------------------------------
 * SettingsScreen (UC) — STACK SCREEN
 * ------------------------------------------------------------------
 * Pushed from the UC More sheet. Placeholder until app-level
 * settings (theme, language, notification preferences) ship.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';

import { SafeScreen, ScreenHeader, ComingSoon } from '@shared/components';
import { Spacing } from '@theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      </View>
      <ComingSoon feature="Settings" Icon={Settings} />
    </SafeScreen>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});