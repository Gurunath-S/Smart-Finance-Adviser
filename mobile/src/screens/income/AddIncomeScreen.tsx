import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { AmountInput } from '../../components/common/AmountInput';
import { FormInput } from '../../components/common/FormInput';
import { CategoryPicker } from '../../components/forms/CategoryPicker';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { toISODateOnly } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';

type AddIncomeNavigationProp = NativeStackNavigationProp<AppStackParamList, 'AddIncome'>;

interface AddIncomeScreenProps {
  navigation: AddIncomeNavigationProp;
}

export const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ navigation }) => {
  const { addIncome } = useTransactions();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('salary');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an income title.');
      return;
    }

    setIsSubmitting(true);
    const success = await addIncome({
      title: title.trim(),
      amount: parsedAmount,
      category,
      description: description.trim() || 'Income record',
      date: toISODateOnly(),
    });
    setIsSubmitting(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save income record. Please check your network connection.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Income</Text>
          </View>

          {/* Amount Card */}
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
          />

          {/* Title Input */}
          <FormInput
            label="INCOME SOURCE / TITLE"
            placeholder="e.g. Monthly Salary or Client Project"
            value={title}
            onChangeText={setTitle}
            leftIcon="cash-outline"
          />

          {/* Category Picker */}
          <CategoryPicker
            type="income"
            selectedCategory={category}
            onSelectCategory={setCategory}
          />

          {/* Notes Input */}
          <FormInput
            label="DESCRIPTION (OPTIONAL)"
            placeholder="Add any extra notes or reference"
            value={description}
            onChangeText={setDescription}
            leftIcon="document-text-outline"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Submit Button */}
          <PrimaryButton
            title="Save Income Record"
            variant="income"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.expense,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});
