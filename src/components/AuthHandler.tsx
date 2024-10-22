import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        localStorage.clear(); // Clear all local storage
        navigate('/login');
      } catch {
        console.error('Error during logout');
      }
    };

    // Check server health and Firebase auth state
    const checkServerAndAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (!response.ok) {
          console.log('Server is down, logging out...');
          await performLogout();
        }
      } catch {
        console.log('Server is unreachable, logging out...');
        await performLogout();
      }
    };

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    // Check server health immediately and then every 5 seconds
    checkServerAndAuth();
    const intervalId = setInterval(checkServerAndAuth, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default AuthHandler;