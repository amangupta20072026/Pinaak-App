/**
 * ------------------------------------------------------------------
 * Onboarding — Role Picker
 * ------------------------------------------------------------------
 * Uses the shared role config + RoleCard from src/components/roles.
 * This screen owns the entrance stagger animation and the "Continue"
 * CTA that dispatches selectRole + completeOnboarding.
 * ------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import {
  Colors,
  Dimensions,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../../theme';
import { useAppDispatch } from '../../../store/hooks';
import {
  completeOnboarding,
  selectRole,
  type UserRole,
} from '../../../store/slices/appSlice';
import { ROLES, RoleCard } from '../../../components/roles';

const OnboardingDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleSelect = useCallback((id: UserRole) => {
    setSelected(id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    dispatch(selectRole(selected));
    dispatch(completeOnboarding());
  }, [dispatch, selected]);

  const canContinue = selected !== null;
  const topPad = Math.max(insets.top, Spacing.md);
  const bottomPad = Math.max(insets.bottom, Spacing.md);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.eyebrow}>Welcome to Urban Cruise</Text>
          <Text style={styles.title} accessibilityRole="header">
            How will you use{'\n'}Urban Cruise?
          </Text>
          <Text style={styles.description}>
            Pick the role that fits you best. You can always switch later from your profile.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.list}
          accessibilityRole="radiogroup"
        >
          {ROLES.map((role, i) => (
            <Animated.View
              key={role.id}
              entering={FadeInUp.delay(200 + i * 80).duration(500)}
            >
              <RoleCard
                role={role}
                selected={selected === role.id}
                onPress={handleSelect}
              />
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ disabled: !canContinue }}
          style={({ pressed }) => [
            styles.cta,
            !canContinue && styles.ctaDisabled,
            pressed && canContinue && styles.ctaPressed,
          ]}
        >
          <Text
            style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Dimensions.screenHorizontalPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  list: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  footer: {
    paddingHorizontal: Dimensions.screenHorizontalPadding,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  cta: {
    height: Dimensions.buttonHeightLarge,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  ctaDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    ...Typography.button,
    color: Colors.buttonPrimaryText,
  },
  ctaTextDisabled: {
    color: Colors.textInverse,
  },
});