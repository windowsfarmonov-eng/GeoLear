<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import TrustRow from './components/sections/TrustRow.vue'
import ProblemSection from './components/sections/ProblemSection.vue'
import { loadSmoothScroll, scrollToSection, setSectionsReady } from './composables/scrollLite'
import { whenUserReady } from './composables/useScene'
import { locale, t } from './i18n'

// Tezlik: birinchi ekran (hero) darhol chiziladi. Pastdagi bo'limlar alohida fayllarda — foydalanuvchi
// birinchi marta harakat qilganda (skroll, teginish, sichqoncha, klaviatura) yoki bir necha soniyadan keyin
// yuklanadi va brauzer bo'sh paytida bittadan qo'shiladi (uzun «qotish» bo'lmaydi).
// Qidiruv robotlari va #bo'lim havolasi uchun kutilmaydi — butun sahifa darhol chiziladi.
const laterLoaders = [
  () => import('./components/sections/DiveSection.vue'),
  () => import('./components/sections/CurriculumSection.vue'),
  () => import('./components/sections/FeaturesSection.vue'),
  () => import('./components/sections/TeachersSection.vue'),
  () => import('./components/sections/StudentsSection.vue'),
  () => import('./components/sections/LiveGameSection.vue'),
  () => import('./components/sections/AiSection.vue'),
  () => import('./components/sections/HowItWorksSection.vue'),
  () => import('./components/sections/RolesSection.vue'),
  () => import('./components/sections/FaqSection.vue'),
  () => import('./components/sections/FinalCta.vue'),
]
const laterSections = shallowRef([])
const allSections = ref(false)

const whenIdle = () =>
  new Promise((resolve) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 400 })
    else window.setTimeout(resolve, 40)
  })
const afterPaint = () => new Promise((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)))

const isBot = /bot|crawl|spider|slurp|yandex|bingpreview|facebookexternalhit|telegram|whatsapp/i.test(navigator.userAgent)

let unmounted = false
let startSections = () => {}
/** Kutmasdan boshlash (masalan, menyudan pastdagi bo'limga o'tilganda) */
const sectionsWanted = new Promise((resolve) => (startSections = resolve))

const gate = () => (isBot || window.location.hash ? Promise.resolve() : Promise.race([whenUserReady(), sectionsWanted]))

async function mountAll(loaders) {
  const pending = loaders.map((load) => load())
  for (const chunk of pending) {
    const component = (await chunk).default
    if (unmounted) return
    laterSections.value = [...laterSections.value, component]
    await nextTick()
    await whenIdle()
  }
}

async function mountLaterSections() {
  await afterPaint()
  await gate()
  await mountAll(laterLoaders)
  if (unmounted) return
  allSections.value = true
  await nextTick()
}

const refreshTriggers = () => loadSmoothScroll().then(({ ScrollTrigger }) => ScrollTrigger.refresh())
// til almashganda matn uzunligi va bo'lim balandliklari o'zgaradi
watch(locale, () => nextTick(refreshTriggers))

let stopWatchingLayout = () => {}

onMounted(() => {
  const sections = mountLaterSections()
  setSectionsReady(sections, startSections)
  afterPaint()
    .then(gate)
    .then(loadSmoothScroll)
    .then((scroll) => {
      if (unmounted) return
      scroll.initSmoothScroll()
      stopWatchingLayout = scroll.watchLayoutChanges(document.getElementById('main'))
      // shriftlar yuklangach bo'lim balandliklari o'zgarishi mumkin
      document.fonts?.ready.then(() => scroll.ScrollTrigger.refresh())
      sections.then(() => scroll.ScrollTrigger.refresh())
    })
  // URL'da #bo'lim bo'lsa — o'sha joyga (bo'limlar chizilgach)
  let hash = ''
  try {
    hash = decodeURIComponent(window.location.hash.slice(1))
  } catch {
    /* buzuq #hash (masalan, «%») — e'tiborsiz qoldiramiz */
  }
  if (hash) {
    sections.then(() => {
      if (document.getElementById(hash)) window.setTimeout(() => scrollToSection(hash), 300)
    })
  }
})
onBeforeUnmount(() => {
  unmounted = true
  stopWatchingLayout()
})
</script>

<template>
  <a href="#main" class="skip-link">{{ t('a11y.skip') }}</a>
  <div class="page-bg" aria-hidden="true" />
  <SiteHeader />
  <main id="main" tabindex="-1">
    <HeroSection />
    <TrustRow />
    <ProblemSection />
    <component :is="section" v-for="(section, index) in laterSections" :key="index" />
  </main>
  <SiteFooter v-if="allSections" />
</template>

<style>
.skip-link {
  position: fixed;
  left: 16px;
  top: 12px;
  z-index: 100;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  font-weight: 650;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
  transform: translateY(-160%);
  transition: transform 0.2s ease;
}
.skip-link:focus {
  transform: none;
}
.page-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(70% 50% at 85% 0%, hsl(var(--primary) / 0.1), transparent 70%),
    radial-gradient(60% 50% at 0% 100%, hsl(var(--accent) / 0.06), transparent 70%), hsl(var(--bg));
}
.page-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.dark .page-bg::after {
  opacity: 0.07;
  mix-blend-mode: overlay;
}
main:focus {
  outline: none;
}
</style>
