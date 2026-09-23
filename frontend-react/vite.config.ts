import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../frontend/dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
