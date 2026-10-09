<script setup>
// Bo'limlardagi qo'shimcha 3D globuslar (engine/globeShowcase.js). three.js faqat
// konteyner ko'rinishga yaqinlashganda yuklanadi; WebGL bo'lmasa statik globus rasmi turadi.
import { computed, ref } from 'vue'
import { device } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import { theme } from '../../composables/useTheme'

const props = defineProps({
  variant: { type: String, required: true, validator: (v) => ['satellite', 'arcs', 'orbits', 'horizon'].includes(v) },
  label: { type: String, default: '' },
})

const box = ref(null)
const canvas = ref(null)
const enabled = device.tier !== 'static'

const { status } = useScene(
  box,
  async ({ ready, fail }) => {
    const { createGlobeShowcase } = await import('./engine/globeShowcase')
    if (!canvas.value || !box.value) throw new Error('Globus konteyneri topilmadi')
    return createGlobeShowcase({
      canvas: canvas.value,
      container: box.value,
      quality: device.tier === 'full' ? 'full' : 'lite',
      variant: props.variant,
      dark: theme.value === 'dark',
      onFirstFrame: ready,
      onContextLost: fail,
    })
  },
  { enabled, rootMargin: '300px 0px' },
)

const live = computed(() => status.value === 'ready')
const showFallback = computed(() => props.variant !== 'horizon' && (!enabled || status.value === 'failed'))
</script>

<template>
  <div ref="box" class="showcase-globe" :class="[`showcase-globe--${variant}`, { 'is-live': live }]">
    <canvas
      v-if="enabled && status !== 'failed'"
      ref="canvas"
      class="showcase-globe__canvas"
      :role="label ? 'img' : undefined"
      :aria-label="label || undefined"
      :aria-hidden="label ? undefined : 'true'"
    />
    <span v-if="enabled && !live && status !== 'failed' && variant !== 'horizon'" class="skeleton-orbit" aria-hidden="true" />
    <img v-if="showFallback" class="showcase-globe__fallback" src="/images/globe-fallback.webp" alt="" loading="lazy" decoding="async" />
  </div>
</template>

<style>
:where(.showcase-globe) {
  position: relative;
  width: 100%;
  height: 100%;
}
.showcase-globe__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 1s ease;
  touch-action: pan-y;
  cursor: grab;
}
.showcase-globe__canvas.is-dragging {
  cursor: grabbing;
}
.showcase-globe--horizon .showcase-globe__canvas {
  cursor: default;
}
.showcase-globe.is-live .showcase-globe__canvas {
  opacity: 1;
}
.showcase-globe__fallback {
  position: absolute;
  inset: 12%;
  width: 76%;
  height: 76%;
  object-fit: contain;
}
</style>
