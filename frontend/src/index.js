import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App';
import { GlobalProvider } from './context/globalContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Nav from './nav';
import App from './into'
import Homelog from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <GlobalProvider>

      {/* <App/> */}
      <Nav />
    </GlobalProvider>
  </React.StrictMode>
);

