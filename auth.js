const express = require('express');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const app = express();
const port = 3000;

// Replace with your Azure App registration details
const CLIENT_ID = 'e1b659fd-ab79-4f0a-ba10-a3e538f366f9';
const TENANT_ID = 'b678463e-d9fb-475f-8153-8dcfa896047d';
const REDIRECT_URI = 'http://localhost:3000';  // Adjust this to your redirect URI

// Set up MSAL Node application
const cca = new ConfidentialClientApplication({
  auth: {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
});

// Define the scopes you need access to
const SCOPES = ['user.read'];

app.get('/', (req, res) => {
  res.send(`<a href="/login">Login with Microsoft</a>`);
});

// Redirect to Microsoft Login Page
app.get('/login', (req, res) => {
  const authUrlParams = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
  };

  cca.getAuthCodeUrl(authUrlParams)
    .then((authUrl) => {
      res.redirect(authUrl);
    })
    .catch((error) => {
      console.log('Error getting auth URL', error);
      res.status(500).send('Error occurred');
    });
});

// Handle the redirect after Microsoft Login
app.get('/redirect', (req, res) => {
  const tokenRequest = {
    code: req.query.code,  // This code is returned by Microsoft after login
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
  };

  cca.acquireTokenByCode(tokenRequest)
    .then((response) => {
      console.log('Access Token:', response.accessToken);
      res.send(`<h1>Login Successful</h1><p>Access Token: ${response.accessToken}</p>`);
    })
    .catch((error) => {
      console.log('Error exchanging code for token', error);
      res.status(500).send('Error occurred');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});