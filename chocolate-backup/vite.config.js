import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',    // Use '/' for user/org sites, or '/repo-name/' for project sites
  build: {
    rollupOptions: {
      external: [
        /^scripts\/.*/  // Excludes anything in the scripts directory
      ]
    }
  }
})