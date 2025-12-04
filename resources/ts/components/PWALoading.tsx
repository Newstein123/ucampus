import React, { useEffect, useState } from 'react';
import { isPWA } from '../utils/pwa';

interface PWALoadingProps {
    children: React.ReactNode;
}

export const PWALoading: React.FC<PWALoadingProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isPWA()) return;

        const handleBeforeUnload = () => {
            setIsLoading(true);
        };

        const handleLoad = () => {
            setIsLoading(false);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('load', handleLoad);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    if (!isPWA()) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            {isLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#f7fafd',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
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
                    />
                    <div style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Loading...</div>
                    <style>
                        {`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}
                    </style>
                </div>
            )}
        </>
    );
};
