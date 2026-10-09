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

function applyDocumentLocale(current) {
  document.documentElement.lang = current
  document.title = t('meta.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', current === 'ru' ? 'ru_RU' : 'uz_UZ')
  canonical?.setAttribute('href', current === 'ru' ? `${siteOrigin}/?lang=ru` : `${siteOrigin}/`)

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
