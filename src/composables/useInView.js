import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Element ko'rinish maydoniga kirganini kuzatadi.
 * once=true bo'lsa, birinchi kirishdan keyin kuzatish to'xtaydi.
 */
export function useInView(target, { rootMargin = '0px', threshold = 0, once = false } = {}) {
  const inView = ref(false)
  let observer = null

  onMounted(() => {
    const el = target.value
    if (!el) return
    observer = new IntersectionObserver(
      ([entry]) => {
        inView.value = entry.isIntersecting
        if (entry.isIntersecting && once) {
          observer?.disconnect()
          observer = null
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())
  return inView
}
