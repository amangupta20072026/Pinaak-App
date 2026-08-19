import type { ISODateTime } from '@app-types/datetime';

export type CustomerType = 'personal' | 'corporate';

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  phone: string;
  email: string;
  city: string;
  gstin?: string;
  createdAt: ISODateTime;
  totalBookings: number;
  lastBookingAt: ISODateTime | null;
};

export type CustomerFilter = 'all' | CustomerType;

/* ------------------------------------------------------------------
 * Filter sheet state
 * ------------------------------------------------------------------ */

export type CustomerSortBy = 'newest' | 'oldest' | 'nameAsc' | 'mostTrips';

export type CustomerTripsBucket = 'all' | 'none' | '1to10' | '10plus';

export type CustomerFilters = {
  type: CustomerFilter;
  dateFrom: string | null; // ISO date (yyyy-mm-dd or full ISO)
  dateTo: string | null;
  sortBy: CustomerSortBy;
  tripsBucket: CustomerTripsBucket;
};

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  type: 'all',
  dateFrom: null,
  dateTo: null,
  sortBy: 'newest',
  tripsBucket: 'all',
};

/**
 * Count of filters that differ from defaults.
 * Used for the little badge on the filter icon.
 */
export function countActiveFilters(f: CustomerFilters): number {
  let n = 0;
  if (f.type !== DEFAULT_CUSTOMER_FILTERS.type) n += 1;
  if (f.dateFrom || f.dateTo) n += 1;
  if (f.sortBy !== DEFAULT_CUSTOMER_FILTERS.sortBy) n += 1;
  if (f.tripsBucket !== DEFAULT_CUSTOMER_FILTERS.tripsBucket) n += 1;
  return n;
}
