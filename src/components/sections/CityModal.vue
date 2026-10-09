<script setup>
// Relyef xaritasida shahar bosilganda ochiladigan oyna: shaharning geografiyasi va 3D galereya (tabiat manzaralari).
// Galereya — halqa bo'ylab joylashgan rasmlar (CSS 3D): o'zi aylanadi, sudrab yoki
// strelkalar / klaviatura bilan aylantiriladi.
// Cho'l, tog', vodiy va plato uchun galereya o'rniga 3D relyef dioramasi chiqadi; oyna pastga aylantirilganda
// balandlik kesimi, iqlim / o'simlik / hayvonot / boyliklar kartalari va raqamlar ketma-ket ochiladi.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import CountUp from '../ui/CountUp.vue'
import LandformViewer from './LandformViewer.vue'
import { cityInfo } from '../../content/cities'
import { diveCities, mapLabels } from '../../content/geo'
import { cityKeys, landformKeys, waterKeys } from '../../content/cities'
import { motionOK } from '../../composables/useDevice'
import { pauseBackgroundStages } from '../three/engine/pause'
import { startScroll, stopScroll } from '../../composables/useSmoothScroll'
import { locale } from '../../i18n'

const city = defineModel('city', { type: String, default: null })

const ui = {
  uz: {
    facts: 'Geografik xususiyatlar',
    lat: 'sh.k.',
    lon: 'sh.u.',
    close: 'Yopish',
    prev: 'Oldingi shahar',
    next: 'Keyingi shahar',
    photo: 'Foto',
    drag: 'Sudrab aylantiring',
    prevPhoto: 'Oldingi rasm',
    nextPhoto: 'Keyingi rasm',
    rotate: 'Sudrab aylantiring',
    more: 'Pastga aylantiring — kesim, iqlim va tabiat',
    profile: 'Balandlik kesimi',
    profileNote: "Hudud bo'ylab yer yuzasi balandligi (metr)",
    nature: 'Tabiati',
    numbers: 'Raqamlarda',
    cards: { climate: 'Iqlimi', flora: "O'simliklari", fauna: 'Hayvonot dunyosi', wealth: 'Tabiiy boyliklari' },
    types: { desert: "Cho'l", mountain: "Tog'lar", valley: 'Vodiy', plateau: 'Plato' },
  },
  ru: {
    facts: 'Географические особенности',
    lat: 'с.ш.',
    lon: 'в.д.',
    close: 'Закрыть',
    prev: 'Предыдущий город',
    next: 'Следующий город',
    photo: 'Фото',
    drag: 'Потяните, чтобы вращать',
    prevPhoto: 'Предыдущее фото',
    nextPhoto: 'Следующее фото',
    rotate: 'Потяните, чтобы вращать',
    more: 'Прокрутите вниз — профиль, климат и природа',
    profile: 'Профиль высот',
    profileNote: 'Высота поверхности вдоль территории (метры)',
    nature: 'Природа',
    numbers: 'В цифрах',
    cards: { climate: 'Климат', flora: 'Растительность', fauna: 'Животный мир', wealth: 'Природные богатства' },
    types: { desert: 'Пустыня', mountain: 'Горы', valley: 'Долина', plateau: 'Плато' },
  },
}
const L = computed(() => ui[locale.value] ?? ui.uz)
const info = computed(() => (city.value ? cityInfo(city.value, locale.value) : null))
const coords = computed(() => {
  const c = diveCities.find((item) => item.key === city.value) ?? mapLabels.find((item) => item.key === city.value)
  return c ? `${c.lat.toFixed(1)}° ${L.value.lat}, ${c.lon.toFixed(1)}° ${L.value.lon}` : ''
})
const photos = computed(() => info.value?.photos ?? [])
const isLand = computed(() => info.value?.kind === 'landform')
const cardIcons = { climate: 'thermo', flora: 'leaf', fauna: 'paw', wealth: 'gem' }

// ── relyef: oyna skrolli 3D sahnaga uzatiladi va pastdagi bloklar ochiladi
const panel = ref(null)
const landScroll = { value: 0 }
const scrolled = ref(false)
function onPanelScroll() {
  const el = panel.value
  if (!el) return
  const max = Math.max(1, el.scrollHeight - el.clientHeight)
  landScroll.value = Math.min(1, el.scrollTop / Math.min(max, 700))
  scrolled.value = el.scrollTop > 40
}
function scrollMore() {
  panel.value?.scrollBy({ top: panel.value.clientHeight * 0.7, behavior: motionOK ? 'smooth' : 'auto' })
}
let revealObserver = null
function setupReveal() {
  revealObserver?.disconnect()
  const root = panel.value
  if (!root) return
  const items = root.querySelectorAll('.lf-reveal')
  if (!motionOK) {
    items.forEach((el) => el.classList.add('is-in'))
    return
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          revealObserver?.unobserve(entry.target)
        }
      }
    },
    { root, threshold: 0.18 },
  )
  items.forEach((el) => revealObserver.observe(el))
}

// ── balandlik kesimi (SVG)
// telefonda tor viewBox — yozuvlar o'qiladigan o'lchamda qoladi
const narrowProfile = window.matchMedia('(max-width: 640px)').matches
const PW = narrowProfile ? 460 : 960
const PH = narrowProfile ? 280 : 300
const profile = computed(() => {
  const data = info.value?.profile
  if (!data) return null
  const pts = data.points
  const min = Math.min(0, ...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const toY = (v) => PH - 36 - ((v - min) / span) * (PH - 84)
  const xy = pts.map((v, i) => [56 + (i * (PW - 84)) / (pts.length - 1), toY(v)])
  let line = `M${xy[0][0]},${xy[0][1].toFixed(1)}`
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[Math.max(0, i - 1)]
    const p1 = xy[i]
    const p2 = xy[i + 1]
    const p3 = xy[Math.min(xy.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    line += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  const base = PH - 36
  const area = `${line} L${xy[xy.length - 1][0]},${base} L${xy[0][0]},${base} Z`
  const unit = locale.value === 'ru' ? 'м' : 'm'
  const ticks = [0, 0.5, 1].map((t) => {
    const v = min + span * t
    return { y: toY(v), label: `${Math.round(v / 10) * 10} ${unit}` }
  })
  const peak = xy[data.peak] ?? xy[0]
  // yozuv chetdan chiqib ketmasin
  const anchor = peak[0] < 140 ? 'start' : peak[0] > PW - 140 ? 'end' : 'middle'
  return { line, area, ticks, peak, anchor, unit, peakValue: pts[data.peak], seaY: min < 0 ? toY(0) : null }
})
const profileColors = computed(() => {
  const type = info.value?.type
  if (type === 'desert') return ['#f2b36f', '#b8663a']
  if (type === 'plateau') return ['#efe6d2', '#a8936e']
  if (type === 'valley') return ['#cfe3a0', '#5f8f45']
  return ['#ffffff', '#7b6f5f']
})
const count = computed(() => Math.max(1, photos.value.length))
const step = computed(() => 360 / count.value)

// ── karusel holati
const angle = ref(0)
const dragging = ref(false)
const active = computed(() => {
  const i = Math.round(angle.value / step.value) % count.value
  return (i + count.value) % count.value
})
const activePhoto = computed(() => photos.value[active.value])

function go(delta) {
  angle.value = Math.round(angle.value / step.value + delta) * step.value
  restartAuto()
}
function goTo(i) {
  // eng qisqa yo'l bilan
  let diff = i - active.value
  if (diff > count.value / 2) diff -= count.value
  if (diff < -count.value / 2) diff += count.value
  go(diff)
}
/** karta qanchalik old tomonda (1 — aynan oldda) */
function frontness(i) {
  let d = Math.abs(((i * step.value - angle.value) % 360) + 360) % 360
  if (d > 180) d = 360 - d
  return 1 - d / 180
}

let autoTimer = 0
function restartAuto() {
  window.clearInterval(autoTimer)
  if (!motionOK) return
  autoTimer = window.setInterval(() => {
    if (!dragging.value) angle.value += step.value
  }, 3600)
}

// sudrash
let startX = 0
let startAngle = 0
const stage = ref(null)
function onDown(event) {
  if (event.button !== 0) return
  dragging.value = true
  startX = event.clientX
  startAngle = angle.value
  stage.value?.setPointerCapture(event.pointerId)
}
function onMove(event) {
  if (!dragging.value) return
  angle.value = startAngle - (event.clientX - startX) * 0.35
}
function onUp(event) {
  if (!dragging.value) return
  dragging.value = false
  if (stage.value?.hasPointerCapture(event.pointerId)) stage.value.releasePointerCapture(event.pointerId)
  go(0)
}

// ── shaharlar bo'ylab
// oldingi/keyingi — shu turdagi obyektlar ichida (shaharlar yoki suv obyektlari)
function otherCity(delta) {
  const order = waterKeys.includes(city.value) ? waterKeys : landformKeys.includes(city.value) ? landformKeys : cityKeys
  const i = order.indexOf(city.value)
  city.value = order[(i + delta + order.length) % order.length]
}

// ── ochish / yopish
const closeBtn = ref(null)
let lastFocus = null
function close() {
  city.value = null
}
function onKey(event) {
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowRight') go(1)
  else if (event.key === 'ArrowLeft') go(-1)
}
watch(
  city,
  (value, old) => {
    if (value && !old) {
      lastFocus = document.activeElement
      stopScroll()
      // orqadagi 3D sahnalar oyna ochiqligida render qilinmaydi
      pauseBackgroundStages(true)
      window.addEventListener('keydown', onKey)
      nextTick(() => closeBtn.value?.focus({ preventScroll: true }))
    }
    if (!value && old) {
      startScroll()
      pauseBackgroundStages(false)
      window.removeEventListener('keydown', onKey)
      window.clearInterval(autoTimer)
      lastFocus?.focus?.({ preventScroll: true })
    }
    if (value) {
      angle.value = 0
      restartAuto()
      landScroll.value = 0
      scrolled.value = false
      nextTick(() => {
        if (panel.value) panel.value.scrollTop = 0
        setupReveal()
      })
    } else {
      revealObserver?.disconnect()
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  revealObserver?.disconnect()
  window.clearInterval(autoTimer)
  window.removeEventListener('keydown', onKey)
  if (city.value) {
    startScroll()
    pauseBackgroundStages(false)
  }
})

const radius = computed(() => {
  // karta kengligi 100% (stage birligida ~ 0.62) — halqa radiusi kartalar orasida bo'shliq qoldiradi
  const n = count.value
  return n < 3 ? 0 : Math.round((330 / Math.tan(Math.PI / n)) * 0.62 + 60)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="city-modal">
      <div v-if="info" class="city-modal" role="dialog" aria-modal="true" :aria-labelledby="`city-title-${info.key}`" @click.self="close">
        <div ref="panel" class="city-modal__panel" :class="{ 'is-land': isLand }" @scroll.passive="onPanelScroll">
          <header class="city-modal__head">
            <button type="button" class="city-modal__nav" :aria-label="L.prev" @click="otherCity(-1)">
              <AppIcon name="arrow" :size="18" class="is-flip" />
            </button>
            <div class="city-modal__title">
              <span class="city-modal__country">
                <span v-if="isLand" class="city-modal__type" :class="`is-${info.type}`">{{ L.types[info.type] }}</span>
                <AppIcon name="globe" :size="14" /> {{ info.country }} · {{ coords }}
              </span>
              <h3 :id="`city-title-${info.key}`">{{ info.name }}</h3>
            </div>
            <button type="button" class="city-modal__nav" :aria-label="L.next" @click="otherCity(1)">
              <AppIcon name="arrow" :size="18" />
            </button>
            <button ref="closeBtn" type="button" class="city-modal__close" :aria-label="L.close" @click="close">
              <AppIcon name="close" :size="20" />
            </button>
          </header>

          <div class="city-modal__body">
            <!-- 3D relyef dioramasi (cho'l, tog', vodiy, plato) -->
            <LandformViewer v-if="isLand" :key="info.key" :info="info" :scroll="landScroll" :hint="L.rotate" />
            <!-- 3D galereya -->
            <div v-else class="cg">
              <div
                ref="stage"
                class="cg-stage"
                :class="{ 'is-dragging': dragging }"
                @pointerdown="onDown"
                @pointermove="onMove"
                @pointerup="onUp"
                @pointercancel="onUp"
              >
                <div class="cg-tilt">
                  <div class="cg-ring" :style="{ transform: `translateZ(${-radius}px) rotateY(${-angle}deg)` }">
                    <figure
                      v-for="(photo, i) in photos"
                      :key="photo.file"
                      class="cg-card"
                      :class="{ 'is-active': i === active }"
                      :style="{
                        transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                        '--front': frontness(i).toFixed(3),
                      }"
                      @click="i !== active && goTo(i)"
                    >
                      <img :src="photo.file" :alt="photo.caption" draggable="false" decoding="async" />
                      <figcaption>{{ photo.caption }}</figcaption>
                    </figure>
                  </div>
                </div>
                <div class="cg-floor" aria-hidden="true" />
              </div>

              <div class="cg-controls">
                <button type="button" class="cg-arrow" :aria-label="L.prevPhoto" @click="go(-1)">
                  <AppIcon name="arrow" :size="18" class="is-flip" />
                </button>
                <div class="cg-thumbs">
                  <button
                    v-for="(photo, i) in photos"
                    :key="photo.file"
                    type="button"
                    class="cg-thumb"
                    :class="{ 'is-on': i === active }"
                    :aria-label="photo.caption"
                    @click="goTo(i)"
                  >
                    <img :src="photo.file" alt="" loading="lazy" decoding="async" />
                  </button>
                </div>
                <button type="button" class="cg-arrow" :aria-label="L.nextPhoto" @click="go(1)">
                  <AppIcon name="arrow" :size="18" />
                </button>
              </div>
              <p v-if="activePhoto" class="cg-credit">
                {{ L.photo }}:
                <a :href="activePhoto.source" target="_blank" rel="noopener noreferrer">{{ activePhoto.artist }}</a>
                · {{ activePhoto.license }} · Wikimedia Commons
              </p>
            </div>

            <!-- Ma'lumot -->
            <div class="city-info">
              <dl class="city-info__stats">
                <div v-for="stat in info.stats" :key="stat.label">
                  <dt>{{ stat.label }}</dt>
                  <dd>{{ stat.value }}</dd>
                </div>
              </dl>
              <p class="city-info__text">{{ info.text }}</p>
              <h4 class="city-info__facts-title"><AppIcon name="mountain" :size="16" /> {{ L.facts }}</h4>
              <ul class="city-info__facts">
                <li v-for="fact in info.facts" :key="fact"><AppIcon name="check" :size="16" :stroke="2.2" />{{ fact }}</li>
              </ul>
            </div>
          </div>

          <!-- Pastga aylantirganda ochiladigan bloklar (relyef obyektlari) -->
          <div v-if="isLand" :key="`more-${info.key}`" class="lf-more">
            <button type="button" class="lf-cue" :class="{ 'is-hidden': scrolled }" @click="scrollMore">
              {{ L.more }} <AppIcon name="chevronDown" :size="18" :stroke="2.2" />
            </button>

            <section v-if="profile" class="lf-profile lf-reveal">
              <header class="lf-block-head">
                <h4><AppIcon name="activity" :size="18" /> {{ L.profile }}</h4>
                <p>{{ L.profileNote }}</p>
              </header>
              <svg :viewBox="`0 0 ${PW} ${PH}`" class="lf-profile__svg" role="img" :aria-label="L.profile">
                <defs>
                  <linearGradient :id="`lf-fill-${info.key}`" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" :stop-color="profileColors[0]" stop-opacity="0.95" />
                    <stop offset="1" :stop-color="profileColors[1]" stop-opacity="0.8" />
                  </linearGradient>
                </defs>
                <g class="lf-profile__grid">
                  <g v-for="tick in profile.ticks" :key="tick.y">
                    <line x1="52" :x2="PW - 20" :y1="tick.y" :y2="tick.y" />
                    <text x="46" :y="tick.y + 4" text-anchor="end">{{ tick.label }}</text>
                  </g>
                </g>
                <line v-if="profile.seaY" class="lf-profile__sea" x1="52" :x2="PW - 20" :y1="profile.seaY" :y2="profile.seaY" />
                <path class="lf-profile__area" :d="profile.area" :fill="`url(#lf-fill-${info.key})`" />
                <path class="lf-profile__line" :d="profile.line" pathLength="1" />
                <g class="lf-profile__peak" :transform="`translate(${profile.peak[0]} ${profile.peak[1]})`">
                  <circle r="12" class="lf-profile__pulse" />
                  <circle r="6" />
                  <text :y="info.profile.valley ? 26 : -16" :text-anchor="profile.anchor">
                    {{ info.profilePeak }} · {{ profile.peakValue }} {{ profile.unit }}
                  </text>
                </g>
                <text class="lf-profile__end" x="56" :y="PH - 10">◂ {{ info.profileFrom }}</text>
                <text class="lf-profile__end" :x="PW - 28" :y="PH - 10" text-anchor="end">{{ info.profileTo }} ▸</text>
              </svg>
            </section>

            <section class="lf-nature">
              <header class="lf-block-head lf-reveal">
                <h4><AppIcon name="globe" :size="18" /> {{ L.nature }}</h4>
              </header>
              <div class="lf-cards">
                <article
                  v-for="(text, key, i) in info.cards"
                  :key="key"
                  class="lf-card lf-reveal"
                  :class="`lf-card--${key}`"
                  :style="{ '--i': i }"
                >
                  <span class="lf-card__icon"><AppIcon :name="cardIcons[key]" :size="22" /></span>
                  <h5>{{ L.cards[key] }}</h5>
                  <p>{{ text }}</p>
                </article>
              </div>
            </section>

            <section class="lf-numbers">
              <header class="lf-block-head lf-reveal">
                <h4><AppIcon name="chart" :size="18" /> {{ L.numbers }}</h4>
              </header>
              <div class="lf-numbers__grid">
                <div v-for="(n, i) in info.numbers" :key="n.label" class="lf-number lf-reveal" :style="{ '--i': i }">
                  <strong><CountUp :value="n.value" /></strong>
                  <span>{{ n.label }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.city-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: hsl(222 40% 4% / 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.city-modal__panel {
  position: relative;
  width: min(1160px, 100%);
  max-height: calc(100svh - 32px);
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 28px;
  color: hsl(var(--fg));
  background:
    radial-gradient(70% 60% at 20% 0%, hsl(var(--primary) / 0.16), transparent 70%),
    radial-gradient(60% 50% at 100% 100%, hsl(var(--accent) / 0.1), transparent 70%),
    hsl(var(--surface));
  border: 1px solid hsl(var(--glass-line));
  box-shadow: 0 50px 120px -40px hsl(222 60% 2% / 0.9);
}
.city-modal-enter-active,
.city-modal-leave-active {
  transition: opacity 0.35s ease;
}
.city-modal-enter-active .city-modal__panel,
.city-modal-leave-active .city-modal__panel {
  transition:
    transform 0.55s cubic-bezier(0.2, 0.9, 0.25, 1),
    opacity 0.4s ease;
}
.city-modal-enter-from,
.city-modal-leave-to {
  opacity: 0;
}
.city-modal-enter-from .city-modal__panel {
  opacity: 0;
  transform: perspective(1200px) translateY(40px) rotateX(10deg) scale(0.94);
}
.city-modal-leave-to .city-modal__panel {
  opacity: 0;
  transform: perspective(1200px) translateY(20px) scale(0.97);
}

.city-modal__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 22px 6px;
}
.city-modal__title {
  flex: 1;
  min-width: 0;
}
.city-modal__title h3 {
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
}
.city-modal__country {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 650;
  color: hsl(var(--primary-strong));
}
.city-modal__nav,
.city-modal__close,
.cg-arrow {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: hsl(var(--fg));
  border: 1px solid hsl(var(--line));
  background: hsl(var(--surface-2) / 0.7);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.city-modal__nav:hover,
.city-modal__close:hover,
.cg-arrow:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.12);
}
.city-modal__nav:active,
.cg-arrow:active {
  transform: scale(0.92);
}
.city-modal__close {
  margin-left: 8px;
}
.is-flip {
  transform: scaleX(-1);
}
.city-modal__body {
  display: grid;
  gap: 18px 28px;
  padding: 6px 22px 24px;
}
@media (min-width: 960px) {
  .city-modal__body {
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
    align-items: center;
  }
}

/* ── 3D galereya */
.cg {
  min-width: 0;
}
.cg-stage {
  --card-w: min(62%, 420px);
  position: relative;
  height: clamp(250px, 46vw, 400px);
  perspective: 1300px;
  perspective-origin: 50% 40%;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  overflow: hidden;
  border-radius: 22px;
  background: radial-gradient(80% 70% at 50% 35%, hsl(var(--primary) / 0.12), transparent 70%);
}
.cg-stage.is-dragging {
  cursor: grabbing;
}
.cg-tilt {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.cg-ring {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.22, 0.9, 0.25, 1);
}
.cg-stage.is-dragging .cg-ring {
  transition: none;
}
.cg-card {
  position: absolute;
  left: 0;
  top: 0;
  width: 420px;
  max-width: 62vw;
  aspect-ratio: 4 / 3;
  margin: 0;
  translate: -50% -50%;
  border-radius: 18px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: hsl(var(--bg-deep));
  box-shadow:
    0 30px 60px -25px hsl(222 60% 3% / 0.75),
    0 0 0 1px hsl(0 0% 100% / 0.08);
  filter: brightness(calc(0.45 + var(--front) * 0.55)) saturate(calc(0.6 + var(--front) * 0.4));
  transition: filter 0.6s ease;
  -webkit-box-reflect: below 10px linear-gradient(transparent 70%, rgb(255 255 255 / 0.18));
  cursor: pointer;
}
.cg-card.is-active {
  cursor: grab;
  box-shadow:
    0 40px 80px -30px hsl(222 60% 3% / 0.85),
    0 0 0 2px hsl(var(--primary) / 0.65),
    0 0 60px -10px hsl(var(--primary) / 0.45);
}
.cg-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.cg-card figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26px 16px 12px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(transparent, hsl(222 50% 5% / 0.82));
  opacity: 0;
  translate: 0 8px;
  transition:
    opacity 0.4s ease,
    translate 0.4s ease;
}
.cg-card.is-active figcaption {
  opacity: 1;
  translate: 0 0;
}
.cg-floor {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 6%;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(closest-side, hsl(var(--primary) / 0.35), transparent);
  filter: blur(8px);
  pointer-events: none;
}
.cg-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
}
.cg-thumbs {
  display: flex;
  gap: 8px;
}
.cg-thumb {
  width: 58px;
  height: 42px;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.cg-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.cg-thumb:hover {
  opacity: 0.9;
}
.cg-thumb.is-on {
  opacity: 1;
  border-color: hsl(var(--primary));
  transform: translateY(-2px);
}
.cg-credit {
  margin-top: 10px;
  text-align: center;
  font-size: 0.74rem;
  color: hsl(var(--muted));
}
.cg-credit a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── ma'lumot */
.city-info__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.city-info__stats div {
  padding: 12px 14px;
  border-radius: 16px;
  background: hsl(var(--fg) / 0.04);
  border: 1px solid hsl(var(--line));
}
.city-info__stats dt {
  font-size: 0.78rem;
  color: hsl(var(--muted));
}
.city-info__stats dd {
  margin-top: 2px;
  font-size: 1.02rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  font-weight: 750;
  letter-spacing: -0.02em;
}
.city-info__text {
  margin-top: 16px;
  font-size: 1rem;
  line-height: 1.6;
  color: hsl(var(--fg-soft));
}
.city-info__facts-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  font-size: 1rem;
  font-weight: 700;
}
.city-info__facts-title svg {
  color: hsl(var(--primary-strong));
}
.city-info__facts {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}
.city-info__facts li {
  display: flex;
  gap: 10px;
  font-size: 0.94rem;
  line-height: 1.5;
  color: hsl(var(--fg-soft));
}
.city-info__facts svg {
  flex: none;
  margin-top: 3px;
  color: hsl(var(--primary-strong));
}
/* ── relyef obyektlari: tur belgisi va pastga aylantirganda ochiladigan bloklar */
.city-modal__type {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
  background: hsl(var(--primary));
}
.city-modal__type.is-desert {
  background: linear-gradient(90deg, #d9803f, #b0532a);
}
.city-modal__type.is-mountain {
  background: linear-gradient(90deg, #7d8ea3, #4f5d70);
}
.city-modal__type.is-valley {
  background: linear-gradient(90deg, #5f9a45, #3d7a3b);
}
.city-modal__type.is-plateau {
  background: linear-gradient(90deg, #b59c74, #8a7454);
}
.lf-more {
  position: relative;
  display: grid;
  gap: clamp(28px, 4vw, 44px);
  padding: 4px 22px 34px;
}
.lf-cue {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.15rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  color: hsl(var(--primary-fg));
  background: linear-gradient(90deg, hsl(var(--grad-from)), hsl(var(--grad-to)));
  box-shadow: 0 14px 30px -14px hsl(var(--primary) / 0.8);
  transition:
    opacity 0.4s ease,
    translate 0.4s ease;
}
.lf-cue svg {
  animation: lf-bounce 1.4s ease-in-out infinite;
}
.lf-cue.is-hidden {
  opacity: 0;
  translate: 0 -8px;
  pointer-events: none;
}
@keyframes lf-bounce {
  0%,
  100% {
    transform: translateY(-2px);
  }
  50% {
    transform: translateY(3px);
  }
}
.lf-block-head h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(1.15rem, 2.2vw, 1.4rem);
  font-weight: 780;
  letter-spacing: -0.02em;
}
.lf-block-head h4 svg {
  color: hsl(var(--primary-strong));
}
.lf-block-head p {
  margin-top: 4px;
  font-size: 0.88rem;
  color: hsl(var(--muted));
}

/* reveal: 3D bilan «ko'tarilib» chiqadi */
.lf-reveal {
  opacity: 0;
  transform: perspective(900px) translateY(46px) rotateX(28deg) scale(0.96);
  transform-origin: 50% 100%;
  transition:
    opacity 0.7s ease,
    transform 0.9s var(--ease-out-expo);
  transition-delay: calc(var(--i, 0) * 110ms);
}
.lf-reveal.is-in {
  opacity: 1;
  transform: none;
}

/* balandlik kesimi */
.lf-profile {
  padding: 18px 18px 8px;
  border-radius: 24px;
  background:
    radial-gradient(80% 90% at 50% 0%, hsl(var(--accent) / 0.1), transparent 70%),
    hsl(var(--fg) / 0.03);
  border: 1px solid hsl(var(--line));
}
.lf-profile__svg {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 10px;
  overflow: visible;
}
.lf-profile__grid line {
  stroke: hsl(var(--line));
  stroke-dasharray: 3 5;
}
.lf-profile__grid text,
.lf-profile__end {
  font-size: 12px;
  font-weight: 600;
  fill: hsl(var(--muted));
}
.lf-profile__end {
  font-size: 13px;
  fill: hsl(var(--fg-soft));
}
.lf-profile__sea {
  stroke: #3fa7d6;
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
}
.lf-profile__area {
  opacity: 0;
  transform: scaleY(0.2);
  transform-origin: 50% 100%;
  transform-box: fill-box;
  transition:
    opacity 0.8s ease 0.5s,
    transform 1.1s var(--ease-out-expo) 0.5s;
}
.lf-profile__line {
  fill: none;
  stroke: hsl(var(--primary-strong));
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.6s cubic-bezier(0.6, 0.05, 0.25, 1) 0.25s;
}
.lf-profile__peak {
  opacity: 0;
  transition: opacity 0.5s ease 1.5s;
}
.lf-profile__peak circle {
  fill: #ffcf6b;
  stroke: hsl(var(--surface));
  stroke-width: 2;
}
.lf-profile__peak .lf-profile__pulse {
  fill: #ffcf6b;
  stroke: none;
  opacity: 0.35;
  transform-box: fill-box;
  transform-origin: center;
  animation: lf-pulse 1.8s ease-out infinite;
}
@keyframes lf-pulse {
  from {
    transform: scale(0.5);
    opacity: 0.6;
  }
  to {
    transform: scale(1.8);
    opacity: 0;
  }
}
.lf-profile__peak text {
  font-size: 13.5px;
  font-weight: 750;
  fill: hsl(var(--fg));
  paint-order: stroke;
  stroke: hsl(var(--surface));
  stroke-width: 4px;
  stroke-linejoin: round;
}
.lf-profile.is-in .lf-profile__area {
  opacity: 1;
  transform: none;
}
.lf-profile.is-in .lf-profile__line {
  stroke-dashoffset: 0;
}
.lf-profile.is-in .lf-profile__peak {
  opacity: 1;
}

/* tabiat kartalari */
.lf-cards {
  display: grid;
  gap: 14px;
  margin-top: 14px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
.lf-card {
  --tone: 174 60% 40%;
  position: relative;
  padding: 18px 18px 20px;
  border-radius: 20px;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 0% 0%, hsl(var(--tone) / 0.16), transparent 60%),
    hsl(var(--surface-2) / 0.7);
  border: 1px solid hsl(var(--tone) / 0.28);
  box-shadow: 0 24px 40px -30px hsl(var(--tone) / 0.9);
}
.lf-card.is-in {
  transition:
    opacity 0.7s ease,
    transform 0.5s var(--ease-out-expo),
    box-shadow 0.3s ease;
  transition-delay: calc(var(--i, 0) * 110ms), 0s, 0s;
}
.lf-card.is-in:hover {
  transform: perspective(900px) translateY(-4px) rotateX(4deg);
  box-shadow: 0 30px 50px -28px hsl(var(--tone) / 1);
}
.lf-card--climate {
  --tone: 24 85% 52%;
}
.lf-card--flora {
  --tone: 120 45% 40%;
}
.lf-card--fauna {
  --tone: 36 70% 45%;
}
.lf-card--wealth {
  --tone: 265 55% 58%;
}
.lf-card__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(140deg, hsl(var(--tone)), hsl(var(--tone) / 0.7));
  box-shadow: 0 10px 20px -10px hsl(var(--tone));
}
.lf-card h5 {
  margin-top: 12px;
  font-size: 1.02rem;
  font-weight: 750;
}
.lf-card p {
  margin-top: 6px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: hsl(var(--fg-soft));
}

/* raqamlar */
.lf-numbers__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.lf-number {
  padding: 18px 16px;
  border-radius: 20px;
  text-align: center;
  background: hsl(var(--fg) / 0.03);
  border: 1px solid hsl(var(--line));
}
.lf-number strong {
  display: block;
  font-size: clamp(1.5rem, 3.6vw, 2.3rem);
  font-weight: 820;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(90deg, hsl(var(--grad-from)), hsl(var(--grad-to)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lf-number > span {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  color: hsl(var(--muted));
}

@media (max-width: 640px) {
  .lf-more {
    padding: 4px 14px 24px;
  }
  .lf-numbers__grid {
    grid-template-columns: 1fr;
  }
  .lf-profile {
    padding: 14px 10px 6px;
  }
  .lf-profile__grid text {
    font-size: 15px;
  }
  .lf-profile__end {
    font-size: 16px;
  }
  .lf-profile__peak text {
    font-size: 17px;
  }
}

@media (max-width: 640px) {
  .city-modal {
    padding: 8px;
    align-items: end;
  }
  .city-modal__panel {
    border-radius: 24px;
    max-height: calc(100svh - 16px);
  }
  .city-modal__head {
    padding: 14px 14px 4px;
    gap: 8px;
  }
  .city-modal__nav {
    width: 38px;
    height: 38px;
  }
  .city-modal__body {
    padding: 4px 14px 18px;
  }
  .cg-card {
    width: 300px;
  }
  .cg-thumb {
    width: 46px;
    height: 34px;
  }
  .city-info__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .city-info__stats dd {
    font-size: 1rem;
  }
}
</style>
