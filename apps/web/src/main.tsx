import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProviders } from './providers/AppProviders';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró #root');

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
