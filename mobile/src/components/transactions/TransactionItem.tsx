import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { UnifiedTransaction } from '../../types';

interface TransactionItemProps {
  transaction: UnifiedTransaction;
  onDelete?: (id: string) => void;
  onPress?: (transaction: UnifiedTransaction) => void;
  style?: ViewStyle;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onDelete,
  onPress,
  style,
}) => {
  const isIncome = transaction.type === 'income';

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'salary':
        return 'cash-outline';
      case 'freelancing':
        return 'laptop-outline';
      case 'investments':
      case 'stocks':
        return 'trending-up-outline';
      case 'bitcoin':
        return 'logo-bitcoin';
      case 'bank':
        return 'card-outline';
      case 'youtube':
        return 'logo-youtube';
      case 'groceries':
        return 'cart-outline';
      case 'education':
        return 'school-outline';
      case 'health':
        return 'medkit-outline';
      case 'subscriptions':
        return 'tv-outline';
      case 'takeaways':
        return 'fast-food-outline';
      case 'clothing':
        return 'shirt-outline';
      case 'travelling':
        return 'airplane-outline';
      default:
        return isIncome ? 'wallet-outline' : 'receipt-outline';
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(transaction._id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(transaction)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Category Icon Badge */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isIncome ? colors.incomeLight : colors.expenseLight,
          },
        ]}
      >
        <Ionicons
          name={getCategoryIcon(transaction.category)}
          size={22}
          color={isIncome ? colors.income : colors.expense}
        />
      </View>

      {/* Title and Date */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.category} numberOfLines={1}>
            {transaction.category}
          </Text>
        </View>
      </View>

      {/* Amount and Delete Action */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.income : colors.expense },
          ]}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        {onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  amount: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 4,
    padding: 2,
  },
});
