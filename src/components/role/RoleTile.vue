<script setup>
// Hero ichidagi ixcham rol kartochkasi. Bosilganda «uchib kirish»
// animatsiyasi bilan portalga o'tadi.
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import { links } from '../../config/links'
import { flyToPortal } from '../../composables/useFlyTransition'
import { t } from '../../i18n'

const props = defineProps({
  role: { type: String, required: true, validator: (v) => v === 'teacher' || v === 'student' },
})

const card = ref(null)

const primary = props.role === 'teacher' ? links.teacherLogin : links.studentLogin
const titleId = `hero-role-${props.role}`

function go(event, href) {
  flyToPortal(event, href, card.value)
}

/** Kartochkaning bo'sh joyiga bosilganda ham asosiy havolaga o'tish (sichqoncha uchun qulaylik) */
function onCardClick(event) {
  if (event.target.closest('a, button')) return
  go(event, primary)
}
</script>

<template>
  <article ref="card" class="role-tile" :class="`role-tile--${role}`" @click="onCardClick">
    <span class="role-tile__bg glass" aria-hidden="true" />
    <div class="role-tile__head depth-1">
      <span class="role-tile__icon" aria-hidden="true"><AppIcon :name="role === 'teacher' ? 'school' : 'cap'" :size="22" /></span>
      <h2 :id="titleId" class="role-tile__title">{{ t(`hero.${role}.title`) }}</h2>
    </div>
    <p class="role-tile__text depth-1">{{ t(`hero.${role}.text`) }}</p>
    <div class="role-tile__actions depth-2">
      <template v-if="role === 'teacher'">
        <a
          :href="links.teacherLogin"
          class="btn btn-outline"
          :aria-describedby="titleId"
          @click="go($event, links.teacherLogin)"
        >
          {{ t('cta.panelLogin') }}
        </a>
      </template>
      <template v-else>
        <a
          :href="links.studentLogin"
          class="btn btn-primary"
          :aria-describedby="titleId"
          @click="go($event, links.studentLogin)"
        >
          {{ t('cta.login') }}
        </a>
        <a :href="links.studentRegister" class="btn btn-ghost" :aria-describedby="titleId" @click="go($event, links.studentRegister)">
          {{ t('cta.register') }}
        </a>
      </template>
    </div>
  </article>
</template>

<style>
.role-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1.2rem 1.15rem 1.15rem;
  border-radius: 22px;
  cursor: pointer;
}
.role-tile__bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--shadow-lg);
}
.role-tile__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.role-tile__icon {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  flex: none;
  border-radius: 14px;
  color: hsl(var(--primary-strong));
  background: linear-gradient(145deg, hsl(var(--primary) / 0.28), hsl(var(--accent) / 0.12));
  box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.25);
}
.role-tile__title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.role-tile__text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: hsl(var(--fg-soft));
}
.role-tile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.2rem;
}
.role-tile .depth-1 {
  transform: translateZ(12px);
}
.role-tile .depth-2 {
  transform: translateZ(22px);
}
.role-tile__actions .btn {
  min-height: 42px;
  padding: 0.5rem 1rem;
  font-size: 0.92rem;
}
.role-tile__actions .btn-ghost {
  padding-inline: 0.7rem;
}
</style>
