import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { AddIncomeScreen } from '../screens/income/AddIncomeScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { SuggestionsScreen } from '../screens/suggestions/SuggestionsScreen';
import { SIPCalculatorScreen } from '../screens/calculators/SIPCalculatorScreen';
import { SWPCalculatorScreen } from '../screens/calculators/SWPCalculatorScreen';
import { FDCalculatorScreen } from '../screens/calculators/FDCalculatorScreen';
import { MutualFundCalculatorScreen } from '../screens/calculators/MutualFundCalculatorScreen';
import { PPFCalculatorScreen } from '../screens/calculators/PPFCalculatorScreen';
import { GoldCalculatorScreen } from '../screens/calculators/GoldCalculatorScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
      <Stack.Screen name="SIPCalculator" component={SIPCalculatorScreen} />
      <Stack.Screen name="SWPCalculator" component={SWPCalculatorScreen} />
      <Stack.Screen name="FDCalculator" component={FDCalculatorScreen} />
      <Stack.Screen name="MutualFundCalculator" component={MutualFundCalculatorScreen} />
      <Stack.Screen name="PPFCalculator" component={PPFCalculatorScreen} />
      <Stack.Screen name="GoldCalculator" component={GoldCalculatorScreen} />
    </Stack.Navigator>
  );
};
