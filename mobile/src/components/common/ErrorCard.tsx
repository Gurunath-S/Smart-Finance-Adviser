import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={24} color={colors.expense} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.expense,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  retryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.expense,
    borderRadius: radii.sm,
    marginLeft: spacing.sm,
  },
  retryText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
});
