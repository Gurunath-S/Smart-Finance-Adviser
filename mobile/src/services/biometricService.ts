import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const BIOMETRICS_ENABLED_KEY = 'sfa_biometrics_enabled';
const BIOMETRICS_USER_KEY = 'sfa_biometrics_saved_user';
const BIOMETRICS_TOKEN_KEY = 'sfa_biometrics_saved_token';

export interface BiometricStatus {
  available: boolean;
  enrolled: boolean;
  biometricType: 'Fingerprint' | 'Face ID' | 'Iris' | 'Biometrics';
}

export const biometricService = {
  /**
   * Checks if the device has biometric hardware and enrolled fingerprints / face
   */
  async checkBiometricStatus(): Promise<BiometricStatus> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricStatus['biometricType'] = 'Biometrics';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'Iris';
      }

      return {
        available: hasHardware && isEnrolled,
        enrolled: isEnrolled,
        biometricType,
      };
    } catch (e) {
      console.warn('Biometric check failed:', e);
      return {
        available: false,
        enrolled: false,
        biometricType: 'Biometrics',
      };
    }
  },

  /**
   * Prompts the native fingerprint / Face ID modal
   */
  async authenticate(promptMessage: string = 'Scan fingerprint to access Smart Finance Adviser'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        return { success: true };
      }

      if (result.error === 'user_cancel' || result.error === 'app_cancel') {
        return { success: false, error: 'Authentication cancelled' };
      }

      return { success: false, error: result.warning || 'Biometric authentication failed' };
    } catch (err: any) {
      console.warn('Biometric authenticate error:', err);
      return { success: false, error: err?.message || 'Biometric error occurred' };
    }
  },

  /**
   * Saves user session credentials for quick biometric unlock
   */
  async saveBiometricSession(token: string, user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
      await SecureStore.setItemAsync(BIOMETRICS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(BIOMETRICS_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving biometric session:', e);
    }
  },

  /**
   * Retrieves saved biometric session
   */
  async getSavedBiometricSession(): Promise<{ token: string; user: User } | null> {
    try {
      const isEnabled = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
      if (isEnabled !== 'true') return null;

      const token = await SecureStore.getItemAsync(BIOMETRICS_TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(BIOMETRICS_USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        return { token, user };
      }
      return null;
    } catch (e) {
      console.warn('Error reading biometric session:', e);
      return null;
    }
  },

  /**
   * Checks whether the user has enabled biometric unlock
   */
  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Enables or disables biometrics
   */
  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
      } else {
        await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'false');
      }
    } catch (e) {
      console.warn('Error updating biometric setting:', e);
    }
  },

  /**
   * Clears saved biometric session
   */
  async clearBiometricSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRICS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRICS_USER_KEY);
    } catch {
      // Ignore
    }
  },
};
