import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GlobalProvider } from './context/globalContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Nav from './nav';
import { GOOGLE_CLIENT_ID } from './config';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder-client-id"}>
      <GlobalProvider>
        <Nav />
      </GlobalProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

