import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    children: React.ReactNode;
    /** Duration in milliseconds before splash screen fades out */
    duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ children, duration = 2500 }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, duration);

        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration + 600); // 600ms for fade-out animation

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, [duration]);

    if (!isVisible) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Render children hidden behind splash so they can initialize */}
            <div style={{ display: isVisible ? 'none' : 'block' }}>{children}</div>

            {/* Splash Screen Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    opacity: isFading ? 0 : 1,
                    transition: 'opacity 0.6s ease-out',
                }}
            >
                {/* Logo Container */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '80px',
                    }}
                >
                    <img
                        src="/assets/images/logo.png"
                        alt="UCampus Logo"
                        style={{
                            width: '160px',
                            height: '160px',
                            objectFit: 'contain',
                            animation: 'splashLogoFadeIn 0.8s ease-out',
                        }}
                    />
                </div>

                {/* Bottom Section */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '60px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    {/* Spinner + Initializing Text */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '3px solid #e0e0e0',
                                borderTop: '3px solid #1F8505',
                                borderRadius: '50%',
                                animation: 'splashSpin 0.8s linear infinite',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '3px',
                                color: '#3d3d3d',
                                fontFamily: '"Inter", "Roboto", sans-serif',
                            }}
                        >
                            INITIALIZING
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        style={{
                            width: '220px',
                            height: '4px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                borderRadius: '4px',
                                background: 'linear-gradient(90deg, #1F8505, #48b74d, #1F8505)',
                                animation: `splashProgress ${duration}ms ease-in-out forwards`,
                            }}
                        />
                    </div>

                    {/* Version Text */}
                    <span
                        style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            letterSpacing: '1.5px',
                            color: '#a0978e',
                            fontFamily: '"Inter", "Roboto", sans-serif',
                            marginTop: '8px',
                        }}
                    >
                        VERSION 1.0.2 • POWERED BY CODEARTISAN
                    </span>
                </div>

                {/* Keyframe Animations */}
                <style>
                    {`
                        @keyframes splashSpin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes splashProgress {
                            0% { width: 0%; }
                            20% { width: 15%; }
                            50% { width: 45%; }
                            80% { width: 75%; }
                            100% { width: 100%; }
                        }
                        @keyframes splashLogoFadeIn {
                            0% { opacity: 0; transform: scale(0.8); }
                            100% { opacity: 1; transform: scale(1); }
                        }
                    `}
                </style>
            </div>
        </>
    );
};

export default SplashScreen;
