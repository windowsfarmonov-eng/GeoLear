<script setup>
// GeoLearn belgisi: to'q ko'k «G» ichida yashil globus va ochiq kitob sahifalari.
// «G» rangi currentColor'dan olinadi (yorug'/qorong'i mavzuga moslashadi).
import { useId } from 'vue'

defineProps({
  size: { type: [Number, String], default: 32 },
})

// sahifada bir nechta logo bo'lsa ham gradient id'lari to'qnashmasin
const uid = useId()
const globe = `glg-${uid}`
const leaf = `gll-${uid}`
const clip = `glc-${uid}`
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 64 64" fill="none" aria-hidden="true" class="logo-mark">
    <defs>
      <linearGradient :id="globe" x1="14" y1="12" x2="44" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3fcf7f" />
        <stop offset="0.55" stop-color="#1f9a78" />
        <stop offset="1" stop-color="#16607a" />
      </linearGradient>
      <linearGradient :id="leaf" x1="40" y1="50" x2="58" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1c7f78" />
        <stop offset="1" stop-color="#46d983" />
      </linearGradient>
      <clipPath :id="clip">
        <circle cx="29" cy="31" r="17" />
      </clipPath>
    </defs>

    <!-- globus -->
    <g transform="translate(30 31.5) scale(1.17) translate(-29 -31)">
      <circle cx="29" cy="31" r="17" :fill="`url(#${globe})`" />
      <g :clip-path="`url(#${clip})`">
        <!-- quruqlik (Amerika qit'alari) -->
        <path
          d="M22 15.5c3.5-1.6 8.4-1.4 11 .6 1.6 1.3.4 3.4-1.7 3.6-2.4.3-3.6 2.1-2.4 3.9 1 1.5-.4 2.9-2.4 2.6-2.1-.3-3.3 1-3 2.6.3 1.8-1.6 2.3-3 1.1-2.1-1.8-3.6-5.4-3.2-8.6.3-2.6 2-4.6 4.7-5.8Z"
          fill="#8df0a8"
          fill-opacity="0.55"
        />
        <path
          d="M29.5 31.5c2.6-.5 5.3.9 5.6 3.3.3 2.5-1.4 4.6-2.3 7-.8 2.1-1.2 4.6-3.1 4.9-1.6.2-2-2-1.8-4 .3-2.5-1.3-4.3-1.1-6.6.2-2.2 1.1-4.2 2.7-4.6Z"
          fill="#8df0a8"
          fill-opacity="0.55"
        />
        <!-- meridian va parallellar -->
        <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.75">
          <ellipse cx="29" cy="31" rx="7.5" ry="17" />
          <path d="M12.5 26.5c10 3.4 23 3.4 33 0M13.5 37c9.5 3 21.5 3 31 0" />
        </g>
      </g>
    </g>

    <!-- «G» harfi -->
    <path d="M50.4 13.6A26 26 0 1 0 55.6 43V32.5H40" stroke="currentColor" stroke-width="6.2" stroke-linejoin="miter" />

    <!-- ochiq kitob sahifalari -->
    <path d="M40 51c3-6.4 8.4-10.6 14.9-12.2v3.4C49 43.6 44.3 46.8 40 51Z" :fill="`url(#${leaf})`" />
    <path d="M40 51c4-3.2 9-5.2 14.9-5.6v3.2C49.4 48.6 44.6 49.6 40 51Z" :fill="`url(#${leaf})`" />
  </svg>
</template>
