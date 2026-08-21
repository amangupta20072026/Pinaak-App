/**
 * ------------------------------------------------------------------
 * FeedbackScreen (UC) — STACK SCREEN
 * ------------------------------------------------------------------
 * Pushed from the UC More sheet. Placeholder until the feedback
 * form (rating, comments, attachments) ships.
 * ------------------------------------------------------------------
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';

import { SafeScreen, ScreenHeader, ComingSoon } from '@shared/components';
import { Spacing } from '@theme';

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title="Feedback"
          subtitle="Share suggestions and report problems."
          onBack={() => navigation.goBack()}
        />
      </View>
      <ComingSoon feature="Feedback" Icon={MessageSquare} />
    </SafeScreen>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});