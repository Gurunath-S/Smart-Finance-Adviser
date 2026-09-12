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

export const FDCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [depositAmount, setDepositAmount] = useState(100000); // 1 Lakh
  const [interestRate, setInterestRate] = useState(7.2);
  const [durationYears, setDurationYears] = useState(5);

  const results = useMemo(() => {
    const P = depositAmount;
    const r = interestRate / 100;
    const n = 4; // Quarterly compounding
    const t = durationYears;

    const maturityValue = P * Math.pow(1 + r / n, n * t);
    const interestEarned = Math.max(0, maturityValue - P);

    const yearlyData: number[] = [];
    for (let y = 1; y <= durationYears; y++) {
      yearlyData.push(Math.round(P * Math.pow(1 + r / n, n * y)));
    }

    return {
      principal: P,
      interestEarned: Math.round(interestEarned),
      maturityValue: Math.round(maturityValue),
      yearlyData,
    };
  }, [depositAmount, interestRate, durationYears]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>FD Calculator</Text>
            <Text style={styles.subtitle}>Fixed Deposit Compound Growth</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Total Deposit Amount"
          value={depositAmount}
          onValueChange={setDepositAmount}
          min={10000}
          max={5000000}
          step={10000}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Annual Interest Rate"
          value={interestRate}
          onValueChange={setInterestRate}
          min={3}
          max={12}
          step={0.1}
          unit="%"
        />

        <CalculatorSlider
          label="Deposit Tenure (Years)"
          value={durationYears}
          onValueChange={setDurationYears}
          min={1}
          max={10}
          step={1}
          unit="Yrs"
        />

        {/* Result Card */}
        <CalculatorResultCard
          primaryLabel="Maturity Value"
          primaryValue={results.maturityValue}
          investedLabel="Principal Amount"
          investedValue={results.principal}
          returnsLabel="Total Interest"
          returnsValue={results.interestEarned}
        />

        {/* Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="Compound Maturity Trajectory" />
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
