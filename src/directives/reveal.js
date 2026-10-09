import { motionOK } from '../composables/useDevice'

// v-reveal — element ko'rinish maydoniga kirganda yengil fade + translate bilan chiqadi.
// v-reveal="120" — 120 ms kechikish bilan.

let observer = null

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer?.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
  }
  return observer
}

export const vReveal = {
  mounted(el, binding) {
    if (!motionOK) return
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
