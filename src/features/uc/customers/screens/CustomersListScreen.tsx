import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  SafeScreen,
  SearchBar,
  EmptyState,
  ErrorView,
} from '@shared/components';
import { Colors, Spacing } from '@theme';

import { useCustomerList } from '../hooks/useCustomerList';
import { CustomerCard } from '../components/CustomerCard';
import { CustomerListHeader } from '../components/CustomerListHeader';
import { Pagination } from '../components/Pagination';
import { CustomerContactSheet } from '../components/CustomerContactSheet';
import { CustomerFilterSheet } from '../components/CustomerFilterSheet';
import {
  DEFAULT_CUSTOMER_FILTERS,
  countActiveFilters,
  type Customer,
  type CustomerFilters,
} from '../types';

const CustomersListScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );

  const [selected, setSelected] = useState<Customer | null>(null);
  const contactSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const { data, totalPages, isLoading, isRefreshing, error, refresh, refetch } =
    useCustomerList({ search, page, pageSize: 6, filters });

  const onRowPress = useCallback((c: Customer) => {
    setSelected(c);
    contactSheetRef.current?.present();
  }, []);

  const onContactDismiss = useCallback(() => {
    // small delay so content doesn't flash empty during close animation
    setTimeout(() => setSelected(null), 200);
  }, []);

  const openFilterSheet = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const onApplyFilters = useCallback((next: CustomerFilters) => {
    setFilters(next);
    setPage(1); // reset paging whenever the filter set changes
  }, []);

  const badgeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <CustomerListHeader
          onSearch={() => setShowSearch(v => !v)}
          onFilter={openFilterSheet}
          filterBadgeCount={badgeCount}
        />
        {showSearch && (
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, phone, email"
          />
        )}
      </View>

      {error ? (
        <ErrorView onRetry={refetch} />
      ) : !isLoading && data.length === 0 ? (
        <EmptyState title="No customers" message="Try changing filters." />
      ) : (
        <FlashList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CustomerCard customer={item} onPress={onRowPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          }
        />
      )}

      <CustomerContactSheet
        ref={contactSheetRef}
        customer={selected}
        onDismiss={onContactDismiss}
      />

      <CustomerFilterSheet
        ref={filterSheetRef}
        initialFilters={filters}
        onApply={onApplyFilters}
      />
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});

export default CustomersListScreen;
