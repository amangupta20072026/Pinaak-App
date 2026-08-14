/**
 * ------------------------------------------------------------------
 * Urban Cruise — Onboarding
 * ------------------------------------------------------------------
 * Two-slide onboarding flow. On Skip or Get Started, dispatches
 * completeOnboarding() — RootNavigator then swaps this stack out for
 * AuthFlow (if unauthenticated) or the role-specific home stack
 * (if authenticated). Auto-advance is cancelled on manual swipe and
 * paused when the app is backgrounded.
 * ------------------------------------------------------------------
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import PagerView, {
  PageScrollStateChangedNativeEvent,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  Colors,
  Dimensions,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../theme';
import { useAppDispatch } from '../../store/hooks';
import { completeOnboarding } from '../../store/slices/appSlice';

/* -----------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------- */

type IconTint = 'primary' | 'secondary';
type FeatureIconProps = { color: string; size: number };
type Feature = {
  id: string;
  title: string;
  description: string;
  Icon: React.FC<FeatureIconProps>;
  tint: IconTint;
};

export type OnboardingScreenProps = {
  autoAdvanceMs?: number | null;
};

/* -----------------------------------------------------------------
 * SVG Icons
 * ----------------------------------------------------------------- */

const ShieldIcon: React.FC<FeatureIconProps> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5 4.5 5.2v6c0 4.9 3.2 9.3 7.5 10.5 4.3-1.2 7.5-5.6 7.5-10.5v-6L12 2.5z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="m8.8 12.1 2.3 2.3 4.1-4.4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PersonIcon: React.FC<FeatureIconProps> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
    <Path
      d="M5 20c1.4-3.5 3.9-5 7-5s5.6 1.5 7 5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const MapPinIcon: React.FC<FeatureIconProps> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.5s7-5.8 7-11.5a7 7 0 1 0-14 0c0 5.7 7 11.5 7 11.5z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const HeadsetIcon: React.FC<FeatureIconProps> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 14v-2a8 8 0 0 1 16 0v2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M4 14v2a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H6a2 2 0 0 0-2 2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M20 14v2a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M18 18v.5a2.5 2.5 0 0 1-2.5 2.5H14"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

/* -----------------------------------------------------------------
 * Constants
 * ----------------------------------------------------------------- */

const SLIDE_COUNT = 2;
const AUTO_ADVANCE_DEFAULT_MS = 5000;

const FEATURES: Feature[] = [
  {
    id: 'safe',
    title: 'Safe & Reliable',
    description: 'Well maintained buses for your safety',
    Icon: ShieldIcon,
    tint: 'primary',
  },
  {
    id: 'drivers',
    title: 'Professional Drivers',
    description: 'Experienced & verified chauffeurs',
    Icon: PersonIcon,
    tint: 'secondary',
  },
  {
    id: 'pan-india',
    title: 'Pan India Service',
    description: 'Available in 100+ cities across India',
    Icon: MapPinIcon,
    tint: 'primary',
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: "We're here to assist you anytime",
    Icon: HeadsetIcon,
    tint: 'secondary',
  },
];

const withAlpha = (hex: string, alpha: number): string => {
  const suffix = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${suffix}`;
};

/* -----------------------------------------------------------------
 * Feature Card
 * ----------------------------------------------------------------- */

const FeatureCard: React.FC<{ feature: Feature; index: number }> = memo(
  ({ feature, index }) => {
    const { Icon, title, description, tint } = feature;
    const iconColor = tint === 'primary' ? Colors.primary : Colors.secondary;
    const iconBg = withAlpha(iconColor, 0.14);

    return (
      <Animated.View
        entering={FadeInUp.delay(400 + index * 90).duration(500)}
        style={styles.card}
      >
        <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
          <Icon color={iconColor} size={Dimensions.iconMd} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {description}
        </Text>
      </Animated.View>
    );
  },
);
FeatureCard.displayName = 'FeatureCard';

/* -----------------------------------------------------------------
 * Pagination
 * ----------------------------------------------------------------- */

const DOT_ACTIVE_WIDTH = 24;
const DOT_INACTIVE_WIDTH = 8;
const DOT_HEIGHT = 8;

const PaginationDot: React.FC<{
  index: number;
  progress: SharedValue<number>;
}> = ({ index, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    return {
      width: interpolate(
        distance,
        [0, 1],
        [DOT_ACTIVE_WIDTH, DOT_INACTIVE_WIDTH],
        Extrapolation.CLAMP,
      ),
      backgroundColor: interpolateColor(
        distance,
        [0, 1],
        [Colors.primary, Colors.border],
      ),
    };
  });

  return (
    <Animated.View
      style={[styles.dot, animatedStyle]}
      accessibilityRole="tab"
    />
  );
};

const Pagination: React.FC<{
  count: number;
  progress: SharedValue<number>;
}> = ({ count, progress }) => (
  <View
    style={styles.pagination}
    accessibilityRole="tablist"
    accessibilityLabel={`Slide indicator, ${count} slides`}
  >
    {Array.from({ length: count }).map((_, i) => (
      <PaginationDot key={i} index={i} progress={progress} />
    ))}
  </View>
);

/* -----------------------------------------------------------------
 * Slides
 * ----------------------------------------------------------------- */

const SlideOne: React.FC = memo(() => (
  <View style={styles.slide} collapsable={false}>
    <View style={styles.slideOneContent}>
      <Animated.View entering={FadeIn.duration(700)} style={styles.brandBlock}>
        <Image
          source={require('../../assets/images/ucwithdesignandtext.png')}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel="Urban Cruise — Car & Bus Rentals"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(250).duration(600)}
        style={styles.taglineBlock}
      >
        <Text style={styles.taglineLine} accessibilityRole="header">
          <Text style={styles.taglineAccent}>India's </Text>
          <Text style={styles.taglineDark}>Most </Text>
          <Text style={styles.taglinePrimary}>Preferred</Text>
        </Text>
        <Text style={styles.taglineLine}>
          <Text style={styles.taglinePrimary}>Bus </Text>
          <Text style={styles.taglineDark}>Rental </Text>
          <Text style={styles.taglineAccent}>Services</Text>
        </Text>
      </Animated.View>
    </View>
  </View>
));
SlideOne.displayName = 'SlideOne';

const SlideTwo: React.FC = memo(() => (
  <View style={styles.slide} collapsable={false}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.slideTwoScroll}
      bounces={false}
    >
      <Animated.View entering={FadeInDown.duration(600)}>
        <Text style={styles.headline} accessibilityRole="header">
          <Text style={styles.headlinePrimary}>Your Journey,{'\n'}</Text>
          <Text style={styles.headlineAccent}>Our Responsibility</Text>
        </Text>
        <Text style={styles.description}>
          Experience safe, reliable and comfortable bus rental services across
          India.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(200).duration(700)}
        style={styles.heroWrap}
      >
        <Image
          source={require('../../assets/images/urban-cruise-bus-onboarding-image.png')}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Urban Cruise bus on a city highway"
        />
      </Animated.View>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <FeatureCard feature={FEATURES[0]} index={0} />
          <FeatureCard feature={FEATURES[1]} index={1} />
        </View>
        <View style={styles.gridRow}>
          <FeatureCard feature={FEATURES[2]} index={2} />
          <FeatureCard feature={FEATURES[3]} index={3} />
        </View>
      </View>
    </ScrollView>
  </View>
));
SlideTwo.displayName = 'SlideTwo';

/* -----------------------------------------------------------------
 * Screen
 * ----------------------------------------------------------------- */

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  autoAdvanceMs = AUTO_ADVANCE_DEFAULT_MS,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const pagerRef = useRef<PagerView>(null);
  const progress = useSharedValue(0);
  const [page, setPage] = useState(0);

  const isLastPage = page === SLIDE_COUNT - 1;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractedRef = useRef(false);
  const pageRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleAdvance = useCallback(() => {
    clearTimer();
    if (!autoAdvanceMs || autoAdvanceMs <= 0) return;
    if (userInteractedRef.current) return;
    if (pageRef.current >= SLIDE_COUNT - 1) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (userInteractedRef.current) return;
      if (pageRef.current >= SLIDE_COUNT - 1) return;
      pagerRef.current?.setPage(pageRef.current + 1);
    }, autoAdvanceMs);
  }, [autoAdvanceMs, clearTimer]);

  const onPageScroll = useCallback(
    (e: PagerViewOnPageScrollEvent) => {
      const { position, offset } = e.nativeEvent;
      progress.value = position + offset;
    },
    [progress],
  );

  const onPageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    setPage(e.nativeEvent.position);
  }, []);

  const onPageScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) => {
      if (e.nativeEvent.pageScrollState === 'dragging') {
        userInteractedRef.current = true;
        clearTimer();
      }
    },
    [clearTimer],
  );

  useEffect(() => {
    pageRef.current = page;
    scheduleAdvance();
    return clearTimer;
  }, [page, scheduleAdvance, clearTimer]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') scheduleAdvance();
      else clearTimer();
    });
    return () => sub.remove();
  }, [scheduleAdvance, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const handleFinishOnboarding = useCallback(() => {
    userInteractedRef.current = true;
    clearTimer();
    // Marks the onboarding session as done. RootNavigator will then
    // swap this stack out for AuthFlow (if unauthenticated) or the
    // role-specific home stack (if authenticated).
    dispatch(completeOnboarding());
  }, [clearTimer, dispatch]);

  const topPad = Math.max(insets.top, Spacing.md);
  const bottomPad = Math.max(insets.bottom, Spacing.md);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        {!isLastPage ? (
          <Pressable
            onPress={handleFinishOnboarding}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
        overdrag
      >
        <View key="slide-1" collapsable={false} style={styles.page}>
          <SlideOne />
        </View>
        <View key="slide-2" collapsable={false} style={styles.page}>
          <SlideTwo />
        </View>
      </PagerView>

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <Pagination count={SLIDE_COUNT} progress={progress} />

        {isLastPage ? (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Pressable
              onPress={handleFinishOnboarding}
              accessibilityRole="button"
              accessibilityLabel="Get started"
              style={({ pressed }) => [
                styles.cta,
                pressed && styles.ctaPressed,
              ]}
            >
              <Text style={styles.ctaText}>Get Started</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.ctaSpacer} />
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;

/* -----------------------------------------------------------------
 * Styles
 * ----------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: Dimensions.headerHeight - Spacing.sm,
    paddingHorizontal: Dimensions.screenHorizontalPadding,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    minHeight: Dimensions.touchTargetMinimum,
    minWidth: Dimensions.touchTargetMinimum,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipPlaceholder: { height: Dimensions.touchTargetMinimum },
  skipText: { ...Typography.label, color: Colors.primary, fontSize: 15 },
  pressed: { opacity: 0.55 },

  pager: { flex: 1 },
  page: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: Dimensions.screenHorizontalPadding },

  slideOneContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandBlock: { width: '100%', alignItems: 'center' },
  brandLogo: { width: '85%', height: 220 },
  taglineBlock: { marginTop: Spacing.huge, alignItems: 'center' },
  taglineLine: { ...Typography.h4, textAlign: 'center' },
  taglinePrimary: { color: Colors.primary, fontWeight: '700' },
  taglineAccent: { color: Colors.accent, fontWeight: '700' },
  taglineDark: { color: Colors.textPrimary, fontWeight: '600' },

  slideTwoScroll: { paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  headline: { ...Typography.h3, textAlign: 'center' },
  headlinePrimary: { color: Colors.primary, fontWeight: '700' },
  headlineAccent: { color: Colors.accent, fontWeight: '700' },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  heroWrap: {
    marginTop: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  hero: { width: '100%', height: 200 },

  grid: { marginTop: Spacing.lg, gap: Spacing.md },
  gridRow: { flexDirection: 'row', gap: Spacing.md },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    ...Shadows.xs,
  },
  cardIconWrap: {
    width: Dimensions.avatarMd,
    height: Dimensions.avatarMd,
    borderRadius: Radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxs,
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: Dimensions.screenHorizontalPadding,
    paddingTop: Spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  dot: { height: DOT_HEIGHT, borderRadius: Radius.pill },

  cta: {
    height: Dimensions.buttonHeightLarge,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  ctaPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  ctaText: { ...Typography.button, color: Colors.buttonPrimaryText },
  ctaSpacer: { height: Dimensions.buttonHeightLarge },
});
