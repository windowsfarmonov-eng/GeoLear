<script setup>
// «Kim sifatida kirasiz?» bo'limidagi katta kartochka (qatlamlar, ro'yxat va kirish tugmalari).
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { t, tm } from '../../i18n'

const props = defineProps({
  role: { type: String, required: true, validator: (v) => v === 'teacher' || v === 'student' },
})

const card = ref(null)

const primary = props.role === 'teacher' ? links.teacherLogin : links.studentLogin
const titleId = `role-card-${props.role}`

function go(event, href) {
  flyToPortal(event, href, card.value)
}

function onCardClick(event) {
  if (event.target.closest('a, button')) return
  go(event, primary)
}
</script>

<template>
  <article ref="card" class="role-card" :class="`role-card--${role}`" @click="onCardClick">
    <span class="role-card__bg" aria-hidden="true" />

    <div class="role-card__orb depth-3" aria-hidden="true">
      <AppIcon :name="role === 'teacher' ? 'school' : 'cap'" :size="34" :stroke="1.6" />
    </div>

    <div class="depth-1">
      <h3 :id="titleId" class="role-card__title">{{ t(`roles.${role}.title`) }}</h3>
      <p class="role-card__text">{{ t(`roles.${role}.text`) }}</p>
    </div>

    <ul class="role-card__list depth-1">
      <li v-for="item in tm(`roles.${role}.items`)" :key="item">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
        {{ item }}
      </li>
    </ul>

    <div class="role-card__actions depth-2">
      <template v-if="role === 'teacher'">
        <a
          :href="links.teacherLogin"
          class="btn btn-lg btn-primary"
          :aria-describedby="titleId"
          @click="go($event, links.teacherLogin)"
        >
          {{ t('cta.panelLogin') }}
        </a>
      </template>
      <template v-else>
        <a
          :href="links.studentLogin"
          class="btn btn-lg btn-primary"
          :aria-describedby="titleId"
          @click="go($event, links.studentLogin)"
        >
          {{ t('cta.login') }}
        </a>
        <a
          :href="links.studentRegister"
          class="btn btn-lg btn-outline"
          :aria-describedby="titleId"
          @click="go($event, links.studentRegister)"
        >
          {{ t('cta.register') }}
        </a>
      </template>
    </div>
  </article>
</template>

<style>
.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100%;
  padding: clamp(1.6rem, 3.2vw, 2.6rem);
  border-radius: 30px;
  cursor: pointer;
  border: 1px solid hsl(var(--glass-line));
  box-shadow: var(--shadow-lg);
}
.role-card__bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(120% 80% at 100% 0%, hsl(var(--primary) / 0.26), transparent 60%),
    radial-gradient(90% 70% at 0% 100%, hsl(var(--accent) / 0.14), transparent 60%), hsl(var(--surface));
}
.role-card--student .role-card__bg {
  background:
    radial-gradient(120% 80% at 100% 0%, hsl(var(--accent) / 0.24), transparent 60%),
    radial-gradient(90% 70% at 0% 100%, hsl(var(--primary) / 0.16), transparent 60%), hsl(var(--surface));
}
.role-card__orb {
  display: grid;
  place-items: center;
  width: 4.6rem;
  height: 4.6rem;
  border-radius: 50%;
  color: hsl(var(--fg));
  background:
    radial-gradient(circle at 32% 28%, hsl(0 0% 100% / 0.55), transparent 42%),
    radial-gradient(circle at 50% 60%, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.12) 70%);
  box-shadow:
    0 18px 40px -16px hsl(var(--primary) / 0.7),
    inset 0 0 0 1px hsl(0 0% 100% / 0.25);
}
.role-card--student .role-card__orb {
  background:
    radial-gradient(circle at 32% 28%, hsl(0 0% 100% / 0.55), transparent 42%),
    radial-gradient(circle at 50% 60%, hsl(var(--accent) / 0.55), hsl(var(--accent) / 0.12) 70%);
  box-shadow:
    0 18px 40px -16px hsl(var(--accent) / 0.7),
    inset 0 0 0 1px hsl(0 0% 100% / 0.25);
}
.role-card__title {
  font-size: clamp(1.7rem, 2.6vw, 2.2rem);
  font-weight: 780;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.role-card__text {
  margin-top: 0.6rem;
  color: hsl(var(--fg-soft));
  max-width: 44ch;
}
.role-card__list {
  display: grid;
  gap: 0.6rem;
  font-size: 0.98rem;
}
.role-card__list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.role-card__list svg {
  flex: none;
  color: hsl(var(--primary-strong));
}
.role-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: auto;
}
</style>
