import { DataModule } from './modules/DataModule.js';
import { EventHandlingModule } from './modules/EventHandlingModule.js';
import { StreetViewModule } from './modules/StreetViewModule.js';
import { UtilityModule } from './modules/UtilityModule.js';
import React from 'react';  // Import React from 'react' (no need to specify node_modules)
import ReactDOM from 'react-dom/client';  // Same for react-dom/client
import App from '../src/App';  // Correct path to the App component

import { devTestingModule } from './modules/devTestingModule.js'; 
import { PublicClientApplication } from '@azure/msal-browser';  // Use the package name directly
import { MsalProvider } from '@azure/msal-react';  // Same here
import { msalConfig } from '../src/Auth/authConfig';  // Adjust the path if necessary

// Initialize application
(async () => {
    try {
        await DataModule.initialize();
        
        // Expose necessary functions to global scope
        Object.assign(window, {
            markShortestPathFromInput: EventHandlingModule.markShortestPathFromInput,
            navSchedule: EventHandlingModule.navSchedule,
            updateAgent: UtilityModule.updateAgent,
            getImg: StreetViewModule.getImg
        });
        
        window.addEventListener('resize', UtilityModule.configureScroll);
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
})();

//########################################################################################################

const msalInstance = new PublicClientApplication(msalConfig);

// Assuming you have an element with id 'root' in your public/index.html file

let root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);