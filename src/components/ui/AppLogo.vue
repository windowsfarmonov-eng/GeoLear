<script setup>
import AppLogoMark from './AppLogoMark.vue'

defineProps({
  size: { type: Number, default: 34 },
  showText: { type: Boolean, default: true },
})
</script>

<template>
  <span class="logo inline-flex items-center gap-2">
    <AppLogoMark :size="size" class="logo__mark shrink-0" />
    <span v-if="showText" class="logo__word text-[1.22rem] font-extrabold tracking-[-0.03em]">
      <span class="logo__geo">Geo</span><span class="logo__learn">Learn</span>
    </span>
  </span>
</template>

<style>
.logo__mark {
  color: hsl(var(--logo-ink));
}
.logo__geo {
  color: hsl(var(--logo-ink));
}
.logo__learn {
  background: linear-gradient(90deg, #1f9a78, #2fbf7c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.dark .logo__learn {
  background-image: linear-gradient(90deg, #3fcf7f, #5fe0a0);
}
</style>
