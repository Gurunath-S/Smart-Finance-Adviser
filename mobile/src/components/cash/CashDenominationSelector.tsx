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
  calculateChangeDenominations,
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
  // Optional Change Return states (when cash given > expense amount)
  changeNotes?: Partial<CashDenominationNotes>;
  onChangeChangeNotes?: (notes: Partial<CashDenominationNotes>) => void;
  changeCoins?: Partial<CashDenominationCoins>;
  onChangeChangeCoins?: (coins: Partial<CashDenominationCoins>) => void;
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
  changeNotes,
  onChangeChangeNotes,
  changeCoins,
  onChangeChangeCoins,
}) => {
  const [availableNotes, setAvailableNotes] = useState<CashDenominationNotes>(defaultNotes);
  const [availableCoins, setAvailableCoins] = useState<CashDenominationCoins>(defaultCoins);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'coins'>('notes');
  const [isCustomChangeOpen, setIsCustomChangeOpen] = useState<boolean>(false);
  const [activeChangeTab, setActiveChangeTab] = useState<'notes' | 'coins'>('notes');

  // Local fallback if parent doesn't provide change states
  const [localChangeNotes, setLocalChangeNotes] = useState<Partial<CashDenominationNotes>>({});
  const [localChangeCoins, setLocalChangeCoins] = useState<Partial<CashDenominationCoins>>({});
  const [isCustomChangeActive, setIsCustomChangeActive] = useState<boolean>(false);

  const effectiveChangeNotes = changeNotes !== undefined ? changeNotes : localChangeNotes;
  const setEffectiveChangeNotes = onChangeChangeNotes || setLocalChangeNotes;
  const effectiveChangeCoins = changeCoins !== undefined ? changeCoins : localChangeCoins;
  const setEffectiveChangeCoins = onChangeChangeCoins || setLocalChangeCoins;

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

  // Change amount calculation for expenses
  const changeDueAmount = useMemo(() => {
    if (type !== 'expense' || currentAmount <= 0 || selectedTotal <= currentAmount) {
      return 0;
    }
    return Math.round((selectedTotal - currentAmount) * 100) / 100;
  }, [type, currentAmount, selectedTotal]);

  // Standard auto-breakdown for change
  const standardChange = useMemo(() => {
    return calculateChangeDenominations(changeDueAmount);
  }, [changeDueAmount]);

  // Keep effective change synced with auto breakdown unless user has custom change active
  useEffect(() => {
    if (type === 'expense') {
      if (changeDueAmount > 0 && !isCustomChangeActive) {
        setEffectiveChangeNotes(standardChange.notes);
        setEffectiveChangeCoins(standardChange.coins);
      } else if (changeDueAmount === 0) {
        setEffectiveChangeNotes({});
        setEffectiveChangeCoins({});
        setIsCustomChangeActive(false);
        setIsCustomChangeOpen(false);
      }
    }
  }, [changeDueAmount, isCustomChangeActive, standardChange, type]);

  // Custom change total
  const customChangeTotal = useMemo(() => {
    return calculateCashTotal(effectiveChangeNotes, effectiveChangeCoins).totalCash;
  }, [effectiveChangeNotes, effectiveChangeCoins]);

  const updateNoteCount = (key: keyof CashDenominationNotes, delta: number) => {
    const current = selectedNotes[key] || 0;
    const next = Math.max(0, current + delta);
    const updated = { ...selectedNotes, [key]: next };
    onChangeSelectedNotes(updated);

    const newTotal = calculateCashTotal(updated, selectedCoins).totalCash;
    if (type === 'income') {
      if (onSyncAmountWithCash && newTotal > 0) {
        onSyncAmountWithCash(newTotal);
      }
    } else {
      // In expense mode, only auto-sync if user hasn't typed an amount yet
      if (onSyncAmountWithCash && (!currentAmount || currentAmount <= 0) && newTotal > 0) {
        onSyncAmountWithCash(newTotal);
      }
    }
  };

  const updateCoinCount = (key: keyof CashDenominationCoins, delta: number) => {
    const current = selectedCoins[key] || 0;
    const next = Math.max(0, current + delta);
    const updated = { ...selectedCoins, [key]: next };
    onChangeSelectedCoins(updated);

    const newTotal = calculateCashTotal(selectedNotes, updated).totalCash;
    if (type === 'income') {
      if (onSyncAmountWithCash && newTotal > 0) {
        onSyncAmountWithCash(newTotal);
      }
    } else {
      // In expense mode, only auto-sync if user hasn't typed an amount yet
      if (onSyncAmountWithCash && (!currentAmount || currentAmount <= 0) && newTotal > 0) {
        onSyncAmountWithCash(newTotal);
      }
    }
  };

  // Handlers for customizing change received
  const updateChangeNoteCount = (key: keyof CashDenominationNotes, delta: number) => {
    setIsCustomChangeActive(true);
    const current = effectiveChangeNotes[key] || 0;
    const next = Math.max(0, current + delta);
    setEffectiveChangeNotes({ ...effectiveChangeNotes, [key]: next });
  };

  const updateChangeCoinCount = (key: keyof CashDenominationCoins, delta: number) => {
    setIsCustomChangeActive(true);
    const current = effectiveChangeCoins[key] || 0;
    const next = Math.max(0, current + delta);
    setEffectiveChangeCoins({ ...effectiveChangeCoins, [key]: next });
  };

  const handleResetChangeToStandard = () => {
    setIsCustomChangeActive(false);
    setEffectiveChangeNotes(standardChange.notes);
    setEffectiveChangeCoins(standardChange.coins);
  };

  const handleAutoMatch = () => {
    if (currentAmount <= 0) return;
    const matched = autoSelectDenominationsForAmount(
      availableNotes,
      availableCoins,
      currentAmount,
      type === 'expense' // allow higher tender note if small change unavailable
    );
    onChangeSelectedNotes(matched.notes);
    onChangeSelectedCoins(matched.coins);
  };

  const handleClear = () => {
    onChangeSelectedNotes({});
    onChangeSelectedCoins({});
    setEffectiveChangeNotes({});
    setEffectiveChangeCoins({});
    setIsCustomChangeActive(false);
    setIsCustomChangeOpen(false);
  };

  const remainingOrNewCash = useMemo(() => {
    if (type === 'expense') {
      if (currentAmount > 0 && selectedTotal >= currentAmount) {
        // You give selectedTotal and get (selectedTotal - currentAmount) change back
        // The net cash reduction is currentAmount
        return Math.max(0, availableTotal - currentAmount);
      }
      return Math.max(0, availableTotal - selectedTotal);
    }
    return availableTotal + selectedTotal;
  }, [availableTotal, selectedTotal, currentAmount, type]);

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
                {type === 'expense'
                  ? changeDueAmount > 0
                    ? `Given: ${formatCurrency(selectedTotal)}`
                    : `Spend: ${formatCurrency(selectedTotal)}`
                  : `Add: ${formatCurrency(selectedTotal)}`}
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
                    ? 'Select cash notes/coins given (tendered):'
                    : 'Select cash notes/coins received:'}
                </Text>
                {currentAmount > 0 && selectedTotal === 0 && (
                  <TouchableOpacity
                    style={styles.autoMatchBtn}
                    onPress={handleAutoMatch}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="flash-outline" size={12} color="#059669" />
                    <Text style={styles.autoMatchText}>Auto-Select Cash</Text>
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

              {/* Quick option to sync expense amount if user wants exact matching */}
              {type === 'expense' && selectedTotal > 0 && currentAmount > 0 && selectedTotal !== currentAmount && (
                <TouchableOpacity
                  style={styles.syncLinkRow}
                  onPress={() => onSyncAmountWithCash && onSyncAmountWithCash(selectedTotal)}
                >
                  <Text style={styles.syncLinkText}>
                    Did this actually cost {formatCurrency(selectedTotal)}? Tap to change expense amount
                  </Text>
                </TouchableOpacity>
              )}

              {/* CHANGE RETURNED SECTION (When cash given > expense amount) */}
              {type === 'expense' && changeDueAmount > 0 && (
                <View style={styles.changeCard}>
                  <View style={styles.changeCardHeader}>
                    <View style={styles.changeHeaderLeft}>
                      <View style={styles.changeIconBadge}>
                        <Ionicons name="arrow-undo" size={14} color="#047857" />
                      </View>
                      <View>
                        <Text style={styles.changeCardTitle}>Change Returned to You</Text>
                        <Text style={styles.changeCardSubtitle}>
                          Given: <Text style={styles.boldText}>{formatCurrency(selectedTotal)}</Text> • Expense:{' '}
                          <Text style={styles.boldText}>{formatCurrency(currentAmount)}</Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.changeAmountBadge}>
                      <Text style={styles.changeAmountText}>+{formatCurrency(changeDueAmount)}</Text>
                    </View>
                  </View>

                  {/* Badges for Change Denominations */}
                  <View style={styles.changeBadgesWrap}>
                    {noteKeys.map((k) => {
                      const count = effectiveChangeNotes[k] || 0;
                      if (!count) return null;
                      return (
                        <View key={k} style={styles.changeBadge}>
                          <Ionicons name="cash-outline" size={11} color="#065F46" />
                          <Text style={styles.changeBadgeText}>
                            {count}× ₹{NOTE_VALUES[k]} note
                          </Text>
                        </View>
                      );
                    })}
                    {coinKeys.map((k) => {
                      const count = effectiveChangeCoins[k] || 0;
                      if (!count) return null;
                      return (
                        <View key={k} style={styles.changeBadge}>
                          <Ionicons name="disc-outline" size={11} color="#065F46" />
                          <Text style={styles.changeBadgeText}>
                            {count}× ₹{COIN_VALUES[k]} coin
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Text style={styles.changeHintText}>
                    💡 Your wallet will deduct {formatCurrency(selectedTotal)} given and automatically add back{' '}
                    {formatCurrency(changeDueAmount)} in change (Net deduction: -{formatCurrency(currentAmount)}).
                  </Text>

                  {/* Toggle Customize Change Received */}
                  <TouchableOpacity
                    style={styles.customizeToggleBtn}
                    onPress={() => setIsCustomChangeOpen(!isCustomChangeOpen)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isCustomChangeOpen ? 'chevron-up' : 'options-outline'}
                      size={13}
                      color="#047857"
                    />
                    <Text style={styles.customizeToggleText}>
                      {isCustomChangeOpen
                        ? 'Hide Custom Change Adjuster'
                        : isCustomChangeActive
                        ? 'Customized Change (Active) - Edit'
                        : 'Received different change? Customize'}
                    </Text>
                  </TouchableOpacity>

                  {/* Custom Change Adjuster Drawer */}
                  {isCustomChangeOpen && (
                    <View style={styles.customDrawer}>
                      <View style={styles.customDrawerHeader}>
                        <Text style={styles.customDrawerTitle}>Select Actual Change Received:</Text>
                        {isCustomChangeActive && (
                          <TouchableOpacity onPress={handleResetChangeToStandard}>
                            <Text style={styles.resetStandardText}>Reset Standard</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Tab Switcher for custom change */}
                      <View style={[styles.tabBar, { marginVertical: 4 }]}>
                        <TouchableOpacity
                          style={[
                            styles.tabItem,
                            activeChangeTab === 'notes' && styles.tabItemActive,
                          ]}
                          onPress={() => setActiveChangeTab('notes')}
                        >
                          <Text
                            style={[
                              styles.tabItemText,
                              activeChangeTab === 'notes' && styles.tabItemTextActive,
                            ]}
                          >
                            Change Notes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.tabItem,
                            activeChangeTab === 'coins' && styles.tabItemActive,
                          ]}
                          onPress={() => setActiveChangeTab('coins')}
                        >
                          <Text
                            style={[
                              styles.tabItemText,
                              activeChangeTab === 'coins' && styles.tabItemTextActive,
                            ]}
                          >
                            Change Coins
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Custom change grid */}
                      <View style={styles.denomGrid}>
                        {activeChangeTab === 'notes'
                          ? noteKeys.map((key) => {
                              const noteVal = NOTE_VALUES[key];
                              const cnt = effectiveChangeNotes[key] || 0;
                              return (
                                <View
                                  key={`chg-${key}`}
                                  style={[
                                    styles.denomBox,
                                    cnt > 0 && styles.denomBoxSelected,
                                    { width: '48%' },
                                  ]}
                                >
                                  <Text style={styles.denomLabel}>₹{noteVal}</Text>
                                  <View style={styles.counterRow}>
                                    <TouchableOpacity
                                      style={[
                                        styles.counterBtn,
                                        cnt === 0 && styles.counterBtnDisabled,
                                      ]}
                                      onPress={() => updateChangeNoteCount(key, -1)}
                                      disabled={cnt === 0}
                                    >
                                      <Ionicons name="remove" size={13} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterVal, cnt > 0 && styles.counterValActive]}>
                                      {cnt}
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.counterBtn}
                                      onPress={() => updateChangeNoteCount(key, 1)}
                                    >
                                      <Ionicons name="add" size={13} color="#059669" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })
                          : coinKeys.map((key) => {
                              const coinVal = COIN_VALUES[key];
                              const cnt = effectiveChangeCoins[key] || 0;
                              return (
                                <View
                                  key={`chg-${key}`}
                                  style={[
                                    styles.denomBox,
                                    cnt > 0 && styles.denomBoxSelected,
                                    { width: '48%' },
                                  ]}
                                >
                                  <Text style={styles.denomLabel}>₹{coinVal}</Text>
                                  <View style={styles.counterRow}>
                                    <TouchableOpacity
                                      style={[
                                        styles.counterBtn,
                                        cnt === 0 && styles.counterBtnDisabled,
                                      ]}
                                      onPress={() => updateChangeCoinCount(key, -1)}
                                      disabled={cnt === 0}
                                    >
                                      <Ionicons name="remove" size={13} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterVal, cnt > 0 && styles.counterValActive]}>
                                      {cnt}
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.counterBtn}
                                      onPress={() => updateChangeCoinCount(key, 1)}
                                    >
                                      <Ionicons name="add" size={13} color="#059669" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                      </View>

                      {/* Custom change balance indicator */}
                      <View style={styles.customStatusRow}>
                        <Text style={styles.customStatusText}>
                          Selected change: <Text style={styles.boldText}>{formatCurrency(customChangeTotal)}</Text>
                        </Text>
                        {customChangeTotal === changeDueAmount ? (
                          <View style={styles.validChangeTag}>
                            <Ionicons name="checkmark-circle" size={12} color="#059669" />
                            <Text style={styles.validChangeText}>Matches {formatCurrency(changeDueAmount)}</Text>
                          </View>
                        ) : (
                          <View style={styles.warnChangeTag}>
                            <Ionicons name="alert-circle" size={12} color="#D97706" />
                            <Text style={styles.warnChangeText}>
                              {customChangeTotal > changeDueAmount
                                ? `Over by ${formatCurrency(customChangeTotal - changeDueAmount)}`
                                : `Short by ${formatCurrency(changeDueAmount - customChangeTotal)}`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* EXACT TENDER BANNER (When cash given == expense amount) */}
              {type === 'expense' && selectedTotal > 0 && currentAmount > 0 && selectedTotal === currentAmount && (
                <View style={styles.exactTenderBanner}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.exactTenderText}>
                    Exact cash tendered ({formatCurrency(selectedTotal)}). No change returned.
                  </Text>
                </View>
              )}

              {/* PARTIAL TENDER BANNER (When cash given < expense amount) */}
              {type === 'expense' && selectedTotal > 0 && currentAmount > 0 && selectedTotal < currentAmount && (
                <View style={styles.partialTenderBanner}>
                  <Ionicons name="information-circle" size={14} color="#2563EB" />
                  <Text style={styles.partialTenderText}>
                    Tendered {formatCurrency(selectedTotal)} of {formatCurrency(currentAmount)} (Short by{' '}
                    {formatCurrency(currentAmount - selectedTotal)})
                  </Text>
                </View>
              )}

              {/* Selection Summary Banner */}
              {selectedTotal > 0 && (
                <View style={styles.summaryBanner}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {type === 'expense' ? 'Cash Tendered (Given):' : 'Cash Received:'}
                    </Text>
                    <Text style={styles.summaryVal}>
                      {formatCurrency(selectedTotal)}
                    </Text>
                  </View>

                  {type === 'expense' && changeDueAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Change Returned:</Text>
                      <Text style={[styles.summaryVal, { color: '#059669' }]}>
                        +{formatCurrency(changeDueAmount)}
                      </Text>
                    </View>
                  )}

                  {type === 'expense' && currentAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Net Expense Deducted:</Text>
                      <Text style={[styles.summaryVal, { color: colors.expense }]}>
                        -{formatCurrency(currentAmount)}
                      </Text>
                    </View>
                  )}

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
                      ? 'Update In-Hand Cash & Change'
                      : 'Increase In-Hand Cash on Save'}
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    {type === 'expense'
                      ? 'Deducts tendered notes and credits returned change automatically'
                      : 'Updates your live currency note counts automatically'}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  syncLinkRow: {
    marginTop: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  syncLinkText: {
    fontSize: 10,
    color: '#047857',
    textDecorationLine: 'underline',
  },
  changeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: '#34D399',
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: 6,
  },
  changeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  changeIconBadge: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  changeCardSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  changeAmountBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  changeAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  changeBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  changeHintText: {
    fontSize: 10,
    color: '#047857',
    lineHeight: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 6,
    borderRadius: radii.sm,
  },
  customizeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    marginTop: 2,
  },
  customizeToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  customDrawer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  customDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  customDrawerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  resetStandardText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  customStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  customStatusText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  validChangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  validChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  warnChangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  warnChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  exactTenderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  exactTenderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  partialTenderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  partialTenderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
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
