import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@theme';

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

export const Pagination: React.FC<Props> = ({ page, totalPages, onChange }) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <View style={styles.row}>
      <Pressable
        disabled={!canPrev}
        onPress={() => onChange(page - 1)}
        style={styles.side}
      >
        <ChevronLeft
          size={16}
          color={canPrev ? Colors.textPrimary : Colors.textDisabled}
        />
        <Text style={[styles.text, !canPrev && styles.disabled]}>Previous</Text>
      </Pressable>

      <Text style={styles.pageText}>
        Page {page} of {totalPages}
      </Text>

      <Pressable
        disabled={!canNext}
        onPress={() => onChange(page + 1)}
        style={styles.side}
      >
        <Text style={[styles.text, !canNext && styles.disabled]}>Next</Text>
        <ChevronRight
          size={16}
          color={canNext ? Colors.textPrimary : Colors.textDisabled}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  pageText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  disabled: { color: Colors.textDisabled },
});
