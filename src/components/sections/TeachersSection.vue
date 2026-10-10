<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import DisplayMockup from '../devices/DisplayMockup.vue'
import TeacherCrm from '../crm/TeacherCrm.vue'
import { computed, ref } from 'vue'
import { crmData, crmViews } from '../../content/crm'
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { scrollToElement, scrollToSection } from '../../composables/scrollLite'
import { locale, t, tm } from '../../i18n'

// tartib i18n'dagi «teachers.items» bilan bir xil
const icons = ['dashboard', 'activity', 'users', 'book', 'clipboard', 'gamepad', 'trophy', 'video', 'bot', 'shield', 'sliders']

// noutbukdagi CRM'da ochiq bo'lim; pastdagi ro'yxatdan ham tanlanadi
const crmView = ref('dashboard')
const laptop = ref(null)
const hint = computed(() => (crmData[locale.value] ?? crmData.uz).hint)
// monitor oldida suzib turuvchi karta: hozir ochiq bo'lim
const currentIndex = computed(() => Math.max(0, crmViews.indexOf(crmView.value)))
const currentItem = computed(() => tm('teachers.items')?.[currentIndex.value] ?? null)
const liveLabel = computed(() => (locale.value === 'ru' ? 'Живая демонстрация' : 'Jonli namoyish'))

function showInLaptop(i) {
  crmView.value = crmViews[i]
  const el = laptop.value?.$el
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.top < 60 || rect.top > window.innerHeight * 0.4) scrollToElement(el, -90)
}
</script>

<template>
  <section id="oqituvchilar" class="section teachers" aria-labelledby="teachers-title">
    <div class="container-x">
      <div class="teachers__head">
        <SectionHeading id="teachers-title" :title="t('teachers.title')" :lead="t('teachers.subtitle')" />
        <a
          :href="links.teacherLogin"
          class="btn btn-lg btn-primary teachers__cta"
          @click="flyToPortal($event, links.teacherLogin)"
        >
          {{ t('cta.panelLogin') }}
        </a>
      </div>

      <p class="teachers__hint">
        <span class="teachers__hint-dot" aria-hidden="true" />
        {{ hint }}
      </p>
      <DisplayMockup ref="laptop" class="teachers__display">
        <TeacherCrm v-model:view="crmView" />
        <template #float>
          <div class="crm-float" aria-live="polite">
            <div class="crm-float__top">
              <span class="crm-float__live"><i aria-hidden="true" /> {{ liveLabel }}</span>
              <span class="crm-float__count">{{ String(currentIndex + 1).padStart(2, '0') }} / {{ crmViews.length }}</span>
            </div>
            <div v-if="currentItem" :key="crmView" class="crm-float__body">
                <span class="crm-float__icon" aria-hidden="true"><AppIcon :name="icons[currentIndex] ?? 'check'" :size="20" /></span>
                <div>
                  <strong>{{ currentItem.title }}</strong>
                  <p>{{ currentItem.text }}</p>
                </div>
            </div>
            <!-- mayda ko'rsatkich nuqtalari: klaviatura uchun pastdagi ro'yxat xuddi shu bo'limlarni ochadi -->
            <div class="crm-float__dots">
              <button
                v-for="(key, i) in crmViews"
                :key="key"
                type="button"
                tabindex="-1"
                :class="{ 'is-on': key === crmView }"
                :aria-label="tm('teachers.items')?.[i]?.title ?? key"
                @click="crmView = key"
              />
            </div>
          </div>
        </template>
      </DisplayMockup>

      <ul class="teacher-list">
        <li v-for="(item, i) in tm('teachers.items')" :key="item.title" v-reveal="(i % 3) * 60">
          <button
            type="button"
            class="teacher-list__item"
            :class="{ 'is-active': crmView === crmViews[i] }"
            :aria-pressed="crmView === crmViews[i]"
            @click="showInLaptop(i)"
          >
            <span class="teacher-list__icon" aria-hidden="true">
              <AppIcon :name="icons[i] ?? 'check'" :size="20" />
            </span>
            <span>
              <span class="teacher-list__title">{{ item.title }}</span>
              <span class="teacher-list__text">{{ item.text }}</span>
            </span>
          </button>
        </li>
      </ul>

      <p class="teachers__note">
        {{ t('teachers.note') }}
        <a href="#faq" class="text-link" @click.prevent="scrollToSection('faq')">{{ t('teachers.noteLink') }}</a
        >.
      </p>
    </div>
  </section>
</template>

<style>
.teachers__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem 2rem;
}
.teachers__cta {
  flex: none;
}
.teacher-list {
  display: grid;
  gap: 0;
  margin-top: 1rem;
  border-top: 1px solid hsl(var(--line));
}
@media (min-width: 768px) {
  .teacher-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2.5rem;
  }
}
@media (min-width: 1100px) {
  .teacher-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.teachers__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 2.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--primary-strong));
}
.teachers__hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--primary));
  animation: pulse-soft 1.6s ease-in-out infinite;
}
.teachers__display {
  margin-top: 0.75rem;
}
/* monitor oldidagi suzuvchi karta */
.crm-float {
  padding: 16px 16px 14px;
  border-radius: 20px;
  color: #eef4fb;
  background: linear-gradient(160deg, hsl(222 30% 14% / 0.82), hsl(222 34% 9% / 0.88));
  border: 1px solid hsl(174 70% 60% / 0.28);
  box-shadow:
    0 30px 60px -24px hsl(222 60% 3% / 0.85),
    0 0 50px -18px hsl(174 70% 45% / 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.crm-float__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.crm-float__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4ff0d8;
}
.crm-float__live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ff0d8;
  box-shadow: 0 0 0 3px hsl(172 85% 60% / 0.25);
  animation: pulse-soft 1.6s ease-in-out infinite;
}
.crm-float__count {
  color: hsl(214 20% 70%);
  font-variant-numeric: tabular-nums;
}
.crm-float__body {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  min-height: 76px;
}
.crm-float__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: #062420;
  background: linear-gradient(140deg, #4ff0d8, #39a7f0);
}
.crm-float__body strong {
  display: block;
  font-size: 1rem;
  font-weight: 750;
}
.crm-float__body p {
  margin-top: 3px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: hsl(214 22% 78%);
}
.crm-float__dots {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
}
.crm-float__dots button {
  width: 14px;
  height: 6px;
  border-radius: 999px;
  background: hsl(214 20% 60% / 0.35);
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}
.crm-float__dots button:hover {
  background: hsl(214 20% 80% / 0.6);
}
.crm-float__dots button.is-on {
  width: 28px;
  background: linear-gradient(90deg, #4ff0d8, #39a7f0);
}
.crm-float__body {
  animation: crm-float-in 0.55s var(--ease-out-expo) both;
}
@keyframes crm-float-in {
  from {
    opacity: 0;
    transform: perspective(600px) translateY(14px) rotateX(-35deg);
  }
}
@media (max-width: 1023px) {
  .crm-float__body {
    min-height: 0;
  }
}
.teacher-list > li {
  border-bottom: 1px solid hsl(var(--line));
}
.teacher-list__item {
  display: flex;
  gap: 0.9rem;
  width: 100%;
  height: 100%;
  padding: 1.3rem 0.75rem;
  margin-inline: -0.75rem;
  border-radius: 14px;
  text-align: left;
  transition: background-color 0.25s ease;
}
.teacher-list__item:hover {
  background: hsl(var(--primary) / 0.06);
}
.teacher-list__item.is-active {
  background: hsl(var(--primary) / 0.1);
}
.teacher-list__item.is-active .teacher-list__icon {
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
}
.teacher-list__icon {
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 12px;
  color: hsl(var(--primary-strong));
  background: hsl(var(--primary) / 0.12);
}
.teacher-list__title {
  display: block;
  font-size: 1.02rem;
  font-weight: 660;
  letter-spacing: -0.01em;
}
.teacher-list__text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.94rem;
  line-height: 1.55;
  color: hsl(var(--fg-soft));
}
.teachers__note {
  margin-top: 1.6rem;
  font-size: 0.95rem;
  color: hsl(var(--muted));
}
.text-link {
  color: hsl(var(--primary-strong));
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.text-link:hover {
  text-decoration-thickness: 2px;
}
</style>
