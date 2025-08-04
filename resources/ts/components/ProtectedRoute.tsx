import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { usePWANavigation } from '../hooks/usePWANavigation';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { isPWA } from '../utils/pwa';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/login' }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const location = useLocation();
    const pwaNavigate = usePWANavigation();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        if (isPWA()) {
            // For PWA mode, use window.location to maintain standalone mode
            window.location.href = redirectTo;
            return null;
        }
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If authenticated but user data is not loaded yet
    if (!user) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f7fafd',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #1F8505',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }}
                ></div>
                <div style={{ color: '#666', fontSize: '16px' }}>Loading...</div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // If all checks pass, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
