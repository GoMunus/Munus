import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './types/google.d.ts';

// Load Google APIs
const loadGoogleAPIs = () => {
  // Google API client library
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.async = true;
  gapiScript.defer = true;
  document.head.appendChild(gapiScript);

  // Google OAuth2 client library
  const oauthScript = document.createElement('script');
  oauthScript.src = 'https://accounts.google.com/gsi/client';
  oauthScript.async = true;
  oauthScript.defer = true;
  document.head.appendChild(oauthScript);
};

// Load Google APIs when the app starts
loadGoogleAPIs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
