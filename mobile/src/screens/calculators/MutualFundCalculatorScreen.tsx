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

export const MutualFundCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [totalInvestment, setTotalInvestment] = useState(200000); // 2 Lakhs
  const [expectedReturn, setExpectedReturn] = useState(14);
  const [durationYears, setDurationYears] = useState(10);

  const results = useMemo(() => {
    const P = totalInvestment;
    const r = expectedReturn / 100;
    const t = durationYears;

    const totalValue = P * Math.pow(1 + r, t);
    const estimatedReturns = Math.max(0, totalValue - P);

    const yearlyData: number[] = [];
    for (let y = 1; y <= durationYears; y++) {
      yearlyData.push(Math.round(P * Math.pow(1 + r, y)));
    }

    return {
      principal: P,
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      yearlyData,
    };
  }, [totalInvestment, expectedReturn, durationYears]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Mutual Funds</Text>
            <Text style={styles.subtitle}>Lump-sum Wealth Projection</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Total Investment Amount"
          value={totalInvestment}
          onValueChange={setTotalInvestment}
          min={5000}
          max={5000000}
          step={5000}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Expected Annual Return"
          value={expectedReturn}
          onValueChange={setExpectedReturn}
          min={5}
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
          primaryLabel="Expected Future Corpus"
          primaryValue={results.totalValue}
          investedLabel="Invested Capital"
          investedValue={results.principal}
          returnsLabel="Estimated Gain"
          returnsValue={results.estimatedReturns}
        />

        {/* Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="Compounded Capital Growth" />
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
