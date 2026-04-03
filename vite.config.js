import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4173,
  },
  server: {
    proxy: {
      // Proxy /piston requests to the self-hosted Piston container (avoids CORS)
      '/piston': {
        target: 'http://localhost:2000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piston/, ''),
      },
    },
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['react-icons/fa', 'react-icons/si'],
          'axios': ['axios'],
          'monaco': ['@monaco-editor/react'],
          'html2pdf': ['html2pdf.js'],
        }
      }
    }
  },
})
