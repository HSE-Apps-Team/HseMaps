import { DataModule } from './modules/DataModule.js';
import { UtilityModule } from './modules/UtilityModule.js';
import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './Auth/authConfig';

(async () => {
    try {
        await DataModule.initialize();
        window.addEventListener('resize', UtilityModule.configureScroll);
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
})();

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);