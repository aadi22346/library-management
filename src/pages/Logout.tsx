import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Logout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await signOut(auth);
                localStorage.clear(); // Clear all local storage
                navigate('/login');
            } catch (error) {
                console.error('Error during logout:', error);
                // Even if there's an error, try to navigate to login
                navigate('/login');
            }
        };

        logout();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-lg">Logging out...</div>
        </div>
    );
};

export default Logout;