import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import {
  cashService,
  defaultNotes,
  defaultCoins,
  NOTE_VALUES,
  COIN_VALUES,
  calculateCashTotal,
  autoSelectDenominationsForAmount,
} from '../../services/cashService';
import { CashDenominationNotes, CashDenominationCoins } from '../../types';

interface CashDenominationSelectorProps {
  type: 'income' | 'expense';
  selectedNotes: Partial<CashDenominationNotes>;
  onChangeSelectedNotes: (notes: Partial<CashDenominationNotes>) => void;
  selectedCoins: Partial<CashDenominationCoins>;
  onChangeSelectedCoins: (coins: Partial<CashDenominationCoins>) => void;
  shouldUpdateDenominations: boolean;
  onToggleUpdateDenominations: (val: boolean) => void;
  currentAmount?: number;
  onSyncAmountWithCash?: (total: number) => void;
}

export const CashDenominationSelector: React.FC<CashDenominationSelectorProps> = ({
  type,
  selectedNotes,
  onChangeSelectedNotes,
  selectedCoins,
  onChangeSelectedCoins,
  shouldUpdateDenominations,
  onToggleUpdateDenominations,
  currentAmount = 0,
  onSyncAmountWithCash,
}) => {
  const [availableNotes, setAvailableNotes] = useState<CashDenominationNotes>(defaultNotes);
  const [availableCoins, setAvailableCoins] = useState<CashDenominationCoins>(defaultCoins);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'coins'>('notes');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await cashService.getCashDenominations();
        if (isMounted && data?.denominations) {
          setAvailableNotes({ ...defaultNotes, ...(data.denominations.notes || {}) });
          setAvailableCoins({ ...defaultCoins, ...(data.denominations.coins || {}) });
        }
      } catch {
        // Fallback to defaults
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableTotal = useMemo(
    () => calculateCashTotal(availableNotes, availableCoins).totalCash,
    [availableNotes, availableCoins]
  );

  const selectedTotal = useMemo(
    () => calculateCashTotal(selectedNotes, selectedCoins).totalCash,
    [selectedNotes, selectedCoins]
  );

  const updateNoteCount = (key: keyof CashDenominationNotes, delta: number) => {
    const current = selectedNotes[key] || 0;
    const next = Math.max(0, current + delta);
    const updated = { ...selectedNotes, [key]: next };
    onChangeSelectedNotes(updated);

    const newTotal = calculateCashTotal(updated, selectedCoins).totalCash;
    if (onSyncAmountWithCash && newTotal > 0) {
      onSyncAmountWithCash(newTotal);
    }
  };

  const updateCoinCount = (key: keyof CashDenominationCoins, delta: number) => {
    const current = selectedCoins[key] || 0;
    const next = Math.max(0, current + delta);
    const updated = { ...selectedCoins, [key]: next };
    onChangeSelectedCoins(updated);

    const newTotal = calculateCashTotal(selectedNotes, updated).totalCash;
    if (onSyncAmountWithCash && newTotal > 0) {
      onSyncAmountWithCash(newTotal);
    }
  };

  const handleAutoMatch = () => {
    if (currentAmount <= 0) return;
    const matched = autoSelectDenominationsForAmount(
      availableNotes,
      availableCoins,
      currentAmount
    );
    onChangeSelectedNotes(matched.notes);
    onChangeSelectedCoins(matched.coins);
  };

  const handleClear = () => {
    onChangeSelectedNotes({});
    onChangeSelectedCoins({});
  };

  const remainingOrNewCash = useMemo(() => {
    if (type === 'expense') {
      return Math.max(0, availableTotal - selectedTotal);
    }
    return availableTotal + selectedTotal;
  }, [availableTotal, selectedTotal, type]);

  const noteKeys: (keyof CashDenominationNotes)[] = ['n500', 'n200', 'n100', 'n50', 'n20', 'n10'];
  const coinKeys: (keyof CashDenominationCoins)[] = ['c20', 'c10', 'c5', 'c2', 'c1'];

  return (
    <View style={styles.card}>
      {/* Header Bar */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.cashIconWrap}>
            <Ionicons name="cash" size={16} color="#059669" />
          </View>
          <View>
            <Text style={styles.cardTitle}>In-Hand Cash Units</Text>
            <Text style={styles.cardSubtitle}>
              Available in hand: <Text style={styles.boldText}>{formatCurrency(availableTotal)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {selectedTotal > 0 && (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>
                {type === 'expense' ? 'Spend' : 'Add'}: {formatCurrency(selectedTotal)}
              </Text>
            </View>
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingText}>Loading available notes & coins...</Text>
            </View>
          ) : (
            <>
              {/* Prompt and helper */}
              <View style={styles.instructionRow}>
                <Text style={styles.instructionText}>
                  {type === 'expense'
                    ? 'Select which notes/coins you spent:'
                    : 'Select which notes/coins you received:'}
                </Text>
                {currentAmount > 0 && selectedTotal === 0 && (
                  <TouchableOpacity
                    style={styles.autoMatchBtn}
                    onPress={handleAutoMatch}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="flash-outline" size={12} color="#059669" />
                    <Text style={styles.autoMatchText}>Auto-Match Amount</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Note / Coin Tab Switcher */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'notes' && styles.tabItemActive]}
                  onPress={() => setActiveTab('notes')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color={activeTab === 'notes' ? '#059669' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabItemText,
                      activeTab === 'notes' && styles.tabItemTextActive,
                    ]}
                  >
                    Currency Notes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'coins' && styles.tabItemActive]}
                  onPress={() => setActiveTab('coins')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="disc-outline"
                    size={14}
                    color={activeTab === 'coins' ? '#059669' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabItemText,
                      activeTab === 'coins' && styles.tabItemTextActive,
                    ]}
                  >
                    Metal Coins
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Denominations Grid */}
              <View style={styles.denomGrid}>
                {activeTab === 'notes'
                  ? noteKeys.map((key) => {
                      const noteVal = NOTE_VALUES[key];
                      const inHand = availableNotes[key] || 0;
                      const selected = selectedNotes[key] || 0;
                      return (
                        <View
                          key={key}
                          style={[
                            styles.denomBox,
                            selected > 0 && styles.denomBoxSelected,
                          ]}
                        >
                          <View style={styles.denomLeft}>
                            <Text style={styles.denomLabel}>₹{noteVal}</Text>
                            <Text style={styles.denomInHand}>
                              {inHand} in hand
                            </Text>
                          </View>

                          <View style={styles.counterRow}>
                            <TouchableOpacity
                              style={[
                                styles.counterBtn,
                                selected === 0 && styles.counterBtnDisabled,
                              ]}
                              onPress={() => updateNoteCount(key, -1)}
                              disabled={selected === 0}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color={selected === 0 ? colors.textMuted : colors.textPrimary}
                              />
                            </TouchableOpacity>

                            <Text
                              style={[
                                styles.counterVal,
                                selected > 0 && styles.counterValActive,
                              ]}
                            >
                              {selected}
                            </Text>

                            <TouchableOpacity
                              style={styles.counterBtn}
                              onPress={() => updateNoteCount(key, 1)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Ionicons name="add" size={14} color="#059669" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  : coinKeys.map((key) => {
                      const coinVal = COIN_VALUES[key];
                      const inHand = availableCoins[key] || 0;
                      const selected = selectedCoins[key] || 0;
                      return (
                        <View
                          key={key}
                          style={[
                            styles.denomBox,
                            selected > 0 && styles.denomBoxSelected,
                          ]}
                        >
                          <View style={styles.denomLeft}>
                            <Text style={styles.denomLabel}>₹{coinVal}</Text>
                            <Text style={styles.denomInHand}>
                              {inHand} in hand
                            </Text>
                          </View>

                          <View style={styles.counterRow}>
                            <TouchableOpacity
                              style={[
                                styles.counterBtn,
                                selected === 0 && styles.counterBtnDisabled,
                              ]}
                              onPress={() => updateCoinCount(key, -1)}
                              disabled={selected === 0}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Ionicons
                                name="remove"
                                size={14}
                                color={selected === 0 ? colors.textMuted : colors.textPrimary}
                              />
                            </TouchableOpacity>

                            <Text
                              style={[
                                styles.counterVal,
                                selected > 0 && styles.counterValActive,
                              ]}
                            >
                              {selected}
                            </Text>

                            <TouchableOpacity
                              style={styles.counterBtn}
                              onPress={() => updateCoinCount(key, 1)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Ionicons name="add" size={14} color="#059669" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
              </View>

              {/* Selection Summary Banner */}
              {selectedTotal > 0 && (
                <View style={styles.summaryBanner}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {type === 'expense' ? 'Cash Deducted:' : 'Cash Received:'}
                    </Text>
                    <Text style={styles.summaryVal}>
                      {formatCurrency(selectedTotal)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {type === 'expense' ? 'Remaining In-Hand Cash:' : 'New In-Hand Cash:'}
                    </Text>
                    <Text
                      style={[
                        styles.summaryVal,
                        { color: type === 'expense' ? '#059669' : colors.income },
                      ]}
                    >
                      {formatCurrency(remainingOrNewCash)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={handleClear}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.clearText}>Clear Selection</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Denomination Update Toggle Switch */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>
                    {type === 'expense'
                      ? 'Reduce In-Hand Cash on Save'
                      : 'Increase In-Hand Cash on Save'}
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    Updates your live currency note counts automatically
                  </Text>
                </View>
                <Switch
                  value={shouldUpdateDenominations}
                  onValueChange={onToggleUpdateDenominations}
                  trackColor={{ false: colors.border, true: '#34D399' }}
                  thumbColor={shouldUpdateDenominations ? '#059669' : '#f4f3f4'}
                />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.25)',
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cashIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activePill: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(5, 150, 105, 0.12)',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: '#047857',
  },
  instructionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  autoMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  autoMatchText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: radii.md,
    padding: 3,
    marginVertical: spacing.xs,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radii.sm,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabItemTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  denomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  denomBox: {
    width: '48.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  denomBoxSelected: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  denomLeft: {
    flex: 1,
  },
  denomLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  denomInHand: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  counterBtn: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  counterVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    minWidth: 16,
    textAlign: 'center',
  },
  counterValActive: {
    color: '#059669',
  },
  summaryBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 3,
    marginTop: 2,
  },
  clearText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(5, 150, 105, 0.1)',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  toggleSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
});
