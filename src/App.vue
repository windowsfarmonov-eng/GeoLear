<script setup>
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import TrustRow from './components/sections/TrustRow.vue'
import ProblemSection from './components/sections/ProblemSection.vue'
import DiveSection from './components/sections/DiveSection.vue'
import CurriculumSection from './components/sections/CurriculumSection.vue'
import FeaturesSection from './components/sections/FeaturesSection.vue'
import TeachersSection from './components/sections/TeachersSection.vue'
import StudentsSection from './components/sections/StudentsSection.vue'
import LiveGameSection from './components/sections/LiveGameSection.vue'
import AiSection from './components/sections/AiSection.vue'
import HowItWorksSection from './components/sections/HowItWorksSection.vue'
import RolesSection from './components/sections/RolesSection.vue'
import FaqSection from './components/sections/FaqSection.vue'
import FinalCta from './components/sections/FinalCta.vue'
import { initSmoothScroll, ScrollTrigger, scrollToSection, watchLayoutChanges } from './composables/useSmoothScroll'
import { locale, t } from './i18n'

// til almashganda matn uzunligi va bo'lim balandliklari o'zgaradi
watch(locale, () => nextTick(() => ScrollTrigger.refresh()))

let stopWatchingLayout = () => {}

onMounted(() => {
  initSmoothScroll()
  stopWatchingLayout = watchLayoutChanges(document.getElementById('main'))
  // shriftlar yuklangach bo'lim balandliklari o'zgarishi mumkin
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  // URL'da #bo'lim bo'lsa — o'sha joyga
  const hash = decodeURIComponent(window.location.hash.slice(1))
  if (hash && document.getElementById(hash)) {
    window.setTimeout(() => scrollToSection(hash), 300)
  }
})
onBeforeUnmount(() => stopWatchingLayout())
</script>

<template>
  <a href="#main" class="skip-link">{{ t('a11y.skip') }}</a>
  <div class="page-bg" aria-hidden="true" />
  <SiteHeader />
  <main id="main" tabindex="-1">
    <HeroSection />
    <TrustRow />
    <ProblemSection />
    <DiveSection />
    <CurriculumSection />
    <FeaturesSection />
    <TeachersSection />
    <StudentsSection />
    <LiveGameSection />
    <AiSection />
    <HowItWorksSection />
    <RolesSection />
    <FaqSection />
    <FinalCta />
  </main>
  <SiteFooter />
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
