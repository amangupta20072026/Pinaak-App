/**
 * ------------------------------------------------------------------
 * App Slice
 * ------------------------------------------------------------------
 * Holds session + auth + role state. Two categories:
 *
 *   Session (in-memory, never persisted):
 *     - hasSeenOnboardingThisSession  → resets on app kill
 *     - selectedRole                  → chosen at role picker
 *
 *   Persisted (via redux-persist + MMKV, see store/index.ts):
 *     - isAuthenticated
 *     - userRole
 *
 * The persist blacklist in store/index.ts enforces the split.
 * ------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'customer' | 'vendor' | 'driver' | 'uc';

export type AppState = {
  hasSeenOnboardingThisSession: boolean;
  selectedRole: UserRole | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
};

const initialState: AppState = {
  hasSeenOnboardingThisSession: false,
  selectedRole: null,
  isAuthenticated: false,
  userRole: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /** Called after the 2-slide onboarding + role pick is complete. */
    completeOnboarding: (state) => {
      state.hasSeenOnboardingThisSession = true;
    },

    /** Called when the user picks a role in the role-picker screen. */
    selectRole: (state, action: PayloadAction<UserRole>) => {
      state.selectedRole = action.payload;
    },

    /**
     * Called from the Login screen's "Change" affordance.
     * Clears the current role pick and rewinds the onboarding flag so
     * RootNavigator swaps back to the role-picker screen.
     */
    changeRole: (state) => {
      state.selectedRole = null;
      state.hasSeenOnboardingThisSession = false;
    },

    /** Called after successful login/signup. */
    loginSuccess: (
      state,
      action: PayloadAction<{ role: UserRole }>,
    ) => {
      state.isAuthenticated = true;
      state.userRole = action.payload.role;
    },

    /** Full logout — clears auth but keeps onboarding-seen for the session. */
    logout: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.selectedRole = null;
    },
  },
});

export const {
  completeOnboarding,
  selectRole,
  changeRole,
  loginSuccess,
  logout,
} = appSlice.actions;

export default appSlice.reducer;