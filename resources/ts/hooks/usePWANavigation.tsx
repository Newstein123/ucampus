import { useNavigate as useReactRouterNavigate } from 'react-router-dom';
import { isPWA, navigateInPWA, replaceInPWA } from '../utils/pwa';

export const usePWANavigation = () => {
    const navigate = useReactRouterNavigate();

    const pwaNavigate = (to: string, options?: { replace?: boolean }) => {
        if (isPWA()) {
            // Show loading indicator for PWA navigation
            const loadingElement = document.createElement('div');
            loadingElement.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #f7fafd;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    gap: 16px;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #e0e0e0;
                        border-top: 4px solid #1F8505;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <div style="color: #666; font-size: 16px; font-weight: 500;">
                        Loading...
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            `;
            document.body.appendChild(loadingElement);

            // For PWA mode, use window.location to maintain standalone mode
            setTimeout(() => {
                if (options?.replace) {
                    replaceInPWA(to);
                } else {
                    navigateInPWA(to);
                }
            }, 100);
        } else {
            // For browser mode, use React Router navigation
            if (options?.replace) {
                navigate(to, { replace: true });
            } else {
                navigate(to);
            }
        }
    };

    return pwaNavigate;
};
