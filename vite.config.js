import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // This is correct for user/org GitHub Pages sites (chocly.github.io)
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        /^scripts\/.*/  // Excludes anything in the scripts directory
      ]
    }
  },
  // Add this to help with routing in development
  server: {
    historyApiFallback: true
  }
})