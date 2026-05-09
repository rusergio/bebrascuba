import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Single origin in dev: frontend and API through localhost:5173
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
