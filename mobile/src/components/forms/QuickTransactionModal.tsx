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
import { CashDenominationSelector } from '../cash/CashDenominationSelector';
import { CalculationOptionsCard } from './CalculationOptionsCard';
import { toISODateOnly } from '../../utils/date';
import {
  cashService,
  defaultNotes,
  defaultCoins,
  applyCashTransactionToDenominations,
  autoSelectDenominationsForAmount,
  calculateCashTotal,
  calculateChangeDenominations,
  applyCashExpenseWithChange,
} from '../../services/cashService';
import {
  PaymentMode,
  CashDenominationNotes,
  CashDenominationCoins,
} from '../../types';

interface QuickTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddIncome: (data: {
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMode?: PaymentMode;
    excludeFromTotal?: boolean;
    omittedAmount?: number;
  }) => Promise<boolean>;
  onAddExpense: (data: {
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMode?: PaymentMode;
    excludeFromTotal?: boolean;
    omittedAmount?: number;
  }) => Promise<boolean>;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  visible,
  onClose,
  onAddIncome,
  onAddExpense,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('online');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('groceries');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cash Denomination Tracking
  const [selectedNotes, setSelectedNotes] = useState<Partial<CashDenominationNotes>>({});
  const [selectedCoins, setSelectedCoins] = useState<Partial<CashDenominationCoins>>({});
  const [changeNotes, setChangeNotes] = useState<Partial<CashDenominationNotes>>({});
  const [changeCoins, setChangeCoins] = useState<Partial<CashDenominationCoins>>({});
  const [shouldUpdateDenominations, setShouldUpdateDenominations] = useState<boolean>(true);

  // Calculation Options (Omit Amount)
  const [excludeFromTotal, setExcludeFromTotal] = useState<boolean>(false);
  const [omittedAmount, setOmittedAmount] = useState<string>('');

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'salary' : 'groceries');
    setSelectedNotes({});
    setSelectedCoins({});
    setChangeNotes({});
    setChangeCoins({});
    setError(null);
  };

  const handleResetForm = () => {
    setAmount('');
    setTitle('');
    setDescription('');
    setSelectedNotes({});
    setSelectedCoins({});
    setChangeNotes({});
    setChangeCoins({});
    setExcludeFromTotal(false);
    setOmittedAmount('');
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
    const parsedOmitted = parseFloat(omittedAmount) || 0;

    const payload = {
      title: title.trim(),
      amount: parsedAmount,
      category: category || (type === 'income' ? 'salary' : 'other'),
      description:
        description.trim() ||
        `${type === 'income' ? 'Income' : 'Expense'} record (${
          paymentMode === 'cash' ? 'Cash' : 'Online'
        })`,
      date: toISODateOnly(),
      paymentMode,
      excludeFromTotal,
      omittedAmount: parsedOmitted,
    };

    let success = false;
    if (type === 'income') {
      success = await onAddIncome(payload);
    } else {
      success = await onAddExpense(payload);
    }

    // If transaction succeeded and user paid in cash with denomination updates enabled
    if (success && paymentMode === 'cash' && shouldUpdateDenominations) {
      try {
        const cashResp = await cashService.getCashDenominations();
        const currentNotes = cashResp?.denominations?.notes || defaultNotes;
        const currentCoins = cashResp?.denominations?.coins || defaultCoins;

        // Check if user specifically selected notes/coins
        const selectedTotal = calculateCashTotal(selectedNotes, selectedCoins).totalCash;
        let deltaNotes = selectedNotes;
        let deltaCoins = selectedCoins;

        // If no individual notes selected, auto-allocate to match the typed amount
        if (selectedTotal <= 0 && parsedAmount > 0) {
          const autoAllocated = autoSelectDenominationsForAmount(
            currentNotes,
            currentCoins,
            parsedAmount,
            type === 'expense'
          );
          deltaNotes = autoAllocated.notes;
          deltaCoins = autoAllocated.coins;
        }

        const effectiveTenderTotal = calculateCashTotal(deltaNotes, deltaCoins).totalCash;
        let updated: { notes: CashDenominationNotes; coins: CashDenominationCoins };

        if (type === 'expense' && effectiveTenderTotal > parsedAmount) {
          const changeAmount = effectiveTenderTotal - parsedAmount;
          const customChangeTotal = calculateCashTotal(changeNotes, changeCoins).totalCash;
          const effectiveChange =
            customChangeTotal === changeAmount
              ? { notes: changeNotes, coins: changeCoins }
              : calculateChangeDenominations(changeAmount);

          updated = applyCashExpenseWithChange(
            currentNotes,
            currentCoins,
            deltaNotes,
            deltaCoins,
            effectiveChange.notes,
            effectiveChange.coins
          );
        } else {
          updated = applyCashTransactionToDenominations(
            currentNotes,
            currentCoins,
            deltaNotes,
            deltaCoins,
            type
          );
        }

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
      handleResetForm();
      onClose();
    } else {
      Alert.alert('Error', `Failed to save ${type}. Please check your connection.`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Backdrop touchable to dismiss outside the sheet */}
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Add Transaction</Text>
                <Text style={styles.headerSubtitle}>Record quick cash or online entry</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              bounces={true}
            >
              {/* Income / Expense Segmented Control */}
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

              {/* Payment Mode Selector: In Account vs In Hand */}
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
                    size={15}
                    color={paymentMode === 'online' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentModeText,
                      paymentMode === 'online' && styles.paymentModeTextActiveOnline,
                    ]}
                  >
                    In Account (Bank/UPI)
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
                    size={15}
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

              {/* Amount Input */}
              <AmountInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
              />

              {/* Cash Denomination Selector (Shown when In-Hand Cash is selected) */}
              {paymentMode === 'cash' && (
                <CashDenominationSelector
                  type={type}
                  selectedNotes={selectedNotes}
                  onChangeSelectedNotes={setSelectedNotes}
                  selectedCoins={selectedCoins}
                  onChangeSelectedCoins={setSelectedCoins}
                  changeNotes={changeNotes}
                  onChangeChangeNotes={setChangeNotes}
                  changeCoins={changeCoins}
                  onChangeChangeCoins={setChangeCoins}
                  shouldUpdateDenominations={shouldUpdateDenominations}
                  onToggleUpdateDenominations={setShouldUpdateDenominations}
                  currentAmount={parseFloat(amount) || 0}
                  onSyncAmountWithCash={(newTotal) => setAmount(String(newTotal))}
                />
              )}

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

              {/* Calculation Options (Omit Amount / Exclude from Total) */}
              <CalculationOptionsCard
                excludeFromTotal={excludeFromTotal}
                onToggleExcludeFromTotal={setExcludeFromTotal}
                omittedAmount={omittedAmount}
                onChangeOmittedAmount={setOmittedAmount}
                totalAmount={parseFloat(amount) || 0}
              />

              {/* Optional Notes */}
              <FormInput
                label="NOTES (OPTIONAL)"
                placeholder="Add any extra notes or reference"
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxHeight: '92%',
    flexShrink: 1,
    borderWidth: 1,
    borderColor: colors.border,
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
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceVariant,
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
