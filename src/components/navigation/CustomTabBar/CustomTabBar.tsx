/**
 * ------------------------------------------------------------------
 * CustomTabBar — Notched pill with floating white badge
 * ------------------------------------------------------------------
 * Matches the neumorphic reference design:
 *
 *   ┌────────────────────╮╭─────────────────┐
 *   │                    ╰○╯                │   ← white badge sits
 *   │  🏠     📅     🚗     💳     👤        │     in a notch cut
 *   │ Home Bookings Trips Payments Profile  │     from the top edge
 *   └───────────────────────────────────────┘
 *
 * Two layered shadows:
 *   - SVG-drawn bar uses <FeDropShadow /> INSIDE the SVG so its
 *     shadow follows the notch on both iOS and Android
 *   - Badge is a plain circle so RN's own shadow system is enough
 *
 * Active state — colour comes from tabConfig.ts:
 *   - Badge fill: white (Colors.surface)
 *   - Icon inside badge: tab.color
 *   - Label under the notch: tab.color, bold
 * Inactive state:
 *   - Icon: Colors.textSecondary (grey)
 *   - Label: Colors.textSecondary, medium
 *
 * The notch centre + badge x-position share one Reanimated shared
 * value, so they slide together as a single motion.
 * ------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useState } from 'react';
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
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, FeDropShadow, Filter, Path } from 'react-native-svg';
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

const BADGE_SIZE = 48;
const BADGE_RADIUS = BADGE_SIZE / 2;

const NOTCH_DEPTH = 22;
const NOTCH_WIDTH = 72;

/** Extra room around the SVG so its drop shadow doesn't clip. */
const SHADOW_PAD = 14;

const SPRING = { damping: 15, stiffness: 180, mass: 0.6 } as const;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/* -----------------------------------------------------------------
 * Notched-pill path (worklet-safe)
 * -----------------------------------------------------------------
 * Rounded rectangle with a smooth curve cut into the top edge,
 * centred on `cx`. Marked 'worklet' so it can run on the UI thread
 * from useAnimatedProps.
 * ----------------------------------------------------------------- */

function buildNotchedPath(width: number, cx: number): string {
  'worklet';
  const r = BAR_RADIUS;
  const h = BAR_HEIGHT;
  const half = NOTCH_WIDTH / 2;
  const dip = NOTCH_DEPTH;

  const notchLeft = cx - half;
  const notchRight = cx + half;
  const c1 = cx - half * 0.55;
  const c2 = cx + half * 0.55;

  return (
    'M ' + r + ' 0' +
    ' L ' + notchLeft + ' 0' +
    ' C ' + c1 + ' 0, ' + c1 + ' ' + dip + ', ' + cx + ' ' + dip +
    ' C ' + c2 + ' ' + dip + ', ' + c2 + ' 0, ' + notchRight + ' 0' +
    ' L ' + (width - r) + ' 0' +
    ' Q ' + width + ' 0, ' + width + ' ' + r +
    ' L ' + width + ' ' + (h - r) +
    ' Q ' + width + ' ' + h + ', ' + (width - r) + ' ' + h +
    ' L ' + r + ' ' + h +
    ' Q 0 ' + h + ', 0 ' + (h - r) +
    ' L 0 ' + r +
    ' Q 0 0, ' + r + ' 0' +
    ' Z'
  );
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

  useEffect(() => {
    cx.value = withSpring(targetCx, SPRING);
  }, [targetCx, cx]);

  const animatedPathProps = useAnimatedProps(() => ({
    d: buildNotchedPath(barWidth, cx.value),
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cx.value - BADGE_RADIUS }],
  }));

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
        },
      ]}
    >
      <View style={styles.barWrap} onLayout={onBarLayout}>
        {/* Notched-pill background + its drop shadow (SVG) */}
        <Svg
          width={barWidth + SHADOW_PAD * 2}
          height={BAR_HEIGHT + SHADOW_PAD * 2}
          style={styles.svgLayer}
        >
          <Defs>
            <Filter
              id="softShadow"
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
            >
              <FeDropShadow
                dx="0"
                dy="3"
                stdDeviation="5"
                floodColor="#000000"
                floodOpacity="0.08"
              />
            </Filter>
          </Defs>
          <AnimatedPath
            animatedProps={animatedPathProps}
            transform={`translate(${SHADOW_PAD}, ${SHADOW_PAD})`}
            fill={Colors.backgroundSecondary}
            filter="url(#softShadow)"
          />
        </Svg>

        {/* Floating white badge with the coloured active icon inside */}
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, badgeAnimStyle]}
        >
          {ActiveIcon ? (
            <ActiveIcon
              color={activeColor}
              size={22}
              strokeWidth={2.4}
            />
          ) : null}
        </Animated.View>

        {/* Tab row */}
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
                    // Icon is drawn inside the floating badge above;
                    // this placeholder keeps the label at the same y
                    // as inactive tabs.
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
  svgLayer: {
    position: 'absolute',
    left: -SHADOW_PAD,
    top: -SHADOW_PAD,
  },
  badge: {
    position: 'absolute',
    left: 0,
    // ~6px of the badge peeks above the bar's top edge; the rest sits
    // inside the notch (which is NOTCH_DEPTH tall).
    top: -(BADGE_RADIUS + 4),
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    backgroundColor: Colors.surface, // white — not the tab colour
    alignItems: 'center',
    justifyContent: 'center',
    // Badge's own soft shadow — the "raised button" feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 5,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_HEIGHT,
    paddingTop: NOTCH_DEPTH + 4,
    paddingBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconSlot: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
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
});