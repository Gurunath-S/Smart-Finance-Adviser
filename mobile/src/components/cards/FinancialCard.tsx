import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/theme';

interface FinancialCardProps {
  savingsRate: number; // 0 - 100
  expenseRatio: number; // 0 - 100
  style?: ViewStyle;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  savingsRate,
  expenseRatio,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Savings Rate Metric */}
      <View style={[styles.card, shadows.sm]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Ionicons name="trending-up" size={18} color={colors.income} />
          </View>
          <Text style={styles.percentageText}>{savingsRate}%</Text>
        </View>
        <Text style={styles.cardTitle}>Savings Rate</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, savingsRate))}%`, backgroundColor: colors.income },
            ]}
          />
        </View>
        <Text style={styles.cardSubtitle}>
          {savingsRate >= 30 ? 'Healthy savings habit 🌟' : 'Consider saving more'}
        </Text>
      </View>

      {/* Expense Ratio Metric */}
      <View style={[styles.card, shadows.sm]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
            <Ionicons name="pie-chart" size={18} color={colors.expense} />
          </View>
          <Text style={styles.percentageText}>{expenseRatio}%</Text>
        </View>
        <Text style={styles.cardTitle}>Expense Ratio</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, expenseRatio))}%`, backgroundColor: colors.expense },
            ]}
          />
        </View>
        <Text style={styles.cardSubtitle}>
          {expenseRatio <= 70 ? 'Controlled spending 👍' : 'High expense ratio ⚠️'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    ...typography.h3,
    color: colors.primary,
  },
  cardTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceVariant,
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
