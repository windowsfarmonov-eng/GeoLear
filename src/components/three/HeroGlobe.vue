<script setup>
// Hero: interaktiv 3D Yer shari. three.js faqat konteyner ko'ringanda dinamik
// import qilinadi; ungacha (va WebGL bo'lmasa) statik globus rasmi turadi.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { device } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import { theme } from '../../composables/useTheme'
import { t } from '../../i18n'
import AppIcon from '../ui/AppIcon.vue'
import { FALLBACK_GLOBE_FRACTION, FALLBACK_MARKER, STATIC_CARD_ANGLES, computeHeroLayout, projectRing } from './engine/heroLayout'

const props = defineProps({
  textColumn: { type: Object, default: null },
})

const cards = [
  { key: 'lessons', icon: 'book', label: 'hero.orbit.lessons' },
  { key: 'game', icon: 'gamepad', label: 'hero.orbit.game' },
  { key: 'ai', icon: 'bot', label: 'hero.orbit.ai' },
  { key: 'rating', icon: 'trophy', label: 'hero.orbit.rating' },
]

const container = ref(null)
const canvas = ref(null)
const marker = ref(null)
const layout = ref(null)
const hintVisible = ref(true)

const enabled = device.tier !== 'static'
const quality = device.tier === 'full' ? 'full' : 'lite'

function safeLeft() {
  const box = container.value
  const text = props.textColumn
  if (!box || !text) return 0
  return text.getBoundingClientRect().right - box.getBoundingClientRect().left + 24
}

function cardElements() {
  return Array.from(container.value?.querySelectorAll('.orbit-card') ?? [])
}

const { status, handle } = useScene(
  container,
  async ({ ready, fail }) => {
    const { createHeroGlobe } = await import('./engine/heroGlobe')
    if (!canvas.value || !container.value) throw new Error('Hero konteyneri topilmadi')
    return createHeroGlobe({
      canvas: canvas.value,
      container: container.value,
      quality,
      cards: cardElements(),
      markerLabel: marker.value,
      safeLeft,
      dark: theme.value === 'dark',
      onFirstFrame: ready,
      onContextLost: fail,
    })
  },
  { enabled, rootMargin: '0px', deferUntilInteraction: true },
)

const live = computed(() => status.value === 'ready')

/** 3D yo'q paytda kartochkalar va Toshkent yozuvini statik joylash */
function placeStatic() {
  const l = layout.value
  if (!l || live.value) return
  cardElements().forEach((card, i) => {
    const p = projectRing(l, STATIC_CARD_ANGLES[i])
    card.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`
    card.style.opacity = '1'
    card.style.zIndex = '3'
  })
  if (marker.value) {
    const size = l.radius / FALLBACK_GLOBE_FRACTION
    const x = l.cx - size / 2 + FALLBACK_MARKER.x * size
    const y = l.cy - size / 2 + FALLBACK_MARKER.y * size
    marker.value.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    marker.value.style.opacity = '1'
  }
}

function measure() {
  const box = container.value
  if (!box) return
  const rect = box.getBoundingClientRect()
  layout.value = computeHeroLayout(rect.width, rect.height, safeLeft())
  placeStatic()
  handle.value?.relayout()
}

let resizeObserver = null
onMounted(() => {
  measure()
  resizeObserver = new ResizeObserver(measure)
  if (container.value) resizeObserver.observe(container.value)
  if (props.textColumn) resizeObserver.observe(props.textColumn)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

const fallbackStyle = computed(() => {
  const l = layout.value
  if (!l) return { visibility: 'hidden' }
  const size = l.radius / FALLBACK_GLOBE_FRACTION
  return {
    width: `${size.toFixed(1)}px`,
    height: `${size.toFixed(1)}px`,
    transform: `translate3d(${(l.cx - size / 2).toFixed(1)}px, ${(l.cy - size / 2).toFixed(1)}px, 0)`,
  }
})

const ringStyle = computed(() => {
  const l = layout.value
  if (!l) return { display: 'none' }
  const size = l.radius * 2.3
  return {
    width: `${size}px`,
    height: `${size}px`,
    transform: `translate3d(${l.cx - size / 2}px, ${l.cy - size / 2}px, 0)`,
  }
})

const hintStyle = computed(() => {
  const l = layout.value
  if (!l) return { display: 'none' }
  return { transform: `translate3d(${l.cx}px, ${l.cy + l.radius * 1.12 + 10}px, 0) translateX(-50%)` }
})
</script>

<template>
  <div ref="container" class="hero-visual" role="img" :aria-label="t('a11y.globe')">
    <img
      class="hero-visual__fallback"
      :class="{ 'is-hidden': live }"
      :style="fallbackStyle"
      src="/images/globe-fallback.webp"
      width="1000"
      height="1000"
      alt=""
      fetchpriority="high"
      decoding="async"
      draggable="false"
    />

    <div v-if="status === 'loading'" class="hero-visual__loading" :style="ringStyle" aria-hidden="true" />
    <span v-if="status === 'loading'" class="sr-only" role="status">{{ t('common.loading3d') }}</span>

    <canvas
      v-if="enabled && status !== 'failed'"
      ref="canvas"
      class="hero-visual__canvas"
      :class="{ 'is-live': live }"
      @pointerdown="hintVisible = false"
    />

    <div class="hero-visual__overlay" aria-hidden="true">
      <div v-for="card in cards" :key="card.key" class="orbit-card glass">
        <span class="orbit-card__icon"><AppIcon :name="card.icon" size="60%" /></span>
        <span>{{ t(card.label) }}</span>
      </div>

      <div ref="marker" class="marker-label">
        <span class="marker-label__line" />
        <span class="marker-label__text">{{ t('hero.marker') }}</span>
      </div>

      <div v-if="live" class="drag-hint" :class="{ 'is-hidden': !hintVisible }" :style="hintStyle">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 7 4 11l4 4M16 7l4 4-4 4M4 11h16" />
        </svg>
        {{ t('hero.drag') }}
      </div>
    </div>
  </div>
</template>

<style>
.hero-visual {
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.hero-visual__fallback,
.hero-visual__loading,
.hero-visual__canvas,
.orbit-card,
.marker-label,
.drag-hint {
  position: absolute;
  left: 0;
  top: 0;
}
.hero-visual__fallback {
  max-width: none;
  pointer-events: none;
  transition: opacity 0.5s ease;
}
.hero-visual__fallback.is-hidden {
  opacity: 0;
}
.hero-visual__loading {
  border-radius: 50%;
  border: 1px dashed hsl(var(--primary) / 0.5);
  animation: spin 16s linear infinite;
  pointer-events: none;
}
.hero-visual__canvas {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.6s ease;
  touch-action: pan-y;
}
.hero-visual__canvas.is-live {
  opacity: 1;
}
.hero-visual__canvas.is-grabbable {
  cursor: grab;
}
.hero-visual__canvas.is-dragging {
  cursor: grabbing;
}
.hero-visual__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orbit-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem 0.5rem 0.55rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 620;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: hsl(var(--fg));
  opacity: 0;
  will-change: transform, opacity;
  box-shadow: 0 18px 40px -22px hsl(222 60% 3% / 0.7);
}
.orbit-card__icon {
  display: grid;
  place-items: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 10px;
  background: hsl(var(--primary) / 0.16);
  color: hsl(var(--primary-strong));
}
@media (max-width: 1023px) {
  .orbit-card {
    font-size: 0.78rem;
    padding: 0.35rem 0.65rem 0.35rem 0.4rem;
    border-radius: 12px;
  }
  .orbit-card__icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 8px;
  }
}
.marker-label {
  opacity: 0;
  will-change: transform, opacity;
}
.marker-label__line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 26px;
  height: 1px;
  background: hsl(var(--primary-strong));
  transform-origin: left center;
  transform: rotate(-38deg);
}
.marker-label__text {
  position: absolute;
  left: 20px;
  bottom: 14px;
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 650;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary-strong));
  white-space: nowrap;
}
.drag-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 560;
  color: hsl(var(--muted));
  background: hsl(var(--fg) / 0.05);
  border: 1px solid hsl(var(--fg) / 0.08);
  transition: opacity 0.6s ease;
}
.drag-hint.is-hidden {
  opacity: 0;
}
</style>
