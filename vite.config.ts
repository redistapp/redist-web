import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Em dev, a SPA fala com a BFF (redist-bff) via proxy de mesma origem, para os
// cookies de sessão funcionarem como em produção. Ajuste a porta se mudar a BFF.
const BFF_TARGET = process.env.BFF_TARGET ?? 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': { target: BFF_TARGET, changeOrigin: true },
      '/auth': { target: BFF_TARGET, changeOrigin: true },
    },
  },
})
