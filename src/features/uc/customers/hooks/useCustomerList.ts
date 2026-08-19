/* eslint-disable no-void */
/**
 * ------------------------------------------------------------------
 * useCustomerList — UC role, customers list
 * ------------------------------------------------------------------
 * Single source of truth for "the list of UC customers for a given
 * filter combination." Backed by TanStack Query, so:
 *
 *   - each (status, search, page, pageSize) combo gets its own cache
 *     entry, remembered across screen mounts
 *   - warm start rehydrates from MMKV (see App.tsx)
 *   - a mutation elsewhere can invalidate all list variants with:
 *       queryClient.invalidateQueries({
 *         queryKey: queryKeys.uc.customers.all(),
 *       })
 *   - `keepPreviousData` prevents a spinner flash when the user
 *     changes page/filter — old page stays visible while the new
 *     one fetches
 *
 * Backend integration:
 *   The real endpoint is registered at endpoints.uc.customers.list()
 *   and returns { items, totalPages, counts }. Until the backend is
 *   ready, the queryFn falls back to fixture data with the same
 *   shape, so the screen works today.
 *
 *   To go live: delete the TEMP mock block inside fetchUcCustomers
 *   and uncomment the two apiClient.get lines.
 * ------------------------------------------------------------------
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';

// Uncomment when backend is ready:
// import { apiClient } from '@api/axios';
// import { endpoints } from '@api/endpoints';
import { queryKeys } from '@constants/queryKeys';
import { fixtureUcCustomersAll } from '@mocks/fixtures/ucCustomers';
import { delayLikeApi } from '@mocks/helpers/delay';

import type { Customer, StatusFilter } from '../types';

export type UseCustomerListArgs = {
  status?: StatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};

type CustomerListFilters = Required<UseCustomerListArgs>;

type CustomerListResponse = {
  items: Customer[];
  totalPages: number;
  counts: Record<StatusFilter, number>;
};

const EMPTY_COUNTS: Record<StatusFilter, number> = {
  all: 0,
  active: 0,
  inactive: 0,
  blocked: 0,
};

async function fetchUcCustomers(
  filters: CustomerListFilters,
): Promise<CustomerListResponse> {
  // TODO(backend): replace mock block below with:
  // const { data } = await apiClient.get<CustomerListResponse>(
  //   endpoints.uc.customers.list(),
  //   { params: filters },
  // );
  // return data;

  await delayLikeApi();

  const all = fixtureUcCustomersAll;
  const q = filters.search.trim().toLowerCase();

  const filtered = all.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const counts: Record<StatusFilter, number> = {
    all: all.length,
    active: all.filter(c => c.status === 'active').length,
    inactive: all.filter(c => c.status === 'inactive').length,
    blocked: all.filter(c => c.status === 'blocked').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const start = (filters.page - 1) * filters.pageSize;
  const items = filtered.slice(start, start + filters.pageSize);

  return { items, totalPages, counts };
}

export function useCustomerList({
  status = 'all',
  search = '',
  page = 1,
  pageSize = 6,
}: UseCustomerListArgs = {}) {
  const filters: CustomerListFilters = { status, search, page, pageSize };

  const query = useQuery<CustomerListResponse, Error>({
    queryKey: queryKeys.uc.customers.list(filters),
    queryFn: () => fetchUcCustomers(filters),
    placeholderData: keepPreviousData,
    // Uncomment if this list shouldn't be persisted to MMKV
    // (e.g. contains sensitive PII that shouldn't survive process kills):
    // meta: { persist: false },
  });

  return {
    data: query.data?.items ?? [],
    counts: query.data?.counts ?? EMPTY_COUNTS,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isPending,
    isRefreshing: query.isFetching && !query.isPending,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
    refresh: () => {
      void query.refetch();
    },
  };
}
