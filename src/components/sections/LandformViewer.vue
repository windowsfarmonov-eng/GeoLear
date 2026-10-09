<script setup>
// Relyef obyektining 3D dioramasi (cho'l barxanlari, tog' cho'qqilari, vodiy, plato) — shahar oynasi ichida.
// WebGL bo'lmasa — chiroyli gradient va belgi bilan zaxira ko'rinish.
import { ref } from 'vue'
import { device, motionOK } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import AppIcon from '../ui/AppIcon.vue'

const props = defineProps({
  info: { type: Object, required: true },
  /** { value: 0…1 } — oyna qanchalik pastga aylantirilgani */
  scroll: { type: Object, required: true },
  hint: { type: String, default: '' },
})

const box = ref(null)
const canvas = ref(null)

const { status } = useScene(
  box,
  async ({ ready, fail }) => {
    const { createLandformScene } = await import('../three/engine/landformScene')
    if (!canvas.value || !box.value) throw new Error('Relyef konteyneri topilmadi')
    return createLandformScene({
      canvas: canvas.value,
      container: box.value,
      quality: device.tier === 'full' ? 'full' : 'lite',
      info: props.info,
      scroll: props.scroll,
      motion: motionOK,
      onFirstFrame: ready,
      onContextLost: fail,
    })
  },
  { enabled: device.webgl, rootMargin: '0px' },
)
</script>

<template>
  <div
    ref="box"
    class="lf3d"
    :class="[`lf3d--${info.type}`, { 'is-live': status === 'ready', 'is-failed': status === 'failed' || !device.webgl }]"
    :style="{ '--sky': info.look.sky }"
  >
    <canvas ref="canvas" class="lf3d__canvas" role="img" :aria-label="info.name" />
    <div v-if="status !== 'ready'" class="lf3d__fallback" aria-hidden="true">
      <AppIcon :name="info.type === 'desert' || info.type === 'plateau' ? 'sun' : 'mountain'" :size="64" :stroke="1.3" />
    </div>
    <span v-if="status === 'ready' && hint" class="lf3d__hint"><AppIcon name="rotate" :size="14" /> {{ hint }}</span>
  </div>
</template>

<style>
.lf3d {
  position: relative;
  height: clamp(280px, 48vw, 440px);
  border-radius: 22px;
  overflow: hidden;
  background:
    radial-gradient(70% 55% at 50% 30%, color-mix(in srgb, var(--sky) 55%, transparent), transparent 75%),
    radial-gradient(90% 60% at 50% 105%, hsl(var(--primary) / 0.18), transparent 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--sky) 30%, hsl(var(--surface))), hsl(var(--surface-2)));
  box-shadow: inset 0 0 0 1px hsl(var(--line));
  touch-action: pan-y;
  cursor: grab;
}
.lf3d:active {
  cursor: grabbing;
}
.dark .lf3d {
  background:
    radial-gradient(70% 55% at 50% 30%, color-mix(in srgb, var(--sky) 22%, transparent), transparent 75%),
    radial-gradient(90% 60% at 50% 105%, hsl(var(--primary) / 0.2), transparent 70%),
    linear-gradient(180deg, hsl(222 30% 12%), hsl(222 24% 9%));
}
.lf3d__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.7s ease;
}
.lf3d.is-live .lf3d__canvas {
  opacity: 1;
}
.lf3d__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--sky) 70%, hsl(var(--fg)));
  opacity: 0.6;
}
.lf3d:not(.is-failed) .lf3d__fallback svg {
  animation: pulse-soft 1.6s ease-in-out infinite;
}
.lf3d__hint {
  position: absolute;
  left: 50%;
  bottom: 12px;
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
  color: #fff;
  background: hsl(222 32% 10% / 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: none;
}
</style>
