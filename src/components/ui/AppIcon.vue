<script setup>
import { computed } from 'vue'
import { iconPaths } from './icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: Number, default: 1.75 },
})

const markup = computed(() => iconPaths[props.name] ?? '')
// raqamli o'lcham rem'ga aylantiriladi — katta ekranlarda ikonka ham matn bilan birga kattalashadi
const box = computed(() => (typeof props.size === 'number' ? `${props.size / 16}rem` : props.size))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :style="{ width: box, height: box }"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>
