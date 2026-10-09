import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motionOK } from './useDevice'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

/** Lenis (silliq skroll) + GSAP ScrollTrigger sinxronizatsiyasi */
export function initSmoothScroll() {
  if (!motionOK || lenis) return
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function stopScroll() {
  lenis?.stop()
  document.documentElement.classList.add('scroll-locked')
}

export function startScroll() {
  lenis?.start()
  document.documentElement.classList.remove('scroll-locked')
}

/**
 * #bo'lim'ga silliq o'tish va fokusni o'sha bo'limga ko'chirish (klaviatura uchun).
 * Header balandligi CSS'dagi `scroll-padding-top` orqali hisobga olinadi (Lenis ham uni o'qiydi).
 */
/** Elementga yumshoq aylantirish (URL va fokusni o'zgartirmaydi) */
export function scrollToElement(el, offset = 0) {
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1, offset })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: motionOK ? 'smooth' : 'auto' })
}

let sizesKnown = false

/**
 * `content-visibility: auto` bo'limlari hali chizilmagan bo'lsa, ularning o'lchami taxminiy.
 * Uzoq bo'limga o'tishdan oldin hammasini bir kadr chizdirib, haqiqiy o'lchamlarni eslab qolamiz.
 */
function withRealSizes(callback) {
  if (sizesKnown) return callback()
  const root = document.documentElement
  root.classList.add('cv-measure')
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      root.classList.remove('cv-measure')
      sizesKnown = true
      // sahifa balandligi o'zgardi: Lenis skroll chegarasini va triggerlarni yangilash
      lenis?.resize()
      ScrollTrigger.refresh()
      callback()
    }),
  )
}

/** Bo'limlar o'lchami o'zgarsa (chizilib haqiqiy balandligi chiqsa) — skroll triggerlarini yangilash */
export function watchLayoutChanges(el) {
  if (!el || typeof ResizeObserver === 'undefined') return () => {}
  let timer = 0
  let lastHeight = 0
  const observer = new ResizeObserver(([entry]) => {
    const height = Math.round(entry.contentRect.height)
    if (!lastHeight || height === lastHeight) {
      lastHeight = height
      return
    }
    lastHeight = height
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      lenis?.resize()
      ScrollTrigger.refresh()
    }, 150)
  })
  observer.observe(el)
  return () => {
    window.clearTimeout(timer)
    observer.disconnect()
  }
}

export function scrollToSection(id) {
  const target = document.getElementById(id)
  if (!target) return
  withRealSizes(() => scrollToTarget(target, id))
}

function scrollToTarget(target, id) {
  const focusTarget = () => {
    const heading = target.querySelector('h2, h1') ?? target
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2, force: true, onComplete: focusTarget })
  } else {
    target.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' })
    focusTarget()
  }
  const url = new URL(window.location.href)
  url.hash = id
  history.replaceState(history.state, '', url)
}

export { gsap, ScrollTrigger }
