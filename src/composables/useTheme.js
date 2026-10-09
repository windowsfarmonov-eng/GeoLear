import { ref, watch } from 'vue'
import { motionOK } from './useDevice'

const root = document.documentElement
const STORAGE_KEY = 'geolearn-theme'

/** Joriy tema. Standart — qorong'i (index.html'dagi skript oldindan qo'llaydi). */
export const theme = ref(root.classList.contains('dark') ? 'dark' : 'light')

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

let transitionTimer = 0

watch(theme, (next) => {
  if (motionOK) {
    root.classList.add('theme-transition')
    window.clearTimeout(transitionTimer)
    transitionTimer = window.setTimeout(() => root.classList.remove('theme-transition'), 450)
  }
  root.classList.toggle('dark', next === 'dark')
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
})
