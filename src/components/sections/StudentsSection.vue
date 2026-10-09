<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import TabletMockup from '../devices/TabletMockup.vue'
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { t, tm } from '../../i18n'

// tartib i18n'dagi «students.items» bilan bir xil
const icons = ['dashboard', 'chart', 'book', 'clipboard', 'gamepad', 'trophy', 'video', 'bot']
const statusIcons = ['file', 'upload', 'check']
</script>

<template>
  <section id="oquvchilar" class="section students" aria-labelledby="students-title">
    <div class="container-x students__grid">
      <div class="students__copy">
        <SectionHeading id="students-title" :title="t('students.title')" :lead="t('students.subtitle')" />

        <ul class="student-list">
          <li v-for="(item, i) in tm('students.items')" :key="item.title" v-reveal="(i % 2) * 60" class="student-list__item">
            <AppIcon :name="icons[i] ?? 'check'" :size="20" class="student-list__icon" />
            <div>
              <h3 class="student-list__title">{{ item.title }}</h3>
              <p class="student-list__text">{{ item.text }}</p>
            </div>
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

      <div class="students__device">
        <TabletMockup src="/screens/student.png" :alt="t('students.screenAlt')" />
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
.student-list {
  display: grid;
  gap: 1.3rem 1.8rem;
  margin-top: 2.2rem;
}
@media (min-width: 640px) {
  .student-list {
    grid-template-columns: 1fr 1fr;
  }
}
.student-list__item {
  display: flex;
  gap: 0.75rem;
}
.student-list__icon {
  flex: none;
  margin-top: 0.15rem;
  color: hsl(var(--primary-strong));
}
.student-list__title {
  font-size: 1rem;
  font-weight: 660;
}
.student-list__text {
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
