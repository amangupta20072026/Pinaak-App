/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  X,
} from 'lucide-react-native';

import { Colors, Radius, Shadows, Spacing, Typography } from '@theme';
import { makePhoneCall, openWhatsApp, sendEmail } from '@services/contact';
import type { Customer } from '../types';
import { avatarColorFor, initials } from '../utils/avatar';

type Props = {
  customer: Customer | null;
  onDismiss?: () => void;
};

const EMAIL = '#FB8C00';

/* Soft-tinted quick-action colors (2026 pastel style) */
const CALL_TINT_BG = '#E7F7EC';
const CALL_TINT_FG = '#049856';
const WHATSAPP_TINT_BG = '#E3F9EA';
const WHATSAPP_TINT_FG = '#1FA855';
const EMAIL_TINT_BG = '#FFF1E0';
const EMAIL_TINT_FG = '#D97B0A';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/* --- Real WhatsApp brand icon (SVG path) --- */
const WhatsAppIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#fff',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      d="M20.52 3.48A11.9 11.9 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.25-6.19-3.48-8.52ZM12 21.82a9.83 9.83 0 0 1-5.02-1.37l-.36-.21-3.68.96.98-3.58-.24-.37A9.83 9.83 0 1 1 21.82 12 9.83 9.83 0 0 1 12 21.82Zm5.4-7.36c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3 0-.45.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5H8c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.26 5.16 4.57.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"
    />
  </Svg>
);

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
          opacity={0.55}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleCall = useCallback(async () => {
      if (!customer) return;
      const r = await makePhoneCall(customer.phone);
      if (!r.ok) Alert.alert('Cannot place call', 'Dialer unavailable.');
    }, [customer]);

    const handleWhatsApp = useCallback(async () => {
      if (!customer) return;
      const r = await openWhatsApp(
        customer.phone,
        `Hi ${customer.name.split(' ')[0]}, this is Urban Cruise.`,
      );
      if (!r.ok)
        Alert.alert('WhatsApp unavailable', 'Could not open WhatsApp.');
    }, [customer]);

    const handleEmail = useCallback(async () => {
      if (!customer) return;
      const r = await sendEmail({
        to: customer.email,
        subject: 'Urban Cruise — Follow up',
        body: `Hi ${customer.name.split(' ')[0]},\n\n`,
      });
      if (!r.ok) Alert.alert('Email unavailable', 'No email app configured.');
    }, [customer]);

    return (
      <BottomSheetModal
        ref={internalRef}
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
              onClose={() => internalRef.current?.dismiss()}
            />
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

CustomerContactSheet.displayName = 'CustomerContactSheet';

/* ---------------- Content ---------------- */

type ContentProps = {
  customer: Customer;
  onCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  onClose: () => void;
};

const SheetContent: React.FC<ContentProps> = ({
  customer,
  onCall,
  onWhatsApp,
  onEmail,
  onClose,
}) => {
  const c = avatarColorFor(customer.id);

  return (
    <View>
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={styles.closeBtn}
        accessibilityLabel="Close"
      >
        <X size={20} color={Colors.textPrimary} />
      </Pressable>

      {/* IDENTITY */}
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: c.bg }]}>
          <Text style={[styles.avatarText, { color: c.fg }]}>
            {initials(customer.name)}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {customer.name}
        </Text>
      </View>

      {/* QUICK ACTION CIRCLES */}
      <View style={styles.quickRow}>
        <QuickAction
          label="Call"
          bg={CALL_TINT_BG}
          fg={CALL_TINT_FG}
          onPress={onCall}
          icon={<Phone size={22} color={CALL_TINT_FG} strokeWidth={2.2} />}
        />
        <QuickAction
          label="WhatsApp"
          bg={WHATSAPP_TINT_BG}
          fg={WHATSAPP_TINT_FG}
          onPress={onWhatsApp}
          icon={<WhatsAppIcon size={22} color={WHATSAPP_TINT_FG} />}
        />
        <QuickAction
          label="Email"
          bg={EMAIL_TINT_BG}
          fg={EMAIL_TINT_FG}
          onPress={onEmail}
          icon={<Mail size={22} color={EMAIL_TINT_FG} strokeWidth={2.2} />}
        />
      </View>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <InfoRow
          bg="#E7F7EC"
          fg={Colors.primary}
          icon={<Phone size={16} color={Colors.primary} strokeWidth={2.2} />}
          label="Phone"
          value={customer.phone}
        />
        <InfoRow
          bg="#FFF1E0"
          fg={EMAIL}
          icon={<Mail size={16} color={EMAIL} strokeWidth={2.2} />}
          label="Email"
          value={customer.email}
        />
        <InfoRow
          bg="#EDF2FF"
          fg="#3B82F6"
          icon={<MapPin size={16} color="#3B82F6" strokeWidth={2.2} />}
          label="City"
          value={customer.city}
        />
        <InfoRow
          bg="#E7F7EC"
          fg={Colors.success}
          icon={
            <Briefcase size={16} color={Colors.success} strokeWidth={2.2} />
          }
          label="Total Trips"
          value={`${customer.totalBookings}`}
          valueColor={Colors.success}
        />
        <InfoRow
          bg="#F1F3F5"
          fg={Colors.textSecondary}
          icon={
            <Calendar
              size={16}
              color={Colors.textSecondary}
              strokeWidth={2.2}
            />
          }
          label="Registered"
          value={fmtDate(customer.createdAt)}
          last
        />
      </View>
    </View>
  );
};

/* ---------------- Sub-components ---------------- */

const QuickAction: React.FC<{
  label: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  onPress: () => void;
}> = ({ label, icon, bg, fg, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.quickWrap,
      pressed && { transform: [{ scale: 0.96 }] },
    ]}
  >
    <View style={[styles.quickCircle, { backgroundColor: bg }]}>{icon}</View>
    <Text style={[styles.quickLabel, { color: fg }]}>{label}</Text>
  </Pressable>
);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  bg: string;
  fg: string;
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}> = ({ icon, bg, label, value, valueColor, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <View style={[styles.infoIcon, { backgroundColor: bg }]}>{icon}</View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          valueColor ? { color: valueColor, fontWeight: '700' } : null,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  </View>
);

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  handle: { backgroundColor: Colors.border, width: 44 },
  sheetBg: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.md,
    padding: 6,
    zIndex: 2,
  },

  /* Identity */
  identity: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.xs,
  },
  avatarText: { ...Typography.h2, fontWeight: '800', fontSize: 30 },
  name: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  /* Quick action circles */
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  quickWrap: { alignItems: 'center', gap: 8 },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },

  /* Info card */
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    ...Shadows.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
});
