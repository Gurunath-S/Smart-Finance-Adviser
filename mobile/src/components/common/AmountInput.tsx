import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  placeholder?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  label = 'Amount',
  error,
  containerStyle,
  placeholder = '0',
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, !!error && styles.errorWrapper]}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            // Only allow numbers and one decimal point
            const cleaned = text.replace(/[^0-9.]/g, '');
            onChangeText(cleaned);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          maxLength={12}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorWrapper: {
    borderColor: colors.expense,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.expense,
    marginTop: spacing.xxs,
  },
});
