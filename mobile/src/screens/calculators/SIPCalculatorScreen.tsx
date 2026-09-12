import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalculatorSlider } from '../../components/calculators/CalculatorSlider';
import { CalculatorResultCard } from '../../components/cards/CalculatorResultCard';
import { GrowthChart } from '../../components/charts/GrowthChart';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';

export const SIPCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [durationYears, setDurationYears] = useState(10);

  const results = useMemo(() => {
    const P = monthlyInvestment;
    const r = expectedReturnRate / 100 / 12;
    const n = durationYears * 12;

    const totalInvested = P * n;
    // SIP Compound formula: P * (( (1+i)^n - 1 ) / i) * (1+i)
    const maturityValue = r > 0 ? P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : totalInvested;
    const estimatedReturns = Math.max(0, maturityValue - totalInvested);

    // Compute annual points for chart
    const yearlyData: number[] = [];
    for (let y = 1; y <= durationYears; y++) {
      const months = y * 12;
      const val = r > 0 ? P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r) : P * months;
      yearlyData.push(Math.round(val));
    }

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      maturityValue: Math.round(maturityValue),
      yearlyData,
    };
  }, [monthlyInvestment, expectedReturnRate, durationYears]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>SIP Calculator</Text>
            <Text style={styles.subtitle}>Systematic Investment Plan</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Monthly Investment"
          value={monthlyInvestment}
          onValueChange={setMonthlyInvestment}
          min={500}
          max={100000}
          step={500}
          prefix="₹"
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Expected Annual Return"
          value={expectedReturnRate}
          onValueChange={setExpectedReturnRate}
          min={1}
          max={30}
          step={0.5}
          unit="%"
        />

        <CalculatorSlider
          label="Time Horizon (Years)"
          value={durationYears}
          onValueChange={setDurationYears}
          min={1}
          max={30}
          step={1}
          unit="Yrs"
        />

        {/* Result Card */}
        <CalculatorResultCard
          primaryLabel="Estimated Future Value"
          primaryValue={results.maturityValue}
          investedLabel="Total Invested"
          investedValue={results.totalInvested}
          returnsLabel="Wealth Gain"
          returnsValue={results.estimatedReturns}
        />

        {/* Projection Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="SIP Wealth Compounding" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
