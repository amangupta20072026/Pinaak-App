import { useEffect, useState } from 'react';
import { mockCustomers } from '@mocks/data/customers';
import { delayLikeApi } from '@mocks/helpers/delay';
import type { Customer } from '../types';

export function useCustomer(id: string | undefined) {
  const [data, setData] = useState<Customer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        await delayLikeApi();
        if (cancelled) return;
        const found = mockCustomers.find(c => c.id === id);
        if (!found) throw new Error('Customer not found');
        setData(found);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, isLoading, error };
}