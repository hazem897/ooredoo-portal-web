import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      selfDestroying: false,
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['favicon.svg', 'ooredoo_icon.png', 'ooredoo_logo.png', 'screenshots/*.png'],
      manifest: {
        name: 'Portail Interne Ooredoo',
        short_name: 'Ooredoo Portal',
        description: 'Application de gestion interne Ooredoo Fix Jdid - Accès rapide et notifications en temps réel.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ed1c24',
        orientation: 'portrait',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/ooredoo_icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/ooredoo_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Tableau de bord Ooredoo'
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Interface Mobile Ooredoo'
          }
        ],
        shortcuts: [
          {
            name: 'Tableau de Bord',
            short_name: 'Dashboard',
            description: 'Voir les statistiques et tickets',
            url: '/dashboard',
            icons: [{ src: '/ooredoo_icon.png', sizes: '192x192' }]
          },
          {
            name: 'Alertes',
            short_name: 'Alertes',
            description: 'Consulter les alertes récentes',
            url: '/alertes',
            icons: [{ src: '/ooredoo_icon.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})

