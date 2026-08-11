/**
 * ------------------------------------------------------------------
 * QueryClient — Root TanStack Query Config
 * ------------------------------------------------------------------
 * Sensible mobile defaults:
 *   - Retry twice on network/server errors, never on 4xx client errors
 *   - Refetch when phone regains network
 *   - No window-focus refetch (RN has no real window focus)
 *   - 30s staleTime — background refetch on remount
 *   - 5min gcTime — cache retained after last observer unmounts
 * ------------------------------------------------------------------
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60_000, // 5 minutes

      retry: (failureCount, error) => {
        // Don't retry client errors — they won't recover on retry.
        if (error instanceof ApiError) {
          if (
            error.kind === 'unauthorized' ||
            error.kind === 'forbidden' ||
            error.kind === 'notFound' ||
            error.kind === 'validation'
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },

      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // never auto-retry mutations
    },
  },
});
