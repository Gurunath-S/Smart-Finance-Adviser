import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { shadows } from '../../theme/theme';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  style?: ViewStyle;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expenses,
  onAddIncome,
  onAddExpense,
  style,
}) => {
  return (
    <View style={[styles.card, shadows.hero, style]}>
      {/* Balance Header */}
      <View style={styles.header}>
        <Text style={styles.label}>TOTAL BALANCE</Text>
        <View style={styles.chip}>
          <Ionicons name="wallet" size={14} color={colors.accentPink} />
          <Text style={styles.chipText}>Live</Text>
        </View>
      </View>

      <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

      {/* Income & Expense Row */}
      <View style={styles.metricsRow}>
        {/* Income Pill */}
        <TouchableOpacity
          style={styles.metricBox}
          onPress={onAddIncome}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.incomeLight }]}>
            <Ionicons name="arrow-up" size={16} color={colors.income} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.incomeValue}>+{formatCurrency(income)}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Expense Pill */}
        <TouchableOpacity
          style={styles.metricBox}
          onPress={onAddExpense}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.expenseLight }]}>
            <Ionicons name="arrow-down" size={16} color={colors.expense} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Expenses</Text>
            <Text style={styles.expenseValue}>-{formatCurrency(expenses)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.captionBold,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 102, 146, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    gap: 4,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.accentPink,
    fontSize: 11,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textInverse,
    marginVertical: spacing.xs,
    letterSpacing: -0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  metricBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  incomeValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.income,
  },
  expenseValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.expense,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: spacing.sm,
  },
});
