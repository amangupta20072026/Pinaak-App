/**
 * ------------------------------------------------------------------
 * ProfileScreen (UC) — STACK SCREEN
 * ------------------------------------------------------------------
 * Pushed from the UC More sheet. Placeholder until the real
 * profile view (name, phone, role, avatar, edit CTA) ships.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User } from 'lucide-react-native';

import { SafeScreen, ScreenHeader, ComingSoon } from '@shared/components';
import { Spacing } from '@theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
      </View>
      <ComingSoon feature="Profile" Icon={User} />
    </SafeScreen>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});