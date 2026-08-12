import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@theme';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
}) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <Pressable
          hitSlop={12}
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          style={styles.clearBtn}
        >
          <View style={styles.clearCircle} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
    marginLeft: Spacing.xs,
  },
  clearCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.textMuted,
  },
});
