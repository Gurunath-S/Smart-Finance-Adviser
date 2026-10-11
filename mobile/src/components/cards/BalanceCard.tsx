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
  inAccountBalance?: number;
  inHandBalance?: number;
  income: number;
  expenses: number;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onOpenCashManager?: () => void;
  style?: ViewStyle;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  inAccountBalance = 0,
  inHandBalance = 0,
  income,
  expenses,
  onAddIncome,
  onAddExpense,
  onOpenCashManager,
  style,
}) => {
  return (
    <View style={[styles.card, shadows.hero, style]}>
      {/* Balance Header */}
      <View style={styles.header}>
        <Text style={styles.label}>TOTAL WEALTH</Text>
        <View style={styles.chip}>
          <Ionicons name="wallet" size={14} color={colors.accentPink} />
          <Text style={styles.chipText}>Live</Text>
        </View>
      </View>

      <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

      {/* In-Account & In-Hand Split Cards */}
      <View style={styles.splitRow}>
        {/* In-Account (Bank/Online) */}
        <View style={styles.splitBox}>
          <View style={styles.splitHeader}>
            <View style={[styles.splitIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="card-outline" size={14} color="#60A5FA" />
            </View>
            <Text style={styles.splitTitle}>In Account</Text>
          </View>
          <Text style={styles.splitAmount}>{formatCurrency(inAccountBalance)}</Text>
          <Text style={styles.splitSub}>Online / Bank</Text>
        </View>

        {/* In-Hand (Cash) */}
        <TouchableOpacity
          style={[styles.splitBox, styles.splitBoxCash]}
          onPress={onOpenCashManager}
          activeOpacity={0.8}
        >
          <View style={styles.splitHeader}>
            <View style={[styles.splitIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="cash-outline" size={14} color="#34D399" />
            </View>
            <Text style={styles.splitTitle}>In Hand</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>Notes</Text>
              <Ionicons name="chevron-forward" size={10} color="#34D399" />
            </View>
          </View>
          <Text style={[styles.splitAmount, { color: '#34D399' }]}>
            {formatCurrency(inHandBalance)}
          </Text>
          <Text style={styles.splitSub}>Physical Cash ➔</Text>
        </TouchableOpacity>
      </View>

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
  splitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  splitBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  splitBoxCash: {
    backgroundColor: 'rgba(16, 185, 129, 0.09)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  splitIcon: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  splitTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    flex: 1,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
    marginRight: 2,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#93C5FD',
    marginTop: 2,
  },
  splitSub: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
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
