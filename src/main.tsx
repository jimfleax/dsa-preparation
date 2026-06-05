import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ClerkProvider} from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is missing. Add it to your .env file.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#4f46e5', // Indigo-600 — matches the app's design system
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-white rounded-2xl shadow-lg border border-neutral-100',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm font-bold rounded-xl',
          footerActionLink: 'text-indigo-600 hover:text-indigo-700 font-semibold',
          formFieldInput: 'rounded-xl border-neutral-200 focus:border-indigo-600 focus:ring-indigo-100',
          headerTitle: 'text-neutral-900 font-bold',
          headerSubtitle: 'text-neutral-500',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
