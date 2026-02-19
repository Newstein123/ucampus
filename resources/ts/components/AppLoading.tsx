import React from 'react';

interface AppLoadingProps {
    /** If true, the loader takes the full viewport height. Default: true */
    fullHeight?: boolean;
}

const AppLoading: React.FC<AppLoadingProps> = ({ fullHeight = true }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: fullHeight ? '100vh' : '100%',
                minHeight: fullHeight ? undefined : '200px',
                gap: '20px',
            }}
        >
            {/* Logo with pulse animation */}
            <img
                src="/assets/images/logo.png"
                alt="UCampus"
                style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    animation: 'appLoadingPulse 1.5s ease-in-out infinite',
                }}
            />

            {/* Spinner */}
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid #e0e0e0',
                    borderTop: '3px solid #1F8505',
                    borderRadius: '50%',
                    animation: 'appLoadingSpin 0.8s linear infinite',
                }}
            />

            {/* Keyframe Animations */}
            <style>
                {`
                    @keyframes appLoadingPulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(0.95); }
                    }
                    @keyframes appLoadingSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default AppLoading;
