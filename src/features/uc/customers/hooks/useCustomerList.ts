import { useCallback, useEffect, useMemo, useState } from 'react';
import { fixtureUcCustomersAll } from '@mocks/fixtures/ucCustomers';
import { delayLikeApi } from '@mocks/helpers/delay';
import type { Customer, StatusFilter } from '../types';

export type UseCustomerListArgs = {
  status?: StatusFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useCustomerList({
  status = 'all',
  search = '',
  page = 1,
  pageSize = 6,
}: UseCustomerListArgs = {}) {
  const [all, setAll] = useState<Customer[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      await delayLikeApi();
      setAll(fixtureUcCustomersAll);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const acc: Record<StatusFilter, number> = {
      all: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
    };
    (all ?? []).forEach(c => {
      acc.all += 1;
      acc[c.status] += 1;
    });
    return acc;
  }, [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (all ?? []).filter(c => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [all, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return {
    data: pageData,
    counts,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    refetch: () => load(false),
    refresh: () => load(true),
  };
}
