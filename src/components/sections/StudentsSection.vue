<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import TabletMockup from '../devices/TabletMockup.vue'
import StudentCrm from '../crm/StudentCrm.vue'
import { computed, ref } from 'vue'
import { studentData, studentIcons as icons, studentViews } from '../../content/studentCrm'
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { scrollToElement } from '../../composables/scrollLite'
import { locale, t, tm } from '../../i18n'

// planshetdagi o'quvchi portalida ochiq bo'lim; ro'yxatdan ham tanlanadi (tartib «students.items» bilan bir xil)
const portalView = ref('dashboard')
const device = ref(null)
const hint = computed(() => (studentData[locale.value] ?? studentData.uz).hint)

function showInTablet(i) {
  portalView.value = studentViews[i]
  // tor ekranda planshet ro'yxatdan pastda — bosilganda unga olib boramiz
  const el = device.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.bottom < 120 || rect.top > window.innerHeight * 0.6) scrollToElement(el, -90)
}
const statusIcons = ['file', 'upload', 'check']
</script>

<template>
  <section id="oquvchilar" class="section students" aria-labelledby="students-title">
    <div class="container-x students__grid">
      <div class="students__copy">
        <SectionHeading id="students-title" :title="t('students.title')" :lead="t('students.subtitle')" />

        <ul class="student-list">
          <li v-for="(item, i) in tm('students.items')" :key="item.title" v-reveal="(i % 2) * 60">
            <button
              type="button"
              class="student-list__item"
              :class="{ 'is-active': portalView === studentViews[i] }"
              :aria-pressed="portalView === studentViews[i]"
              @click="showInTablet(i)"
            >
              <span class="student-list__icon" aria-hidden="true"><AppIcon :name="icons[i] ?? 'check'" :size="20" /></span>
              <span>
                <span class="student-list__title">{{ item.title }}</span>
                <span class="student-list__text">{{ item.text }}</span>
              </span>
            </button>
          </li>
        </ul>

        <div v-reveal class="hw-status">
          <h3 class="hw-status__title">{{ t('students.statusTitle') }}</h3>
          <ol class="hw-status__steps">
            <li v-for="(status, i) in tm('students.statuses')" :key="status" class="hw-status__item">
              <span class="hw-status__step" :class="`is-${i}`">
                <AppIcon :name="statusIcons[i] ?? 'check'" :size="16" :stroke="2" />
                {{ status }}
              </span>
              <svg
                v-if="i < 2"
                class="hw-status__chev"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </li>
          </ol>
        </div>

        <div class="students__actions">
          <a :href="links.studentRegister" class="btn btn-lg btn-primary" @click="flyToPortal($event, links.studentRegister)">
            {{ t('cta.register') }}
          </a>
          <a :href="links.studentLogin" class="btn btn-lg btn-outline" @click="flyToPortal($event, links.studentLogin)">
            {{ t('cta.studentLogin') }}
          </a>
        </div>
        <p class="students__note">{{ t('students.note') }}</p>
      </div>

      <div ref="device" class="students__device">
        <p class="students__hint">
          <span class="students__hint-dot" aria-hidden="true" />
          {{ hint }}
        </p>
        <TabletMockup>
          <StudentCrm v-model:view="portalView" />
        </TabletMockup>
      </div>
    </div>
  </section>
</template>

<style>
.students__grid {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .students__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: 3.5rem;
    align-items: center;
  }
  .students__device {
    position: sticky;
    top: 120px;
  }
}
.students__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--primary-strong));
}
.students__hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--primary));
  animation: pulse-soft 1.6s ease-in-out infinite;
}
.student-list {
  display: grid;
  gap: 0.35rem 1rem;
  margin-top: 1.8rem;
}
@media (min-width: 640px) {
  .student-list {
    grid-template-columns: 1fr 1fr;
  }
}
.student-list__item {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
  padding: 0.7rem 0.75rem;
  margin-inline: -0.75rem;
  border-radius: 14px;
  text-align: left;
  transition: background-color 0.25s ease;
}
.student-list__item:hover {
  background: hsl(var(--primary) / 0.06);
}
.student-list__item.is-active {
  background: hsl(var(--primary) / 0.1);
}
.student-list__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 11px;
  color: hsl(var(--primary-strong));
  background: hsl(var(--primary) / 0.12);
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}
.student-list__item.is-active .student-list__icon {
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
}
.student-list__title {
  display: block;
  font-size: 1rem;
  font-weight: 660;
}
.student-list__text {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.93rem;
  line-height: 1.5;
  color: hsl(var(--fg-soft));
}
.hw-status {
  margin-top: 2.2rem;
  padding: 1.1rem 1.2rem;
  border-radius: 18px;
  border: 1px solid hsl(var(--line));
  background: hsl(var(--fg) / 0.025);
}
.hw-status__title {
  font-size: 0.92rem;
  font-weight: 620;
  color: hsl(var(--muted));
}
.hw-status__steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.hw-status__step {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.8rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 620;
}
.hw-status__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.hw-status__chev {
  color: hsl(var(--muted));
}
.hw-status__step.is-0 {
  color: hsl(var(--accent));
  background: hsl(var(--accent) / 0.12);
}
.hw-status__step.is-1 {
  color: hsl(var(--warning));
  background: hsl(var(--warning) / 0.12);
}
.hw-status__step.is-2 {
  color: hsl(var(--success));
  background: hsl(var(--success) / 0.13);
}
.students__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.2rem;
}
.students__note {
  margin-top: 0.9rem;
  font-size: 0.92rem;
  color: hsl(var(--muted));
}
</style>
