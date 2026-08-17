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
 * Total vertical footprint of the tab bar, safe-area bottom included.
 * Parents use this when they present a bottom sheet (like MoreSheet)
 * that must stop above the tab bar via `bottomInset`.
 *
 *   footprint = badge overflow + bar height + bottom margin + safeArea
 *
 * Wrapped in a hook so it stays in sync with orientation / safe-area
 * changes.
 */
export function useTabBarFootprint(): number {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 8);
  return BADGE_OVERFLOW_TOP + BAR_HEIGHT + BAR_BOTTOM_MARGIN + safeBottom;
}

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
  // A "normal" scoop needs this much flat top on each side of cx to fit
  // both the shoulder spread and the notch radius. When cx sits closer
  // to either edge than this, the shoulder would collide with — or run
  // past — the bar's rounded corner. In that case we swap the two-part
  // shoulder-plus-scoop for a SINGLE smooth cubic that runs directly
  // from the rounded corner into the notch bottom, so the edge tabs
  // read as one continuous curve instead of a sticky, clipped shoulder.
  const cornerZone = radius + NOTCH_RADIUS;
  const isLeftEdge = cx < cornerZone;
  const isRightEdge = cx > width - cornerZone;

  const leftSide = isLeftEdge
    ? // Corner arc → straight into a single sweeping curve down to
      // the notch bottom. Control-point x is proportional to cx so the
      // curve stays smooth as cx shrinks toward 0.
      `M0,${radius} C0,0 ${cx * 0.4},0 ${cx},${NOTCH_DEPTH}`
    : (() => {
        const left = cx - NOTCH_RADIUS - NOTCH_SPREAD;
        return (
          `M0,${radius} Q0,0 ${radius},0 L${left},0 ` +
          `C${left + NOTCH_SPREAD * 0.55},0 ${
            cx - NOTCH_RADIUS
          },${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}`
        );
      })();

  const rightSide = isRightEdge
    ? // Mirror of the left-edge case — sweep from notch bottom directly
      // into the right rounded corner.
      `C${width - (width - cx) * 0.4},0 ${width},0 ${width},${radius}`
    : (() => {
        const right = cx + NOTCH_RADIUS + NOTCH_SPREAD;
        return (
          `C${cx + NOTCH_RADIUS},${NOTCH_DEPTH} ${
            right - NOTCH_SPREAD * 0.55
          },0 ${right},0 ` +
          `L${width - radius},0 Q${width},0 ${width},${radius}`
        );
      })();

  return (
    `${leftSide} ${rightSide} ` +
    `L${width},${height - radius} ` +
    `Q${width},${height} ${width - radius},${height} ` +
    `L${radius},${height} ` +
    `Q0,${height} 0,${height - radius} Z`
  );
}

/* -----------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------- */

type Props = BottomTabBarProps & {
  role: TabRoleName;
  /**
   * Optional index to visually treat as active, overriding
   * React Navigation's `state.index`. Used when the More sheet is
   * open — the sheet's presence doesn't change navigation state, but
   * the badge/notch should slide onto the More tab so the user has a
   * visual anchor. Falls back to `state.index` when undefined.
   */
  overrideActiveIndex?: number;
};

const CustomTabBar: React.FC<Props> = ({
  state,
  navigation,
  role,
  overrideActiveIndex,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const config = getTabConfig(role);

  const initialWidth = screenWidth - BAR_HORIZONTAL_MARGIN * 2;
  const [barWidth, setBarWidth] = useState(initialWidth);

  const activeIndex =
    typeof overrideActiveIndex === 'number' &&
    overrideActiveIndex >= 0 &&
    overrideActiveIndex < state.routes.length
      ? overrideActiveIndex
      : state.index;
  const tabWidth = barWidth / state.routes.length;
  const targetCx = tabWidth * activeIndex + tabWidth / 2;

  // Edge tabs (first / last) use a smooth single-curve notch instead of
  // the symmetric shoulder-scoop. Lifting the badge slightly on those
  // tabs keeps the curve visually wrapping the badge without the notch
  // depth clipping into it.
  const cornerZone = BAR_RADIUS + NOTCH_RADIUS;
  const isEdgeTab = targetCx < cornerZone || targetCx > barWidth - cornerZone;
  const badgeTopOffset = isEdgeTab
    ? BADGE_OVERFLOW_TOP - 4
    : BADGE_OVERFLOW_TOP;

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

            const focused = activeIndex === index;
            const { Icon, label, color } = meta;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              // Compare against the REAL navigation state here — even
              // when overrideActiveIndex marks this tab as visually
              // focused (More sheet open), tapping it again should
              // still fire the tabPress event so listeners like
              // preventDefault + present() can run.
              if (state.index !== index && !event.defaultPrevented) {
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

        {/* Floating badge — sits inside the notch's gap, slides horizontally.
            Edge tabs lift the badge a few px so the smooth single-curve
            notch wraps around it cleanly instead of clipping its bottom. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, { top: -badgeTopOffset }, badgeAnimStyle]}
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
