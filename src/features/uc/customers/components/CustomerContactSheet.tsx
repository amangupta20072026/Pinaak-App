/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { Colors, Radius, Spacing, Typography } from '@theme';
import { makePhoneCall, openWhatsApp, sendEmail } from '@services/contact';
import type { Customer } from '../types';

type Props = {
  customer: Customer | null;
  onDismiss?: () => void;
};

export type CustomerContactSheetRef = {
  present: () => void;
  dismiss: () => void;
};

export const CustomerContactSheet = forwardRef<BottomSheetModal, Props>(
  ({ customer, onDismiss }, ref) => {
    const internalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => internalRef.current as BottomSheetModal, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleCall = useCallback(async () => {
      if (!customer) return;
      const result = await makePhoneCall(customer.phone);
      if (!result.ok) {
        Alert.alert(
          'Cannot place call',
          'The dialer is not available on this device.',
        );
      }
    }, [customer]);

    const handleWhatsApp = useCallback(async () => {
      if (!customer) return;
      const result = await openWhatsApp(
        customer.phone,
        `Hi ${
          customer.name.split(' ')[0]
        }, this is Urban Cruise regarding your booking.`,
      );
      if (!result.ok) {
        Alert.alert('WhatsApp unavailable', 'Could not open WhatsApp.');
      }
    }, [customer]);

    const handleEmail = useCallback(async () => {
      if (!customer) return;
      const result = await sendEmail({
        to: customer.email,
        subject: 'Urban Cruise — Follow up',
        body: `Hi ${customer.name.split(' ')[0]},\n\n`,
      });
      if (!result.ok) {
        Alert.alert(
          'Email unavailable',
          'No email app is set up on this device. Try copying the address instead.',
        );
      }
    }, [customer]);

    // Content height sized dynamically by BottomSheetView.
    const snapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

    return (
      <BottomSheetModal
        ref={internalRef}
        snapPoints={snapPoints}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
        onDismiss={onDismiss}
        enablePanDownToClose
      >
        <BottomSheetView>
          {customer ? (
            <SheetContent
              customer={customer}
              onCall={handleCall}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

CustomerContactSheet.displayName = 'CustomerContactSheet';

/* ---------------- Sheet content ---------------- */

type ContentProps = {
  customer: Customer;
  onCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
};

const SheetContent: React.FC<ContentProps> = ({
  customer,
  onCall,
  onWhatsApp,
  onEmail,
}) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name
              .split(/\s+/)
              .slice(0, 2)
              .map(w => w[0]?.toUpperCase())
              .join('')}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {customer.name}
        </Text>
        <Text style={styles.phoneBig}>{customer.phone}</Text>
        <Text style={styles.email}>{customer.email}</Text>
      </View>

      <View style={styles.actionsRow}>
        <ActionButton
          label="Call"
          color={Colors.success}
          onPress={onCall}
          glyph="📞"
        />
        <ActionButton
          label="WhatsApp"
          color="#25D366"
          onPress={onWhatsApp}
          glyph="💬"
        />
        <ActionButton
          label="Email"
          color={Colors.info}
          onPress={onEmail}
          glyph="✉️"
        />
      </View>

      <View style={styles.detailsCard}>
        <DetailRow label="Type" value={customer.type} />
        <DetailRow label="City" value={customer.city} />
        <DetailRow label="Bookings" value={String(customer.totalBookings)} />
        {customer.gstin ? (
          <DetailRow label="GSTIN" value={customer.gstin} />
        ) : null}
      </View>
    </View>
  );
};

const ActionButton: React.FC<{
  label: string;
  color: string;
  glyph: string;
  onPress: () => void;
}> = ({ label, color, glyph, onPress }) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: color + '30', borderless: false }}
    style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={[styles.actionIcon, { backgroundColor: color + '18' }]}>
      <Text style={{ fontSize: 24 }}>{glyph}</Text>
    </View>
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </Pressable>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  handle: { backgroundColor: Colors.border, width: 44 },
  sheetBg: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  wrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  identity: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  name: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  phoneBig: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  email: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  action: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    ...Typography.button,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
  },
});
