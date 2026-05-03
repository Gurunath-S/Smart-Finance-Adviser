import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalProvider } from './context/globalContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Nav from './nav';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalProvider>
      <AuthProvider>
        <ThemeProvider>
          <Nav />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </ThemeProvider>
      </AuthProvider>
    </GlobalProvider>
  </React.StrictMode>
);
