import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import Onboarding from '../pages/Onboarding';
import Home from '../pages/Home';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
    console.log(isAuthenticated, user, loading);
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading...
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated but user data is not loaded yet
    if (!user) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading user data...
            </div>
        );
    }

    // If user hasn't completed onboarding, show onboarding
    if (!user.onboarding_completed) {
        return <Onboarding />;
    }

    // If user has completed onboarding, show the protected content (Home)
    return <Home />;
};

export default ProtectedRoute; 