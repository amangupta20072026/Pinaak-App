/* eslint-disable react-native/no-inline-styles */
/**
 * ------------------------------------------------------------------
 * CustomTabBar — Flat bar with floating overlapping badge
 * ------------------------------------------------------------------
 *   ┌──────────────────────────────────────────┐
 *   │   ╭──╮                                   │  ← white badge sits
 *   │   │🏠│                                   │    with ~22px above
 *   │   ╰──╯    📄     📅     💳     👤        │    the bar and the
 *   │   Home  Quo... Book.. Pay... Prof..      │    rest inside it
 *   └──────────────────────────────────────────┘
 *
 * The bar itself is a plain rounded rectangle — no SVG, no notch.
 * The "curve" around the active icon is just the badge circle's own
 * border sitting half above / half inside the bar. Much less code
 * to maintain than the notched-path variant.
 *
 * Active state — color comes from tabConfig.ts:
 *   - Badge fill:      Colors.surface (white)
 *   - Icon in badge:   tab.color
 *   - Label:           tab.color, bold
 * Inactive state:
 *   - Icon:            Colors.textSecondary (grey)
 *   - Label:           Colors.textSecondary, medium
 *
 * A single Reanimated shared value drives the badge's translateX
 * with a spring, so it slides smoothly between tab positions.
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Colors, Shadows, Spacing, Typography } from '@theme';
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
 * How much of the badge protrudes above the bar's top edge.
 *   larger → circle rides higher above the bar
 *   smaller → circle sits deeper inside the bar
 * At 22, roughly 40% is above and 60% inside — matches the reference.
 */
const BADGE_OVERFLOW_TOP = 22;

const SPRING = { damping: 15, stiffness: 180, mass: 0.6 } as const;

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
          paddingTop: BADGE_OVERFLOW_TOP,
        },
      ]}
    >
      <View style={styles.barWrap}>
        {/* Flat rounded-rect bar */}
        <View style={styles.bar} onLayout={onBarLayout}>
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

        {/* Floating white badge — slides horizontally to the active tab */}
        <Animated.View
          pointerEvents="none"
          style={[styles.badge, badgeAnimStyle]}
        >
          {ActiveIcon ? (
            <ActiveIcon
              color={activeColor}
              size={24}
              strokeWidth={2.2}
            />
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
  bar: {
    height: BAR_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: BAR_RADIUS,
    flexDirection: 'row',
    alignItems: 'stretch',
    ...Shadows.md,
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
    ...Shadows.sm,
  },
});
