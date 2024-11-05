import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log('API_URL:', API_URL);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('Making request to:', `${API_URL}/api/login`);  // Add this log
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      console.log('Token obtained, making API request...');  // Add this log
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user: result.user })
      });
  
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to log in');
      }

      // Handle successful login
      console.log('Login successful, navigating to recommendations...');
      navigate('/recommendations');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;