// PWA utility functions for handling iOS standalone mode

export const isStandalone = (): boolean => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
    );
};

export const isIOS = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isPWA = (): boolean => {
    return isStandalone() || (isIOS() && window.matchMedia('(display-mode: standalone)').matches);
};

export const navigateInPWA = (url: string): void => {
    if (isPWA()) {
        // For iOS PWA, use window.location.href to maintain standalone mode
        // Ensure we're in the same origin to maintain PWA context
        if (url.startsWith('/') || url.startsWith(window.location.origin)) {
            window.location.href = url;
        } else {
            // For external links, open in new tab to maintain PWA context
            window.open(url, '_blank');
        }
    } else {
        // Use regular navigation for browser mode
        window.location.href = url;
    }
};

export const replaceInPWA = (url: string): void => {
    if (isPWA()) {
        // For iOS PWA, use window.location.replace to maintain standalone mode
        // Ensure we're in the same origin to maintain PWA context
        if (url.startsWith('/') || url.startsWith(window.location.origin)) {
            window.location.replace(url);
        } else {
            // For external links, open in new tab to maintain PWA context
            window.open(url, '_blank');
        }
    } else {
        // Use regular replace for browser mode
        window.location.replace(url);
    }
};

// Add PWA-specific meta tags for iOS
export const addPWAMetaTags = (): void => {
    if (typeof document !== 'undefined') {
        // Add viewport meta tag for iOS PWA
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.setAttribute('name', 'viewport');
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

        // Add apple-mobile-web-app-capable meta tag
        let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (!appleMeta) {
            appleMeta = document.createElement('meta');
            appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
            document.head.appendChild(appleMeta);
        }
        appleMeta.setAttribute('content', 'yes');

        // Add apple-mobile-web-app-title meta tag
        let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (!appleTitleMeta) {
            appleTitleMeta = document.createElement('meta');
            appleTitleMeta.setAttribute('name', 'apple-mobile-web-app-title');
            document.head.appendChild(appleTitleMeta);
        }
        appleTitleMeta.setAttribute('content', 'UCampus');

        // Add apple-mobile-web-app-status-bar-style meta tag
        let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!statusBarMeta) {
            statusBarMeta = document.createElement('meta');
            statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
            document.head.appendChild(statusBarMeta);
        }
        statusBarMeta.setAttribute('content', 'default');
    }
};

// Handle PWA navigation for React Router
export const handlePWARouterNavigation = (to: string, replace = false): void => {
    if (isPWA()) {
        // In PWA mode, use window.location to maintain standalone mode
        if (replace) {
            window.location.replace(to);
        } else {
            window.location.href = to;
        }
    } else {
        // In browser mode, let React Router handle navigation
        // This will be handled by the calling component
    }
};

// Force PWA mode detection for iOS
export const forcePWAModeDetection = (): void => {
    if (isIOS()) {
        // Add a class to body for iOS PWA styling
        document.body.classList.add('ios-pwa');
        
        // Check if we're in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-standalone');
        }
        
        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('pwa-standalone');
            } else {
                document.body.classList.remove('pwa-standalone');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
    }
};

// Add PWA-specific event listeners
export const addPWAEventListeners = (): void => {
    if (typeof window !== 'undefined') {
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
            if (document.visibilityState === 'visible' && isPWA()) {
                console.log('PWA became visible');
                // Refresh data if needed
            }
        });

        // Handle page visibility for iOS PWA
        if (isIOS()) {
            document.addEventListener('pageshow', (event) => {
                if ((event as any).persisted) {
                    console.log('Page restored from bfcache');
                    // Refresh data if needed
                }
            });
        }
    }
};
