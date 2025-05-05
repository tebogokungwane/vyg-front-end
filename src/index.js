// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import UserProvider from './context/UserContextProvider'; // ✅ correct import

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider> {/* ✅ wrap App with UserProvider */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
