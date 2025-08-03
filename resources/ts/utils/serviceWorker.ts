// Service worker utilities for PWA

export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            console.log('Service Worker registered successfully:', registration);

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('New service worker available');
                        }
                    });
                }
            });

            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};

// Handle PWA navigation to maintain standalone mode
export const handlePWANavigation = (url: string, replace = false) => {
    if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
        // In PWA standalone mode, use window.location to maintain the mode
        if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    } else {
        // In browser mode, use regular navigation
        if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    }
};

// Check if running in PWA standalone mode
export const isInStandaloneMode = () => {
    return (
        (window.navigator as any).standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches ||
        document.referrer.includes('android-app://')
    );
};

// Add PWA-specific event listeners
export const addPWAEventListeners = () => {
    // Handle beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt available');
        // Store the event for later use
        (window as any).deferredPrompt = e;
    });

    // Handle appinstalled event
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        // Clear the deferred prompt
        (window as any).deferredPrompt = null;
    });

    // Handle visibility change for PWA
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isInStandaloneMode()) {
            console.log('PWA became visible');
            // Refresh data if needed
        }
    });
};
