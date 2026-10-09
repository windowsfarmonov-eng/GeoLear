<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import ShowcaseGlobe from '../three/ShowcaseGlobe.vue'
import { t, tm } from '../../i18n'

const teacherIcons = ['upload', 'layers', 'clipboard']
const studentIcons = ['book', 'check', 'chart']
</script>

<template>
  <section id="darslar" class="section curriculum" aria-labelledby="curriculum-title">
    <div class="container-x">
      <div class="showcase-head">
        <SectionHeading id="curriculum-title" :title="t('curriculum.title')" :lead="t('curriculum.subtitle')" />
        <ShowcaseGlobe variant="satellite" class="showcase-head__globe" />
      </div>

      <div class="curriculum__grid mt-12 lg:mt-16">
        <article v-reveal class="unit-card">
          <div class="unit-card__topo" aria-hidden="true" />
          <header class="unit-card__head">
            <span class="unit-card__grade">{{ t('curriculum.grade') }}</span>
            <h3 class="unit-card__title">{{ t('curriculum.unit') }}</h3>
          </header>
          <ol class="unit-card__topics">
            <li v-for="(topic, i) in tm('curriculum.topics')" :key="topic">
              <span class="unit-card__num" aria-hidden="true">{{ i + 1 }}</span>
              <span>{{ topic }}</span>
            </li>
          </ol>
          <p class="unit-card__more">{{ t('curriculum.more') }}</p>
        </article>

        <div class="curriculum__flows">
          <div v-reveal="80" class="flow">
            <h3 class="flow__title">
              <AppIcon name="school" :size="20" />
              {{ t('curriculum.teacherFlow.title') }}
            </h3>
            <ol class="flow__steps">
              <li v-for="(step, i) in tm('curriculum.teacherFlow.steps')" :key="step" class="flow__step">
                <span class="flow__icon" aria-hidden="true">
                  <AppIcon :name="teacherIcons[i]" :size="20" />
                </span>
                {{ step }}
              </li>
            </ol>
          </div>
          <div v-reveal="140" class="flow">
            <h3 class="flow__title">
              <AppIcon name="cap" :size="20" />
              {{ t('curriculum.studentFlow.title') }}
            </h3>
            <ol class="flow__steps">
              <li v-for="(step, i) in tm('curriculum.studentFlow.steps')" :key="step" class="flow__step">
                <span class="flow__icon" aria-hidden="true">
                  <AppIcon :name="studentIcons[i]" :size="20" />
                </span>
                {{ step }}
              </li>
            </ol>
          </div>
          <p v-reveal="200" class="curriculum__note">
            <AppIcon name="globe" :size="18" />
            {{ t('curriculum.classes') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.curriculum__grid {
  display: grid;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .curriculum__grid {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 2rem;
    align-items: start;
  }
}
.unit-card {
  position: relative;
  overflow: hidden;
  padding: clamp(1.4rem, 3vw, 2.2rem);
  border-radius: 28px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--line));
}
.unit-card__topo {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: url('/images/contours.svg') right -40px top -20px / 720px auto no-repeat;
  opacity: 0.5;
  mask-image: linear-gradient(200deg, #000 10%, transparent 65%);
  -webkit-mask-image: linear-gradient(200deg, #000 10%, transparent 65%);
}
.unit-card__head {
  position: relative;
}
.unit-card__grade {
  display: inline-flex;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 650;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
}
.unit-card__title {
  margin-top: 0.9rem;
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: 760;
  letter-spacing: -0.025em;
  line-height: 1.15;
  max-width: 22ch;
}
.unit-card__topics {
  position: relative;
  display: grid;
  margin-top: 1.6rem;
  border-top: 1px solid hsl(var(--line));
}
@media (min-width: 640px) {
  .unit-card__topics {
    grid-template-columns: 1fr 1fr;
    column-gap: 1.6rem;
  }
}
.unit-card__topics li {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid hsl(var(--line));
  font-size: 0.98rem;
}
.unit-card__num {
  flex: none;
  width: 1.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: hsl(var(--primary-strong));
}
.unit-card__more {
  position: relative;
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: hsl(var(--muted));
}
.curriculum__flows {
  display: grid;
  gap: 1rem;
}
.flow {
  padding: 1.4rem;
  border-radius: 24px;
  background: hsl(var(--fg) / 0.03);
  border: 1px solid hsl(var(--line));
}
.flow__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.05rem;
  font-weight: 680;
}
.flow__title svg {
  color: hsl(var(--primary-strong));
}
.flow__steps {
  display: grid;
  gap: 0.6rem;
  margin-top: 1rem;
  counter-reset: none;
}
.flow__step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--line));
  font-size: 0.97rem;
  font-weight: 540;
}
.flow__step + .flow__step::before {
  content: '';
  position: absolute;
  left: calc(0.8rem + 18px);
  top: -0.65rem;
  width: 2px;
  height: 0.6rem;
  background: hsl(var(--primary) / 0.5);
}
.flow__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
  color: hsl(var(--primary-strong));
  background: hsl(var(--primary) / 0.12);
}
.curriculum__note {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.4rem 0.2rem;
  font-size: 0.93rem;
  color: hsl(var(--muted));
}
.curriculum__note svg {
  flex: none;
  margin-top: 0.15rem;
  color: hsl(var(--primary-strong));
}
</style>
