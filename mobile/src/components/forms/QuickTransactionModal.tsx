import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { AmountInput } from '../common/AmountInput';
import { FormInput } from '../common/FormInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { CategoryPicker } from './CategoryPicker';
import { toISODateOnly } from '../../utils/date';

interface QuickTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddIncome: (data: {
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => Promise<boolean>;
  onAddExpense: (data: {
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => Promise<boolean>;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  visible,
  onClose,
  onAddIncome,
  onAddExpense,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('groceries');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'salary' : 'groceries');
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for this record.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      amount: parsedAmount,
      category: category || (type === 'income' ? 'salary' : 'other'),
      description: description.trim() || `${type === 'income' ? 'Income' : 'Expense'} record`,
      date: toISODateOnly(),
    };

    let success = false;
    if (type === 'income') {
      success = await onAddIncome(payload);
    } else {
      success = await onAddExpense(payload);
    }

    setIsSubmitting(false);

    if (success) {
      // Reset fields and close
      setAmount('');
      setTitle('');
      setDescription('');
      onClose();
    } else {
      Alert.alert('Error', `Failed to save ${type}. Please check your connection.`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Transaction</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Segmented Control */}
                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      type === 'income' && styles.segmentActiveIncome,
                    ]}
                    onPress={() => handleTypeChange('income')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={18}
                      color={type === 'income' ? colors.income : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.segmentText,
                        type === 'income' && { color: colors.income, fontWeight: '700' },
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      type === 'expense' && styles.segmentActiveExpense,
                    ]}
                    onPress={() => handleTypeChange('expense')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="arrow-down-circle"
                      size={18}
                      color={type === 'expense' ? colors.expense : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.segmentText,
                        type === 'expense' && { color: colors.expense, fontWeight: '700' },
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <AmountInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                />

                {/* Title Input */}
                <FormInput
                  label="TITLE / DESCRIPTION"
                  placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Grocery Shopping'}
                  value={title}
                  onChangeText={setTitle}
                  leftIcon="pencil-outline"
                />

                {/* Category Picker */}
                <CategoryPicker
                  type={type}
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                />

                {/* Optional Note */}
                <FormInput
                  label="NOTES (OPTIONAL)"
                  placeholder="Add any extra details"
                  value={description}
                  onChangeText={setDescription}
                  leftIcon="document-text-outline"
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Submit Button */}
                <PrimaryButton
                  title={type === 'income' ? 'Add Income Record' : 'Add Expense Record'}
                  variant={type === 'income' ? 'income' : 'expense'}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  style={styles.submitBtn}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 56, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  segmentActiveIncome: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentActiveExpense: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.expense,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
