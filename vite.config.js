import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { faqJsonLd } from './src/content/faq.js'

/** FAQ savol-javoblari Google uchun FAQPage (JSON-LD) ko'rinishida HTML'ga yoziladi — src/content/faq.js'dan */
function faqStructuredData() {
  return {
    name: 'faq-structured-data',
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { type: 'application/ld+json', id: 'ld-faq' }, children: JSON.stringify(faqJsonLd('uz')), injectTo: 'head' }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), faqStructuredData()],
  build: {
    // three.js lazy chunk'i ~500 KB (gzip ~130 KB) — ogohlantirish chegarasini moslaymiz
    chunkSizeWarningLimit: 800,
  },
})
