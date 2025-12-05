import React, { createContext, useContext, useEffect, useState } from 'react';
import { addPWAMetaTags, isPWA } from '../utils/pwa';

interface PWAContextType {
    isPWA: boolean;
    isStandalone: boolean;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
    const context = useContext(PWAContext);
    if (context === undefined) {
        throw new Error('usePWA must be used within a PWAProvider');
    }
    return context;
};

interface PWAProviderProps {
    children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
    const [isPWAState, setIsPWAState] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize PWA meta tags
        addPWAMetaTags();

        // Check if running in PWA mode
        const checkPWAMode = () => {
            const pwaMode = isPWA();
            setIsPWAState(pwaMode);

            // Check if in standalone mode
            const standaloneMode =
                window.matchMedia('(display-mode: standalone)').matches ||
                ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
            setIsStandalone(standaloneMode);
        };

        checkPWAMode();

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = () => {
            checkPWAMode();
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const value: PWAContextType = {
        isPWA: isPWAState,
        isStandalone,
        isLoading,
        setLoading: setIsLoading,
    };

    return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};
