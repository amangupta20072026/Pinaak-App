import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  SafeScreen,
  Header,
  SearchBar,
  FilterChips,
  EmptyState,
  ErrorView,
  Skeleton,
} from '@shared/components';
import { Colors, Spacing } from '@theme';

import { useCustomerList } from '../hooks/useCustomerList';
import { CustomerListItem } from '../components/CustomerListItem';
import { CustomerContactSheet } from '../components/CustomerContactSheet';
import type { Customer, CustomerFilter } from '../types';

const CustomersListScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('all');
  const [selected, setSelected] = useState<Customer | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

  const { data, counts, isLoading, isRefreshing, error, refresh, refetch } =
    useCustomerList({ filter, search });

  const handleRowPress = useCallback((customer: Customer) => {
    setSelected(customer);
    sheetRef.current?.present();
  }, []);

  const handleSheetDismiss = useCallback(() => {
    // Delay clearing selected so the sheet doesn't blink content during close animation.
    setTimeout(() => setSelected(null), 200);
  }, []);

  const filterOptions = [
    { key: 'all' as const, label: 'All', count: counts.all },
    { key: 'personal' as const, label: 'Personal', count: counts.personal },
    { key: 'corporate' as const, label: 'Corporate', count: counts.corporate },
  ];

  return (
    <SafeScreen edges={['top']}>
      <Header title="Customers" />

      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, phone, email, city"
        />
      </View>

      <FilterChips
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />

      {isLoading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorView onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title={search || filter !== 'all' ? 'No matches' : 'No customers yet'}
          message={
            search || filter !== 'all'
              ? 'Try clearing filters or search.'
              : 'When customers are added, they will appear here.'
          }
        />
      ) : (
        <FlashList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CustomerListItem customer={item} onPress={handleRowPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      <CustomerContactSheet
        ref={sheetRef}
        customer={selected}
        onDismiss={handleSheetDismiss}
      />
    </SafeScreen>
  );
};

const ListSkeleton: React.FC = () => (
  <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.sm }}>
    {[0, 1, 2, 3, 4, 5].map(i => (
      <View key={i} style={styles.skelRow}>
        <Skeleton width={46} height={46} radius={23} />
        <View style={styles.skelBody}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
          <Skeleton width="70%" height={12} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  listContent: { paddingBottom: Spacing.xl },
  skelRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  skelBody: { flex: 1, gap: 8, justifyContent: 'center' },
});

export default CustomersListScreen;
