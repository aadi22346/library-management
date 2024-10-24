import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* Wrap with AuthProvider */}
      <CartProvider> {/* Wrap with CartProvider */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);