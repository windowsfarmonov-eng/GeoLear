<script setup>
// Matndagi oxirgi sonni 0 dan sanab chiqaradi: "20+" → 0…20+, "1–11" → 1–0…11.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useInView } from '../../composables/useInView'
import { motionOK } from '../../composables/useDevice'

const props = defineProps({
  value: { type: String, required: true },
  duration: { type: Number, default: undefined },
})

const el = ref(null)
const inView = useInView(el, { once: true, rootMargin: '0px 0px -10% 0px' })

const parts = computed(() => {
  const match = props.value.match(/^(.*?)(\d+)(\D*)$/)
  if (!match) return null
  return { prefix: match[1], target: Number(match[2]), suffix: match[3] }
})

const current = ref(motionOK ? 0 : (parts.value?.target ?? 0))
let frame = 0

watch(inView, (visible) => {
  if (!visible || !parts.value || !motionOK) return
  const target = parts.value.target
  const duration = props.duration ?? 1400
  const start = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - p, 4)
    current.value = Math.round(target * eased)
    if (p < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
})

watch(
  () => props.value,
  () => {
    if (parts.value && (inView.value || !motionOK)) current.value = parts.value.target
  },
)

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <span ref="el" class="tabular-nums">
    <template v-if="parts">
      <span aria-hidden="true">{{ parts.prefix }}{{ current }}{{ parts.suffix }}</span>
      <span class="sr-only">{{ value }}</span>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>
