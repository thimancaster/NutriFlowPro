
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedTestimonials } from './utils/seedTestimonials';

// Seed testimonials when the app starts in development
if (import.meta.env.DEV) {
  seedTestimonials().catch(console.error);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
