import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

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
          includeAssets:['favicon.ico', "apple-touc-icon.png", "masked-icon.svg"],
            manifest: {
              name: 'U Campus',
              short_name: 'UCampus',
              description: 'A collaborative platform for Myanmar youth to share and develop social good ideas',
              theme_color: '#1F8505',
              background_color: '#f7fafd',
              display: 'standalone',
              start_url: '/',
              icons:[{
                src: '/assets/images/android-chrome-192x192.png',
                sizes:'192x192',
                type:'image/png',
                purpose:'favicon'
              },
              {
                src:'/assets/images/android-chrome-512x512.png',
                sizes:'512x512',
                type:'image/png',
                purpose:'favicon'
              },
              {
                src: '/assets/images/apple-touch-icon.png',
                sizes:'180x180',
                type:'image/png',
                purpose:'apple touch icon',
              },
              {
                src: '/assets/images/maskable_icon.png',
                sizes:'512x512',
                type:'image/png',
                purpose:'any maskable',
              }
            ],
            },
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
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
