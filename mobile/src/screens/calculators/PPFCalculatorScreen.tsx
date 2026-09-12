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

export const PPFCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [yearlyInvestment, setYearlyInvestment] = useState(150000); // Max 1.5L
  const [interestRate, setInterestRate] = useState(7.1); // Current PPF rate
  const [durationYears, setDurationYears] = useState(15); // Standard 15 years lock-in

  const results = useMemo(() => {
    const P = yearlyInvestment;
    const r = interestRate / 100;
    const t = durationYears;

    let balance = 0;
    const yearlyData: number[] = [];

    for (let y = 1; y <= t; y++) {
      balance = (balance + P) * (1 + r);
      yearlyData.push(Math.round(balance));
    }

    const totalInvested = P * t;
    const maturityValue = Math.round(balance);
    const totalInterest = Math.max(0, maturityValue - totalInvested);

    return {
      totalInvested,
      totalInterest,
      maturityValue,
      yearlyData,
    };
  }, [yearlyInvestment, interestRate, durationYears]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>PPF Calculator</Text>
            <Text style={styles.subtitle}>Public Provident Fund (Tax-Free Returns)</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Yearly Investment"
          value={yearlyInvestment}
          onValueChange={setYearlyInvestment}
          min={500}
          max={150000}
          step={500}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Annual Interest Rate"
          value={interestRate}
          onValueChange={setInterestRate}
          min={5}
          max={10}
          step={0.1}
          unit="%"
        />

        <CalculatorSlider
          label="Investment Tenure (Years)"
          value={durationYears}
          onValueChange={setDurationYears}
          min={15}
          max={30}
          step={5}
          unit="Yrs"
        />

        {/* Result Card */}
        <CalculatorResultCard
          primaryLabel="Maturity Amount"
          primaryValue={results.maturityValue}
          investedLabel="Total Deposit"
          investedValue={results.totalInvested}
          returnsLabel="Total Interest"
          returnsValue={results.totalInterest}
        />

        {/* Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="PPF Accumulation Trajectory" />
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
