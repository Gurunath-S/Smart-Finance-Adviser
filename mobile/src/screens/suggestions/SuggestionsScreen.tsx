import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { suggestionService } from '../../services/suggestionService';
import { SuggestionCard } from '../../components/cards/SuggestionCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { SuggestionHistoryItem } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../theme/theme';

export const SuggestionsScreen: React.FC = () => {
  const { summary } = useTransactions();
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<SuggestionHistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    try {
      const past = await suggestionService.getSavedSuggestions();
      setHistory(past);
      if (past.length > 0 && currentSuggestions.length === 0) {
        setCurrentSuggestions(past[0].suggestions || []);
      }
    } catch {
      // History is optional on first load
    }
  }, [currentSuggestions.length]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const response = await suggestionService.getSuggestions(
        summary.currentBalance,
        summary.totalIncome,
        summary.totalExpenses
      );

      if (response.suggestions && response.suggestions.length > 0) {
        setCurrentSuggestions(response.suggestions);
        // Persist to backend database
        await suggestionService.saveSuggestions(response.suggestions);
        await fetchHistory();
      } else {
        Alert.alert('Notice', 'No advice points were generated. Try adding more transactions first.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Unable to reach AI advisory service. Ensure your connection and AI credentials are configured.';
      Alert.alert('Advisory Service', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistory();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Smart Advisory</Text>
          <Text style={styles.subtitle}>
            AI-driven wealth strategies tailored to your cash flow
          </Text>
        </View>

        {/* Financial Position Snapshot */}
        <View style={[styles.snapshotCard, shadows.md]}>
          <View style={styles.snapshotHeader}>
            <View style={styles.brainIcon}>
              <Ionicons name="sparkles" size={20} color={colors.accentPink} />
            </View>
            <Text style={styles.snapshotTitle}>CURRENT FINANCIAL PROFILE</Text>
          </View>

          <View style={styles.snapshotMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Balance</Text>
              <Text style={styles.metricValue}>{formatCurrency(summary.currentBalance)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Income</Text>
              <Text style={[styles.metricValue, { color: colors.income }]}>
                {formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Expense</Text>
              <Text style={[styles.metricValue, { color: colors.expense }]}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
          </View>

          <PrimaryButton
            title={isGenerating ? 'Analyzing Cash Flow...' : '✨ Generate Smart Advice'}
            onPress={handleGenerateSuggestions}
            isLoading={isGenerating}
            style={styles.generateBtn}
          />
        </View>

        {/* Suggestions Section */}
        <SectionHeader
          title="Active Recommendations"
          subtitle={
            currentSuggestions.length > 0
              ? 'Personalized asset allocation and savings tips'
              : 'Tap Generate above to consult the AI adviser'
          }
        />

        {currentSuggestions.length === 0 ? (
          <EmptyState
            icon="bulb-outline"
            title="No suggestions yet"
            description="Tap 'Generate Smart Advice' above to receive custom investment insights based on your income and expenses."
          />
        ) : (
          currentSuggestions.map((item, index) => (
            <SuggestionCard key={index} suggestion={item} index={index} />
          ))
        )}

        {/* Past Advisory History */}
        {history.length > 1 && (
          <>
            <SectionHeader
              title="Advisory History"
              subtitle="Previous consultations"
              style={{ marginTop: spacing.xl }}
            />
            {history.slice(1, 4).map((hist) => (
              <View key={hist._id} style={[styles.historyCard, shadows.sm]}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>Saved on {formatDate(hist.date || hist.createdAt)}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{hist.itemsUsedCount || hist.suggestions.length} items</Text>
                  </View>
                </View>
                <Text style={styles.historyPreview} numberOfLines={2}>
                  {hist.suggestions.join(' • ')}
                </Text>
              </View>
            ))}
          </>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  snapshotCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  brainIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(245, 102, 146, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  snapshotMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  generateBtn: {
    marginTop: spacing.xs,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  historyDate: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  countBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  countText: {
    ...typography.captionBold,
    color: colors.brand,
    fontSize: 10,
  },
  historyPreview: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
