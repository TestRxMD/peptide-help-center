import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In production, Vercel handles /api routes.
    // For local dev with `vercel dev`, this proxy is not needed.
    // Uncomment the proxy below only if running a local API server separately.
    // proxy: { '/api': 'http://localhost:3001' },
  },
})
