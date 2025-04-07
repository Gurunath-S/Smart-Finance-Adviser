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
import { useGlobalContext } from './context/globalContext';
import Homelog from './App';
function SideNav() {
  const [active, setActive] = useState(1)

  const global = useGlobalContext()
  console.log(global);

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
      default:
        return <Dashboard />
        
    }
  }

  const orbMemo = useMemo(() => {
    return <Orb />
  },[])

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
  ${'' /* background-image: url(${props => props.bg}); */}
  ${'' /* background: rgba(250, 229, 250, 0.6); */}
  position: relative;
  main{
    flex: 1;
    background: rgba(250, 229, 250, 0.6);
    border: 3px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    overflow-x: hidden;
    &::-webkit-scrollbar{
      width: 0;
    }
  }
`;

export default SideNav;
