import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ||  "http://localhost:5000";
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

      if (response.ok) {
        navigate('/user-dashboard');
      } else {
        console.error('Failed to login:', response.statusText);
        setError('Failed to login. Please try again.');
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login to Intelligent Library
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
          } text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center`}
        >
          {isLoading ? (
            <span className="animate-pulse">Signing in...</span>
          ) : (
            <>
              <LogIn className="mr-2" />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;