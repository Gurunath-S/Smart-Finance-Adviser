import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';
import {
  cashService,
  defaultNotes,
  defaultCoins,
  calculateCashTotal,
} from '../../services/cashService';
import { CashDenominationNotes, CashDenominationCoins } from '../../types';

interface CashDenominationModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (totalCash: number) => void;
}

interface DenominationItemProps {
  title: string;
  value: number;
  count: number;
  color: string;
  isCoin?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeCount: (newVal: number) => void;
}

const DenominationRow: React.FC<DenominationItemProps> = ({
  title,
  value,
  count,
  color,
  isCoin,
  onIncrement,
  onDecrement,
  onChangeCount,
}) => {
  const subtotal = value * count;

  return (
    <View style={styles.denomRow}>
      <View style={styles.denomInfo}>
        <View style={[styles.badgePill, { backgroundColor: `${color}18`, borderColor: color }]}>
          <Ionicons
            name={isCoin ? 'disc-outline' : 'cash-outline'}
            size={14}
            color={color}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.badgeText, { color }]}>{title}</Text>
        </View>
        <Text style={styles.denomSubtotal}>
          {count > 0 ? `= ${formatCurrency(subtotal)}` : '₹0'}
        </Text>
      </View>

      <View style={styles.counterControl}>
        <TouchableOpacity
          style={[styles.counterBtn, count === 0 && styles.counterBtnDisabled]}
          onPress={onDecrement}
          disabled={count === 0}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={16} color={count === 0 ? colors.textMuted : colors.textPrimary} />
        </TouchableOpacity>

        <TextInput
          style={styles.counterInput}
          keyboardType="number-pad"
          value={String(count)}
          onChangeText={(txt) => {
            const parsed = parseInt(txt.replace(/[^0-9]/g, ''), 10);
            onChangeCount(isNaN(parsed) ? 0 : parsed);
          }}
          selectTextOnFocus
        />

        <TouchableOpacity style={styles.counterBtn} onPress={onIncrement} activeOpacity={0.7}>
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CashDenominationModal: React.FC<CashDenominationModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [notes, setNotes] = useState<CashDenominationNotes>(defaultNotes);
  const [coins, setCoins] = useState<CashDenominationCoins>(defaultCoins);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'coins'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Omit / Reserve Cash from Total calculation
  const [omittedInput, setOmittedInput] = useState<string>('');
  const [isOmittedActive, setIsOmittedActive] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadDenominations();
    }
  }, [visible]);

  const loadDenominations = async () => {
    setIsLoading(true);
    try {
      const data = await cashService.getCashDenominations();
      if (data?.denominations) {
        setNotes({ ...defaultNotes, ...(data.denominations.notes || {}) });
        setCoins({ ...defaultCoins, ...(data.denominations.coins || {}) });
      }
      if (data?.omittedAmount !== undefined) {
        setOmittedInput(data.omittedAmount > 0 ? String(data.omittedAmount) : '');
      }
      if (data?.isOmittedActive !== undefined) {
        setIsOmittedActive(Boolean(data.isOmittedActive));
      }
    } catch {
      // Use existing state or defaults gracefully
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => calculateCashTotal(notes, coins), [notes, coins]);

  const parsedOmitted = parseFloat(omittedInput) || 0;
  const countedInTotal = isOmittedActive
    ? Math.max(0, totals.totalCash - parsedOmitted)
    : totals.totalCash;

  const updateNote = (key: keyof CashDenominationNotes, delta: number) => {
    setNotes((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const setNoteVal = (key: keyof CashDenominationNotes, val: number) => {
    setNotes((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const updateCoin = (key: keyof CashDenominationCoins, delta: number) => {
    setCoins((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const setCoinVal = (key: keyof CashDenominationCoins, val: number) => {
    setCoins((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const handleReset = () => {
    Alert.alert('Reset All Counts?', 'This will clear all notes and coins in hand to 0.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setNotes(defaultNotes);
          setCoins(defaultCoins);
          setOmittedInput('');
          setIsOmittedActive(false);
        },
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanOmitted = Math.max(0, parseFloat(omittedInput) || 0);
      const result = await cashService.updateCashDenominations(
        notes,
        coins,
        cleanOmitted,
        isOmittedActive
      );
      const effectiveCash = isOmittedActive
        ? Math.max(0, result.totalInHandCash - cleanOmitted)
        : result.totalInHandCash;
      onSaved?.(effectiveCash);
      Alert.alert(
        'Saved!',
        `In-Hand Cash updated to ${formatCurrency(result.totalInHandCash)}${
          isOmittedActive && cleanOmitted > 0
            ? ` (${formatCurrency(cleanOmitted)} reserved/omitted from total calculation)`
            : ''
        }.`
      );
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save cash denominations. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>In-Hand Cash Manager</Text>
              <Text style={styles.subtitle}>Count physical currency notes & coins</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Grand Total Hero Card */}
          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroLabel}>TOTAL PHYSICAL CASH</Text>
              <Text style={styles.heroAmount}>{formatCurrency(totals.totalCash)}</Text>
              {isOmittedActive && parsedOmitted > 0 && (
                <View style={styles.heroEffectiveBox}>
                  <Text style={styles.heroEffectiveText}>
                    Counted in Total: <Text style={{ fontWeight: '800', color: '#6EE7B7' }}>{formatCurrency(countedInTotal)}</Text>
                  </Text>
                  <Text style={styles.heroOmittedSub}>
                    ({formatCurrency(parsedOmitted)} omitted / reserved)
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.heroBreakdown}>
              <View style={styles.heroPill}>
                <Ionicons name="cash" size={14} color="#8B5CF6" />
                <Text style={styles.heroPillText}>Notes: {formatCurrency(totals.totalNotes)}</Text>
              </View>
              <View style={[styles.heroPill, { marginTop: 4 }]}>
                <Ionicons name="disc" size={14} color="#F59E0B" />
                <Text style={styles.heroPillText}>Coins: {formatCurrency(totals.totalCoins)}</Text>
              </View>
            </View>
          </View>

          {/* Segment Filter Tabs */}
          <View style={styles.tabRow}>
            {(['all', 'notes', 'coins'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'all' ? 'All Units' : tab === 'notes' ? 'Notes (6)' : 'Coins (5)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* List Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading denominations...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
              {/* Omit / Reserve Cash from Total Calculation Card */}
              <View style={styles.omitCard}>
                <View style={styles.omitHeader}>
                  <View style={styles.omitTitleRow}>
                    <View style={styles.omitIcon}>
                      <Ionicons name="lock-closed" size={14} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.omitTitle}>Reserve / Omit Cash from Total</Text>
                      <Text style={styles.omitSubtitle}>
                        Exclude emergency/set-aside cash from Total Wealth
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isOmittedActive}
                    onValueChange={setIsOmittedActive}
                    trackColor={{ false: colors.border, true: '#34D399' }}
                    thumbColor={isOmittedActive ? '#059669' : '#f4f3f4'}
                  />
                </View>

                {isOmittedActive && (
                  <View style={styles.omitInputArea}>
                    <Text style={styles.omitInputLabel}>AMOUNT TO OMIT / RESERVE (₹):</Text>
                    <View style={styles.omitInputRow}>
                      <Text style={styles.omitCurrency}>₹</Text>
                      <TextInput
                        style={styles.omitTextInput}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        value={omittedInput}
                        onChangeText={(txt) => setOmittedInput(txt.replace(/[^0-9.]/g, ''))}
                      />
                      {parsedOmitted > 0 && (
                        <TouchableOpacity onPress={() => setOmittedInput('')} style={{ padding: 4 }}>
                          <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Quick Presets */}
                    <View style={styles.presetsRow}>
                      {[500, 1000, 2000, 5000].map((preset) => (
                        <TouchableOpacity
                          key={preset}
                          style={styles.presetChip}
                          onPress={() => setOmittedInput(String(preset))}
                        >
                          <Text style={styles.presetChipText}>₹{preset}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.omitExplanation}>
                      {parsedOmitted > 0
                        ? `₹${parsedOmitted.toLocaleString()} will be omitted from your total calculated wealth.`
                        : 'Enter an amount or choose a preset.'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes Section */}
              {(activeTab === 'all' || activeTab === 'notes') && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>💵 Currency Notes</Text>
                  <DenominationRow
                    title="₹500 Note"
                    value={500}
                    count={notes.n500 || 0}
                    color="#7C3AED"
                    onIncrement={() => updateNote('n500', 1)}
                    onDecrement={() => updateNote('n500', -1)}
                    onChangeCount={(val) => setNoteVal('n500', val)}
                  />
                  <DenominationRow
                    title="₹200 Note"
                    value={200}
                    count={notes.n200 || 0}
                    color="#EA580C"
                    onIncrement={() => updateNote('n200', 1)}
                    onDecrement={() => updateNote('n200', -1)}
                    onChangeCount={(val) => setNoteVal('n200', val)}
                  />
                  <DenominationRow
                    title="₹100 Note"
                    value={100}
                    count={notes.n100 || 0}
                    color="#6366F1"
                    onIncrement={() => updateNote('n100', 1)}
                    onDecrement={() => updateNote('n100', -1)}
                    onChangeCount={(val) => setNoteVal('n100', val)}
                  />
                  <DenominationRow
                    title="₹50 Note"
                    value={50}
                    count={notes.n50 || 0}
                    color="#06B6D4"
                    onIncrement={() => updateNote('n50', 1)}
                    onDecrement={() => updateNote('n50', -1)}
                    onChangeCount={(val) => setNoteVal('n50', val)}
                  />
                  <DenominationRow
                    title="₹20 Note"
                    value={20}
                    count={notes.n20 || 0}
                    color="#10B981"
                    onIncrement={() => updateNote('n20', 1)}
                    onDecrement={() => updateNote('n20', -1)}
                    onChangeCount={(val) => setNoteVal('n20', val)}
                  />
                  <DenominationRow
                    title="₹10 Note"
                    value={10}
                    count={notes.n10 || 0}
                    color="#B45309"
                    onIncrement={() => updateNote('n10', 1)}
                    onDecrement={() => updateNote('n10', -1)}
                    onChangeCount={(val) => setNoteVal('n10', val)}
                  />
                </View>
              )}

              {/* Coins Section */}
              {(activeTab === 'all' || activeTab === 'coins') && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>🪙 Metal Coins</Text>
                  <DenominationRow
                    title="₹20 Coin"
                    value={20}
                    count={coins.c20 || 0}
                    color="#D97706"
                    isCoin
                    onIncrement={() => updateCoin('c20', 1)}
                    onDecrement={() => updateCoin('c20', -1)}
                    onChangeCount={(val) => setCoinVal('c20', val)}
                  />
                  <DenominationRow
                    title="₹10 Coin"
                    value={10}
                    count={coins.c10 || 0}
                    color="#B45309"
                    isCoin
                    onIncrement={() => updateCoin('c10', 1)}
                    onDecrement={() => updateCoin('c10', -1)}
                    onChangeCount={(val) => setCoinVal('c10', val)}
                  />
                  <DenominationRow
                    title="₹5 Coin"
                    value={5}
                    count={coins.c5 || 0}
                    color="#475569"
                    isCoin
                    onIncrement={() => updateCoin('c5', 1)}
                    onDecrement={() => updateCoin('c5', -1)}
                    onChangeCount={(val) => setCoinVal('c5', val)}
                  />
                  <DenominationRow
                    title="₹2 Coin"
                    value={2}
                    count={coins.c2 || 0}
                    color="#64748B"
                    isCoin
                    onIncrement={() => updateCoin('c2', 1)}
                    onDecrement={() => updateCoin('c2', -1)}
                    onChangeCount={(val) => setCoinVal('c2', val)}
                  />
                  <DenominationRow
                    title="₹1 Coin"
                    value={1}
                    count={coins.c1 || 0}
                    color="#94A3B8"
                    isCoin
                    onIncrement={() => updateCoin('c1', 1)}
                    onDecrement={() => updateCoin('c1', -1)}
                    onChangeCount={(val) => setCoinVal('c1', val)}
                  />
                </View>
              )}
            </ScrollView>
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.saveText}>Save In-Hand Cash</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: colors.card,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#0F172A',
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.md,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },
  heroAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 4,
  },
  heroBreakdown: {
    alignItems: 'flex-end',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 4,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  denomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  denomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  denomSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 10,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterInput: {
    width: 44,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  heroEffectiveBox: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  heroEffectiveText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  heroOmittedSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  omitCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  omitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  omitTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: spacing.sm,
  },
  omitIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  omitSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  omitInputArea: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  omitInputLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  omitInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  omitCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 4,
  },
  omitTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  omitExplanation: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
