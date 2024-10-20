import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Ensure this path is correct

const Logout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                // Sign out from Firebase
                await signOut(auth);

                // Clear user data from local storage or any other storage
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');

                // Redirect to login page
                navigate('/login');
            } catch (error) {
                console.error('Error during logout:', error);
            }
        };

        logout();
    }, [navigate]);

    return (
        <div>
            Logging out...
        </div>
    );
};

export default Logout;