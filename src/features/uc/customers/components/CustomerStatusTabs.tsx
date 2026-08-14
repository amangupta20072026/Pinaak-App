import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@theme';
import type { StatusFilter } from '../types';

type TabOption = { key: StatusFilter; label: string; count: number };

type Props = {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
};

export const CustomerStatusTabs: React.FC<Props> = ({
  value,
  onChange,
  counts,
}) => {
  const tabs: TabOption[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'inactive', label: 'Inactive', count: counts.inactive },
    { key: 'blocked', label: 'Blocked', count: counts.blocked },
  ];

  return (
    <View style={styles.wrap}>
      {tabs.map(t => {
        const active = value === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.label, active && styles.labelActive]}
            >
              {t.label} ({t.count.toLocaleString()})
            </Text>
            <View
              style={[styles.underline, active && styles.underlineActive]}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', // row instead of ScrollView
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1, // ← each tab takes exactly 1/4 of the row
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  underline: {
    height: 2,
    width: '70%', // slightly narrower than the tab for a tidy look
    backgroundColor: 'transparent',
    marginTop: Spacing.xs,
    borderRadius: 1,
  },
  underlineActive: {
    backgroundColor: Colors.primary,
  },
});
