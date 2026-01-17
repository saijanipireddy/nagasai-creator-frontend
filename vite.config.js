import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Handle SPA routing for preview/production
  preview: {
    port: 4173,
  },
  build: {
    // Ensure assets are properly referenced
    assetsDir: 'assets',
  },
})
