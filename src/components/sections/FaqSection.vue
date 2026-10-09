<script setup>
// FAQ — savol-javoblar src/content/faq.ts faylidan olinadi (o'sha yerda tahrirlang).
import { computed, ref, watch } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import ShowcaseGlobe from '../three/ShowcaseGlobe.vue'
import { faq, faqJsonLd } from '../../content/faq'
import { contacts } from '../../config/site'
import { locale, t } from '../../i18n'

const items = computed(() => faq[locale.value])
const open = ref(items.value[0]?.id ?? null)

// FAQPage JSON-LD (index.html'da build paytida yozilgan) joriy tilga moslanadi
watch(
  locale,
  (lang) => {
    const ld = document.getElementById('ld-faq')
    if (ld) ld.textContent = JSON.stringify(faqJsonLd(lang))
  },
  { immediate: true },
)

function toggle(id) {
  open.value = open.value === id ? null : id
}
</script>

<template>
  <section id="faq" class="section faq" aria-labelledby="faq-title">
    <div class="container-x faq__grid">
      <div class="faq__intro">
        <SectionHeading id="faq-title" :title="t('faq.title')" :lead="t('faq.subtitle')" />
        <div class="faq__contacts">
          <a :href="contacts.telegram.href" class="faq__contact"> <AppIcon name="send" :size="18" /> {{ contacts.telegram.label }} </a>
          <a :href="contacts.phone.href" class="faq__contact"> <AppIcon name="phone" :size="18" /> {{ contacts.phone.label }} </a>
          <a :href="contacts.email.href" class="faq__contact"> <AppIcon name="mail" :size="18" /> {{ contacts.email.label }} </a>
        </div>
        <ShowcaseGlobe variant="orbits" class="faq__globe" />
      </div>

      <div class="faq__list">
        <div v-for="item in items" :key="item.id" class="faq-item" :class="{ 'is-open': open === item.id }">
          <h3>
            <button
              :id="`faq-q-${item.id}`"
              type="button"
              class="faq-item__q"
              :aria-expanded="open === item.id"
              :aria-controls="`faq-a-${item.id}`"
              @click="toggle(item.id)"
            >
              <span>{{ item.q }}</span>
              <span class="faq-item__icon" aria-hidden="true" />
            </button>
          </h3>
          <div :id="`faq-a-${item.id}`" class="faq-item__a" role="region" :aria-labelledby="`faq-q-${item.id}`" :inert="open !== item.id">
            <div class="faq-item__inner">
              <p v-for="(para, i) in item.a.split('\n')" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.faq__grid {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .faq__grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 4rem;
    align-items: start;
  }
  .faq__intro {
    position: sticky;
    top: 120px;
  }
}
.faq__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.6rem;
}
.faq__contact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1px solid hsl(var(--line));
  transition: border-color 0.2s ease;
}
.faq__globe {
  height: 18.75rem;
  margin-top: 1rem;
}
@media (min-width: 1024px) {
  .faq__globe {
    height: 23.75rem;
    margin: 1.5rem -1rem 0;
  }
}
.faq__contact:hover {
  border-color: hsl(var(--primary));
}
.faq__contact svg {
  color: hsl(var(--primary-strong));
}
.faq__list {
  border-top: 1px solid hsl(var(--line));
}
.faq-item {
  border-bottom: 1px solid hsl(var(--line));
}
.faq-item__q {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 0;
  text-align: left;
  font-size: clamp(1.02rem, 1.4vw, 1.15rem);
  font-weight: 640;
  letter-spacing: -0.01em;
  line-height: 1.4;
  border-radius: 8px;
}
.faq-item__q:hover {
  color: hsl(var(--primary-strong));
}
.faq-item__icon {
  position: relative;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 50%;
  border: 1px solid hsl(var(--line));
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.4s var(--ease-out-expo);
}
.faq-item__icon::before,
.faq-item__icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 1.8px;
  margin: -0.9px 0 0 -6px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.4s var(--ease-out-expo);
}
.faq-item__icon::after {
  transform: rotate(90deg);
}
.faq-item.is-open .faq-item__icon {
  transform: rotate(180deg);
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}
.faq-item.is-open .faq-item__icon::after {
  transform: rotate(0deg);
}
.faq-item__a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s var(--ease-out-expo);
}
.faq-item.is-open .faq-item__a {
  grid-template-rows: 1fr;
}
.faq-item__inner {
  overflow: hidden;
}
.faq-item__inner p {
  max-width: 62ch;
  padding-bottom: 0.4rem;
  color: hsl(var(--fg-soft));
  line-height: 1.65;
}
.faq-item__inner p:last-child {
  padding-bottom: 1.4rem;
}
</style>
