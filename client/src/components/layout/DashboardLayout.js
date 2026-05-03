import React, { useState } from 'react';
import MainLayout from './MainLayout';
import Dashboard from '../features/Dashboard';
import Income from '../features/Income';
import Expenses from '../features/Expenses';
import ViewTransactions from '../features/ViewTransactions';
import FinancialSuggestion from '../features/FinancialSuggestion';
import Budget from '../features/Budget';
import Profile from '../../features/profile/Profile';

function DashboardLayout() {
  const [active, setActive] = useState(1);

  const displayData = () => {
    switch (active) {
      case 1: return <Dashboard />;
      case 2: return <Income />;
      case 3: return <Expenses />;
      case 4: return <ViewTransactions />;
      case 5: return <FinancialSuggestion />;
      case 6: return <Budget />;
      case 7: return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout active={active} setActive={setActive}>
      {displayData()}
    </MainLayout>
  );
}

export default DashboardLayout;
