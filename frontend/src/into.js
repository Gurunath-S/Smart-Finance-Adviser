import React, {useState, useMemo} from 'react'
import styled from "styled-components";
import bg from './img/bg.png'
import {MainLayout} from './styles/Layouts'
import Orb from './Components/Orb/Orb'
import Navigation from './Components/Navigation/Navigation'
import Dashboard from './Components/Dashboard/Dashboard';
import Income from './Components/Income/Income'
import Expenses from './Components/Expenses/Expenses';
import AllHistory from './Components/ViewTransactions/ViewTransactions'
import FinancialSuggestion from './Components/FinancialSuggestion/FinancialSuggestion'
import Profile from './Components/Profile/Profile';
import Settings from './Components/Settings/Settings';

function SideNav() {
  const [active, setActive] = useState(1)

  const displayData = () => {
    switch(active){
      case 1:
        return <Dashboard />
      case 2:
        return <Income />
      case 3:
        return <Expenses />
      case 4:
        return <AllHistory/>
      case 5:
        return <FinancialSuggestion />
      case 6:
        return <Profile setActive={setActive} />
      case 7:
        return <Settings />
      default:
        return <Dashboard />
        
    }
  }

  const orbEnabled = localStorage.getItem("app_orb_enabled") !== "false";
  const orbMemo = useMemo(() => {
    return orbEnabled ? <Orb /> : null;
  },[orbEnabled])

  return (
    <AppStyled bg={bg} className="App">
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
  display: flex;
  flex-direction: column;

  @media (max-width: 992px) {
    height: auto;
    min-height: 100vh;
  }

  main {
    flex: 1;
    background: rgba(250, 229, 250, 0.6);
    border: 3px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    overflow-x: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(34, 34, 96, 0.2);
      border-radius: 10px;
    }

    @media (max-width: 992px) {
      border-radius: 20px;
      border: 2px solid #FFFFFF;
      overflow: visible;
      width: 100%;
    }

    @media (max-width: 576px) {
      border-radius: 16px;
      border: 1.5px solid #FFFFFF;
    }
  }
`;

export default SideNav;
