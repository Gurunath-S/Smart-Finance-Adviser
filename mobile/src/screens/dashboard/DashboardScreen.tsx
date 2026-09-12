import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { BalanceCard } from '../../components/cards/BalanceCard';
import { FinancialCard } from '../../components/cards/FinancialCard';
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { SectionHeader } from '../../components/common/SectionHeader';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { QuickTransactionModal } from '../../components/forms/QuickTransactionModal';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    summary,
    unifiedTransactions,
    isLoading,
    isRefreshing,
    refresh,
    addIncome,
    addExpense,
    deleteIncome,
    deleteExpense,
  } = useTransactions();

  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [modalVisible, setModalVisible] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const recentTransactions = unifiedTransactions.slice(0, 5);

  const handleDeleteTransaction = async (id: string) => {
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
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* Top Greeting */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.username}>{user?.username || 'Investor'}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarLetter}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Balance Card */}
        <BalanceCard
          balance={summary.currentBalance}
          income={summary.totalIncome}
          expenses={summary.totalExpenses}
          onAddIncome={() => setModalVisible(true)}
          onAddExpense={() => setModalVisible(true)}
        />

        {/* Financial Health Metrics */}
        <FinancialCard
          savingsRate={summary.savingsRate}
          expenseRatio={summary.expenseRatio}
        />

        {/* Interactive Cash Flow Trend Chart */}
        <IncomeExpenseChart transactions={unifiedTransactions} />

        {/* Recent Transactions Section */}
        <SectionHeader
          title="Recent Transactions"
          subtitle="Your latest 5 inflows and outflows"
          actionText="View All"
          onAction={() => navigation.navigate('TransactionsTab')}
        />

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            description="Tap the + button below to log your first income or expense."
            actionText="+ Add First Record"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          recentTransactions.map((tx) => (
            <TransactionItem
              key={`${tx.type}-${tx._id}`}
              transaction={tx}
              onDelete={handleDeleteTransaction}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setModalVisible(true)} />

      {/* Quick Transaction Entry Modal */}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 90, // Leave room for floating button and tab bar
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  username: {
    ...typography.h1,
    color: colors.primary,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
