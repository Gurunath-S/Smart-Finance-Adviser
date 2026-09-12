import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { UnifiedTransaction } from '../../types';
import { formatCompactCurrency } from '../../utils/currency';

interface IncomeExpenseChartProps {
  transactions: UnifiedTransaction[];
  style?: ViewStyle;
}

type TimeRange = '7D' | '1M' | '3M' | '6M' | '1Y';

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  transactions,
  style,
}) => {
  const [range, setRange] = useState<TimeRange>('1M');
  const screenWidth = Dimensions.get('window').width;

  const chartData = useMemo(() => {
    const now = new Date();
    let daysToSubtract = 30;
    if (range === '7D') daysToSubtract = 7;
    else if (range === '1M') daysToSubtract = 30;
    else if (range === '3M') daysToSubtract = 90;
    else if (range === '6M') daysToSubtract = 180;
    else if (range === '1Y') daysToSubtract = 365;

    const startDate = new Date();
    startDate.setDate(now.getDate() - daysToSubtract);

    // Filter transactions in range
    const filtered = transactions.filter((t) => new Date(t.date) >= startDate);

    // Generate intervals (e.g. 5 intervals across the range)
    const intervalCount = 5;
    const intervalDays = Math.max(1, Math.floor(daysToSubtract / (intervalCount - 1)));
    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = intervalCount - 1; i >= 0; i--) {
      const pointDate = new Date();
      pointDate.setDate(now.getDate() - i * intervalDays);

      const label = `${pointDate.getDate()} ${months[pointDate.getMonth()]}`;
      labels.push(label);

      // Sum transactions belonging up to this interval bucket
      const bucketStartDate = new Date(pointDate);
      bucketStartDate.setDate(pointDate.getDate() - intervalDays);

      const bucketIncomes = filtered
        .filter(
          (t) =>
            t.type === 'income' &&
            new Date(t.date) <= pointDate &&
            new Date(t.date) > bucketStartDate
        )
        .reduce((sum, item) => sum + item.amount, 0);

      const bucketExpenses = filtered
        .filter(
          (t) =>
            t.type === 'expense' &&
            new Date(t.date) <= pointDate &&
            new Date(t.date) > bucketStartDate
        )
        .reduce((sum, item) => sum + item.amount, 0);

      incomeData.push(bucketIncomes);
      expenseData.push(bucketExpenses);
    }

    // If all data points are 0, provide minimal baseline
    const hasData = incomeData.some((v) => v > 0) || expenseData.some((v) => v > 0);

    return {
      labels,
      datasets: [
        {
          data: hasData ? incomeData : [0, 0, 0, 0, 0],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2.5,
        },
        {
          data: hasData ? expenseData : [0, 0, 0, 0, 0],
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2.5,
        },
      ],
      legend: ['Income', 'Expense'],
    };
  }, [transactions, range]);

  return (
    <View style={[styles.container, style]}>
      {/* Header & Range Filters */}
      <View style={styles.header}>
        <Text style={styles.title}>Cash Flow Trend</Text>
        <View style={styles.rangePills}>
          {(['7D', '1M', '3M', '6M', '1Y'] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[styles.pill, range === r && styles.activePill]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, range === r && styles.activePillText]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Legend Indicators */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>

      {/* Chart Canvas */}
      <LineChart
        data={chartData}
        width={screenWidth - spacing.lg * 2}
        height={190}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(90, 93, 122, ${opacity})`,
          style: {
            borderRadius: radii.lg,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '1.5',
            stroke: colors.card,
          },
          propsForBackgroundLines: {
            stroke: colors.border,
            strokeDasharray: '4',
          },
          formatYLabel: (val) => formatCompactCurrency(parseFloat(val)),
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
  },
  rangePills: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.full,
    padding: 2,
    gap: 2,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  activePill: {
    backgroundColor: colors.brand,
  },
  pillText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  activePillText: {
    color: colors.textInverse,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chart: {
    marginVertical: spacing.xs,
    borderRadius: radii.lg,
  },
});
