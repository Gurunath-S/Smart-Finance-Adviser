import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

interface CalculatorSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  displayFormatter?: (val: number) => string;
  style?: ViewStyle;
}

export const CalculatorSlider: React.FC<CalculatorSliderProps> = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit = '',
  prefix = '',
  displayFormatter,
  style,
}) => {
  const displayValue = displayFormatter
    ? displayFormatter(value)
    : `${prefix}${value.toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueBadge}>
          <Text style={styles.valueText}>{displayValue}</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.brand}
        maximumTrackTintColor={colors.surfaceVariant}
        thumbTintColor={colors.brand}
      />

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          {prefix}
          {min.toLocaleString('en-IN')}
          {unit}
        </Text>
        <Text style={styles.rangeText}>
          {prefix}
          {max.toLocaleString('en-IN')}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  valueBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  valueText: {
    ...typography.bodyMedium,
    color: colors.brand,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 38,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rangeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});
