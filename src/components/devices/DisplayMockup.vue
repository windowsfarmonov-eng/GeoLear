<script setup>
// Haqiqiy hajmli (CSS 3D) katta monitor: alyuminiy korpus qalinligi, orqa qopqoq, oyoq va stol ustidagi aks.
// Skroll bilan monitor burchakdan old tomonga burilib keladi, ekranga yaqinlashadi, oxirida yon tomonga buriladi.
// Sichqoncha harakatiga qarab ozgina egiladi. Ekranga slot orqali jonli kontent (CRM) qo'yiladi,
// «float» slotidagi karta monitor oyog'i yonida turadi.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from '../../composables/useSmoothScroll'
import { device, motionOK } from '../../composables/useDevice'
import AppLogoMark from '../ui/AppLogoMark.vue'

const root = ref(null)
let ctx = null
let frame = 0
let tx = 0
let ty = 0
let cx = 0
let cy = 0

function onPointer(event) {
  if (!device.finePointer || !root.value) return
  const rect = root.value.getBoundingClientRect()
  tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
  ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  if (!frame) frame = requestAnimationFrame(tick)
}
function onLeave() {
  tx = 0
  ty = 0
  if (!frame) frame = requestAnimationFrame(tick)
}
function tick() {
  cx += (tx - cx) * 0.08
  cy += (ty - cy) * 0.08
  root.value?.style.setProperty('--mx', `${(cx * 2.2).toFixed(3)}deg`)
  root.value?.style.setProperty('--my', `${(-cy * 1.6).toFixed(3)}deg`)
  frame = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0
}

onMounted(() => {
  const el = root.value
  if (!el || !motionOK) return
  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 10%', scrub: 0.8 },
        defaults: { ease: 'none' },
      })
      .fromTo(
        el,
        { '--ry': '-32deg', '--rx': '16deg', '--z': '-420px', '--lift': '60px', '--sweep': '-40%', '--glow': 0.2 },
        { '--ry': '0deg', '--rx': '3deg', '--z': '0px', '--lift': '0px', '--sweep': '60%', '--glow': 1, duration: 0.42, ease: 'power2.out' },
      )
      .to(el, { '--sweep': '130%', duration: 0.26 })
      .to(el, { '--ry': '20deg', '--rx': '7deg', '--z': '-160px', '--glow': 0.5, duration: 0.32, ease: 'power1.in' })
  }, el)
})

onBeforeUnmount(() => {
  ctx?.revert()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="monitor" @pointermove="onPointer" @pointerleave="onLeave">
    <div class="monitor__scene">
      <div class="monitor__desk-glow" aria-hidden="true" />
      <div class="monitor__stage">
        <!-- oyoq: bo'yin va taglik -->
        <div class="monitor__neck" aria-hidden="true"><i /></div>
        <div class="monitor__foot" aria-hidden="true" />
        <div class="monitor__foot-shadow" aria-hidden="true" />

        <!-- korpus: old, orqa va 4 ta qirra -->
        <div class="monitor__body">
          <div class="monitor__face monitor__face--back" aria-hidden="true">
            <AppLogoMark :size="72" />
          </div>
          <div class="monitor__face monitor__face--left" aria-hidden="true" />
          <div class="monitor__face monitor__face--right" aria-hidden="true" />
          <div class="monitor__face monitor__face--top" aria-hidden="true" />
          <div class="monitor__face monitor__face--bottom" aria-hidden="true" />
          <div class="monitor__face monitor__face--front">
            <span class="monitor__cam" aria-hidden="true" />
            <div class="monitor__screen">
              <slot />
              <span class="monitor__glass" aria-hidden="true" />
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-if="$slots.float" class="monitor__float">
      <slot name="float" />
    </div>
  </div>
</template>

<style>
@property --ry {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0deg;
}
@property --rx {
  syntax: '<angle>';
  inherits: true;
  initial-value: 3deg;
}
@property --z {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
@property --lift {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
@property --sweep {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 60%;
}
@property --glow {
  syntax: '<number>';
  inherits: true;
  initial-value: 1;
}
.monitor {
  --d: 30px;
  --mx: 0deg;
  --my: 0deg;
  position: relative;
  width: min(calc(100vw - 32px), 1320px);
  margin-left: 50%;
  translate: -50% 0;
  padding: 2% 0 clamp(220px, 18%, 250px);
  perspective: 2600px;
  perspective-origin: 50% 30%;
}
/* Katta ekranlarda (TV, elektron doska) maket ham sahifa shrifti bilan birga kattalashadi */
@media (min-width: 1700px) {
  .monitor {
    width: 1320px;
    zoom: 1.125;
  }
}
@media (min-width: 2100px) {
  .monitor {
    zoom: 1.3125;
  }
}
@media (min-width: 2500px) {
  .monitor {
    zoom: 1.5625;
  }
}
@media (min-width: 3200px) {
  .monitor {
    zoom: 2;
  }
}
@media (min-width: 4200px) {
  .monitor {
    zoom: 2.5;
  }
}
.monitor__scene {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  /* sahna tekisligi ekran oldida qolib kliklarni yutmasin */
  pointer-events: none;
}
.monitor__stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9.7;
  transform-style: preserve-3d;
  transform: translateY(var(--lift)) translateZ(var(--z)) rotateX(calc(var(--rx) + var(--my))) rotateY(calc(var(--ry) + var(--mx)));
  will-change: transform;
  /* tekis qatlam qirralar oldida qolmasin — kliklar faqat ekranga tushadi */
  pointer-events: none;
}
.monitor__body {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.monitor__face {
  position: absolute;
}
/* old panel: qora shisha + ingichka alyuminiy hoshiya */
.monitor__face--front {
  inset: 0;
  padding: 1.25%;
  border-radius: 22px;
  background: linear-gradient(180deg, #11151c, #07090d);
  box-shadow:
    0 0 0 3px #b9c2cd,
    0 0 0 4px #7d8793,
    inset 0 0 0 1px hsl(0 0% 100% / 0.08),
    0 50px 80px -50px hsl(222 60% 3% / 0.9);
}
.monitor__cam {
  position: absolute;
  left: 50%;
  top: 0.45%;
  translate: -50% 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #4b6c8f, #0b121c 70%);
  box-shadow: 0 0 0 1.5px #1a212b;
}
.monitor__screen {
  pointer-events: auto;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #0d1117;
  isolation: isolate;
}
/* shisha yaltirashi skroll bilan ekran bo'ylab o'tadi (faqat transform — qayta chizilmaydi) */
.monitor__glass {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, hsl(0 0% 100% / 0.04), transparent 30%);
}
.monitor__glass::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 60%;
  background: linear-gradient(112deg, transparent 10%, hsl(0 0% 100% / 0.08) 45%, hsl(0 0% 100% / 0.02) 60%, transparent 85%);
  transform: translateX(calc(var(--sweep) * 2 - 60%));
  will-change: transform;
}
/* orqa qopqoq — alyuminiy */
.monitor__face--back {
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 22px;
  color: #14305c;
  background:
    radial-gradient(60% 50% at 50% 45%, hsl(0 0% 100% / 0.35), transparent 70%),
    linear-gradient(160deg, #d3d9e1, #9aa4b0 60%, #848e9a);
  transform: translateZ(calc(var(--d) * -1)) rotateY(180deg);
}
/* qirralar (korpus qalinligi) */
.monitor__face--left,
.monitor__face--right {
  top: 14px;
  bottom: 14px;
  width: var(--d);
  background: linear-gradient(90deg, #8d97a3, #c8d0d9 45%, #a1abb7);
}
.monitor__face--left {
  left: 0;
  transform-origin: 0 50%;
  transform: rotateY(90deg);
}
.monitor__face--right {
  right: 0;
  transform-origin: 100% 50%;
  transform: rotateY(-90deg);
}
.monitor__face--top,
.monitor__face--bottom {
  left: 14px;
  right: 14px;
  height: var(--d);
  background: linear-gradient(180deg, #a7b1bc, #dfe5ec 50%, #98a2ae);
}
.monitor__face--top {
  top: 0;
  transform-origin: 50% 0;
  transform: rotateX(-90deg);
}
.monitor__face--bottom {
  bottom: 0;
  transform-origin: 50% 100%;
  transform: rotateX(90deg);
  background: linear-gradient(180deg, #7e8894, #a9b3be);
}
/* oyoq */
.monitor__neck {
  position: absolute;
  left: 41%;
  width: 18%;
  top: 58%;
  height: 58%;
  transform-origin: 50% 0;
  transform: translateZ(calc(var(--d) * -1 - 70px)) rotateX(-7deg);
  border-radius: 8px 8px 4px 4px;
  background:
    linear-gradient(180deg, hsl(222 30% 12% / 0.55), transparent 35%),
    linear-gradient(90deg, #6f7884, #c9d0d8 28%, #e6ebf0 42%, #aab3bd 70%, #6f7884);
  box-shadow: inset 0 -30px 40px -20px hsl(222 30% 20% / 0.45);
}
.monitor__neck i {
  position: absolute;
  left: 50%;
  top: 30%;
  translate: -50% 0;
  width: 26%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, #5b6570 30%, #848e9a 60%, transparent 62%);
  opacity: 0.6;
}
.monitor__foot {
  position: absolute;
  left: 34%;
  width: 32%;
  top: 114%;
  height: 230px;
  transform-origin: 50% 0;
  transform: translateZ(calc(var(--d) * -1 - 210px)) rotateX(90deg);
  border-radius: 18px;
  background: linear-gradient(180deg, #aab4bf, #dde3ea 40%, #c3cbd4);
  box-shadow:
    inset 0 2px 0 hsl(0 0% 100% / 0.6),
    inset 0 -4px 0 #8a94a0;
}
.monitor__foot-shadow {
  position: absolute;
  left: 22%;
  width: 56%;
  top: 114.5%;
  height: 320px;
  transform-origin: 50% 0;
  transform: translateZ(calc(var(--d) * -1 - 260px)) rotateX(90deg) translateZ(-2px);
  border-radius: 50%;
  background: radial-gradient(closest-side, hsl(222 60% 3% / 0.5), hsl(222 60% 3% / 0.2) 60%, transparent);
}
/* ekrandan stolga tushadigan yorug'lik */
.monitor__desk-glow {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 92%;
  height: 34%;
  border-radius: 50%;
  background: radial-gradient(closest-side, hsl(174 70% 45% / 0.28), hsl(208 80% 50% / 0.1) 55%, transparent);
  opacity: var(--glow);
  pointer-events: none;
}
/* ekran oldida suzib turuvchi karta */
.monitor__float {
  position: absolute;
  left: 3%;
  bottom: 18px;
  z-index: 10;
  width: min(420px, 30%);
}
@media (max-width: 1023px) {
  .monitor {
    --d: 18px;
    perspective: 1600px;
  }
  .monitor__face--front,
  .monitor__face--back {
    border-radius: 14px;
  }
  .monitor__float {
    position: relative;
    left: auto;
    bottom: auto;
    width: 100%;
    margin-top: 1rem;
  }
  .monitor__stage {
    /* kartani pastga joylash uchun */
    aspect-ratio: auto;
  }
  .monitor__body {
    position: relative;
    inset: auto;
    aspect-ratio: 16 / 10;
  }
  .monitor__neck,
  .monitor__foot,
  .monitor__foot-shadow {
    display: none;
  }
  .monitor {
    padding-bottom: 24px;
  }
}
@media (max-width: 639px) {
  .monitor {
    --d: 10px;
  }
  .monitor__body {
    aspect-ratio: 4 / 3.4;
  }
  .monitor__face--front {
    padding: 2%;
  }
}
</style>
