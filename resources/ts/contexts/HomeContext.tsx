import React, { createContext, useCallback, useContext, useRef } from 'react';

interface HomeContextType {
    triggerHomeRestart: () => void;
    onHomeRestart: (callback: () => void) => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const useHomeContext = () => {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error('useHomeContext must be used within a HomeProvider');
    }
    return context;
};

interface HomeProviderProps {
    children: React.ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
    const restartCallbacksRef = useRef<(() => void)[]>([]);

    const triggerHomeRestart = useCallback(() => {
        console.log('triggerHomeRestart called, callbacks:', restartCallbacksRef.current.length);
        restartCallbacksRef.current.forEach((callback) => {
            try {
                callback();
            } catch (error) {
                console.error('Error in home restart callback:', error);
            }
        });
    }, []);

    const onHomeRestart = useCallback((callback: () => void) => {
        // Clear previous callbacks and add the new one
        restartCallbacksRef.current = [callback];
        console.log('Home restart callback registered');
    }, []);

    const value: HomeContextType = {
        triggerHomeRestart,
        onHomeRestart,
    };

    return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};
