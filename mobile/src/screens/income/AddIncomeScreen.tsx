import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { AmountInput } from '../../components/common/AmountInput';
import { FormInput } from '../../components/common/FormInput';
import { CategoryPicker } from '../../components/forms/CategoryPicker';
import { CashDenominationSelector } from '../../components/cash/CashDenominationSelector';
import { CalculationOptionsCard } from '../../components/forms/CalculationOptionsCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { toISODateOnly } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import {
  cashService,
  defaultNotes,
  defaultCoins,
  applyCashTransactionToDenominations,
  autoSelectDenominationsForAmount,
  calculateCashTotal,
} from '../../services/cashService';
import {
  PaymentMode,
  CashDenominationNotes,
  CashDenominationCoins,
} from '../../types';

type AddIncomeNavigationProp = NativeStackNavigationProp<AppStackParamList, 'AddIncome'>;

interface AddIncomeScreenProps {
  navigation: AddIncomeNavigationProp;
}

export const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ navigation }) => {
  const { addIncome } = useTransactions();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('online');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('salary');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cash Denomination state
  const [selectedNotes, setSelectedNotes] = useState<Partial<CashDenominationNotes>>({});
  const [selectedCoins, setSelectedCoins] = useState<Partial<CashDenominationCoins>>({});
  const [shouldUpdateDenominations, setShouldUpdateDenominations] = useState<boolean>(true);

  // Calculation Options (Omit Amount)
  const [excludeFromTotal, setExcludeFromTotal] = useState<boolean>(false);
  const [omittedAmount, setOmittedAmount] = useState<string>('');

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
    const parsedOmitted = parseFloat(omittedAmount) || 0;

    const success = await addIncome({
      title: title.trim(),
      amount: parsedAmount,
      category,
      description: description.trim() || 'Income record',
      date: toISODateOnly(),
      paymentMode,
      excludeFromTotal,
      omittedAmount: parsedOmitted,
    });

    if (success && paymentMode === 'cash' && shouldUpdateDenominations) {
      try {
        const cashResp = await cashService.getCashDenominations();
        const currentNotes = cashResp?.denominations?.notes || defaultNotes;
        const currentCoins = cashResp?.denominations?.coins || defaultCoins;

        const selectedTotal = calculateCashTotal(selectedNotes, selectedCoins).totalCash;
        let deltaNotes = selectedNotes;
        let deltaCoins = selectedCoins;

        if (selectedTotal <= 0 && parsedAmount > 0) {
          const autoAllocated = autoSelectDenominationsForAmount(
            currentNotes,
            currentCoins,
            parsedAmount
          );
          deltaNotes = autoAllocated.notes;
          deltaCoins = autoAllocated.coins;
        }

        const updated = applyCashTransactionToDenominations(
          currentNotes,
          currentCoins,
          deltaNotes,
          deltaCoins,
          'income'
        );

        await cashService.updateCashDenominations(
          updated.notes,
          updated.coins,
          cashResp?.omittedAmount,
          cashResp?.isOmittedActive
        );
      } catch (denomErr) {
        console.warn('Failed to update cash denominations automatically:', denomErr);
      }
    }

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
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          bounces={true}
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
            <View>
              <Text style={styles.headerTitle}>Add New Income</Text>
              <Text style={styles.headerSubtitle}>Record your earnings</Text>
            </View>
          </View>

          {/* Payment Mode Selector */}
          <View style={styles.paymentModeRow}>
            <TouchableOpacity
              style={[
                styles.paymentModeBtn,
                paymentMode === 'online' && styles.paymentModeBtnActiveOnline,
              ]}
              onPress={() => setPaymentMode('online')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="card-outline"
                size={16}
                color={paymentMode === 'online' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.paymentModeText,
                  paymentMode === 'online' && styles.paymentModeTextActiveOnline,
                ]}
              >
                In Account (Online/Bank)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentModeBtn,
                paymentMode === 'cash' && styles.paymentModeBtnActiveCash,
              ]}
              onPress={() => setPaymentMode('cash')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cash-outline"
                size={16}
                color={paymentMode === 'cash' ? '#059669' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.paymentModeText,
                  paymentMode === 'cash' && styles.paymentModeTextActiveCash,
                ]}
              >
                In Hand (Cash)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Card */}
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
          />

          {/* Cash Denominations (Notes & Coins) Selector */}
          {paymentMode === 'cash' && (
            <CashDenominationSelector
              type="income"
              selectedNotes={selectedNotes}
              onChangeSelectedNotes={setSelectedNotes}
              selectedCoins={selectedCoins}
              onChangeSelectedCoins={setSelectedCoins}
              shouldUpdateDenominations={shouldUpdateDenominations}
              onToggleUpdateDenominations={setShouldUpdateDenominations}
              currentAmount={parseFloat(amount) || 0}
              onSyncAmountWithCash={(newTotal) => setAmount(String(newTotal))}
            />
          )}

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

          {/* Calculation Options (Omit Amount / Exclude from Total) */}
          <CalculationOptionsCard
            excludeFromTotal={excludeFromTotal}
            onToggleExcludeFromTotal={setExcludeFromTotal}
            omittedAmount={omittedAmount}
            onChangeOmittedAmount={setOmittedAmount}
            totalAmount={parseFloat(amount) || 0}
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
    paddingBottom: 80,
    flexGrow: 1,
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
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
  paymentModeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  paymentModeBtnActiveOnline: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: colors.primary,
  },
  paymentModeBtnActiveCash: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: '#059669',
  },
  paymentModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paymentModeTextActiveOnline: {
    color: colors.primary,
    fontWeight: '700',
  },
  paymentModeTextActiveCash: {
    color: '#059669',
    fontWeight: '700',
  },
});
