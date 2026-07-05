import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const appSurface = process.env.VITE_APP_SURFACE || 'web'
const isDesktopSurface = appSurface === 'desktop' || appSurface === 'pos-desktop'
const isPackagedSurface = isDesktopSurface || appSurface === 'mobile'

// https://vite.dev/config/
export default defineConfig({
  base: isPackagedSurface ? './' : '/',
  plugins: [
    react(),
    ...(!isDesktopSurface ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Daurennan CRM',
        short_name: 'Daurennan',
        description: 'Daurennan Management CRM and POS',
        theme_color: '#f97316',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'icons.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })] : [])
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      'localhost',
      'frontend',
      'daurennan.kz',
      'www.daurennan.kz',
      '213.155.21.4',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
