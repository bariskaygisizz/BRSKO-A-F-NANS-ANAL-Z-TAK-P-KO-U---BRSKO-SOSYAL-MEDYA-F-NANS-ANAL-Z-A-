import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    // GitHub Pages alt-klasor servis ettigi icin goreceli yol kullaniyoruz
                              base: './',
    plugins: [react()],
    server: {
          proxy: {
                  '/api': 'http://localhost:3002',
          },
    },
})
