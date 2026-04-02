import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'avatar.png'],
      manifest: {
        name: 'AlgorithmCamp | Ziming\'s Algorithm Hub',
        short_name: 'AlgorithmCamp',
        description: 'Competitive programming portfolio featuring ML-powered network security projects, C++ implementations, and algorithm practice progress.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/AlgorithmCamp/',
        start_url: '/AlgorithmCamp/',
        icons: [
          {
            src: '/icons.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
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
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: '/AlgorithmCamp/',
  server: {
    port: 5173,
    proxy: {
      // Proxy /api requests to backend server during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      // Manual chunks for better code splitting
      output: {
        // Manual chunk splitting for vendor code
        manualChunks: (id) => {
          // Vue core packages
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vue-vendor'
          }
          // Vue Router
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router-vendor'
          }
          // Marked (markdown parser) - used only in BlogPost/ProblemDetail
          if (id.includes('node_modules/marked')) {
            return 'marked-vendor'
          }
          // Highlight.js - used only in BlogPost/ProblemDetail
          if (id.includes('node_modules/highlight.js')) {
            return 'highlight-vendor'
          }
          // PWA plugin
          if (id.includes('node_modules/vite-plugin-pwa') || id.includes('workbox-')) {
            return 'pwa-vendor'
          }
        }
      }
    }
  }
})
