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

export const SWPCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [totalCorpus, setTotalCorpus] = useState(1000000); // 10 Lakhs
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(8000);
  const [returnRate, setReturnRate] = useState(9);
  const [durationYears, setDurationYears] = useState(10);

  const results = useMemo(() => {
    let balance = totalCorpus;
    const r = returnRate / 100 / 12;
    const totalMonths = durationYears * 12;
    const totalWithdrawn = monthlyWithdrawal * totalMonths;

    const yearlyData: number[] = [];
    for (let m = 1; m <= totalMonths; m++) {
      balance = Math.max(0, (balance - monthlyWithdrawal) * (1 + r));
      if (m % 12 === 0) {
        yearlyData.push(Math.round(balance));
      }
    }

    return {
      totalCorpus,
      totalWithdrawn,
      remainingBalance: Math.round(balance),
      yearlyData,
    };
  }, [totalCorpus, monthlyWithdrawal, returnRate, durationYears]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>SWP Calculator</Text>
            <Text style={styles.subtitle}>Systematic Withdrawal Plan</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Total Investment Corpus"
          value={totalCorpus}
          onValueChange={setTotalCorpus}
          min={100000}
          max={10000000}
          step={50000}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Monthly Withdrawal Amount"
          value={monthlyWithdrawal}
          onValueChange={setMonthlyWithdrawal}
          min={1000}
          max={100000}
          step={1000}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Expected Annual Return"
          value={returnRate}
          onValueChange={setReturnRate}
          min={1}
          max={20}
          step={0.5}
          unit="%"
        />

        <CalculatorSlider
          label="Withdrawal Tenure (Years)"
          value={durationYears}
          onValueChange={setDurationYears}
          min={1}
          max={25}
          step={1}
          unit="Yrs"
        />

        {/* Result Card */}
        <CalculatorResultCard
          primaryLabel="Remaining Portfolio Balance"
          primaryValue={results.remainingBalance}
          investedLabel="Total Withdrawn Cash"
          investedValue={results.totalWithdrawn}
          returnsLabel="Initial Corpus"
          returnsValue={results.totalCorpus}
        />

        {/* Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="Corpus Trajectory Over Time" />
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
