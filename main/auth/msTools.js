import msalInstance from './msalConfig.js';

async function login() {
    const loginRequest = {
        scopes: ['User.Read'],  // Microsoft Graph scope
    };

    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        console.log('Logged in:', loginResponse);
        // Get the access token to call Microsoft Graph
        const accessToken = loginResponse.accessToken;
        getUserInfo(accessToken);
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Use the access token to get the user's profile
async function getUserInfo(accessToken) {
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const user = await userResponse.json();
    console.log('User info:', user);
}
async function logout() {
    await msalInstance.logoutPopup();
}