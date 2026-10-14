import { loadSmoothScroll } from './scrollLite'
import { motionOK } from './useDevice'
import { t } from '../i18n'
import { withVisit } from '../analytics/track'

// Kartochka bosilganda kamera unga «uchib kirgandek» o'tish animatsiyasi, so'ng
// havola shu tabning o'zida ochiladi. Ctrl/Cmd/Shift + bosish brauzerning odatiy
// xatti-harakatiga qoldiriladi.

let overlay = null
let animatedCard = null
let navigating = false
let gsap = null

function cleanup() {
  overlay?.remove()
  overlay = null
  if (animatedCard) gsap?.set(animatedCard, { clearProps: 'transform,opacity,filter' })
  animatedCard = null
  navigating = false
}

// Orqaga tugmasi bilan qaytilganda (bfcache) sahifani asl holatiga qaytaramiz
window.addEventListener('pageshow', (event) => {
  if (event.persisted) cleanup()
})

function buildOverlay() {
  const el = document.createElement('div')
  el.className = 'fly-overlay'
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = `
    <div class="fly-overlay__inner">
      <svg viewBox="0 0 32 32" width="56" height="56" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/>
        <ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M3 16h26" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span></span>
    </div>`
  // matn faqat textContent orqali qo'yiladi — HTML sifatida talqin qilinmaydi
  el.querySelector('span').textContent = t('cta.opening')
  document.body.appendChild(el)
  return el
}

export async function flyToPortal(event, href, card) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  if (navigating) return
  navigating = true

  const go = () => window.location.assign(withVisit(href))
  if (!motionOK) {
    go()
    return
  }

  const target = card ?? event.currentTarget
  try {
    gsap = (await loadSmoothScroll()).gsap
  } catch {
    go()
    return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const rect = target.getBoundingClientRect()
  const from = `inset(${Math.max(0, rect.top)}px ${Math.max(0, vw - rect.right)}px ${Math.max(0, vh - rect.bottom)}px ${Math.max(0, rect.left)}px round 28px)`

  overlay = buildOverlay()
  animatedCard = card ?? null

  const safety = window.setTimeout(go, 1400)
  const tl = gsap.timeline({
    onComplete: () => {
      window.clearTimeout(safety)
      go()
    },
  })

  if (card) {
    tl.to(card, { transformPerspective: 900, z: 180, rotateX: 0, rotateY: 0, duration: 0.42, ease: 'power3.in' }, 0)
  }
  tl.fromTo(
    overlay,
    { clipPath: from, opacity: 0.35 },
    { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1, duration: 0.6, ease: 'expo.inOut' },
    card ? 0.18 : 0,
  ).fromTo(
    overlay.querySelector('.fly-overlay__inner'),
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
    '-=0.25',
  )
}
