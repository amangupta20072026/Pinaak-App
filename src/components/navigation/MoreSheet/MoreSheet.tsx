/* eslint-disable react-native/no-inline-styles */
/**
 * ------------------------------------------------------------------
 * MoreSheet — Per-role "More" bottom-sheet
 * ------------------------------------------------------------------
 * Opened when the user taps the "More" tab in any of the 4 role tab
 * bars. The tab's `tabPress` listener calls preventDefault() and
 * imperatively calls `ref.current?.present()`.
 *
 * LAYOUT (2026 pattern):
 *   - Half-sheet snap points (60% / 85%) so the tab bar stays visible
 *     below the sheet and the user always has visual anchor.
 *   - `bottomInset` = tab bar footprint, so the sheet stops above it.
 *   - Backdrop also inset so the dim overlay never covers the tab bar.
 *     Tab bar stays fully interactive — tapping another tab dismisses
 *     the sheet and switches, iOS/Instagram style.
 *   - Grouped sections: Account · Business · Support. Section headers
 *     are 11px uppercase muted labels.
 *   - Icons render inside colored tinted circles (10% alpha of the
 *     icon's accent color). Modern Material 3 / iOS 17 look.
 *   - Drag handle is the only close affordance — no × button.
 *
 * PARENT CALLBACKS:
 *   `onOpenChange(open)` fires when the sheet transitions between
 *   presented and dismissed. Parents use this to switch the tab bar's
 *   `overrideActiveIndex` to the More tab while the sheet is open,
 *   so the badge visually slides to More.
 *
 * ACTION DISPATCH:
 *   On item tap we stash the actionId and dismiss the sheet. The real
 *   navigation / logout side-effect fires from onDismiss, after the
 *   sheet is fully offscreen — avoids animation conflicts.
 * ------------------------------------------------------------------
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {
  BottomSheetBackdropProps,
  BottomSheetModal as BottomSheetModalType,
} from '@gorhom/bottom-sheet';

import { Colors, Shadows, Spacing, Typography } from '@theme';
import {
  MORE_GROUP_LABEL,
  MORE_GROUP_ORDER,
  getMoreMenu,
  groupMoreMenu,
  type MoreActionId,
  type MoreItem,
  type MoreRole,
} from './moreMenuConfig';
import { useMoreActions } from './useMoreActions';

/* -----------------------------------------------------------------
 * Public ref API
 * ----------------------------------------------------------------- */

export type MoreSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  role: MoreRole;
  /**
   * Fires whenever the sheet transitions between presented and
   * dismissed. Parents wire this into their tab bar's
   * `overrideActiveIndex` to slide the badge onto the More tab while
   * the sheet is open.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Space below the sheet (typically the tab bar's footprint) so the
   * sheet rests ON TOP of the tab bar instead of covering it.
   * Backdrop respects the same inset — tab bar stays undimmed.
   */
  bottomInset?: number;
};

/* -----------------------------------------------------------------
 * Colored tint utility — used for the soft icon backgrounds.
 * ----------------------------------------------------------------- */

const withAlpha = (hex: string, alpha: number): string => {
  const clamped = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  const suffix = clamped.toString(16).padStart(2, '0');
  return `${hex}${suffix}`;
};

/* -----------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------- */

const MoreSheet = forwardRef<MoreSheetRef, Props>(
  ({ role, onOpenChange, bottomInset = 0 }, ref) => {
    const sheetRef = useRef<BottomSheetModalType>(null);
    const items = useMemo(() => getMoreMenu(role), [role]);
    const grouped = useMemo(() => groupMoreMenu(items), [items]);
    const { run } = useMoreActions();

    const snapPoints = useMemo(() => ['60%', '85%'], []);

    const pendingActionRef = useRef<MoreActionId | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleItemPress = useCallback((item: MoreItem) => {
      pendingActionRef.current = item.actionId;
      sheetRef.current?.dismiss();
    }, []);

    const handleChange = useCallback(
      (index: number) => {
        onOpenChange?.(index >= 0);
      },
      [onOpenChange],
    );

    const handleDismiss = useCallback(() => {
      onOpenChange?.(false);
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      if (action) run(action);
    }, [onOpenChange, run]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        bottomInset={bottomInset}
        detached={bottomInset > 0}
        style={bottomInset > 0 ? styles.detachedSheet : undefined}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
        onChange={handleChange}
        onDismiss={handleDismiss}
        enablePanDownToClose
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>More</Text>

          {MORE_GROUP_ORDER.map(group => {
            const groupItems = grouped[group];
            if (groupItems.length === 0) return null;
            return (
              <View key={group} style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {MORE_GROUP_LABEL[group].toUpperCase()}
                </Text>
                <View style={styles.grid}>
                  {groupItems.map(item => (
                    <MenuCell
                      key={item.key}
                      item={item}
                      onPress={handleItemPress}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

MoreSheet.displayName = 'MoreSheet';

export default MoreSheet;

/* -----------------------------------------------------------------
 * Menu cell — colored tinted icon circle + label
 * ----------------------------------------------------------------- */

const MenuCell: React.FC<{
  item: MoreItem;
  onPress: (item: MoreItem) => void;
}> = ({ item, onPress }) => {
  const { Icon, label, color, group } = item;
  const isLogout = item.actionId === 'logout';

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: withAlpha(color, 0.12) },
        ]}
      >
        <Icon color={color} size={22} strokeWidth={2} />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          isLogout && { color: Colors.error, fontWeight: '600' },
          group === 'support' && !isLogout && styles.labelSubtle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/* -----------------------------------------------------------------
 * Styles
 * ----------------------------------------------------------------- */

const CIRCLE_SIZE = 52;

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  detachedSheet: {
    marginHorizontal: 8,
    ...Shadows.lg,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 44,
    height: 5,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },

  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  cell: {
    width: '33.333%',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  cellPressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSubtle: {
    color: Colors.textSecondary,
  },
});
