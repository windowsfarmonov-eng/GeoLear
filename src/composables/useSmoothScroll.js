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

export function scrollToSection(id) {
  const target = document.getElementById(id)
  if (!target) return
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
