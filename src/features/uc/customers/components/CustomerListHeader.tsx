import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Search, Filter } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@theme';

type Props = {
  onSearch: () => void;
  onFilter: () => void;
  filterBadgeCount?: number;
};

const IconButton: React.FC<{
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  badgeCount?: number;
}> = ({ label, onPress, children, badgeCount }) => (
  <Pressable onPress={onPress} style={styles.iconBtnWrap}>
    <View style={styles.iconBtn}>
      {children}
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      ) : null}
    </View>
    <Text style={styles.iconLabel}>{label}</Text>
  </Pressable>
);

export const CustomerListHeader: React.FC<Props> = ({
  onSearch,
  onFilter,
  filterBadgeCount,
}) => (
  <View style={styles.row}>
    <View style={styles.textCol}>
      <Text style={styles.title}>Customers</Text>
      <Text style={styles.subtitle}>Manage and view registered customers.</Text>
    </View>
    <View style={styles.actions}>
      <IconButton label="Search" onPress={onSearch}>
        <Search size={20} color={Colors.iconPrimary} />
      </IconButton>
      <IconButton
        label="Filter"
        onPress={onFilter}
        badgeCount={filterBadgeCount}
      >
        <Filter size={20} color={Colors.iconPrimary} />
      </IconButton>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  textCol: { flex: 1 },
  title: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtnWrap: { alignItems: 'center' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
