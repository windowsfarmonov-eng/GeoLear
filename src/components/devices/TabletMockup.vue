<script setup>
// CSS 3D planshet: skroll bilan perspektivada buriladi.
// Skrinshot: /public/screens/student.png (o'zingiznikiga almashtiring).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '../../composables/useSmoothScroll'
import { motionOK } from '../../composables/useDevice'

defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
})

const root = ref(null)
const failed = ref(false)
let ctx = null

onMounted(() => {
  const el = root.value
  if (!el || !motionOK) return
  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 5%', scrub: 0.7 },
        defaults: { ease: 'none' },
      })
      .fromTo(
        el,
        { '--ry': '-34deg', '--rx': '16deg', '--rz': '-4deg' },
        { '--ry': '-8deg', '--rx': '6deg', '--rz': '0deg', duration: 0.5, ease: 'power1.out' },
      )
      .to(el, { '--ry': '14deg', '--rx': '-2deg', '--rz': '2deg', duration: 0.5, ease: 'power1.in' })
  }, el)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="tablet">
    <div class="tablet__body">
      <span class="tablet__edge" aria-hidden="true" />
      <div class="tablet__face">
        <div class="tablet__screen">
          <img v-if="!failed" :src="src" :alt="alt" loading="lazy" decoding="async" @error="failed = true" />
          <div v-else class="screen-placeholder">{{ alt }}</div>
          <span class="laptop__glare" aria-hidden="true" />
        </div>
        <span class="tablet__camera" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<style>
@property --ry {
  syntax: '<angle>';
  inherits: true;
  initial-value: -12deg;
}
@property --rz {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0deg;
}
.tablet {
  --rx: 6deg;
  position: relative;
  width: 100%;
  padding: 4% 2%;
  perspective: 1800px;
}
.tablet__body {
  position: relative;
  width: min(100%, 640px);
  margin-inline: auto;
  aspect-ratio: 4 / 3;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz));
}
.tablet__edge,
.tablet__face {
  position: absolute;
  inset: 0;
  border-radius: 34px;
}
.tablet__edge {
  transform: translateZ(-9px);
  background: linear-gradient(135deg, #8b95a3, #4b5563);
  box-shadow: 0 50px 90px -40px hsl(222 60% 3% / 0.85);
}
.tablet__face {
  padding: 3.2%;
  background: linear-gradient(160deg, #1f2631, #0f141b);
  box-shadow:
    inset 0 0 0 1.5px hsl(0 0% 100% / 0.12),
    inset 0 0 0 6px #0b0f15;
}
.tablet__screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #0d1117;
}
.tablet__camera {
  position: absolute;
  left: 50%;
  top: 1.4%;
  width: 6px;
  height: 6px;
  margin-left: -3px;
  border-radius: 50%;
  background: #2c3440;
}
</style>
