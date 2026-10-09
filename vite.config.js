import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    // three.js lazy chunk'i ~500 KB (gzip ~130 KB) — ogohlantirish chegarasini moslaymiz
    chunkSizeWarningLimit: 800,
  },
})
