<script setup>
defineProps({
  title: { type: String, required: true },
  lead: { type: String, default: undefined },
  id: { type: String, default: undefined },
  align: { type: String, default: 'left' },
  gradient: { type: Boolean, default: false },
})
</script>

<template>
  <header class="max-w-3xl" :class="align === 'center' ? 'mx-auto text-center' : ''">
    <h2 :id="id" v-reveal class="h2" :class="gradient ? 'text-gradient' : ''">{{ title }}</h2>
    <p v-if="lead" v-reveal="90" class="lead mt-5" :class="align === 'center' ? 'mx-auto' : ''">{{ lead }}</p>
    <slot />
  </header>
</template>
