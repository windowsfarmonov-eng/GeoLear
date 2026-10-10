<script setup>
import { ref } from 'vue'
import HeroGlobe from '../three/HeroGlobe.vue'
import RoleTile from '../role/RoleTile.vue'
import { scrollToSection } from '../../composables/scrollLite'
import { t } from '../../i18n'

const textColumn = ref(null)
</script>

<template>
  <section id="top" class="hero" aria-labelledby="hero-title">
    <div class="hero__glow" aria-hidden="true" />
    <div class="container-x hero__grid">
      <div ref="textColumn" class="hero__text">
        <p class="hero__badge">
          <span class="hero__badge-dot" aria-hidden="true" />
          {{ t('hero.badge') }}
        </p>
        <h1 id="hero-title" class="hero__title">
          <span class="text-gradient">{{ t('hero.title') }}</span>
        </h1>
        <p class="lead hero__lead">{{ t('hero.subtitle') }}</p>
      </div>

      <HeroGlobe class="hero__visual" :text-column="textColumn" />

      <div class="hero__roles">
        <RoleTile role="teacher" />
        <RoleTile role="student" />
      </div>
    </div>

    <a href="#ishonch" class="hero__scroll" @click.prevent="scrollToSection('ishonch')">
      <span>{{ t('hero.scroll') }}</span>
      <span class="hero__scroll-line" aria-hidden="true" />
    </a>
  </section>
</template>

<style>
.hero {
  position: relative;
  overflow: clip;
  padding-top: 96px;
  padding-bottom: 72px;
}
.hero__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(60% 55% at 78% 45%, hsl(var(--primary) / 0.16), transparent 70%),
    radial-gradient(40% 40% at 10% 15%, hsl(var(--accent) / 0.08), transparent 70%);
}
.hero__grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'text' 'visual' 'roles';
  gap: 1.5rem;
}
.hero__text {
  grid-area: text;
  position: relative;
  z-index: 2;
}
.hero__visual {
  grid-area: visual;
  height: min(118vw, 560px);
  margin-inline: -20px;
}
.hero__roles {
  grid-area: roles;
  position: relative;
  z-index: 2;
  display: grid;
  gap: 0.9rem;
}
@media (min-width: 640px) {
  .hero__roles {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 768px) {
  .hero__visual {
    margin-inline: -32px;
    height: min(80vw, 620px);
  }
}
@media (min-width: 1024px) {
  .hero {
    min-height: max(100svh, 45rem);
    display: flex;
    align-items: center;
    padding-top: 110px;
    padding-bottom: 96px;
  }
  .hero__grid {
    position: static;
    width: 100%;
    grid-template-columns: minmax(0, 0.5fr) minmax(0, 0.5fr);
    grid-template-areas: 'text .' 'roles .';
    column-gap: 3rem;
    row-gap: 2.2rem;
  }
  .hero__visual {
    position: absolute;
    inset: 0;
    height: auto;
    margin: 0;
    z-index: 1;
  }
}
@media (min-width: 1280px) {
  .hero__grid {
    grid-template-columns: minmax(0, 35rem) minmax(0, 1fr);
  }
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 100%;
  padding: 0.45rem 0.9rem 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 560;
  line-height: 1.35;
  color: hsl(var(--fg-soft));
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.22);
}
.hero__badge-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--primary-strong));
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
}
.hero__title {
  margin-top: 1.4rem;
  font-size: clamp(2.6rem, 4.9vw, 4.75rem);
  font-weight: 800;
  letter-spacing: -0.042em;
  line-height: 1.02;
  text-wrap: balance;
}
.hero__lead {
  margin-top: 1.4rem;
  max-width: 52ch;
}
.hero__scroll {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  translate: -50% 0;
  font-size: 0.78rem;
  font-weight: 560;
  color: hsl(var(--muted));
  z-index: 2;
}
.hero__scroll-line {
  position: relative;
  width: 1px;
  height: 34px;
  overflow: hidden;
  background: hsl(var(--fg) / 0.12);
}
.hero__scroll-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: -40%;
  width: 1px;
  height: 40%;
  background: hsl(var(--primary-strong));
  animation: scroll-line 2.2s cubic-bezier(0.6, 0, 0.3, 1) infinite;
}
@keyframes scroll-line {
  to {
    top: 110%;
  }
}
@media (min-width: 1024px) and (min-height: 760px) {
  .hero__scroll {
    display: inline-flex;
  }
}
</style>
