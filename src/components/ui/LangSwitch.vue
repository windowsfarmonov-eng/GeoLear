<script setup>
import { locale, setLocale, t } from '../../i18n'

const options = [
  { value: 'uz', label: 'UZ', full: "O'zbekcha" },
  { value: 'ru', label: 'RU', full: 'Русский' },
]
</script>

<template>
  <div
    role="group"
    :aria-label="t('a11y.language')"
    class="relative inline-flex rounded-full border border-line p-0.5 text-[0.8rem] font-semibold"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :lang="option.value"
      :aria-pressed="locale === option.value"
      :title="option.full"
      class="relative z-10 min-h-9 min-w-10 rounded-full px-2.5 transition-colors duration-300"
      :class="locale === option.value ? 'bg-primary text-primary-fg' : 'text-muted hover:text-fg'"
      @click="setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
