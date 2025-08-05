import { useNavigate } from 'react-router-dom';
import { isPWA } from '../utils/pwa';

export const usePWANavigation = () => {
    const navigate = useNavigate();

    const pwaNavigate = (to: string, options?: { replace?: boolean }) => {
        console.log('PWA Navigation called:', { to, options, isPWA: isPWA() });
        
        if (isPWA()) {
            // In PWA mode, use window.location to maintain standalone mode
            try {
                if (options?.replace) {
                    window.location.replace(to);
                } else {
                    window.location.href = to;
                }
                console.log('PWA navigation executed');
            } catch (error) {
                console.error('PWA navigation failed:', error);
                // Fallback to React Router
                if (options?.replace) {
                    navigate(to, { replace: true });
                } else {
                    navigate(to);
                }
            }
        } else {
            // In browser mode, use React Router navigation
            if (options?.replace) {
                navigate(to, { replace: true });
            } else {
                navigate(to);
            }
            console.log('Browser navigation executed');
        }
    };

    return { navigate: pwaNavigate };
};
