/* eslint-disable no-void */
/**
 * ------------------------------------------------------------------
 * useCustomerList — UC role, customers list
 * ------------------------------------------------------------------
 * Single source of truth for "the list of UC customers for a given
 * filter combination." Backed by TanStack Query, so:
 *
 *   - each (search, page, pageSize, filters) combo gets its own cache
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
 *   and returns { items, totalPages }. Until the backend is ready,
 *   the queryFn falls back to fixture data with the same shape, so
 *   the screen works today.
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

import {
  DEFAULT_CUSTOMER_FILTERS,
  type Customer,
  type CustomerFilters,
} from '../types';

export type UseCustomerListArgs = {
  search?: string;
  page?: number;
  pageSize?: number;
  filters?: CustomerFilters;
};

type CustomerListParams = Required<UseCustomerListArgs>;

type CustomerListResponse = {
  items: Customer[];
  totalPages: number;
};

/* ------------------------------------------------------------------ */
/* Filter helpers                                                     */
/* ------------------------------------------------------------------ */

/** Inclusive of dateFrom, exclusive of the day AFTER dateTo. */
function withinDateRange(
  createdAt: string,
  dateFrom: string | null,
  dateTo: string | null,
): boolean {
  const t = new Date(createdAt).getTime();

  if (dateFrom) {
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    if (t < from.getTime()) return false;
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    if (t > to.getTime()) return false;
  }

  return true;
}

function inTripsBucket(
  totalBookings: number,
  bucket: CustomerFilters['tripsBucket'],
): boolean {
  switch (bucket) {
    case 'all':
      return true;
    case 'none':
      return totalBookings === 0;
    case '1to10':
      return totalBookings >= 1 && totalBookings <= 10;
    case '10plus':
      return totalBookings > 10;
  }
}

function sortCustomers(
  items: Customer[],
  sortBy: CustomerFilters['sortBy'],
): Customer[] {
  const copy = [...items];
  switch (sortBy) {
    case 'newest':
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'oldest':
      return copy.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case 'nameAsc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'mostTrips':
      return copy.sort((a, b) => b.totalBookings - a.totalBookings);
  }
}

/* ------------------------------------------------------------------ */
/* Fetch                                                              */
/* ------------------------------------------------------------------ */

async function fetchUcCustomers(
  params: CustomerListParams,
): Promise<CustomerListResponse> {
  // TODO(backend): replace mock block below with:
  // const { data } = await apiClient.get<CustomerListResponse>(
  //   endpoints.uc.customers.list(),
  //   { params },
  // );
  // return data;

  await delayLikeApi();

  const { search, page, pageSize, filters } = params;
  const q = search.trim().toLowerCase();

  const matched = fixtureUcCustomersAll.filter(c => {
    // Text search
    if (q) {
      const hit =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);
      if (!hit) return false;
    }

    // Customer type
    if (filters.type !== 'all' && c.type !== filters.type) return false;

    // Registration date range
    if (!withinDateRange(c.createdAt, filters.dateFrom, filters.dateTo))
      return false;

    // Trips bucket
    if (!inTripsBucket(c.totalBookings, filters.tripsBucket)) return false;

    return true;
  });

  const sorted = sortCustomers(matched, filters.sortBy);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return { items, totalPages };
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useCustomerList({
  search = '',
  page = 1,
  pageSize = 6,
  filters = DEFAULT_CUSTOMER_FILTERS,
}: UseCustomerListArgs = {}) {
  const params: CustomerListParams = { search, page, pageSize, filters };

  const query = useQuery<CustomerListResponse, Error>({
    queryKey: queryKeys.uc.customers.list(params),
    queryFn: () => fetchUcCustomers(params),
    placeholderData: keepPreviousData,
    // Uncomment if this list shouldn't be persisted to MMKV
    // (e.g. contains sensitive PII that shouldn't survive process kills):
    // meta: { persist: false },
  });

  return {
    data: query.data?.items ?? [],
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
