<script setup>
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { t } from '../../i18n'
import ShowcaseGlobe from '../three/ShowcaseGlobe.vue'
</script>

<template>
  <section class="section final-cta" aria-labelledby="final-title">
    <div class="container-x">
      <div v-reveal class="final-cta__box">
        <div class="final-cta__topo" aria-hidden="true" />
        <ShowcaseGlobe variant="horizon" class="final-cta__planet" />
        <div class="final-cta__content">
          <h2 id="final-title" class="h2 final-cta__title">{{ t('final.title') }}</h2>
          <p class="final-cta__text">{{ t('final.text') }}</p>
          <div class="final-cta__actions">
            <a
              :href="links.studentRegister"
              class="btn btn-lg final-cta__primary"
              @click="flyToPortal($event, links.studentRegister)"
            >
              {{ t('cta.register') }}
            </a>
            <a :href="links.studentLogin" class="btn btn-lg final-cta__ghost" @click="flyToPortal($event, links.studentLogin)">
              {{ t('cta.studentLogin') }}
            </a>
            <a :href="links.teacherLogin" class="btn btn-lg final-cta__ghost" @click="flyToPortal($event, links.teacherLogin)">
              {{ t('cta.teacherPanel') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.final-cta__box {
  position: relative;
  overflow: hidden;
  padding: clamp(2.2rem, 6vw, 5rem) clamp(1.4rem, 5vw, 4.5rem);
  border-radius: 34px;
  color: #fff;
  background:
    radial-gradient(80% 120% at 100% 0%, hsl(205 85% 45% / 0.85), transparent 60%),
    radial-gradient(70% 90% at 0% 100%, hsl(170 70% 30%), transparent 70%), linear-gradient(135deg, hsl(174 68% 30%), hsl(196 75% 32%));
  box-shadow: 0 40px 90px -45px hsl(180 70% 30% / 0.9);
}
.final-cta__topo {
  position: absolute;
  inset: -10%;
  background: url('/images/contours.svg') center / cover no-repeat;
  opacity: 0.22;
  mix-blend-mode: soft-light;
  pointer-events: none;
}
.final-cta__planet {
  position: absolute;
  inset: 0;
  height: auto;
}
@media (max-width: 760px) {
  .final-cta__box {
    padding-bottom: 260px;
  }
  .final-cta__planet {
    inset: auto 0 0 0;
    height: 300px;
  }
}
.final-cta__content {
  position: relative;
  max-width: 44rem;
}
.final-cta__title {
  color: #fff;
}
.final-cta__text {
  margin-top: 1.1rem;
  font-size: clamp(1.05rem, 1.4vw, 1.2rem);
  line-height: 1.6;
  color: hsl(0 0% 100% / 0.86);
  max-width: 52ch;
}
.final-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}
.final-cta__primary {
  color: hsl(196 70% 16%);
  background: #fff;
}
.final-cta__primary:hover {
  background: hsl(174 60% 92%);
  box-shadow: 0 12px 30px -12px hsl(0 0% 100% / 0.6);
}
.final-cta__ghost {
  color: #fff;
  border: 1px solid hsl(0 0% 100% / 0.45);
}
.final-cta__ghost:hover {
  background: hsl(0 0% 100% / 0.12);
  border-color: #fff;
}
</style>
