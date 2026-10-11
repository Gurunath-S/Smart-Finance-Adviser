import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { api, updateApiBaseUrl, getDefaultApiUrl, getCustomApiUrl } from '../../services/api';
import { FormInput } from '../../components/common/FormInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

// Dynamically load native GoogleSignin module if available in binary (prevents TurboModuleRegistry crash in Expo Go)
let GoogleSignin: any = null;
let isSuccessResponse: (response: any) => boolean = () => false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = gModule.GoogleSignin;
  if (gModule.isSuccessResponse) {
    isSuccessResponse = gModule.isSuccessResponse;
  }
} catch {
  // Safe fallback in Expo Go
}

WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign-In outside the component
const googleWebClientId = 
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
  '896635394546-rjbo3k9a7fl1ugqbjr4orbuk9gphidk0.apps.googleusercontent.com';

const googleAndroidClientId = 
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
  '896635394546-nn6d85mv0rc39v6kjs1i8qkng62cijpa.apps.googleusercontent.com';

try {
  if (GoogleSignin && typeof GoogleSignin.configure === 'function') {
    GoogleSignin.configure({
      webClientId: googleWebClientId,
    });
  }
} catch {
  // Expo Go safe fallback
}

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isBiometricSubmitting, setIsBiometricSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  // Server Configuration State
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(api.defaults.baseURL || getDefaultApiUrl());
  const [inputApiUrl, setInputApiUrl] = useState(currentApiUrl);
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverTestStatus, setServerTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getCustomApiUrl();
      const target = saved || getDefaultApiUrl();
      setCurrentApiUrl(target);
      setInputApiUrl(target);
    })();
  }, []);

  const handleTestServerConnection = async () => {
    setIsTestingServer(true);
    setServerTestStatus(null);
    try {
      let target = inputApiUrl.trim().replace(/\/+$/, '');
      if (!target.endsWith('/api')) target = `${target}/api`;

      const testClient = api.create({
        baseURL: target,
        timeout: 6000,
      });

      await testClient.get('/auth/login').catch((err) => {
        if (err.response) return true;
        throw err;
      });

      setServerTestStatus({
        success: true,
        message: 'Backend server is reachable and responsive!',
      });
    } catch (e: any) {
      setServerTestStatus({
        success: false,
        message: `Could not reach ${inputApiUrl}. Please verify your PC and phone are on the same Wi-Fi.`,
      });
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleSaveServerUrl = async () => {
    try {
      await updateApiBaseUrl(inputApiUrl);
      const updated = api.defaults.baseURL || inputApiUrl;
      setCurrentApiUrl(updated);
      setIsServerModalVisible(false);
      setServerTestStatus(null);
      Alert.alert('Configuration Saved', `Active API URL updated to:\n${updated}`);
    } catch {
      Alert.alert('Error', 'Failed to save custom API URL.');
    }
  };

  const handleResetServerUrl = async () => {
    const def = getDefaultApiUrl();
    await updateApiBaseUrl(def);
    setCurrentApiUrl(def);
    setInputApiUrl(def);
    setIsServerModalVisible(false);
    setServerTestStatus(null);
    Alert.alert('Default Restored', `API URL restored to:\n${def}`);
  };

  const {
    login,
    loginWithGoogle,
    loginWithBiometrics,
    isBiometricsAvailable,
    isBiometricsEnabled,
    biometricType,
    savedBiometricUser,
    error: authError,
    clearError,
  } = useAuth();

  const redirectUri = makeRedirectUri({
    scheme: 'smartfinanceadviser',
  });

  // Automatically offer biometric unlock if previously enabled and saved session exists
  const hasPromptedBioRef = React.useRef(false);
  useEffect(() => {
    if (isBiometricsAvailable && isBiometricsEnabled && savedBiometricUser && !hasPromptedBioRef.current) {
      hasPromptedBioRef.current = true;
      const timer = setTimeout(() => {
        handleBiometricLogin();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isBiometricsAvailable, isBiometricsEnabled, savedBiometricUser]);

  const handleBiometricLogin = async () => {
    clearError();
    setIsBiometricSubmitting(true);
    await loginWithBiometrics();
    setIsBiometricSubmitting(false);
  };

  // Web and Expo Go compatible Google Auth hook
  const [_webRequest, webResponse, promptWebAsync] = Google.useIdTokenAuthRequest({
    clientId: googleWebClientId,
    androidClientId: googleAndroidClientId,
    scopes: ['profile', 'email'],
    redirectUri,
  });

  const handleGoogleToken = async (idToken: string) => {
    setIsGoogleSubmitting(true);
    await loginWithGoogle(idToken);
    setIsGoogleSubmitting(false);
  };

  useEffect(() => {
    if (webResponse?.type === 'success') {
      const idToken = webResponse.params?.id_token;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        setIsGoogleSubmitting(false);
      }
    } else if (webResponse?.type === 'dismiss' || webResponse?.type === 'error') {
      setIsGoogleSubmitting(false);
    }
  }, [webResponse]);

  const handleGooglePress = async () => {
    clearError();
    // Use WebBrowser auth session in Expo Go or Web environment
    if (Platform.OS === 'web' || !GoogleSignin || typeof GoogleSignin.hasPlayServices !== 'function') {
      setIsGoogleSubmitting(true);
      try {
        await promptWebAsync();
      } catch (err: any) {
        Alert.alert('Google Sign-In Error', err?.message || 'Google Sign-In failed');
        setIsGoogleSubmitting(false);
      }
      return;
    }
    
    try {
      setIsGoogleSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          await handleGoogleToken(idToken);
        } else {
          throw new Error('No ID token present in response!');
        }
      } else {
        // Sign-in cancelled or other non-error response
        setIsGoogleSubmitting(false);
      }
    } catch (error: any) {
      console.warn('Google Auth Error:', error);
      let errorMsg = error?.message || 'Authentication failed.';
      if (error?.code === '10' || error?.code === 10 || errorMsg.includes('DEVELOPER_ERROR')) {
        errorMsg = 'Configuration error (Code 10 / DEVELOPER_ERROR). Please ensure the build SHA-1 fingerprint is registered in Google Cloud Console.';
      }
      Alert.alert('Google Sign-In Error', errorMsg);
      setIsGoogleSubmitting(false);
    }
  };

  const validate = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};
    if (!usernameOrEmail.trim()) {
      errors.identifier = 'Please enter your username or email';
    }
    if (!password) {
      errors.password = 'Please enter your password';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    setIsSubmitting(true);
    await login(usernameOrEmail, password);
    setIsSubmitting(false);
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
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="wallet" size={36} color={colors.textInverse} />
            </View>
            <Text style={styles.brandTitle}>Smart Finance</Text>
            <Text style={styles.brandSubtitle}>Personal Finance & AI Wealth Adviser</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to track your wealth and advisory</Text>

            {authError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.expense} />
                <Text style={styles.errorBannerText}>{authError}</Text>
              </View>
            )}

            {/* Quick Biometric Unlock Card */}
            {isBiometricsAvailable && (savedBiometricUser || isBiometricsEnabled) && (
              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                disabled={isSubmitting || isGoogleSubmitting || isBiometricSubmitting}
                activeOpacity={0.8}
              >
                {isBiometricSubmitting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <View style={styles.biometricIconBadge}>
                      <Ionicons
                        name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.biometricTextWrap}>
                      <Text style={styles.biometricBtnTitle}>Unlock with {biometricType}</Text>
                      <Text style={styles.biometricBtnSub}>
                        {savedBiometricUser
                          ? `Fast sign-in as @${savedBiometricUser.username}`
                          : `Authenticate with your ${biometricType}`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </>
                )}
              </TouchableOpacity>
            )}

            <FormInput
              label="Username or Email"
              placeholder="e.g. johndoe or user@example.com"
              value={usernameOrEmail}
              onChangeText={(text) => {
                setUsernameOrEmail(text);
                if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: undefined });
              }}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="person-outline"
              error={fieldErrors.identifier}
            />

            <FormInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
              }}
              isPassword
              leftIcon="lock-closed-outline"
              error={fieldErrors.password}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isSubmitting}
              style={styles.loginBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGooglePress}
              disabled={isSubmitting || isGoogleSubmitting}
              activeOpacity={0.8}
            >
              {isGoogleSubmitting ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Server Endpoint Indicator */}
            <TouchableOpacity
              style={styles.serverRow}
              onPress={() => setIsServerModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="server-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.serverText} numberOfLines={1}>
                Server: {currentApiUrl}
              </Text>
              <Ionicons name="settings-outline" size={13} color={colors.brand} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server Endpoint Configuration Modal */}
      <Modal
        visible={isServerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsServerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server Address</Text>
              <TouchableOpacity onPress={() => setIsServerModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelp}>
              Enter your computer's local Wi-Fi IP address (port 5000) so your phone can reach the Node.js backend.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={inputApiUrl}
              onChangeText={setInputApiUrl}
              placeholder="http://10.99.147.130:5000/api"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {serverTestStatus && (
              <View
                style={[
                  styles.statusBox,
                  serverTestStatus.success ? styles.statusSuccess : styles.statusError,
                ]}
              >
                <Ionicons
                  name={serverTestStatus.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={serverTestStatus.success ? colors.income : colors.expense}
                />
                <Text
                  style={[
                    styles.statusText,
                    serverTestStatus.success ? styles.statusTextSuccess : styles.statusTextError,
                  ]}
                >
                  {serverTestStatus.message}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestServerConnection}
                disabled={isTestingServer}
              >
                {isTestingServer ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={16} color={colors.brand} />
                    <Text style={styles.testBtnText}>Test Ping</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveServerUrl}>
                <Text style={styles.saveModalBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetServerUrl}>
              <Text style={styles.resetBtnText}>Reset to Default (10.99.147.130)</Text>
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
    backgroundColor: colors.primaryDark,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: radii.xl,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.textInverse,
    fontWeight: '800',
  },
  brandSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xxl,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.expense,
    flex: 1,
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  googleIcon: {
    marginRight: spacing.sm,
  },
  googleBtnText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.bodyMedium,
    color: colors.brand,
    fontWeight: '700',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  biometricIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  biometricTextWrap: {
    flex: 1,
  },
  biometricBtnTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  biometricBtnSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  serverText: {
    ...typography.caption,
    color: colors.textTertiary,
    maxWidth: '80%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    marginBottom: spacing.md,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    ...typography.caption,
    flex: 1,
  },
  statusTextSuccess: {
    color: colors.income,
  },
  statusTextError: {
    color: colors.expense,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    gap: spacing.xs,
  },
  testBtnText: {
    ...typography.button,
    color: colors.brand,
    fontSize: 13,
  },
  saveModalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  saveModalBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 13,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  resetBtnText: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
