/**
 * ==================================================================
 * SheetDismissOnRouteChange — one-way sync helper
 * ==================================================================
 *
 * ROLE:
 *   Invisible component. Watches the tab bar's focused tab index and
 *   dismisses the More sheet whenever that index changes.
 *
 * WHY THIS EXISTS (architectural intent):
 *   We enforce ONE-WAY DATA FLOW between navigation and the sheet:
 *
 *       navigation state change  →  sheet dismisses
 *                (never the reverse)
 *
 *   The tap-press handler on non-More tabs does NOTHING to the sheet.
 *   Navigation proceeds first, untouched; the sheet then reacts to
 *   the resulting state change. This eliminates the "tap Bookings
 *   while sheet open → app navigates to Dashboard" bug that happens
 *   when the sheet's dismiss and the tab's navigate compete inside
 *   the same synchronous tap-press handler.
 *
 * USAGE:
 *   Mount inside the `tabBar` renderer so it re-renders on every
 *   state change automatically. Pass `props.state.index` as tabIndex
 *   and the ref to the MoreSheet.
 *
 *       const renderTabBar = useCallback(
 *         (props: BottomTabBarProps) => (
 *           <>
 *             <SheetDismissOnRouteChange
 *               tabIndex={props.state.index}
 *               sheetRef={moreSheetRef}
 *             />
 *             <CustomTabBar {...props} role="uc" ... />
 *           </>
 *         ),
 *         [isMoreSheetOpen],
 *       );
 *
 * IMPLEMENTATION NOTES:
 *   - Uses a ref (not state) for the previous index so the observer
 *     never itself triggers a render.
 *   - The initial mount does NOT dismiss — prevIndex starts equal to
 *     the current index, so the useEffect early-returns.
 *   - Calling dismiss() on an already-closed sheet is a no-op thanks
 *     to MoreSheet's internal state machine — safe to over-fire.
 * ==================================================================
 */

import React, { useEffect, useRef } from 'react';
import type { MoreSheetRef } from './MoreSheet';

type Props = {
  /** Currently focused tab index — comes from BottomTabBarProps.state.index. */
  tabIndex: number;
  /** Ref to the MoreSheet whose visibility we mirror. */
  sheetRef: React.RefObject<MoreSheetRef | null>;
};

export const SheetDismissOnRouteChange: React.FC<Props> = ({
  tabIndex,
  sheetRef,
}) => {
  const prevIndexRef = useRef(tabIndex);

  useEffect(() => {
    if (prevIndexRef.current === tabIndex) return;
    prevIndexRef.current = tabIndex;
    sheetRef.current?.dismiss();
  }, [tabIndex, sheetRef]);

  return null;
};

export default SheetDismissOnRouteChange;
