/* eslint-disable react-native/no-inline-styles */
/**
 * ------------------------------------------------------------------
 * CustomTabBar — Scooped bar with floating badge (gap around circle)
 * ------------------------------------------------------------------
 *   ╭──╮
 *   │🏠│           ← badge floats above a NOTCH cut into the bar's
 *   ╰──╯              top edge. Notch radius > badge radius, so the
 *  ⌢    📄   📅   💳   👤   screen background shows through as a
 * Home Quo. Book. Pay. Prof.  visible ring/gap around the circle —
 *                              not just a shadow on a flat bar.
 *
 * The bar is drawn as a single animated SVG <Path> (rounded rect +
 * a bezier "valley" around the active tab's x position). The notch
 * position and the badge's translateX are driven by the SAME
 * Reanimated shared value, so they always stay in sync as the
 * active tab changes.
 *
 * Tune the gap by adjusting NOTCH_GAP below.
 * ------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Colors, Spacing, Typography } from '@theme';
import { getTabConfig, type TabRoleName } from './tabConfig';

/* -----------------------------------------------------------------
 * Geometry
 * ----------------------------------------------------------------- */

const BAR_HEIGHT = 68;
const BAR_HORIZONTAL_MARGIN = 12;
const BAR_BOTTOM_MARGIN = 8;
const BAR_RADIUS = 26;

const BADGE_SIZE = 54;
const BADGE_RADIUS = BADGE_SIZE / 2;
const BADGE_BORDER_WIDTH = 1.5;

/**
 * How much of the badge protrudes above the bar's top edge (measured
 * from the bar's flat top, not the bottom of the notch).
 */
const BADGE_OVERFLOW_TOP = 26;

/**
 * Extra radius the notch has over the badge — this is what creates
 * the visible background "ring" gap in the reference image.
 *   larger → wider gap between circle and bar
 *   smaller → gap shrinks, closer to the old flush-overlap look
 */
const NOTCH_GAP = 8;
const NOTCH_RADIUS = BADGE_RADIUS + NOTCH_GAP;

/** How far the scoop's shoulders spread out horizontally before
 * flattening back into the bar's straight top edge. */
const NOTCH_SPREAD = 26;

/** How deep the scoop dips into the bar. */
const NOTCH_DEPTH = NOTCH_RADIUS * 0.92;

const SPRING = { damping: 15, stiffness: 180, mass: 0.6 } as const;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/* -----------------------------------------------------------------
 * Bar path builder
 * ----------------------------------------------------------------- */

function buildBarPath(
  width: number,
  height: number,
  cx: number,
  radius: number,
) {
  'worklet';
  const left = cx - NOTCH_RADIUS - NOTCH_SPREAD;
  const right = cx + NOTCH_RADIUS + NOTCH_SPREAD;

  return [
    `M0,${radius}`,
    `Q0,0 ${radius},0`,
    `L${left},0`,
    // left shoulder into the scoop
    `C${left + NOTCH_SPREAD * 0.55},0 ${cx - NOTCH_RADIUS},${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}`,
    // right shoulder out of the scoop
    `C${cx + NOTCH_RADIUS},${NOTCH_DEPTH} ${right - NOTCH_SPREAD * 0.55},0 ${right},0`,
    `L${width - radius},0`,
    `Q${width},0 ${width},${radius}`,
    `L${width},${height - radius}`,
    `Q${width},${height} ${width - radius},${height}`,
    `L${radius},${height}`,
    `Q0,${height} 0,${height - radius}`,
    'Z',
  ].join(' ');
}

/* -----------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------- */

type Props = BottomTabBarProps & { role: TabRoleName };

const CustomTabBar: React.FC<Props> = ({ state, navigation, role }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const config = getTabConfig(role);

  const initialWidth = screenWidth - BAR_HORIZONTAL_MARGIN * 2;
  const [barWidth, setBarWidth] = useState(initialWidth);

  const activeIndex = state.index;
  const tabWidth = barWidth / state.routes.length;
  const targetCx = tabWidth * activeIndex + tabWidth / 2;

  const cx = useSharedValue(targetCx);

  React.useEffect(() => {
    cx.value = withSpring(targetCx, SPRING);
  }, [targetCx, cx]);

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cx.value - BADGE_RADIUS }],
  }));

  const animatedPathProps = useAnimatedProps(() => ({
    d: buildBarPath(barWidth, BAR_HEIGHT, cx.value, BAR_RADIUS),
  }));

  // Keep the notch glued to the correct tab if the bar is resized
  // (rotation, foldables, etc.) before the next spring animation.
  useDerivedValue(() => {
    // no-op derived value kept in case future logic needs cx elsewhere
    return cx.value;
  }, [cx]);

  const activeRoute = state.routes[activeIndex];
  const activeMeta = activeRoute ? config[activeRoute.name] : undefined;
  const ActiveIcon = activeMeta?.Icon;
  const activeColor = activeMeta?.color ?? Colors.textPrimary;

  const onBarLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0 && Math.abs(w - barWidth) > 1) setBarWidth(w);
    },
    [barWidth],
  );

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom:
            Math.max(insets.bottom, Spacing.sm) + BAR_BOTTOM_MARGIN,
          paddingHorizontal: BAR_HORIZONTAL_MARGIN,
          paddingTop: BADGE_OVERFLOW_TOP,
        },
      ]}
    >
      <View style={styles.barWrap} onLayout={onBarLayout}>
        {/* Bar drawn as a single scooped SVG path (no flat rect) */}
        <Svg
          width={barWidth}
          height={BAR_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <AnimatedPath
            animatedProps={animatedPathProps}
            fill={Colors.surface}
            stroke={Colors.border}
            strokeWidth={1}
          />
        </Svg>

        {/* Row of tab hit-targets, laid over the SVG */}
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const meta = config[route.name];
            if (!meta) return <View key={route.key} style={styles.tab} />;

            const focused = state.index === index;
            const { Icon, label, color } = meta;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                style={({ pressed }) => [
                  styles.tab,
                  pressed && styles.tabPressed,
                ]}
              >
                <View style={styles.iconSlot}>
                  {focused ? (
                    // Icon rendered inside the floating badge; keep a
                    // placeholder of the same size so the label sits
                    // at the same y as inactive tabs.
                    <View style={styles.iconPlaceholder} />
                  ) : (
                    <Icon
                      color={Colors.textSecondary}
                      size={22}
                      strokeWidth={2}
                    />
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    focused && { color, fontWeight: '700' },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Floating badge — sits inside the notch's gap, slides horizontally */}
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, badgeAnimStyle]}
        >
          {ActiveIcon ? (
            <ActiveIcon color={activeColor} size={24} strokeWidth={2.2} />
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
};

export default CustomTabBar;

/* -----------------------------------------------------------------
 * Styles
 * ----------------------------------------------------------------- */

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
  },
  barWrap: {
    position: 'relative',
    height: BAR_HEIGHT,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconSlot: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 22,
    height: 22,
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    left: 0,
    top: -BADGE_OVERFLOW_TOP,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: BADGE_BORDER_WIDTH,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});