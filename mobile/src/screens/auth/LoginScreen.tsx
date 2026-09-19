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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FormInput } from '../../components/common/FormInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  const { login, loginWithGoogle, error: authError, clearError } = useAuth();

  const googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '896635394546-rjbo3k9a7fl1ugqbjr4orbuk9gphidk0.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || googleClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      '896635394546-nn6d85mv0rc39v6kjs1i8qkng62cijpa.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleToken(id_token);
      }
    } else if (response?.type === 'error') {
      console.warn('Google Auth Error:', response.error);
      Alert.alert('Google Sign-In Error', response.error?.message || 'Authentication failed. Please check Google Cloud settings.');
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setIsGoogleSubmitting(true);
    await loginWithGoogle(idToken);
    setIsGoogleSubmitting(false);
  };

  const handleGooglePress = async () => {
    clearError();
    const clientId =
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      googleClientId;
    if (!clientId) {
      Alert.alert(
        'Google Sign-In',
        'Google OAuth Client ID is not configured yet. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in mobile/.env.'
      );
      return;
    }
    if (request) {
      promptAsync();
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
});
