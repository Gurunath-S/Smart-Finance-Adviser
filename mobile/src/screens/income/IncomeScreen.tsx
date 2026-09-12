import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, Income } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { ListSkeleton } from '../../components/common/LoadingSkeleton';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../theme/theme';

export const IncomeScreen: React.FC = () => {
  const { incomes, summary, isLoading, isRefreshing, refresh, deleteIncome } = useTransactions();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIncomes = useMemo(() => {
    if (selectedCategory === 'all') return incomes;
    return incomes.filter((i) => i.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [incomes, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    incomes.forEach((i) => set.add(i.category.toLowerCase()));
    return ['all', ...Array.from(set)];
  }, [incomes]);

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredIncomes}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.income}
            colors={[colors.income]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Income Ledger</Text>
              <Text style={styles.subtitle}>Track all income sources and cash inflows</Text>
            </View>

            {/* Income Summary Card */}
            <View style={[styles.summaryCard, shadows.md]}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Total Income</Text>
                  <Text style={styles.summaryAmount}>{formatCurrency(summary.totalIncome)}</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Ionicons name="trending-up" size={24} color={colors.income} />
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>Earned this month:</Text>
                <Text style={styles.monthlyAmount}>+{formatCurrency(summary.thisMonthIncome)}</Text>
              </View>
            </View>

            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <View style={styles.filterSection}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories}
                  keyExtractor={(cat) => cat}
                  contentContainerStyle={styles.filterScroll}
                  renderItem={({ item: cat }) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedCategory(cat)}
                        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextSelected,
                          ]}
                        >
                          {cat === 'all' ? 'All Incomes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-outline"
            title="No income records found"
            description="Start logging your income streams to analyze your earning patterns."
            actionText="+ Add New Income"
            onAction={() => navigation.navigate('AddIncome')}
          />
        }
        renderItem={({ item }) => (
          <TransactionItem
            transaction={{
              _id: item._id,
              title: item.title,
              amount: item.amount,
              type: 'income',
              date: item.date,
              category: item.category,
              description: item.description,
              userId: item.userId,
            }}
            onDelete={deleteIncome}
          />
        )}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => navigation.navigate('AddIncome')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 90,
  },
  header: {
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.income,
    marginTop: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.incomeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthlyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  monthlyAmount: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.income,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
});
