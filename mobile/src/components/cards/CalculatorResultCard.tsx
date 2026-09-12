import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { shadows } from '../../theme/theme';

interface CalculatorResultCardProps {
  primaryLabel?: string;
  primaryValue: number;
  investedLabel?: string;
  investedValue: number;
  returnsLabel?: string;
  returnsValue: number;
  style?: ViewStyle;
}

export const CalculatorResultCard: React.FC<CalculatorResultCardProps> = ({
  primaryLabel = 'Expected Maturity Value',
  primaryValue,
  investedLabel = 'Invested Amount',
  investedValue,
  returnsLabel = 'Estimated Returns',
  returnsValue,
  style,
}) => {
  const total = investedValue + Math.max(0, returnsValue);
  const investedRatio = total > 0 ? (investedValue / total) * 100 : 50;
  const returnsRatio = total > 0 ? (Math.max(0, returnsValue) / total) * 100 : 50;

  return (
    <View style={[styles.card, shadows.md, style]}>
      <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      <Text style={styles.primaryValue}>{formatCurrency(primaryValue)}</Text>

      {/* Visual Ratio Distribution Bar */}
      <View style={styles.distributionBar}>
        <View style={[styles.barSegment, { width: `${investedRatio}%`, backgroundColor: colors.brand }]} />
        <View style={[styles.barSegment, { width: `${returnsRatio}%`, backgroundColor: colors.income }]} />
      </View>

      {/* Breakdown Boxes */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownBox}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.brand }]} />
            <Text style={styles.breakdownLabel}>{investedLabel}</Text>
          </View>
          <Text style={styles.breakdownValue}>{formatCurrency(investedValue)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownBox}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={styles.breakdownLabel}>{returnsLabel}</Text>
          </View>
          <Text style={[styles.breakdownValue, { color: colors.income }]}>
            +{formatCurrency(returnsValue)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  primaryLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  primaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: spacing.xs,
    letterSpacing: -0.5,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    borderRadius: radii.full,
    overflow: 'hidden',
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  barSegment: {
    height: '100%',
  },
  breakdownRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  breakdownBox: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  breakdownLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
