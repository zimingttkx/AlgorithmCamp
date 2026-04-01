import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
  }
})
