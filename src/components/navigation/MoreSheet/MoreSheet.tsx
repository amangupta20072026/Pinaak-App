/**
 * ------------------------------------------------------------------
 * MoreSheet — Per-role "More" bottom-sheet
 * ------------------------------------------------------------------
 * Opened when the user taps the "More" tab in any of the 4 role tab
 * bars. The tab's `tabPress` listener calls preventDefault() and
 * imperatively calls `ref.current?.present()` — CustomTabBar already
 * respects `event.defaultPrevented`, so no navigation happens.
 *
 * Layout mirrors the reference screenshot:
 *   - 3-column grid of circular icon buttons with labels underneath
 *   - Close (×) button at the bottom that dismisses the sheet
 *
 * BEHAVIOR / ANIMATION:
 *   On item press we don't fire the action immediately — that would
 *   race the sheet's slide-out animation against whatever navigation
 *   the action triggers (visibly janky on mid-range Android).
 *   Instead we:
 *     1. Store the pending action id in a ref.
 *     2. Dismiss the sheet.
 *     3. Run the action from onAnimate(-> closed) / onDismiss,
 *        i.e. after the sheet is fully offscreen.
 *
 * Provider is already wired at the app root (BottomSheetModalProvider
 * in App.tsx), same pattern as CustomerContactSheet.
 * ------------------------------------------------------------------
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {
  BottomSheetBackdropProps,
  BottomSheetModal as BottomSheetModalType,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

import { Colors, Radius, Shadows, Spacing, Typography } from '@theme';
import {
  getMoreMenu,
  type MoreActionId,
  type MoreItem,
  type MoreRole,
} from './moreMenuConfig';
import { useMoreActions } from './useMoreActions';

/* -----------------------------------------------------------------
 * Public ref API — mirrors CustomerContactSheet
 * ----------------------------------------------------------------- */

export type MoreSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  role: MoreRole;
};

/* -----------------------------------------------------------------
 * Component
 * ----------------------------------------------------------------- */

const MoreSheet = forwardRef<MoreSheetRef, Props>(({ role }, ref) => {
  const sheetRef = useRef<BottomSheetModalType>(null);
  const items = useMemo(() => getMoreMenu(role), [role]);
  const { run } = useMoreActions();
  const { height: screenHeight } = useWindowDimensions();

  // Cap sheet height at 85% of the screen so the sheet never covers
  // the full screen even if the menu grows large in the future.
  // Recommended by gorhom's Dynamic Sizing docs.
  const maxDynamicContentSize = screenHeight * 0.85;

  // Holds the action to run AFTER the sheet has finished closing.
  // A ref (not state) because we don't want to re-render on tap;
  // we just want the value read once in onDismiss.
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
        opacity={0.35}
      />
    ),
    [],
  );

  const handleItemPress = useCallback((item: MoreItem) => {
    // Stage the action; run it after the sheet finishes closing.
    pendingActionRef.current = item.actionId;
    sheetRef.current?.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    // Explicit close button — no pending action, just dismiss.
    pendingActionRef.current = null;
    sheetRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    // Sheet is fully offscreen now — safe to trigger navigation
    // or any other side-effect without animation conflict.
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) run(action);
  }, [run]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      maxDynamicContentSize={maxDynamicContentSize}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
      onDismiss={handleDismiss}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>More</Text>

        <View style={styles.grid}>
          {items.map(item => {
            const { Icon } = item;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  styles.cell,
                  pressed && styles.cellPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={styles.iconCircle}>
                  <Icon color={item.color} size={26} strokeWidth={2} />
                </View>
                <Text numberOfLines={1} style={styles.label}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.closeRow}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close More menu"
          >
            <X color={Colors.textPrimary} size={22} strokeWidth={2.2} />
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

MoreSheet.displayName = 'MoreSheet';

export default MoreSheet;

/* -----------------------------------------------------------------
 * Styles
 * ----------------------------------------------------------------- */

const CIRCLE_SIZE = 60;

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 44,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },

  /* --- grid --- */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  cell: {
    width: '33.333%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cellPressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.xs,
  },
  label: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* --- close --- */
  closeRow: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  closeBtnPressed: {
    opacity: 0.7,
  },
});
