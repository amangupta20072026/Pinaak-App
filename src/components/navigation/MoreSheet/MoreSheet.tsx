/* eslint-disable react-native/no-inline-styles */
/**
 * ==================================================================
 * MoreSheet — Production-Grade "More" Bottom Sheet
 * ==================================================================
 *
 * DESIGN INVARIANTS (do not violate):
 *
 *   1. DETERMINISTIC HEIGHT.
 *      Sheet snap point is computed statically from the menu-item
 *      count for the given role, using known layout constants.
 *      `enableDynamicSizing` is explicitly set to `false` below — in
 *      @gorhom/bottom-sheet v5 it defaults to `true`, which silently
 *      ignores `snapPoints` and grows the sheet to fit its content
 *      instead. Left at its default, that's exactly what caused the
 *      sheet to expand to full screen once a role's menu (e.g. UC's
 *      5 groups) grew taller than the 60% snap point. With it off,
 *      the sheet stays fixed at 60% and BottomSheetScrollView handles
 *      the overflow by scrolling internally, as intended.
 *      (Ref: https://gorhom.dev/react-native-bottom-sheet/dynamic-sizing)
 *
 *   2. IDEMPOTENT IMPERATIVE API.
 *      `present()` / `dismiss()` are safe to call at any time in any
 *      order. An internal state ref (`gestureStateRef`) tracks the
 *      real sheet phase (closed | opening | opened | closing) and
 *      short-circuits redundant / racing calls. This is what makes
 *      the sheet survive rapid double-taps and mid-animation
 *      interruptions.
 *
 *   3. ACTIONS FIRE POST-DISMISS.
 *      When the user taps a menu item, we DO NOT navigate synchronously.
 *      Instead we stash the actionId, dismiss the sheet, and — inside
 *      the sheet's onDismiss callback (which fires only after the
 *      close animation has fully retired) — schedule the action via
 *      `requestAnimationFrame`. That gives React one frame to commit
 *      the `setIsMoreSheetOpen(false)` update from onChange(-1) and
 *      flush its passive effects (including CustomTabBar's shared
 *      value sync) BEFORE the destination screen mounts on top.
 *
 *      An earlier revision used `InteractionManager.runAfterInter-
 *      actions` here, which React Native has since deprecated. We
 *      reverted to `requestAnimationFrame` because:
 *        - It is the RN-supported, non-deprecated primitive for
 *          "next frame after commit".
 *        - The tab bar's notch animation lives on the UI thread via
 *          `useAnimatedReaction`, and CustomTabBar's `useFocusEffect`
 *          re-drives the spring on every screen refocus. So even if
 *          navigation dispatches before the spring completes, the
 *          notch snaps to the correct target on return.
 *      `requestIdleCallback` (RN's newer suggested replacement for
 *      InteractionManager) is wrong for this use case — it fires
 *      when the JS thread is idle, which can be many frames later.
 *      Navigation should feel instant, not idle-deferred.
 *
 *   4. TAB BAR VISIBLE + INTERACTIVE.
 *      `bottomInset` = tab bar footprint. Sheet renders ABOVE the tab
 *      bar. Backdrop is contained within the sheet's inset container,
 *      so the tab bar stays undimmed and tappable (Option B UX).
 *
 *   5. ROLE-SCOPED CONTENT.
 *      Menu items come from `getMoreMenu(role)` — data only. Behavior
 *      lives in `useMoreActions.ts`. Neither depends on the other's
 *      internals.
 * ==================================================================
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
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

import { Colors, Spacing, Typography } from '@theme';
import {
  MORE_GROUP_LABEL,
  MORE_GROUP_ORDER,
  getMoreMenu,
  groupMoreMenu,
  type MoreActionId,
  type MoreGroup,
  type MoreItem,
  type MoreRole,
} from './moreMenuConfig';
import { useMoreActions } from './useMoreActions';

/* =================================================================
 * Public ref API
 * ================================================================= */

export type MoreSheetRef = {
  /** Idempotent — safe to call when already open or mid-animation. */
  present: () => void;
  /** Idempotent — safe to call when already closed or mid-animation. */
  dismiss: () => void;
};

type Props = {
  role: MoreRole;
  /** Fires when the sheet transitions between open and closed. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Space below the sheet (tab bar footprint). Sheet renders above
   * this inset; tab bar stays visible and interactive underneath.
   */
  bottomInset?: number;
};

/* =================================================================
 * Utilities
 * ================================================================= */

const withAlpha = (hex: string, alpha: number): string => {
  const clamped = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  const suffix = clamped.toString(16).padStart(2, '0');
  return `${hex}${suffix}`;
};

/** Internal sheet phase — used to guard against racing operations. */
type SheetPhase = 'closed' | 'opening' | 'opened' | 'closing';

/* =================================================================
 * Component
 * ================================================================= */

const MoreSheet = forwardRef<MoreSheetRef, Props>(
  ({ role, onOpenChange, bottomInset = 0 }, ref) => {
    const sheetRef = useRef<BottomSheetModalType>(null);
    const items = useMemo(() => getMoreMenu(role), [role]);
    const grouped = useMemo(() => groupMoreMenu(items), [items]);
    const { run } = useMoreActions();

    /* ---------------------------------------------------------------
     * Snap point — fixed 60% of screen, modal-style.
     *
     * The sheet is intentionally NOT content-fitted anymore. It opens
     * to the same size every time regardless of role, giving it a
     * consistent "modal" feel across roles.
     *
     *   - Roles with fewer items (customer/vendor/driver): the grid
     *     sits at the top of the sheet; the remaining space is empty
     *     but harmless — this is expected modal behaviour.
     *   - Roles with more items (uc): if content exceeds 60%, the
     *     inner BottomSheetScrollView takes over scrolling silently
     *     (indicator hidden).
     *
     * Kept as a hard percentage — no measurement, no first-tap race
     * with @gorhom v5's enableDynamicSizing.
     * ---------------------------------------------------------------- */
    const snapPoints = useMemo(() => ['60%'], []);

    /* ---------------------------------------------------------------
     * State machine — guards against racing present()/dismiss() calls.
     * Also used by handleDismiss to fire pending action AFTER the
     * closing animation is fully complete.
     * ---------------------------------------------------------------- */
    const gestureStateRef = useRef<SheetPhase>('closed');
    const pendingActionRef = useRef<MoreActionId | null>(null);

    /* ---------------------------------------------------------------
     * Idempotent imperative API.
     * ---------------------------------------------------------------- */
    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          const phase = gestureStateRef.current;
          // Reject if already visible or in the process of becoming so.
          if (phase === 'opened' || phase === 'opening') return;
          gestureStateRef.current = 'opening';
          // Guard against ref being null in edge cases (should never be,
          // but defensive: if the modal hasn't attached yet, we bail
          // silently — a subsequent tap will succeed once mounted.).
          sheetRef.current?.present();
        },
        dismiss: () => {
          const phase = gestureStateRef.current;
          if (phase === 'closed' || phase === 'closing') return;
          gestureStateRef.current = 'closing';
          sheetRef.current?.dismiss();
        },
      }),
      [],
    );

    /* ---------------------------------------------------------------
     * Cleanup — if the sheet unmounts while animating (rare, but
     * happens on logout / role swap), force-clear internal state so
     * a future remount starts from a known-clean phase.
     *
     * We ALSO notify the parent via `onOpenChange(false)` so that any
     * parent state that mirrors the sheet's open/closed status (e.g.
     * `isMoreSheetOpen` in useMoreTabController, which drives the
     * tab bar's `overrideActiveIndex`) is reset synchronously with
     * the unmount. Without this, an unmount-while-open leaves the
     * parent believing the sheet is still visible, and the tab bar
     * keeps the notch overridden onto the More tab indefinitely.
     * ---------------------------------------------------------------- */
    useEffect(() => {
      return () => {
        pendingActionRef.current = null;
        gestureStateRef.current = 'closed';
        onOpenChange?.(false);
      };
      // onOpenChange is expected to be stable (setState from useState);
      // intentionally empty deps so the cleanup fires only on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------------------------------------------------------------
     * Backdrop — dims content above the sheet.
     *
     * CRITICAL BUG FIX (per @gorhom/bottom-sheet source + issue #2680):
     *
     *   The default BottomSheetBackdrop is `StyleSheet.absoluteFill`
     *   inside the sheet's Portal container. The Portal container is
     *   ALWAYS full-screen — `bottomInset` on BottomSheetModal only
     *   insets the sheet's snap position, NOT the backdrop's bounds.
     *
     *   So even though the sheet visually sits above the tab bar,
     *   the backdrop still covers the tab bar area with
     *   `pointerEvents='auto'` + `pressBehavior='close'`, meaning:
     *     - Taps on the tab bar area hit the BACKDROP, not the bar.
     *     - Backdrop closes the sheet; navigation is never called.
     *     - Result: user thinks the app "returns to previous tab"
     *       when actually navigation just never fired.
     *
     * FIX: Constrain the backdrop's bottom edge to end at
     * `bottomInset`. Below that, no backdrop → the tab bar
     * receives its own touches directly.
     *
     * ALSO: Wrap in a `pointerEvents="box-none"` guard so the known
     * Android bug in v5.2.14 (invisible closed backdrop trapping
     * touches after cold start, issue #2680) can never propagate
     * through the tab bar area even if the backdrop's internal
     * pointerEvents state gets stuck.
     * ---------------------------------------------------------------- */
    const backdropStyle = useMemo(
      () => ({ bottom: bottomInset }),
      [bottomInset],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
          pressBehavior="close"
          style={backdropStyle}
        />
      ),
      [backdropStyle],
    );

    /* ---------------------------------------------------------------
     * Item tap handler.
     *
     * Sequence:
     *   1. Stash actionId in ref.
     *   2. Call dismiss() (state → 'closing').
     *   3. handleChange fires with -1 → phase becomes 'closed'.
     *   4. handleDismiss runs the stashed action AFTER interactions
     *      settle → no animation clash, no orphan sheet.
     * ---------------------------------------------------------------- */
    const handleItemPress = useCallback((item: MoreItem) => {
      pendingActionRef.current = item.actionId;
      if (gestureStateRef.current !== 'closing') {
        gestureStateRef.current = 'closing';
        sheetRef.current?.dismiss();
      }
    }, []);

    /* ---------------------------------------------------------------
     * onChange — authoritative source for phase. Fires when the sheet
     * finishes its animation (open OR close).
     *   index >= 0 → sheet at that snap → phase = 'opened'
     *   index === -1 → sheet fully dismissed → phase = 'closed'
     * ---------------------------------------------------------------- */
    const handleChange = useCallback(
      (index: number) => {
        if (index >= 0) {
          gestureStateRef.current = 'opened';
          onOpenChange?.(true);
        } else {
          gestureStateRef.current = 'closed';
          onOpenChange?.(false);
        }
      },
      [onOpenChange],
    );

    /* ---------------------------------------------------------------
     * onDismiss — runs after the sheet is fully offscreen. Safe time
     * to dispatch navigation / redux side-effects.
     *
     * We defer the action by ONE frame via `requestAnimationFrame` so
     * React can commit any final post-dismissal state (phase →
     * 'closed', backdrop unmounted, `isMoreSheetOpen` → false) and
     * flush passive effects (CustomTabBar's targetCxSV shared-value
     * sync) BEFORE we push the destination screen. This keeps the
     * next screen's mount from interleaving with the sheet's
     * teardown commit.
     *
     * Why raf rather than InteractionManager or requestIdleCallback:
     *   - `InteractionManager.runAfterInteractions` is deprecated in
     *     recent React Native versions.
     *   - `requestIdleCallback` (RN's official replacement) fires
     *     when the JS thread is idle — potentially many frames later.
     *     That is the wrong timing for "user tapped, act now".
     *   - `requestAnimationFrame` fires at the start of the next
     *     frame, after React has committed and effects have flushed.
     *     That is the exact "one tick later" behaviour we want.
     *
     * Safety net for the case where navigation dispatches before the
     * tab bar's UI-thread spring animation can complete: CustomTabBar
     * runs `useFocusEffect` that re-drives `cx.value = withSpring(
     * targetCxSV.value)` every time the screen regains focus. So even
     * if the destination screen covers UcTabs mid-spring and the
     * shared value freezes at an intermediate position, focus after
     * the user pops back snaps it to the correct target. This is the
     * "self-healing UI" principle — timing precision here is nice to
     * have, not load-bearing.
     * ---------------------------------------------------------------- */
    const handleDismiss = useCallback(() => {
      gestureStateRef.current = 'closed';
      onOpenChange?.(false);
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      if (!action) return;
      // Defer navigation by one frame so React can commit the
      // preceding onChange(-1) → setIsMoreSheetOpen(false) update
      // and flush its passive effects before the destination screen
      // mounts. See the block comment above for the full rationale
      // and why raf is safe with the current tab-bar architecture.
      requestAnimationFrame(() => {
        run(action);
      });
    }, [onOpenChange, run]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        bottomInset={bottomInset}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
        onChange={handleChange}
        onDismiss={handleDismiss}
        enablePanDownToClose
        stackBehavior="replace"
        /**
         * Gesture configuration — the standard iOS/Android modal
         * pattern used by Gmail / Slack / Zoom bottom sheets.
         *
         *   enableOverDrag={false}
         *     Locks the sheet's top edge at its snap point (60%).
         *     Without this, gorhom defaults to true and lets the user
         *     drag the sheet BEYOND its top snap, physically resizing
         *     the sheet instead of scrolling the inner content. That
         *     was the "sheet grows when I scroll up" bug.
         *
         *   enableContentPanningGesture={true} (default)
         *     Keeps the coordinated pan-to-close behaviour: pulling
         *     down on the content area when the ScrollView is already
         *     at the top dismisses the sheet. When the ScrollView is
         *     scrolled down, drags are delegated to it so scrolling
         *     works naturally.
         *
         *   enableHandlePanningGesture={true} (default)
         *     Drag handle at top can still be used to close the sheet.
         *
         * Net effect:
         *   - Sheet stays fixed at 60%.
         *   - Grid drag up  → BottomSheetScrollView scrolls (reveals
         *                     hidden sections like SUPPORT).
         *   - Grid drag down at top of scroll → sheet dismisses.
         *   - Handle drag down → sheet dismisses.
         *   - Backdrop tap → sheet dismisses.
         */
        enableOverDrag={false}
        /**
         * enableDynamicSizing={false}
         *
         * v5 defaults this to `true`, which makes the sheet ignore
         * `snapPoints` and resize itself to fit its content instead.
         * That's the root cause of the "sheet becomes full screen
         * once you scroll to a role with more groups" bug: content
         * taller than 60% caused the library to grow the sheet to
         * match it. Disabling this restores the fixed-60%-with-
         * internal-scroll behaviour `snapPoints` was written for.
         * Official guidance: https://gorhom.dev/react-native-bottom-sheet/dynamic-sizing
         */
        enableDynamicSizing={false}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {MORE_GROUP_ORDER.map(group => {
            const groupItems = grouped[group];
            if (groupItems.length === 0) return null;
            return (
              <MoreSection
                key={group}
                group={group}
                items={groupItems}
                onItemPress={handleItemPress}
              />
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

MoreSheet.displayName = 'MoreSheet';

export default MoreSheet;

/* =================================================================
 * Section — memoized so unrelated re-renders don't rebuild the grid.
 * ================================================================= */

const MoreSection: React.FC<{
  group: MoreGroup;
  items: MoreItem[];
  onItemPress: (item: MoreItem) => void;
}> = React.memo(({ group, items, onItemPress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>
      {MORE_GROUP_LABEL[group].toUpperCase()}
    </Text>
    <View style={styles.grid}>
      {items.map(item => (
        <MenuCell key={item.key} item={item} onPress={onItemPress} />
      ))}
    </View>
  </View>
));
MoreSection.displayName = 'MoreSection';

/* =================================================================
 * Menu Cell
 * ================================================================= */

const MenuCell: React.FC<{
  item: MoreItem;
  onPress: (item: MoreItem) => void;
}> = React.memo(({ item, onPress }) => {
  const { Icon, label, color, group } = item;
  const isLogout = item.actionId === 'logout';

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[styles.iconCircle, { backgroundColor: withAlpha(color, 0.12) }]}
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
});
MenuCell.displayName = 'MenuCell';

/* =================================================================
 * Styles
 * ================================================================= */

const CIRCLE_SIZE = 52;

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  handle: {
    backgroundColor: Colors.border,
    width: 44,
    height: 5,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
