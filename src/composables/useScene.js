import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { device } from './useDevice'
import { theme } from './useTheme'

/**
 * 3D sahnani dangasa (lazy) yuklash: konteyner ko'rinish maydoniga yaqinlashganda
 * three.js chunk'i dinamik import qilinadi va sahna yaratiladi.
 * Xato bo'lsa — status 'failed' va komponent statik rasmni ko'rsatadi.
 */
/**
 * Birinchi ekrandagi (hero) sahna uchun: three.js sahifa yuklanishini sekinlashtirmasin —
 * foydalanuvchi birinchi marta harakat qilganda (sichqoncha, skroll, teginish, klaviatura)
 * yoki yuklangandan bir necha soniya o'tib ishga tushadi. Ungacha bir xil ko'rinishdagi statik rasm turadi.
 * Telefonda (kuchsizroq protsessor) kutish uzoqroq — sahifa to'liq tinchlangach.
 */
export function whenUserReady(delay = device.finePointer ? 3500 : 9000) {
  return new Promise((resolve) => {
    const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll']
    let timer = 0
    const done = () => {
      window.clearTimeout(timer)
      events.forEach((name) => window.removeEventListener(name, done))
      resolve()
    }
    events.forEach((name) => window.addEventListener(name, done, { once: true, passive: true }))
    const arm = () => (timer = window.setTimeout(done, delay))
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })
  })
}

export function useScene(container, create, { enabled = true, rootMargin = '400px 0px', deferUntilInteraction = false } = {}) {
  const status = ref('idle')
  const handle = ref(null)
  let observer = null
  let unmounted = false

  const callbacks = {
    ready: () => {
      if (status.value === 'loading') status.value = 'ready'
    },
    fail: () => {
      status.value = 'failed'
      handle.value?.dispose()
      handle.value = null
    },
  }

  async function start() {
    try {
      if (deferUntilInteraction) await whenUserReady()
      if (unmounted) return
      status.value = 'loading'
      const created = await create(callbacks)
      // fail() await paytida chaqirilgan bo'lishi mumkin
      if (unmounted || status.value === 'failed') {
        created.dispose()
        return
      }
      handle.value = created
      created.setTheme?.(theme.value === 'dark')
    } catch (error) {
      console.warn('[GeoLearn] 3D sahna ishga tushmadi, statik rasm ko‘rsatiladi:', error)
      status.value = 'failed'
    }
  }

  onMounted(() => {
    const el = container.value
    if (!enabled || !el) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer?.disconnect()
        observer = null
        void start()
      },
      { rootMargin },
    )
    observer.observe(el)
  })

  watch(theme, (value) => handle.value?.setTheme?.(value === 'dark'))

  onBeforeUnmount(() => {
    unmounted = true
    observer?.disconnect()
    handle.value?.dispose()
    handle.value = null
  })

  return { status, handle }
}
