import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Backend has NO /api prefix — strip it before forwarding
        // /api/projects/upload → /projects/upload
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})