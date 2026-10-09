<script setup>
// Skroll bilan boshqariladigan 3D sahna: kamera globusga yaqinlashib O'rta Osiyoga
// «sho'ng'iydi», globus esa low-poly relyef xaritaga aylanadi (tog'lar, Orol, Amudaryo, Sirdaryo).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { device } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import { theme } from '../../composables/useTheme'
import { ScrollTrigger } from '../../composables/useSmoothScroll'
import { DIVE_END, diveCities, mapLabels } from '../../content/geo'
import { cityInfo, landformKeys, waterKeys } from '../../content/cities'
import CityModal from './CityModal.vue'
import AppIcon from '../ui/AppIcon.vue'
import fallbackLabels from '../../content/terrainFallbackLabels.json'
import { locale, t } from '../../i18n'

const section = ref(null)
const stickyEl = ref(null)
const canvas = ref(null)
const labelsLayer = ref(null)
const citiesLayer = ref(null)
const panelEl = ref(null)
const hintEl = ref(null)

// bosiladigan shaharlar va ochiq shahar oynasi
const openCity = ref(null)
const cityNames = computed(() => Object.fromEntries(diveCities.map((c) => [c.key, cityInfo(c.key, locale.value)?.name ?? c.key])))
// 3D rejimda shahar nomlari bosiladigan tugmalar sifatida chiqadi — oddiy «shahar» yozuvi kerak emas
const sceneLabels = mapLabels.filter((l) => l.kind !== 'city')
// daryo, ko'l, dengiz, cho'l, tog' va vodiy yozuvlari ham bosiladi
const clickable = new Set([...waterKeys, ...landformKeys])
const cityHint = computed(() => (locale.value === 'ru' ? 'Нажмите на город, реку, пустыню или горы — откроется география' : "Shahar, daryo, cho'l yoki tog'ni bosing — geografiyasi ochiladi"))

const enabled = device.tier !== 'static'
const quality = device.tier === 'full' ? 'full' : 'lite'
const progress = { value: 0 }

const { status, handle } = useScene(
  stickyEl,
  async ({ ready, fail }) => {
    const { createDiveScene } = await import('../three/engine/diveScene')
    if (!canvas.value || !stickyEl.value || !labelsLayer.value) throw new Error('Dive konteyneri topilmadi')
    const labelEls = Array.from(labelsLayer.value.querySelectorAll('[data-label]'))
    const cityEls = Array.from(citiesLayer.value?.querySelectorAll('[data-city]') ?? []).map((el) => ({ el, key: el.dataset.city }))
    return createDiveScene({
      canvas: canvas.value,
      container: stickyEl.value,
      quality,
      progress,
      dark: theme.value === 'dark',
      labels: labelEls.map((el) => {
        const def = mapLabels.find((l) => l.key === el.dataset.label)
        return { el, key: def.key, kind: def.kind, lat: def.lat, lon: def.lon, priority: def.priority }
      }),
      cityEls,
      // yozuvlar shu elementlar ustiga tushmasin
      obstacles: [document.querySelector('.site-header'), panelEl.value, hintEl.value],
      onFirstFrame: ready,
      onContextLost: fail,
    })
  },
  { enabled, rootMargin: '600px 0px' },
)

/** 3D ishlamaydigan holat: oddiy (pin'siz) bo'lim + statik xarita */
const isStatic = computed(() => !enabled || status.value === 'failed')
// til almashganda yozuvlar kengligi o'zgaradi — 3D sahna ularni qayta o'lchaydi
watch(locale, () => nextTick(() => handle.value?.remeasure?.()))
const live = computed(() => status.value === 'ready')

// Statik xarita: telefonda rasm kesib (cover) ko'rsatiladi va faqat asosiy yozuvlar qoladi
const IMAGE_ASPECT = fallbackLabels.aspect
const MOBILE_ASPECT = 1.05
const FOCUS_X = 0.6
const narrowQuery = window.matchMedia('(max-width: 639px)')
const narrow = ref(narrowQuery.matches)
const onNarrowChange = (event) => (narrow.value = event.matches)
narrowQuery.addEventListener('change', onNarrowChange)
const figureAspect = computed(() => (narrow.value ? MOBILE_ASPECT : IMAGE_ASPECT))

const staticLabels = computed(() => {
  const positions = fallbackLabels.labels
  const visible = Math.min(1, figureAspect.value / IMAGE_ASPECT)
  const cropLeft = (1 - visible) * FOCUS_X
  return mapLabels
    .filter((label) => positions[label.key] && (!narrow.value || label.priority === 1))
    .map((label) => ({ ...label, x: (positions[label.key].x - cropLeft) / visible, y: positions[label.key].y }))
    .filter((label) => label.x > 0.06 && label.x < 0.94)
})

let trigger = null
onBeforeUnmount(() => narrowQuery.removeEventListener('change', onNarrowChange))
onMounted(() => {
  if (!enabled || !section.value) return
  trigger = ScrollTrigger.create({
    trigger: section.value,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      progress.value = self.progress
      // --p — sho'ng'ish bosqichi
      const dive = Math.min(1, self.progress / DIVE_END)
      stickyEl.value?.style.setProperty('--p', dive.toFixed(4))
    },
  })
})
onBeforeUnmount(() => trigger?.kill())
</script>

<template>
  <section id="relyef" ref="section" class="dive" :class="{ 'dive--static': isStatic }" aria-labelledby="dive-title">
    <div ref="stickyEl" class="dive__sticky">
      <!-- 3D rejim -->
      <template v-if="!isStatic">
        <canvas ref="canvas" class="dive__canvas" :class="{ 'is-live': live }" role="img" :aria-label="t('a11y.terrain')" />
        <div v-if="!live" class="dive__loading" aria-hidden="true">
          <span class="skeleton-orbit" />
        </div>
        <div ref="labelsLayer" class="dive__labels" aria-hidden="true">
          <template v-for="label in sceneLabels" :key="label.key">
            <button
              v-if="clickable.has(label.key)"
              type="button"
              class="map-label map-label--button"
              :class="`map-label--${label.kind}`"
              :data-label="label.key"
              @click="openCity = label.key"
            >
              {{ t(`dive.labels.${label.key}`) }}
            </button>
            <span v-else class="map-label" :class="`map-label--${label.kind}`" :data-label="label.key">
              {{ t(`dive.labels.${label.key}`) }}
            </span>
          </template>
        </div>
        <div ref="citiesLayer" class="dive__cities">
          <button
            v-for="c in diveCities"
            :key="c.key"
            type="button"
            class="city-pin"
            :class="{ 'city-pin--capital': c.capital }"
            :data-city="c.key"
            @click="openCity = c.key"
          >
            <span class="city-pin__dot" aria-hidden="true" />
            <span class="city-pin__name">{{ cityNames[c.key] }}</span>
          </button>
        </div>
        <p ref="hintEl" class="dive__city-hint"><AppIcon name="sparkles" :size="15" /> {{ cityHint }}</p>
      </template>

      <div class="container-x dive__intro">
        <h2 id="dive-title" class="h2">{{ t('dive.title') }}</h2>
        <p class="lead mt-4">{{ t('dive.text') }}</p>
      </div>

      <!-- Statik rejim: oldindan chizilgan relyef rasmi -->
      <figure v-if="isStatic" class="container-x dive__figure">
        <div class="dive__image" :style="{ aspectRatio: String(figureAspect) }">
          <img src="/images/terrain-fallback.webp" :alt="t('common.fallbackTerrain')" loading="lazy" decoding="async" />
          <template v-for="label in staticLabels" :key="label.key">
            <button
              v-if="clickable.has(label.key)"
              type="button"
              class="map-label map-label--button"
              :class="`map-label--${label.kind}`"
              :style="{ left: `${label.x * 100}%`, top: `${label.y * 100}%` }"
              @click="openCity = label.key"
            >
              {{ t(`dive.labels.${label.key}`) }}
            </button>
            <span
              v-else
              class="map-label"
              :class="`map-label--${label.kind}`"
              :style="{ left: `${label.x * 100}%`, top: `${label.y * 100}%` }"
              aria-hidden="true"
            >
              {{ t(`dive.labels.${label.key}`) }}
            </span>
          </template>
        </div>
      </figure>

      <div class="container-x dive__panel-wrap">
        <div ref="panelEl" class="dive__panel glass">
          <h3 class="h3">{{ t('dive.panelTitle') }}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-fg-soft">{{ t('dive.panelText') }}</p>
          <ul class="dive__legend">
            <li><span class="swatch swatch--mountains" />{{ t('dive.legend.mountains') }}</li>
            <li><span class="swatch swatch--lowlands" />{{ t('dive.legend.lowlands') }}</li>
            <li><span class="swatch swatch--water" />{{ t('dive.legend.water') }}</li>
            <li><span class="swatch swatch--rivers" />{{ t('dive.legend.rivers') }}</li>
            <li><span class="swatch swatch--border" />{{ t('dive.legend.border') }}</li>
          </ul>
        </div>
      </div>
    </div>
    <CityModal v-model:city="openCity" />
  </section>
</template>

<style>
.dive {
  --dive-length: 360svh;
  position: relative;
  height: var(--dive-length);
}
@media (max-width: 767px) {
  .dive {
    --dive-length: 310svh;
  }
}
.dive__sticky {
  --p: 0;
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}
.dive__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.dive__canvas.is-live {
  opacity: 1;
}
.dive__loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
.dive__labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dive__labels .map-label {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}
.dive__cities {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.city-pin {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.7rem 0.28rem 0.45rem;
  translate: -50% calc(-100% - 14px);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
  background: hsl(222 32% 10% / 0.86);
  border: 1px solid hsl(174 70% 60% / 0.55);
  box-shadow: 0 6px 18px -6px hsl(222 60% 3% / 0.7);
  opacity: 0;
  visibility: hidden;
  pointer-events: auto;
  cursor: pointer;
  will-change: transform, opacity;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.city-pin:hover,
.city-pin:focus-visible {
  background: hsl(174 62% 32% / 0.92);
  border-color: hsl(174 80% 70%);
  box-shadow: 0 0 0 4px hsl(174 70% 50% / 0.25), 0 10px 26px -8px hsl(174 70% 40% / 0.8);
  z-index: 2;
}
.city-pin__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ff0d8;
  box-shadow: 0 0 0 3px hsl(172 85% 60% / 0.25);
}
/* joy yetmaganda: faqat nuqta (bosiladi), nomi ustiga kelganda yoki fokusda chiqadi */
.city-pin.is-compact {
  gap: 0;
  padding: 0.3rem;
}
.city-pin.is-compact .city-pin__name {
  display: none;
}
.city-pin.is-compact:hover,
.city-pin.is-compact:focus-visible {
  gap: 0.4rem;
  padding: 0.28rem 0.7rem 0.28rem 0.45rem;
  z-index: 3;
}
.city-pin.is-compact:hover .city-pin__name,
.city-pin.is-compact:focus-visible .city-pin__name {
  display: inline;
}
.city-pin--capital {
  border-color: hsl(40 95% 65% / 0.7);
  font-size: 0.9rem;
}
.city-pin--capital .city-pin__dot {
  background: #ffcf6b;
}
.dive__city-hint {
  position: absolute;
  left: 50%;
  bottom: clamp(16px, 4vh, 36px);
  translate: -50% 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 650;
  white-space: nowrap;
  color: #fff;
  background: hsl(174 60% 28% / 0.85);
  box-shadow: 0 10px 30px -10px hsl(174 70% 30% / 0.8);
  opacity: calc(clamp(0, calc((var(--p) - 0.74) * 10), 1));
  pointer-events: none;
}
.dive__city-hint svg {
  color: #ffd27a;
}
.map-label {
  translate: -50% -50%;
  padding: 0.18rem 0.5rem;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 640;
  line-height: 1.2;
  white-space: nowrap;
  color: hsl(0 0% 100%);
  background: hsl(222 30% 10% / 0.78);
  text-shadow: 0 1px 2px hsl(222 40% 5% / 0.6);
}
.map-label--button {
  pointer-events: auto;
  cursor: pointer;
  border: 1px solid hsl(198 90% 70% / 0.45);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.map-label--button:hover,
.map-label--button:focus-visible {
  background: hsl(200 70% 30% / 0.9);
  border-color: hsl(195 95% 75%);
  box-shadow: 0 0 0 4px hsl(195 90% 60% / 0.22);
}
.map-label--button.map-label--desert {
  border-color: hsl(32 90% 66% / 0.55);
}
.map-label--button.map-label--desert:hover,
.map-label--button.map-label--desert:focus-visible {
  background: hsl(24 70% 32% / 0.92);
  border-color: hsl(36 95% 72%);
  box-shadow: 0 0 0 4px hsl(32 90% 60% / 0.25);
}
.map-label--button.map-label--mountain {
  border-color: hsl(36 40% 85% / 0.5);
}
.map-label--button.map-label--mountain:hover,
.map-label--button.map-label--mountain:focus-visible {
  background: hsl(30 20% 30% / 0.92);
  border-color: hsl(36 50% 88%);
  box-shadow: 0 0 0 4px hsl(36 40% 80% / 0.22);
}
.map-label--button.map-label--valley {
  border-color: hsl(130 50% 65% / 0.5);
}
.map-label--button.map-label--valley:hover,
.map-label--button.map-label--valley:focus-visible {
  background: hsl(135 40% 26% / 0.92);
  border-color: hsl(130 60% 75%);
  box-shadow: 0 0 0 4px hsl(130 55% 55% / 0.22);
}
.map-label--water {
  color: hsl(198 90% 82%);
  font-style: italic;
}
.map-label--river {
  color: hsl(194 92% 76%);
  font-style: italic;
  background: hsl(222 30% 10% / 0.45);
}
.map-label--mountain {
  color: hsl(36 60% 88%);
  letter-spacing: 0.04em;
}
.map-label--desert {
  color: hsl(40 75% 80%);
  background: hsl(30 30% 12% / 0.5);
}
.map-label--valley {
  color: hsl(140 50% 80%);
}
/* davlat nomlari: xaritadagidek yirik, siyrak harfli, yarim shaffof */
.map-label--country {
  padding: 0.1rem 0.3rem;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: hsl(44 40% 94% / 0.82);
  background: none;
  text-shadow:
    0 1px 3px hsl(222 50% 4% / 0.9),
    0 0 12px hsl(222 50% 4% / 0.6);
}
.map-label--plain {
  font-style: italic;
  letter-spacing: 0.06em;
  color: hsl(70 45% 82%);
  background: hsl(80 20% 10% / 0.45);
}
.map-label--mountain:not(.map-label--button) {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: hsl(30 18% 10% / 0.55);
}
.map-label--city {
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary-strong));
  text-shadow: none;
}
.dive__intro {
  position: relative;
  padding-top: clamp(96px, 14vh, 140px);
  opacity: clamp(0, calc((0.3 - var(--p)) * 7), 1);
  translate: 0 calc(var(--p) * -120px);
  pointer-events: none;
}
.dive__intro > * {
  max-width: 34rem;
}
.dive__panel-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: clamp(84px, 12vh, 112px);
  opacity: calc(clamp(0, calc((var(--p) - 0.72) * 9), 1));
  translate: 0 calc(clamp(0, (0.85 - var(--p)) * 6, 1) * -24px);
  pointer-events: none;
}
.dive__panel {
  max-width: 28rem;
  padding: 1.25rem 1.35rem;
  border-radius: 22px;
}
.dive__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 1rem;
  margin-top: 0.9rem;
  font-size: 0.83rem;
  color: hsl(var(--fg-soft));
}
.dive__legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.swatch {
  width: 14px;
  height: 10px;
  border-radius: 3px;
}
.swatch--mountains {
  background: linear-gradient(90deg, #7f735e, #cfd5dc);
}
.swatch--lowlands {
  background: linear-gradient(90deg, #d9c497, #b4ad78);
}
.swatch--water {
  background: #2a8fbf;
}
.swatch--rivers {
  height: 3px;
  background: #6fe3ff;
}
.swatch--border {
  height: 0;
  border-top: 2px dashed #4ff0d8;
}
@media (max-width: 767px) {
  .dive__city-hint {
    top: 76px;
    bottom: auto;
    width: max-content;
    max-width: calc(100% - 32px);
    justify-content: center;
    padding: 0.45rem 0.85rem;
    font-size: 0.76rem;
    line-height: 1.3;
    text-align: center;
    white-space: normal;
  }
  .dive__panel-wrap {
    top: auto;
    bottom: 16px;
    translate: 0 calc(clamp(0, (0.85 - var(--p)) * 6, 1) * 24px);
  }
  .dive__panel {
    padding: 1rem 1.1rem;
  }
  .city-pin {
    padding: 0.22rem 0.55rem 0.22rem 0.38rem;
    font-size: 0.74rem;
  }
  .city-pin--capital {
    font-size: 0.8rem;
  }
  .dive__labels .map-label {
    font-size: 0.72rem;
  }
  .dive__panel p {
    display: none;
  }
  .map-label {
    font-size: 0.72rem;
  }
}

/* Statik rejim (WebGL yo'q / reduced motion) */
.dive--static {
  height: auto;
}
.dive--static .dive__sticky {
  position: relative;
  height: auto;
  overflow: visible;
  padding-bottom: clamp(56px, 8vw, 96px);
}
.dive--static .dive__intro {
  opacity: 1;
  translate: none;
  padding-top: clamp(72px, 10vw, 120px);
}
.dive--static .dive__panel-wrap {
  position: relative;
  top: auto;
  bottom: auto;
  pointer-events: auto;
  opacity: 1;
  translate: none;
  margin-top: 1.5rem;
}
.dive__figure {
  margin-top: 2rem;
}
.dive__image {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: hsl(var(--bg-deep));
}
.dive__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 60% 50%;
}
.dive__image .map-label {
  position: absolute;
}
</style>
