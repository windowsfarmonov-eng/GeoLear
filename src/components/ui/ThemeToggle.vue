<script setup>
import AppIcon from './AppIcon.vue'
import { theme, toggleTheme } from '../../composables/useTheme'
import { t } from '../../i18n'
</script>

<template>
  <button
    type="button"
    class="grid size-10 place-items-center rounded-full border border-line text-fg-soft transition-colors hover:border-primary hover:text-fg"
    :aria-label="theme === 'dark' ? t('a11y.toLight') : t('a11y.toDark')"
    :title="theme === 'dark' ? t('a11y.toLight') : t('a11y.toDark')"
    @click="toggleTheme"
  >
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -rotate-90 scale-50"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 rotate-90 scale-50"
    >
      <AppIcon v-if="theme === 'dark'" key="sun" name="sun" :size="19" />
      <AppIcon v-else key="moon" name="moon" :size="18" />
    </Transition>
  </button>
</template>
