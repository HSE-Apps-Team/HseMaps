import * as msal from '/node_modules/@azure/msal-browser';

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: "e1b659fd-ab79-4f0a-ba10-a3e538f366f9",          // Azure AD Application (Client) ID
        authority: "https://login.microsoftonline.com/b678463e-d9fb-475f-8153-8dcfa896047d",  // Directory (Tenant) ID or 'common' for multi-tenant apps
        redirectUri: "http://localhost:3000",  // Your redirect URI
        clientSecret: "G498Q~wjAJDtsQQu-s9OGNuM5-b32bFD7DvQAa-p"
    },
    cache: {
        cacheLocation: 'sessionStorage',  // Store token in sessionStorage
        storeAuthStateInCookie: false,    // Set true for IE 11 compatibility
    }
};

// Create MSAL instance
const msalInstance = new msal.PublicClientApplication(msalConfig);

export default msalInstance;