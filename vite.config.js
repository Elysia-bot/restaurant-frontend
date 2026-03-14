import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.1.25:8080',  // ← đổi thành IP máy bạn
        changeOrigin: true
      },
      '/ws': {
        target: 'http://192.168.1.25:8080',  // ← đổi thành IP máy bạn
        ws: true,
        changeOrigin: true
      }
    }
  }
})