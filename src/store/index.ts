/**
 * ------------------------------------------------------------------
 * Redux Store
 * ------------------------------------------------------------------
 * redux-persist backed by MMKV. A slice-level transform ensures only
 * auth fields survive process kills — onboarding-seen and selected
 * role reset every session by design.
 *
 * Note on the `as Reducer<...>` cast below: @reduxjs/toolkit v2's
 * combineReducers returns a 3-generic Reducer<S, UnknownAction,
 * Partial<S>>, while redux-persist v6 expects a 2-generic
 * Reducer<S>. The cast bridges that gap — the runtime shape is
 * identical, only the TS signatures disagree.
 * ------------------------------------------------------------------
 */

import {
  combineReducers,
  configureStore,
  type Reducer,
} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createTransform,
  persistReducer,
  persistStore,
} from 'redux-persist';

import appReducer, { type AppState } from './slices/appSlice';
import { reduxMmkvStorage } from './mmkvStorage';

/* -----------------------------------------------------------------
 * Root reducer
 * ----------------------------------------------------------------- */

const rootReducer = combineReducers({
  app: appReducer,
});

type RootReducerState = ReturnType<typeof rootReducer>;

/* -----------------------------------------------------------------
 * Persist transform for the `app` slice
 * ----------------------------------------------------------------- *
 * SubState = AppState (what lives in memory).
 * EndSubState = PersistedAppSubset (what gets written to MMKV).
 *
 * Inbound: strip session-only fields before persisting.
 * Outbound: reconstruct full AppState by combining the persisted
 * subset with the session defaults, so onboarding shows every
 * session regardless of prior sessions' state.
 */

type PersistedAppSubset = Pick<AppState, 'isAuthenticated' | 'userRole'>;

const SESSION_DEFAULTS: Pick<
  AppState,
  'hasSeenOnboardingThisSession' | 'selectedRole'
> = {
  hasSeenOnboardingThisSession: false,
  selectedRole: null,
};

const appSliceTransform = createTransform<AppState, PersistedAppSubset>(
  (inbound): PersistedAppSubset => ({
    isAuthenticated: inbound.isAuthenticated,
    userRole: inbound.userRole,
  }),
  (outbound): AppState => ({
    ...SESSION_DEFAULTS,
    isAuthenticated: outbound.isAuthenticated,
    userRole: outbound.userRole,
  }),
  { whitelist: ['app'] },
);

/* -----------------------------------------------------------------
 * Persist config
 * ----------------------------------------------------------------- */

const persistConfig = {
  key: 'pinaak-root',
  version: 1,
  storage: reduxMmkvStorage,
  transforms: [appSliceTransform],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer as unknown as Reducer<RootReducerState>,
);

/* -----------------------------------------------------------------
 * Store
 * ----------------------------------------------------------------- */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;