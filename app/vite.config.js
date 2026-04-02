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
        // Cache cleanup - remove old caches automatically
        cleanupOutdatedCaches: true,
        // Skip waiting to activate new service worker immediately
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // Google Fonts stylesheets - StaleWhileRevalidate for timely updates
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts webfonts - CacheFirst with long expiration
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // GitHub images - CacheFirst with moderate expiration
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
          },
          // GitHub API responses - NetworkFirst with fallback
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // LeetCode API - NetworkFirst with short cache
          {
            urlPattern: /^https:\/\/leetcode\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'leetcode-api-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Local stats.json - StaleWhileRevalidate for near-real-time updates
          {
            urlPattern: /\/stats\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'stats-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 5 // 5 minutes
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
  },
  // HTTP cache control headers for production
  preview: {
    headers: {
      // Strong cache for static assets with content hashing
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Allow cross-origin requests for fonts and CDNs
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
