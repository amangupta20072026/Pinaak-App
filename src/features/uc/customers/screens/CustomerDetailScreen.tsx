import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeScreen, Header, ErrorView, Skeleton } from '@shared/components';
import { Colors, Radius, Spacing, Typography } from '@theme';
import { useCustomer } from '../hooks/useCustomer';
import type { UcStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<UcStackParamList, 'CustomerDetail'>;

const CustomerDetailScreen: React.FC<Props> = ({ route }) => {
  const { customerId } = route.params;
  const { data, isLoading, error } = useCustomer(customerId);

  return (
    <SafeScreen edges={['top', 'bottom']}>
      <Header title="Customer" showBack />
      {isLoading ? (
        <View style={{ padding: Spacing.md, gap: Spacing.md }}>
          <Skeleton width="70%" height={22} />
          <Skeleton width="50%" height={16} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={140} />
        </View>
      ) : error || !data ? (
        <ErrorView />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.sub}>
            {data.type[0].toUpperCase() + data.type.slice(1)} · {data.city}
          </Text>

          <View style={styles.card}>
            <Row label="Phone" value={data.phone} />
            <Row label="Email" value={data.email} />
            {data.gstin ? <Row label="GSTIN" value={data.gstin} /> : null}
            <Row label="Total bookings" value={String(data.totalBookings)} />
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  name: { ...Typography.h3, color: Colors.textPrimary },
  sub: { ...Typography.body, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: { ...Typography.caption, color: Colors.textSecondary },
  rowValue: { ...Typography.body, color: Colors.textPrimary, maxWidth: '60%' },
});

export default CustomerDetailScreen;
