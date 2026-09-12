import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="wallet" size={42} color={colors.white} />
        </View>
        <Text style={styles.appTitle}>Smart Finance Adviser</Text>
        <Text style={styles.appSubtitle}>Personal Financial Intelligence</Text>
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={styles.spinner}
        />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appTitle: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  appSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 36,
  },
});
