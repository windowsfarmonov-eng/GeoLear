<script setup>
import CountUp from '../ui/CountUp.vue'
import { t, tm } from '../../i18n'
</script>

<template>
  <section id="ishonch" class="trust" :aria-label="t('trust.label')">
    <div class="container-x">
      <ul class="trust__list">
        <li v-for="(item, i) in tm('trust.items')" :key="i" v-reveal="i * 70" class="trust__item">
          <span class="trust__value">
            <CountUp v-if="/^\d+\+?$/.test(item.value)" :value="item.value" />
            <template v-else>{{ item.value }}</template>
          </span>
          <span class="trust__label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style>
.trust {
  position: relative;
  padding-block: 2.2rem 1rem;
}
.trust__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-block: 1px solid hsl(var(--line));
}
.trust__item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.4rem 1rem 1.4rem 0;
}
.trust__item:nth-child(2n) {
  padding-left: 1.2rem;
  border-left: 1px solid hsl(var(--line));
}
.trust__item:nth-child(-n + 2) {
  border-bottom: 1px solid hsl(var(--line));
}
.trust__value {
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 780;
  letter-spacing: -0.035em;
  line-height: 1;
  color: hsl(var(--fg));
}
.trust__label {
  font-size: 0.92rem;
  line-height: 1.4;
  color: hsl(var(--muted));
  max-width: 24ch;
}
@media (min-width: 1024px) {
  .trust__list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .trust__item,
  .trust__item:nth-child(2n) {
    padding: 1.8rem 1.5rem;
    border-left: 1px solid hsl(var(--line));
    border-bottom: 0;
  }
  .trust__item:first-child {
    border-left: 0;
    padding-left: 0;
  }
}
</style>
