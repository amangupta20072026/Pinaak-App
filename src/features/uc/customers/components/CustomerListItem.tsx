import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@theme';
import type { Customer } from '../types';

type Props = {
  customer: Customer;
  onPress: (customer: Customer) => void;
};

const TYPE_META: Record<
  Customer['type'],
  { label: string; color: string; bg: string }
> = {
  personal: {
    label: 'Personal',
    color: Colors.primary,
    bg: Colors.primary + '15',
  },
  corporate: { label: 'Corporate', color: Colors.info, bg: Colors.info + '15' },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

function maskedPhone(phone: string): string {
  // "+91 98712 34501" style
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export const CustomerListItem: React.FC<Props> = ({ customer, onPress }) => {
  const meta = TYPE_META[customer.type];

  return (
    <Pressable
      onPress={() => onPress(customer)}
      android_ripple={{ color: Colors.surfaceMuted }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${customer.name}, ${meta.label}, tap for actions`}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(customer.name)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {customer.name}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.chip, { backgroundColor: meta.bg }]}>
            <Text style={[styles.chipLabel, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
          <Text style={styles.phone} numberOfLines={1}>
            {maskedPhone(customer.phone)}
          </Text>
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {customer.city} · {customer.totalBookings} booking
          {customer.totalBookings === 1 ? '' : 's'}
        </Text>
      </View>

      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pressed: { backgroundColor: Colors.surfaceMuted },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primary,
  },
  body: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  chipLabel: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  phone: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sub: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  chev: {
    fontSize: 28,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
    fontWeight: '300',
  },
});
