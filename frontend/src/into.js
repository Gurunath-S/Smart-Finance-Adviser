import React, { useState, useMemo } from 'react'
import styled from "styled-components";
import bg from './img/bg.png'
import { MainLayout } from './styles/Layouts'
import Orb from './Components/Orb/Orb'
import Navigation from './Components/Navigation/Navigation'
import Dashboard from './Components/Dashboard/Dashboard';
import Income from './Components/Income/Income'
import Expenses from './Components/Expenses/Expenses';
import AllHistory from './Components/ViewTransactions/ViewTransactions'
import FinancialSuggestion from './Components/FinancialSuggestion/FinancialSuggestion'
import Budget from './Components/Budget/Budget';
import Profile from './Profile';
import { useGlobalContext } from './context/globalContext';

function SideNav() {
  const [active, setActive] = useState(1)
  const { darkMode } = useGlobalContext();

  const displayData = () => {
    switch (active) {
      case 1: return <Dashboard />
      case 2: return <Income />
      case 3: return <Expenses />
      case 4: return <AllHistory />
      case 5: return <FinancialSuggestion />
      case 6: return <Budget />
      case 7: return <Profile />
      default: return <Dashboard />
    }
  }

  const orbMemo = useMemo(() => <Orb />, [])

  return (
    <AppStyled bg={bg} className={`App${darkMode ? ' dark' : ''}`}>
      {orbMemo}
      <MainLayout>
        <Navigation active={active} setActive={setActive} />
        <main>
          {displayData()}
        </main>
      </MainLayout>
    </AppStyled>
  );
}

const AppStyled = styled.div`
  height: 100vh;
  position: relative;
  background: var(--bg-body);
  transition: background 0.3s;

  main {
    flex: 1;
    background: var(--main-bg);
    border: 3px solid var(--main-border);
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    overflow-x: hidden;
    overflow-y: auto;
    transition: background 0.3s, border-color 0.3s;
    &::-webkit-scrollbar { width: 0; }
  }
`;

export default SideNav;
