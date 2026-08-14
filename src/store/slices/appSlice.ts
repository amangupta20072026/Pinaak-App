/**
 * ------------------------------------------------------------------
 * App Slice
 * ------------------------------------------------------------------
 * Owns three concerns:
 *
 *   Bootstrap     — `bootstrapped` flips true exactly once, when the
 *                    cold-start orchestrator completes. Gates
 *                    RootNavigator from rendering any real screens
 *                    until Firebase / Keychain / /me / config are
 *                    resolved (or safely fallen back to).
 *
 *   Onboarding    — `hasSeenOnboarding` persists across app kills
 *                    (via MMKV, written directly by the orchestrator
 *                    and OnboardingScreen — NOT via redux-persist).
 *
 *   Identity      — `isAuthenticated`, `userRole`, `userId`, etc.
 *                    Populated by bootstrap OR by loginSuccess after
 *                    an interactive login.
 *
 * The persist transform in store/index.ts only whitelists identity
 * fields — bootstrap flags and onboarding derive from other sources
 * on every launch.
 * ------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole, SubRole } from '@rbac/roles';

// Re-export so existing consumers (roles/config.tsx, RoleCard, RoleSelectionSheet,
// LoginScreen) that import `UserRole`/`SubRole` from '@store/slices/appSlice'
// keep working. New code should prefer importing from '@rbac/roles' directly.
export type { UserRole, SubRole } from '@rbac/roles';
import type { AppConfig } from '@app/bootstrap/steps/appConfig';
import type { AuthResolution } from '@app/bootstrap/steps/auth';

export type AuthStatus =
  | 'unauthenticated'
  | 'provisional' // has token, /me not yet confirmed
  | 'authenticated';

export type AppState = {
  // Bootstrap
  bootstrapped: boolean;

  // Onboarding
  hasSeenOnboarding: boolean;

  // Role picker (before login)
  selectedRole: UserRole | null;

  // Identity
  authStatus: AuthStatus;
  isAuthenticated: boolean; // convenience mirror — true iff authStatus === 'authenticated' | 'provisional'
  userId: string | null;
  userRole: UserRole | null;
  subRole: SubRole;
  entityId: string | null;

  // Remote config
  appConfig: AppConfig | null;
};

const initialState: AppState = {
  bootstrapped: false,
  hasSeenOnboarding: false,
  selectedRole: null,
  authStatus: 'unauthenticated',
  isAuthenticated: false,
  userId: null,
  userRole: null,
  subRole: null,
  entityId: null,
  appConfig: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Called exactly once by the bootstrap orchestrator. Writes ALL
     * resolved state in a single reducer so RootNavigator sees a
     * consistent snapshot on its next render — no flicker between
     * splash and the target stack.
     */
    bootstrapCompleted: (
      state,
      action: PayloadAction<{
        appConfig: AppConfig;
        auth: AuthResolution;
        hasSeenOnboarding: boolean;
      }>,
    ) => {
      const { appConfig, auth, hasSeenOnboarding } = action.payload;

      state.appConfig = appConfig;
      state.hasSeenOnboarding = hasSeenOnboarding;

      if (auth.status === 'authenticated') {
        state.authStatus = 'authenticated';
        state.isAuthenticated = true;
        state.userId = auth.userId;
        state.userRole = auth.role;
        state.subRole = auth.subRole;
        state.entityId = auth.entityId;
      } else if (auth.status === 'provisional') {
        // We trust the local token for now. RootNavigator can either
        // treat provisional as authenticated (opens the app) or hold
        // on a small revalidation screen — we pick "open the app"
        // for perceived speed. A background /me refetch confirms.
        state.authStatus = 'provisional';
        state.isAuthenticated = true;
        // userRole was persisted from last session — keep it.
      } else {
        state.authStatus = 'unauthenticated';
        state.isAuthenticated = false;
        state.userId = null;
        state.userRole = null;
        state.subRole = null;
        state.entityId = null;
      }

      state.bootstrapped = true;
    },

    /** Onboarding "Skip" / "Get Started" tap. Pure state write. */
    completeOnboarding: state => {
      state.hasSeenOnboarding = true;
    },

    /** Role picked in the role-picker sheet. */
    selectRole: (state, action: PayloadAction<UserRole>) => {
      state.selectedRole = action.payload;
    },

    /** "Change role" affordance on Login. */
    changeRole: state => {
      state.selectedRole = null;
    },

    /** Called after successful interactive login. */
    loginSuccess: (
      state,
      action: PayloadAction<{
        userId: string;
        role: UserRole;
        subRole: SubRole;
        entityId: string;
      }>,
    ) => {
      state.authStatus = 'authenticated';
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.userRole = action.payload.role;
      state.subRole = action.payload.subRole;
      state.entityId = action.payload.entityId;
    },

    /**
     * Called by a background /me refetch (post-bootstrap) that
     * upgrades a provisional session to fully authenticated,
     * or downgrades it to unauthenticated if the server rejected.
     */
    reconcileAuth: (state, action: PayloadAction<AuthResolution>) => {
      const auth = action.payload;
      if (auth.status === 'authenticated') {
        state.authStatus = 'authenticated';
        state.isAuthenticated = true;
        state.userId = auth.userId;
        state.userRole = auth.role;
        state.subRole = auth.subRole;
        state.entityId = auth.entityId;
      } else if (auth.status === 'unauthenticated') {
        state.authStatus = 'unauthenticated';
        state.isAuthenticated = false;
        state.userId = null;
        state.userRole = null;
        state.subRole = null;
        state.entityId = null;
      }
    },

    /** Full logout. */
    logout: state => {
      state.authStatus = 'unauthenticated';
      state.isAuthenticated = false;
      state.userId = null;
      state.userRole = null;
      state.subRole = null;
      state.entityId = null;
      state.selectedRole = null;
    },
  },
});

export const {
  bootstrapCompleted,
  completeOnboarding,
  selectRole,
  changeRole,
  loginSuccess,
  reconcileAuth,
  logout,
} = appSlice.actions;

export default appSlice.reducer;
