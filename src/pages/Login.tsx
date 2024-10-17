import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to Intelligent Library</h1>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300 flex items-center justify-center"
        >
          <LogIn className="mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;