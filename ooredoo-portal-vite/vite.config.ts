import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'ooredoo_icon.png', 'ooredoo_logo.png'],
      manifest: {
        name: 'Portail Interne — Ooredoo Fix Jdid',
        short_name: 'Ooredoo Portal',
        description: 'Application mobile de gestion interne pour Ooredoo',
        theme_color: '#ed1c24',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
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
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
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

