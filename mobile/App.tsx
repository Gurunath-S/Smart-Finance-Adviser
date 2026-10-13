import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UpdatePromptModal } from './src/components/common/UpdatePromptModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TransactionProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
          <UpdatePromptModal />
        </TransactionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
