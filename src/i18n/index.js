import { ref, watch } from 'vue'
import uz from './uz.json'
import ru from './ru.json'

const messages = { uz, ru }
const STORAGE_KEY = 'geolearn-lang'

function readInitialLocale() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl === 'uz' || fromUrl === 'ru') return fromUrl
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'uz' || saved === 'ru') return saved
  } catch {
    /* localStorage yopiq bo'lishi mumkin */
  }
  return 'uz'
}

/** Joriy til (reaktiv). Shablonlarda t() orqali avtomatik kuzatiladi. */
export const locale = ref(readInitialLocale())

function lookup(source, path) {
  return path.split('.').reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), source)
}

/** Matn: t('hero.title'). {name} ko'rinishidagi parametrlarni qo'llab-quvvatlaydi. */
export function t(key, params) {
  let value = lookup(messages[locale.value], key)
  if (typeof value !== 'string') value = lookup(messages.uz, key)
  if (typeof value !== 'string') return key
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

/** Massiv yoki obyekt ko'rinishidagi tarjima: tm<string[]>('curriculum.topics') */
export function tm(key) {
  return lookup(messages[locale.value], key) ?? lookup(messages.uz, key)
}

/** Sayt tilidan qat'i nazar, aniq bir tildagi tarjima (masalan, CRM maketining o'z til sozlamasi uchun) */
export function tmIn(lang, key) {
  return lookup(messages[lang], key) ?? lookup(messages.uz, key)
}

export function setLocale(next) {
  locale.value = next
}

const canonical = document.querySelector('link[rel="canonical"]')
const siteOrigin = (() => {
  try {
    return new URL(canonical?.href ?? '').origin
  } catch {
    return window.location.origin
  }
})()

const setMeta = (selector, value) => document.querySelector(selector)?.setAttribute('content', value)

function applyDocumentLocale(current) {
  const pageUrl = current === 'ru' ? `${siteOrigin}/?lang=ru` : `${siteOrigin}/`
  document.documentElement.lang = current
  document.title = t('meta.title')
  setMeta('meta[name="description"]', t('meta.description'))
  setMeta('meta[property="og:locale"]', current === 'ru' ? 'ru_RU' : 'uz_UZ')
  setMeta('meta[property="og:locale:alternate"]', current === 'ru' ? 'uz_UZ' : 'ru_RU')
  setMeta('meta[property="og:url"]', pageUrl)
  setMeta('meta[property="og:title"]', t('meta.title'))
  setMeta('meta[property="og:description"]', t('meta.description'))
  setMeta('meta[name="twitter:title"]', t('meta.title'))
  setMeta('meta[name="twitter:description"]', t('meta.description'))
  canonical?.setAttribute('href', pageUrl)

  // Havolani ulashganda til saqlansin: ?lang=ru
  const url = new URL(window.location.href)
  if (current === 'ru') url.searchParams.set('lang', 'ru')
  else url.searchParams.delete('lang')
  if (url.href !== window.location.href) history.replaceState(history.state, '', url)

  try {
    window.localStorage.setItem(STORAGE_KEY, current)
  } catch {
    /* ignore */
  }
}

watch(locale, applyDocumentLocale, { immediate: true })
