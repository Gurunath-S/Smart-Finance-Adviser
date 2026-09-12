import React from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCompactCurrency } from '../../utils/currency';

interface GrowthChartProps {
  yearlyData: number[];
  title?: string;
  style?: ViewStyle;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  yearlyData,
  title = 'Projected Wealth Growth',
  style,
}) => {
  const screenWidth = Dimensions.get('window').width;

  if (!yearlyData || yearlyData.length === 0) {
    return null;
  }

  // Sample labels if duration is large
  const totalPoints = yearlyData.length;
  const labels: string[] = [];
  const sampledData: number[] = [];

  const step = Math.max(1, Math.floor(totalPoints / 5));
  for (let i = 0; i < totalPoints; i += step) {
    labels.push(`Y${i + 1}`);
    sampledData.push(yearlyData[i]);
  }
  // Ensure last point is included
  if ((totalPoints - 1) % step !== 0) {
    labels.push(`Y${totalPoints}`);
    sampledData.push(yearlyData[totalPoints - 1]);
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: sampledData.length > 0 ? sampledData : [0, 0],
        color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - spacing.lg * 2}
        height={180}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(90, 93, 122, ${opacity})`,
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
  title: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  chart: {
    marginVertical: spacing.xs,
    borderRadius: radii.lg,
  },
});
