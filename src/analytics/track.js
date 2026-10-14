// ─────────────────────────────────────────────────────────────────────────────
//  Tashriflar statistikasi — GeoLearn serveriga (Nazorat markazi → «Reklama sayti»).
//  Nima yuboriladi: sahifa ochilgani, qancha vaqt ko'rilgani, qaysi bo'limlar
//  ko'rilgani, sahifaning qancha qismi o'qilgani, CRM namoyishidan foydalanilgani,
//  qaysi portal/aloqa tugmasi bosilgani. Ism, telefon, kiritilgan matn YUBORILMAYDI.
//  Brauzerdagi tasodifiy identifikator faqat qayta kelganlarni sanash uchun.
// ─────────────────────────────────────────────────────────────────────────────
import { ADMIN_URL, USER_URL, links } from '../config/links'
import { locale } from '../i18n'

const API = (import.meta.env.VITE_API_URL || 'https://geolearn-modified1.onrender.com').replace(/\/+$/, '')
const ENDPOINT = `${API}/api/landing/t`
const BOT_RE = /bot|crawl|spider|slurp|yandex|bingpreview|facebookexternalhit|telegrambot|whatsapp|lighthouse|headless/i

const rid = () => {
  const a = new Uint8Array(12)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20)
}

export const sid = rid()

function visitorId() {
  try {
    let v = localStorage.getItem('geo_vid')
    if (!/^[a-z0-9]{8,32}$/i.test(v || '')) {
      v = rid()
      localStorage.setItem('geo_vid', v)
    }
    return v
  } catch {
    return sid
  }
}

function send(data) {
  const body = JSON.stringify({ sid, ...data })
  try {
    // text/plain — oddiy so'rov: brauzer oldindan CORS so'rovi yubormaydi, sahifa yopilsa ham yetib boradi
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return
  } catch {
    /* sendBeacon taqiqlangan bo'lishi mumkin */
  }
  fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, mode: 'cors' }).catch(() => {})
}

/** Portal havolasiga tashrif raqami qo'shiladi: portal ochilgani va kirilgani shu tashrifga yoziladi. */
export function withVisit(href) {
  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== new URL(ADMIN_URL).origin && url.origin !== new URL(USER_URL).origin) return href
    url.searchParams.set('lv', sid)
    return url.toString()
  } catch {
    return href
  }
}

function clickKind(href) {
  if (!href) return null
  const plain = href.split('?')[0].replace(/\/+$/, '')
  for (const key of ['teacherLogin', 'studentLogin', 'studentRegister']) {
    if (plain === links[key].replace(/\/+$/, '')) return key
  }
  if (plain.startsWith(ADMIN_URL)) return 'teacherLogin'
  if (plain.startsWith(USER_URL)) return 'studentLogin'
  if (/^https:\/\/t\.me\//i.test(href)) return 'telegram'
  if (/^tel:/i.test(href)) return 'phone'
  if (/^mailto:/i.test(href)) return 'email'
  return null
}

let started = false

export function startTracking() {
  if (started || BOT_RE.test(navigator.userAgent)) return
  started = true

  const params = new URLSearchParams(window.location.search)
  send({
    type: 'start',
    v: visitorId(),
    ref: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '',
    utm: { s: params.get('utm_source') || '', m: params.get('utm_medium') || '', c: params.get('utm_campaign') || '' },
    lang: locale.value,
    bl: navigator.language || '',
    tz: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      } catch {
        return ''
      }
    })(),
    w: window.screen?.width || window.innerWidth,
  })

  // ── Faol vaqt: faqat sahifa ko'rinib turgan paytlar sanaladi ──
  let activeMs = 0
  let visibleSince = document.visibilityState === 'visible' ? performance.now() : null
  const secs = () => Math.round((activeMs + (visibleSince != null ? performance.now() - visibleSince : 0)) / 1000)

  // ── Ko'rilgan bo'limlar ──
  const seen = new Set()
  let full = false
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        // bo'limning 40% i ko'rinsa yoki ekranning yarmini egallasa — «ko'rildi»
        if (e.intersectionRatio >= 0.4 || e.intersectionRect.height >= window.innerHeight * 0.5) {
          const id = e.target.dataset.track || e.target.id
          if (id) seen.add(id)
          if (id === 'footer') full = true
          io.unobserve(e.target)
        }
      }
    },
    { threshold: [0, 0.2, 0.4, 0.6] },
  )
  const watched = new WeakSet()
  const scan = () => {
    document.querySelectorAll('main section[id], [data-track]').forEach((el) => {
      if (watched.has(el)) return
      watched.add(el)
      io.observe(el)
    })
  }
  scan()
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true })

  // ── O'qilgan qism: footer chizilgunicha (bo'limlar hali yuklanmagan) hisoblanmaydi ──
  let depth = 0
  const measure = () => {
    if (!document.querySelector('[data-track="footer"]')) return
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const now = max > 0 ? Math.round(((window.scrollY || doc.scrollTop) / max) * 100) : 100
    depth = Math.max(depth, Math.min(100, now))
    if (depth >= 97) full = true
  }
  window.addEventListener('scroll', measure, { passive: true })

  // ── CRM namoyishi (o'qituvchi / o'quvchi paneli maketi) bilan ishlash ──
  const crm = { t: 0, s: 0 }
  document.addEventListener(
    'pointerdown',
    (e) => {
      const el = e.target instanceof Element ? e.target : null
      if (el?.closest('.crm-fit')) crm.t++
      else if (el?.closest('.scrm-fit')) crm.s++
    },
    { capture: true, passive: true },
  )

  // ── Tugmalar: portal va aloqa havolalari ──
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!a) return
      const kind = clickKind(a.getAttribute('href'))
      if (!kind) return
      send({ type: 'click', k: kind })
      ping()
      // yangi tabda ochilsa ham (Ctrl + bosish) portal shu tashrifni tanisin
      if (kind.endsWith('Login') || kind === 'studentRegister') a.href = withVisit(a.getAttribute('href'))
    },
    { capture: true },
  )

  const ping = (end = false) => {
    measure()
    send({ type: 'ping', secs: secs(), depth, sec: [...seen], full, crm, lang: locale.value, end })
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (visibleSince != null) activeMs += performance.now() - visibleSince
      visibleSince = null
      ping(true)
    } else {
      visibleSince = performance.now()
      ping()
    }
  })
  window.addEventListener('pagehide', () => ping(true))
  window.setTimeout(() => ping(), 5000)
  window.setInterval(() => {
    if (document.visibilityState === 'visible') ping()
  }, 15000)
}
