import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { ListSkeleton } from '../../components/common/LoadingSkeleton';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { QuickTransactionModal } from '../../components/forms/QuickTransactionModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { isCurrentMonth } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType, UnifiedTransaction } from '../../types';

type TypeFilter = 'all' | 'income' | 'expense';
type DateFilter = 'all' | 'month' | 'month-past';

export const TransactionsScreen: React.FC = () => {
  const {
    unifiedTransactions,
    isLoading,
    isRefreshing,
    refresh,
    deleteIncome,
    deleteExpense,
    addIncome,
    addExpense,
  } = useTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Date Filter
      if (dateFilter === 'month') {
        if (!isCurrentMonth(tx.date)) return false;
      } else if (dateFilter === 'month-past') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (new Date(tx.date) < thirtyDaysAgo) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesDesc;
      }

      return true;
    });
  }, [unifiedTransactions, typeFilter, dateFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    const target = unifiedTransactions.find((t) => t._id === id);
    if (!target) return;
    if (target.type === 'income') {
      await deleteIncome(id);
    } else {
      await deleteExpense(id);
    }
  };

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
        data={filteredTransactions}
        keyExtractor={(item) => `${item.type}-${item._id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>All Transactions</Text>
              <Text style={styles.subtitle}>
                Showing {filteredTransactions.length} records
              </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions or categories..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Type Filters */}
            <View style={styles.filterRow}>
              {(['all', 'income', 'expense'] as TypeFilter[]).map((tf) => {
                const isSelected = typeFilter === tf;
                return (
                  <TouchableOpacity
                    key={tf}
                    style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
                    onPress={() => setTypeFilter(tf)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                      {tf === 'all' ? 'All' : tf === 'income' ? 'Income' : 'Expense'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Filters */}
            <View style={styles.dateFilterRow}>
              {[
                { key: 'all', label: 'All Time' },
                { key: 'month', label: 'This Month' },
                { key: 'month-past', label: 'Last 30 Days' },
              ].map((df) => {
                const isSelected = dateFilter === df.key;
                return (
                  <TouchableOpacity
                    key={df.key}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setDateFilter(df.key as DateFilter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                      {df.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No matching transactions"
            description={
              searchQuery
                ? `No transactions match "${searchQuery}". Try a different keyword.`
                : 'No transactions found for the selected filters.'
            }
            actionText={searchQuery ? 'Clear Search' : '+ Add Transaction'}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery('');
                setTypeFilter('all');
                setDateFilter('all');
              } else {
                setModalVisible(true);
              }
            }}
          />
        }
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onDelete={handleDelete} />
        )}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setModalVisible(true)} />

      {/* Quick Add Modal */}
      <QuickTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddIncome={addIncome}
        onAddExpense={addExpense}
      />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    padding: 3,
    marginBottom: spacing.sm,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  typeButtonSelected: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  typeText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  typeTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipSelected: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderColor: colors.brand,
  },
  dateChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  dateChipTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
});
