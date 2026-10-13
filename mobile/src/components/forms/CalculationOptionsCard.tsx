import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';

interface CalculationOptionsCardProps {
  excludeFromTotal: boolean;
  onToggleExcludeFromTotal: (val: boolean) => void;
  omittedAmount: string;
  onChangeOmittedAmount: (val: string) => void;
  totalAmount: number;
}

export const CalculationOptionsCard: React.FC<CalculationOptionsCardProps> = ({
  excludeFromTotal,
  onToggleExcludeFromTotal,
  omittedAmount,
  onChangeOmittedAmount,
  totalAmount,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const parsedOmitted = parseFloat(omittedAmount) || 0;
  const effectiveAmountInTotal = excludeFromTotal
    ? 0
    : Math.max(0, totalAmount - parsedOmitted);

  return (
    <View style={styles.card}>
      {/* Primary Toggle Row */}
      <View style={styles.toggleRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={excludeFromTotal ? 'eye-off-outline' : 'calculator-outline'}
            size={16}
            color={excludeFromTotal ? colors.accentPink : colors.primary}
          />
        </View>

        <View style={styles.toggleTextCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Include in Total Balance</Text>
            {excludeFromTotal && (
              <View style={styles.omittedBadge}>
                <Text style={styles.omittedBadgeText}>Omitted</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {excludeFromTotal
              ? 'This transaction will be omitted from total wealth calculation'
              : 'Add/subtract this record to your calculated total balance'}
          </Text>
        </View>

        <Switch
          value={!excludeFromTotal}
          onValueChange={(include) => onToggleExcludeFromTotal(!include)}
          trackColor={{ false: 'rgba(244, 63, 94, 0.25)', true: colors.primary }}
          thumbColor={!excludeFromTotal ? '#FFFFFF' : colors.accentPink}
        />
      </View>

      {/* Accordion / Partial Omit Controls */}
      {!excludeFromTotal && (
        <View style={styles.partialOmitSection}>
          <TouchableOpacity
            style={styles.partialToggleBtn}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.partialToggleLeft}>
              <Ionicons
                name="options-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.partialToggleText}>
                {parsedOmitted > 0
                  ? `Omit Partial Amount: ${formatCurrency(parsedOmitted)}`
                  : 'Omit custom partial amount (Optional)'}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedInputArea}>
              <Text style={styles.inputLabel}>
                AMOUNT TO OMIT FROM TOTAL CALCULATION (₹)
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={omittedAmount}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    onChangeOmittedAmount(cleaned);
                  }}
                />
                {parsedOmitted > 0 && (
                  <TouchableOpacity
                    onPress={() => onChangeOmittedAmount('')}
                    style={styles.clearMiniBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {totalAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Counted in Total Balance:</Text>
                  <Text style={styles.breakdownVal}>
                    {formatCurrency(effectiveAmountInTotal)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  omittedBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  omittedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.expense,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  partialOmitSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partialToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  partialToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partialToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  expandedInputArea: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surfaceVariant,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: 0,
  },
  clearMiniBtn: {
    padding: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  breakdownLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  breakdownVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
