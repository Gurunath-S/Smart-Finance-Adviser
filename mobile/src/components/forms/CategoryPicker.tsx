import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface CategoryOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const INCOME_CATEGORIES: CategoryOption[] = [
  { key: 'salary', label: 'Salary', icon: 'cash-outline' },
  { key: 'freelancing', label: 'Freelance', icon: 'laptop-outline' },
  { key: 'investments', label: 'Investments', icon: 'trending-up-outline' },
  { key: 'stocks', label: 'Stocks', icon: 'analytics-outline' },
  { key: 'bitcoin', label: 'Bitcoin', icon: 'logo-bitcoin' },
  { key: 'bank', label: 'Bank', icon: 'card-outline' },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
  { key: 'other', label: 'Other', icon: 'wallet-outline' },
];

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { key: 'groceries', label: 'Groceries', icon: 'cart-outline' },
  { key: 'education', label: 'Education', icon: 'school-outline' },
  { key: 'health', label: 'Health', icon: 'medkit-outline' },
  { key: 'subscriptions', label: 'Sub', icon: 'tv-outline' },
  { key: 'takeaways', label: 'Food', icon: 'fast-food-outline' },
  { key: 'clothing', label: 'Clothes', icon: 'shirt-outline' },
  { key: 'travelling', label: 'Travel', icon: 'airplane-outline' },
  { key: 'other', label: 'Other', icon: 'receipt-outline' },
];

interface CategoryPickerProps {
  type: 'income' | 'expense';
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  style?: ViewStyle;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  type,
  selectedCategory,
  onSelectCategory,
  style,
}) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>CATEGORY</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.key.toLowerCase();
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
                isSelected && { borderColor: type === 'income' ? colors.income : colors.expense },
              ]}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={
                  isSelected
                    ? type === 'income'
                      ? colors.income
                      : colors.expense
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.selectedChipText,
                  isSelected && { color: type === 'income' ? colors.income : colors.expense },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: '#FAF9FF',
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  selectedChipText: {
    fontWeight: '700',
  },
});
