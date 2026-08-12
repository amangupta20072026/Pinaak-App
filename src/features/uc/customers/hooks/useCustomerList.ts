import { useCallback, useEffect, useMemo, useState } from 'react';
import { fixtureUcCustomersAll } from '@mocks/fixtures/ucCustomers';
import { delayLikeApi } from '@mocks/helpers/delay';
import type { Customer, CustomerFilter } from '../types';

export type UseCustomerListArgs = {
  filter?: CustomerFilter;
  search?: string;
};

export function useCustomerList({ filter = 'all', search = '' }: UseCustomerListArgs = {}) {
  const [data, setData] = useState<Customer[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      await delayLikeApi();
      setData(fixtureUcCustomersAll);
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

  // Client-side filter + search — later this becomes server params.
  const filtered = useMemo(() => {
    if (!data) return undefined;
    const q = search.trim().toLowerCase();
    return data.filter(c => {
      if (filter !== 'all' && c.type !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [data, filter, search]);

  const counts = useMemo(() => {
    if (!data) return { all: 0, personal: 0, corporate: 0, event: 0 };
    return data.reduce(
      (acc, c) => {
        acc.all += 1;
        acc[c.type] += 1;
        return acc;
      },
      { all: 0, personal: 0, corporate: 0, event: 0 },
    );
  }, [data]);

  return {
    data: filtered,
    counts,
    isLoading,
    isRefreshing,
    error,
    refetch: () => load(false),
    refresh: () => load(true),
  };
}