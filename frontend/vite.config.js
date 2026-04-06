import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Python AI service — frontend calls /ai/analyze, proxied to localhost:8000/analyze
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, ''),
      },
      // Spring Boot is getting called directly via http://localhost:8080 in axios.js
      // so no proxy needed for the backend
    },
  },
})