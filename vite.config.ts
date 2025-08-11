import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/ts/index.tsx'],
            ssr: 'resources/ts/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
          registerType:'autoUpdate',
          includeAssets:['favicon.ico', "apple-touch-icon.png", "masked-icon.svg"],
          injectRegister: 'auto',
          devOptions: {
            enabled: true
          },
            manifest: {
              name: 'U Campus',
              short_name: 'UCampus',
              description: 'A collaborative platform for Myanmar youth to share and develop social good ideas',
              theme_color: '#1F8505',
              background_color: '#f7fafd',
              display: 'standalone',
              start_url: '/',
              scope: '/',
              orientation: 'portrait',
              prefer_related_applications: false,
              categories: ['social', 'productivity', 'education'],
              lang: 'en',
              dir: 'ltr',
              icons:[
                {
                  src: '/assets/images/android-chrome-192x192.png',
                  sizes:'192x192',
                  type:'image/png',
                  purpose:'any'
                },
                {
                  src:'/assets/images/android-chrome-512x512.png',
                  sizes:'512x512',
                  type:'image/png',
                  purpose:'any'
                },
                {
                  src: '/assets/images/apple-touch-icon.png',
                  sizes:'180x180',
                  type:'image/png',
                  purpose:'any'
                },
                {
                  src: '/assets/images/maskable_icon.png',
                  sizes:'512x512',
                  type:'image/png',
                  purpose:'maskable'
                }
              ]
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
              navigateFallback: '/',
              navigateFallbackAllowlist: [/^(?!\/__).*/],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'google-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                    }
                  }
                },
                {
                  urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'gstatic-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                    }
                  }
                }
              ]
            }
        }),
    ],
    // server: {
    //   port: 5173,
    //   https: {
    //     key: fs.readFileSync('./infra/ssl/cert-key.pem'),
    //     cert: fs.readFileSync('./infra/ssl/cert.pem'),
    //   },
    //   proxy: {
    //     '/api': 'https://localhost',
    //   },
    // },
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        host: '192.168.1.100' // your local IP
      }
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
