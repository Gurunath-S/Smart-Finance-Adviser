import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export const UpdatePromptModal: React.FC = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const lastCheckTime = useRef<number>(0);

  const checkForUpdate = async () => {
    // expo-updates is only active in production / standalone builds, not in __DEV__ or Expo Go
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    // Rate-limit checks to at most once every 5 minutes
    const now = Date.now();
    if (now - lastCheckTime.current < 5 * 60 * 1000) {
      return;
    }
    lastCheckTime.current = now;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        setModalVisible(true);
      }
    } catch (e) {
      // Gracefully ignore network or dev errors
      console.log('Update check skipped or failed:', e);
    }
  };

  useEffect(() => {
    // Initial check after app mount
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 2000);

    // Re-check when app returns from background
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkForUpdate();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  const handleApplyUpdate = async () => {
    try {
      setIsDownloading(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.warn('Failed to download or apply update:', error);
      setIsDownloading(false);
      setModalVisible(false);
    }
  };

  const handleDismiss = () => {
    setModalVisible(false);
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={modalVisible}
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={32} color={colors.brand} />
          </View>

          <Text style={styles.title}>Update Available!</Text>
          <Text style={styles.message}>
            A new version of Smart Finance Adviser is ready. Update now to get the latest features, improvements, and financial advisory models.
          </Text>

          {isDownloading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.loadingText}>Downloading update...</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.laterButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleApplyUpdate}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-down-circle" size={18} color={colors.textInverse} style={styles.btnIcon} />
                <Text style={styles.updateText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.brand,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  laterButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 6,
  },
  updateText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    fontWeight: '700',
  },
});
