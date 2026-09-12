import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { api, updateApiBaseUrl, getDefaultApiUrl, getCustomApiUrl } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { theme } from '../../theme/theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUserAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // API Config Modal state
  const [isApiModalVisible, setIsApiModalVisible] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(api.defaults.baseURL || getDefaultApiUrl());
  const [inputApiUrl, setInputApiUrl] = useState(currentApiUrl);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getCustomApiUrl();
      if (saved) {
        setCurrentApiUrl(saved);
        setInputApiUrl(saved);
      } else {
        const def = getDefaultApiUrl();
        setCurrentApiUrl(def);
        setInputApiUrl(def);
      }
    })();
  }, []);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are needed to select a profile picture.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        setIsUploading(true);

        const mimeType = asset.mimeType || 'image/jpeg';
        const fileName = asset.fileName || 'profile.jpg';

        const res = await userService.updateProfileImage(asset.uri, mimeType, fileName);
        if (res.profileImage) {
          updateUserAvatar(res.profileImage);
          Alert.alert('Success', 'Profile image updated successfully!');
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Upload Failed',
        err.response?.data?.message || err.message || 'Unable to update profile image.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      let testTarget = inputApiUrl.trim();
      if (testTarget.endsWith('/')) testTarget = testTarget.slice(0, -1);
      if (!testTarget.endsWith('/api')) testTarget = `${testTarget}/api`;

      // Ping health or get-incomes / auth endpoint with small timeout
      const testClient = api.create({
        baseURL: testTarget,
        timeout: 5000,
      });
      // Ping the auth endpoint or any endpoint
      await testClient.get('/auth/login').catch((err) => {
        // Method Not Allowed (404/405) still means server is reachable
        if (err.response) return true;
        throw err;
      });

      setTestStatus({
        tested: true,
        success: true,
        message: 'Backend server is reachable and responsive!',
      });
    } catch (e: any) {
      setTestStatus({
        tested: true,
        success: false,
        message: `Could not reach ${inputApiUrl}. Please verify host & port.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiUrl = async () => {
    try {
      await updateApiBaseUrl(inputApiUrl);
      setCurrentApiUrl(api.defaults.baseURL || inputApiUrl);
      setIsApiModalVisible(false);
      setTestStatus(null);
      Alert.alert('Configuration Saved', `Active API URL updated to:\n${api.defaults.baseURL}`);
    } catch {
      Alert.alert('Error', 'Failed to save custom API URL.');
    }
  };

  const handleResetApiUrl = async () => {
    const def = getDefaultApiUrl();
    await updateApiBaseUrl(def);
    setCurrentApiUrl(def);
    setInputApiUrl(def);
    setIsApiModalVisible(false);
    setTestStatus(null);
    Alert.alert('Default Restored', `API URL restored to:\n${def}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of Smart Finance Adviser?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account & Settings</Text>
          <Text style={styles.headerSubtitle}>Manage credentials, endpoints, and preferences</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.username)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickImage}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || 'Finance Member'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@smartfinance.ai'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
                size={12}
                color={colors.primary}
              />
              <Text style={styles.roleText}>
                {user?.role === 'admin' ? 'ADMINISTRATOR' : 'PERSONAL ACCOUNT'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.prefIconBox}>
              <Ionicons name="cash-outline" size={20} color={colors.income} />
            </View>
            <View style={styles.prefTextBox}>
              <Text style={styles.prefLabel}>Default Currency</Text>
              <Text style={styles.prefSub}>Indian Rupee (₹ INR)</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>₹ Lakhs / Cr</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.preferenceRow}
            onPress={() => setIsApiModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.prefIconBox}>
              <Ionicons name="server-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.prefTextBox}>
              <Text style={styles.prefLabel}>Backend Server Endpoint</Text>
              <Text style={styles.prefSub} numberOfLines={1}>
                {currentApiUrl}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.preferenceRow}>
            <View style={styles.prefIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.prefTextBox}>
              <Text style={styles.prefLabel}>Token Storage</Text>
              <Text style={styles.prefSub}>Hardware Encrypted (SecureStore)</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={colors.income} />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Application</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client Engine</Text>
            <Text style={styles.infoValue}>Smart Finance Adviser v1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Runtime</Text>
            <Text style={styles.infoValue}>Expo SDK 57 (React Native)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend Architecture</Text>
            <Text style={styles.infoValue}>Node.js / Express / MongoDB</Text>
          </View>
        </View>

        {/* Logout Action */}
        <View style={styles.logoutContainer}>
          <SecondaryButton
            title="Log Out of Account"
            onPress={handleLogout}
            icon="log-out-outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* API Endpoint Configuration Modal */}
      <Modal
        visible={isApiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsApiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API Server Endpoint</Text>
              <TouchableOpacity onPress={() => setIsApiModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelp}>
              Configure the REST API endpoint used by the mobile app to communicate with your backend server.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Base URL</Text>
              <TextInput
                style={styles.textInput}
                value={inputApiUrl}
                onChangeText={setInputApiUrl}
                placeholder="http://192.168.1.100:5000/api"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {testStatus && (
              <View
                style={[
                  styles.testStatusCard,
                  testStatus.success ? styles.testStatusSuccess : styles.testStatusError,
                ]}
              >
                <Ionicons
                  name={testStatus.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={testStatus.success ? colors.income : colors.expense}
                />
                <Text
                  style={[
                    styles.testStatusText,
                    testStatus.success ? styles.testSuccessText : styles.testErrorText,
                  ]}
                >
                  {testStatus.message}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="pulse-outline" size={16} color={colors.primary} />
                    <Text style={styles.testButtonText}>Test Connection</Text>
                  </>
                )}
              </TouchableOpacity>

              <PrimaryButton
                title="Save & Apply"
                onPress={handleSaveApiUrl}
                style={styles.saveButton}
              />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={handleResetApiUrl}>
              <Text style={styles.resetButtonText}>Reset to Default (Localhost / 10.0.2.2)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  roleText: {
    ...typography.badge,
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  prefIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  prefTextBox: {
    flex: 1,
  },
  prefLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  prefSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: colors.incomeLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgePillText: {
    ...typography.captionBold,
    color: colors.income,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  logoutContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.expense,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  modalHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  testStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  testStatusSuccess: {
    backgroundColor: colors.incomeLight,
  },
  testStatusError: {
    backgroundColor: colors.expenseLight,
  },
  testStatusText: {
    ...typography.caption,
    flex: 1,
  },
  testSuccessText: {
    color: colors.income,
  },
  testErrorText: {
    color: colors.expense,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
    height: 48,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resetButtonText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
});
