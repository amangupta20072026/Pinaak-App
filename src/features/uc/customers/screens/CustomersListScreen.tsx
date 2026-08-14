import React, { useCallback, useRef, useState } from 'react';
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
import { CustomerStatusTabs } from '../components/CustomerStatusTabs';
import { Pagination } from '../components/Pagination';
import { CustomerContactSheet } from '../components/CustomerContactSheet';
import type { Customer, StatusFilter } from '../types';

const CustomersListScreen: React.FC = () => {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Customer | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

  const {
    data,
    counts,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    refresh,
    refetch,
  } = useCustomerList({ status, search, page, pageSize: 6 });

  const onRowPress = useCallback((c: Customer) => {
    setSelected(c);
    sheetRef.current?.present();
  }, []);

  const onSheetDismiss = useCallback(() => {
    // small delay so content doesn't flash empty during close animation
    setTimeout(() => setSelected(null), 200);
  }, []);

  return (
    <SafeScreen edges={['top']}>
      <View style={styles.headerWrap}>
        <CustomerListHeader
          onSearch={() => setShowSearch(v => !v)}
          onFilter={() => {
            /* TODO open filter sheet */
          }}
        />
        {showSearch && (
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, phone, email"
          />
        )}
      </View>

      <CustomerStatusTabs
        value={status}
        counts={counts}
        onChange={s => {
          setStatus(s);
          setPage(1);
        }}
      />

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
        ref={sheetRef}
        customer={selected}
        onDismiss={onSheetDismiss}
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
