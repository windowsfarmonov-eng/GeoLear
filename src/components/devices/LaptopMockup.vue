<script setup>
// CSS 3D noutbuk: skroll bilan qopqoq ochiladi, so'ng noutbuk burilib ketadi.
// Ekranga slot orqali istalgan kontent (masalan, jonli CRM) qo'yiladi; slot bo'lmasa src rasmi ko'rsatiladi.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '../../composables/useSmoothScroll'
import { motionOK } from '../../composables/useDevice'
import AppLogoMark from '../ui/AppLogoMark.vue'

defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
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
        scrollTrigger: { trigger: el, start: 'top 92%', end: 'bottom 8%', scrub: 0.7 },
        defaults: { ease: 'none' },
      })
      .fromTo(
        el,
        { '--lid': '-86deg', '--turn': '-26deg', '--tilt': '-22deg', '--lift': '40px' },
        { '--lid': '4deg', '--turn': '0deg', '--tilt': '-11deg', '--lift': '0px', duration: 0.45, ease: 'power1.out' },
      )
      .to(el, { duration: 0.15 })
      .to(el, { '--turn': '18deg', '--tilt': '-6deg', duration: 0.4, ease: 'power1.in' })
  }, el)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="laptop">
    <div class="laptop__stage">
      <div class="laptop__lid">
        <div class="laptop__lid-back" aria-hidden="true">
          <AppLogoMark :size="48" />
        </div>
        <div class="laptop__bezel">
          <span class="laptop__notch" aria-hidden="true"><i /></span>
          <div class="laptop__screen">
            <slot>
              <img v-if="!failed" :src="src" :alt="alt" loading="lazy" decoding="async" @error="failed = true" />
              <div v-else class="screen-placeholder">{{ alt }}</div>
            </slot>
            <span class="laptop__glare" aria-hidden="true" />
          </div>
          <span class="laptop__brand" aria-hidden="true">GeoLearn</span>
        </div>
      </div>
      <div class="laptop__base" aria-hidden="true">
        <div class="laptop__keys" />
        <div class="laptop__pad" />
      </div>
      <div class="laptop__shadow" aria-hidden="true" />
    </div>
  </div>
</template>

<style>
@property --lid {
  syntax: '<angle>';
  inherits: true;
  initial-value: 4deg;
}
@property --turn {
  syntax: '<angle>';
  inherits: true;
  initial-value: -10deg;
}
@property --tilt {
  syntax: '<angle>';
  inherits: true;
  initial-value: -11deg;
}
@property --lift {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
.laptop {
  --w: min(100%, 860px);
  position: relative;
  width: 100%;
  padding: 1% 0 min(24%, 230px);
  perspective: 2400px;
  perspective-origin: 50% 10%;
}
.laptop__stage {
  /* 3D'da tekis stage qiyshaygan qopqoq oldida qoladi — kliklar faqat ekranga tushsin */
  pointer-events: none;
  position: relative;
  width: var(--w);
  margin-inline: auto;
  transform-style: preserve-3d;
  transform: translateY(var(--lift)) rotateX(var(--tilt)) rotateY(var(--turn));
}
.laptop__lid {
  position: relative;
  aspect-ratio: 16 / 10.4;
  transform-origin: 50% 100%;
  transform: rotateX(var(--lid));
  transform-style: preserve-3d;
}
.laptop__bezel,
.laptop__lid-back {
  position: absolute;
  inset: 0;
  border-radius: 18px 18px 6px 6px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.laptop__bezel {
  padding: 2.4% 1.6% 3.6%;
  background: linear-gradient(180deg, #1d232d, #0c1016);
  box-shadow:
    inset 0 0 0 1px hsl(0 0% 100% / 0.1),
    inset 0 0 0 4px #0a0d12,
    0 0 0 1.5px #9aa4b1,
    0 50px 90px -40px hsl(222 60% 3% / 0.9),
    0 0 120px -30px hsl(174 70% 45% / 0.35);
}
.laptop__notch {
  position: absolute;
  left: 50%;
  top: 0;
  translate: -50% 0;
  display: grid;
  place-items: center;
  width: 9%;
  height: 2.4%;
  min-height: 9px;
  border-radius: 0 0 8px 8px;
  background: #0a0d12;
  z-index: 2;
}
.laptop__notch i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #4a6a8a, #0d1520 70%);
  box-shadow: 0 0 0 1.5px #1a212b;
}
.laptop__brand {
  position: absolute;
  left: 50%;
  bottom: 0.9%;
  translate: -50% 0;
  font-size: clamp(7px, 1vw, 10px);
  font-weight: 650;
  letter-spacing: 0.12em;
  color: hsl(214 15% 55%);
}
.laptop__shadow {
  position: absolute;
  left: 2%;
  right: 2%;
  top: 100%;
  height: 60%;
  transform-origin: 50% 0;
  transform: rotateX(90deg) translateZ(-2px);
  border-radius: 50%;
  background: radial-gradient(closest-side, hsl(222 60% 3% / 0.55), transparent);
  filter: blur(18px);
  pointer-events: none;
}
.laptop__lid-back {
  display: grid;
  place-items: center;
  color: #14305c;
  background: linear-gradient(160deg, #a9b3c0, #7d8794);
  transform: rotateY(180deg) translateZ(1px);
}
.laptop__screen {
  pointer-events: auto;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
  background: #0d1117;
}
.laptop__screen img,
.tablet__screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
  display: block;
}
.laptop__glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, hsl(0 0% 100% / 0.07) 0%, hsl(0 0% 100% / 0.015) 30%, transparent 46%);
}
.laptop__base {
  position: absolute;
  left: -6%;
  top: 100%;
  width: 112%;
  aspect-ratio: 16 / 8.4;
  transform-origin: 50% 0;
  transform: rotateX(90deg);
  border-radius: 6px 6px 22px 22px;
  background: linear-gradient(180deg, #c9d1db, #9ea8b4 70%, #8a94a1);
  box-shadow:
    inset 0 2px 0 hsl(0 0% 100% / 0.45),
    inset 0 -3px 0 hsl(220 10% 45% / 0.6);
  display: grid;
  grid-template-rows: 1fr auto;
  justify-items: center;
  padding: 5% 9% 4%;
  gap: 5%;
}
.laptop__keys {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background:
    repeating-linear-gradient(90deg, transparent 0 5.6%, hsl(220 10% 55% / 0.55) 5.6% 6.25%),
    repeating-linear-gradient(0deg, transparent 0 15.5%, hsl(220 10% 55% / 0.55) 15.5% 16.67%), #2b323d;
}
.laptop__pad {
  width: 38%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  background: hsl(220 12% 70%);
  box-shadow: inset 0 0 0 1px hsl(220 10% 55%);
}
.screen-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: hsl(214 20% 70%);
  background: radial-gradient(80% 60% at 70% 20%, hsl(174 60% 40% / 0.25), transparent 70%), #111722;
}
</style>
