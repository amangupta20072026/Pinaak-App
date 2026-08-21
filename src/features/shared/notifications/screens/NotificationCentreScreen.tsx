/**
 * ------------------------------------------------------------------
 * NotificationCentreScreen (UC) — STACK SCREEN
 * ------------------------------------------------------------------
 * Pushed from the UC More sheet, and also from the bell icon on the
 * dashboard header. Placeholder until the real notification list +
 * read/unread + deep-link handlers ship.
 *
 * Note: this replaces the NotImplementedScreen ghost registered on
 * the "NotificationCentre" route in UcNavigator. Same route name —
 * no caller changes required.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';

import { SafeScreen, ScreenHeader, ComingSoon } from '@shared/components';
import { Spacing } from '@theme';

const NotificationCentreScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title="Notifications"
          subtitle="Alerts, approvals, and system updates."
          onBack={() => navigation.goBack()}
        />
      </View>
      <ComingSoon feature="Notifications" Icon={Bell} />
    </SafeScreen>
  );
};

export default NotificationCentreScreen;

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});