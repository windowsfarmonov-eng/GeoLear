<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import { t, tm } from '../../i18n'
</script>

<template>
  <section id="muammo" class="section" aria-labelledby="problem-title">
    <div class="container-x">
      <SectionHeading id="problem-title" :title="t('problem.title')" :lead="t('problem.subtitle')" />

      <div class="ledger mt-12 lg:mt-16">
        <div class="ledger__head" aria-hidden="true">
          <span>{{ t('problem.before') }}</span>
          <span />
          <span class="ledger__head-after">{{ t('problem.after') }}</span>
        </div>
        <ul class="ledger__rows">
          <li v-for="(pair, i) in tm('problem.pairs')" :key="i" v-reveal="i * 80" class="ledger__row">
            <p class="ledger__before">
              <span class="sr-only">{{ t('problem.before') }}:</span>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M7 12h10" />
              </svg>
              {{ pair.before }}
            </p>
            <span class="ledger__arrow" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
            <p class="ledger__after">
              <span class="sr-only">{{ t('problem.after') }}:</span>
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
              {{ pair.after }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style>
.ledger__head {
  display: none;
}
.ledger__rows {
  display: grid;
  gap: 0.9rem;
}
.ledger__row {
  display: grid;
  gap: 0.15rem;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid hsl(var(--line));
}
.ledger__before,
.ledger__after {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 1rem 1.2rem;
  line-height: 1.5;
}
.ledger__before svg,
.ledger__after svg {
  flex: none;
  margin-top: 0.2rem;
}
.ledger__before {
  color: hsl(var(--muted));
  background: hsl(var(--fg) / 0.025);
}
.ledger__after {
  color: hsl(var(--fg));
  font-weight: 540;
  background: linear-gradient(90deg, hsl(var(--primary) / 0.13), hsl(var(--primary) / 0.04));
}
.ledger__after svg {
  color: hsl(var(--primary-strong));
}
.ledger__arrow {
  display: none;
}
@media (min-width: 900px) {
  .ledger__head,
  .ledger__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1.15fr);
    align-items: center;
  }
  .ledger__head {
    padding: 0 0 0.9rem;
    font-size: 0.92rem;
    font-weight: 620;
    color: hsl(var(--muted));
  }
  .ledger__head-after {
    color: hsl(var(--primary-strong));
    padding-left: 1.4rem;
  }
  .ledger__rows {
    gap: 0;
    border-top: 1px solid hsl(var(--line));
  }
  .ledger__row {
    gap: 0;
    border: 0;
    border-bottom: 1px solid hsl(var(--line));
    border-radius: 0;
    overflow: visible;
  }
  .ledger__before {
    background: none;
    padding: 1.5rem 1rem 1.5rem 0;
  }
  .ledger__arrow {
    display: grid;
    place-items: center;
    color: hsl(var(--primary));
  }
  .ledger__after {
    margin: 0.6rem 0;
    padding: 1rem 1.4rem;
    border-radius: 16px;
  }
}
</style>
