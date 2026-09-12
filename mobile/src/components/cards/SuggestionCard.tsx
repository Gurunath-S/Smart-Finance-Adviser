import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/theme';

interface SuggestionCardProps {
  suggestion: string;
  index: number;
  style?: ViewStyle;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  index,
  style,
}) => {
  const getIconForIndex = (i: number): keyof typeof Ionicons.glyphMap => {
    const icons: (keyof typeof Ionicons.glyphMap)[] = [
      'bulb-outline',
      'shield-checkmark-outline',
      'trending-up-outline',
      'cash-outline',
      'analytics-outline',
    ];
    return icons[i % icons.length];
  };

  return (
    <View style={[styles.card, shadows.sm, style]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={getIconForIndex(index)} size={20} color={colors.brand} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Point {index + 1}</Text>
        </View>
      </View>
      <Text style={styles.text}>{suggestion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.brand,
    fontSize: 11,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
