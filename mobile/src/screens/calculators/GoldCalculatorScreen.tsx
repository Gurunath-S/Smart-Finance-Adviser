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

export const GoldCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [initialInvestment, setInitialInvestment] = useState(100000); // 1 Lakh
  const [expectedCagr, setExpectedCagr] = useState(10.5); // Historical average gold CAGR
  const [durationYears, setDurationYears] = useState(7);

  const results = useMemo(() => {
    const P = initialInvestment;
    const r = expectedCagr / 100;
    const t = durationYears;

    const yearlyData: number[] = [];
    for (let y = 1; y <= t; y++) {
      yearlyData.push(Math.round(P * Math.pow(1 + r, y)));
    }

    const estimatedValue = Math.round(P * Math.pow(1 + r, t));
    const totalGains = Math.max(0, estimatedValue - P);

    return {
      investedAmount: P,
      totalGains,
      estimatedValue,
      yearlyData,
    };
  }, [initialInvestment, expectedCagr, durationYears]);

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
            <Text style={styles.title}>Gold Investment</Text>
            <Text style={styles.subtitle}>Sovereign Gold Bonds & Physical Gold Returns</Text>
          </View>
        </View>

        {/* Sliders */}
        <CalculatorSlider
          label="Investment Amount"
          value={initialInvestment}
          onValueChange={setInitialInvestment}
          min={5000}
          max={5000000}
          step={5000}
          displayFormatter={(v) => formatCurrency(v)}
        />

        <CalculatorSlider
          label="Expected Annual CAGR"
          value={expectedCagr}
          onValueChange={setExpectedCagr}
          min={4}
          max={20}
          step={0.5}
          unit="%"
        />

        <CalculatorSlider
          label="Holding Period (Years)"
          value={durationYears}
          onValueChange={setDurationYears}
          min={1}
          max={25}
          step={1}
          unit="Yrs"
        />

        {/* Result Card */}
        <CalculatorResultCard
          primaryLabel="Expected Gold Value"
          primaryValue={results.estimatedValue}
          investedLabel="Initial Investment"
          investedValue={results.investedAmount}
          returnsLabel="Estimated Appreciation"
          returnsValue={results.totalGains}
        />

        {/* Growth Chart */}
        <GrowthChart yearlyData={results.yearlyData} title="Gold Appreciation Curve" />
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
