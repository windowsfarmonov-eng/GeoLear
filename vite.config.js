import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
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

/**
 * Xavfsizlik: vercel.json'dagi Content-Security-Policy faqat xeshi ro'yxatda bor inline skriptlarga ruxsat beradi.
 * index.html'dagi inline skript o'zgarib, xesh yangilanmasa — sayt jimgina buzilmasin, build xato bersin.
 */
function verifyCspHashes() {
  return {
    name: 'verify-csp-hashes',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
      const csp = vercel.headers.flatMap((rule) => rule.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? ''
      for (const [, attrs, code] of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/application\/ld\+json/.test(attrs)) continue // ma'lumot bloki, bajarilmaydi
        // brauzer xeshdan oldin qator tugashlarini LF'ga keltiradi (Windows'dagi CRLF'da ham xesh bir xil bo'lsin)
        const normalized = code.replace(/\r\n?/g, '\n')
        const hash = `'sha256-${createHash('sha256').update(normalized).digest('base64')}'`
        if (!csp.includes(hash)) {
          throw new Error(`CSP: inline skript xeshi vercel.json'da yo'q. script-src'ga qo'shing: ${hash}`)
        }
      }
      return html
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), faqStructuredData(), verifyCspHashes()],
  build: {
    // three.js lazy chunk'i ~500 KB (gzip ~130 KB) — ogohlantirish chegarasini moslaymiz
    chunkSizeWarningLimit: 800,
  },
})
