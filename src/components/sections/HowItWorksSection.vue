<script setup>
// Qanday ishlaydi: 3 qadam. Qadamlar orasidagi yo'l skroll bilan chiziladi (SVG path animation).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import ShowcaseGlobe from '../three/ShowcaseGlobe.vue'
import { ScrollTrigger } from '../../composables/useSmoothScroll'
import { motionOK } from '../../composables/useDevice'
import { t, tm } from '../../i18n'

const wrap = ref(null)
const pathD = ref('')
const size = ref({ w: 0, h: 0 })
const progress = ref(motionOK ? 0 : 1)

function buildPath() {
  const box = wrap.value
  if (!box) return
  const rect = box.getBoundingClientRect()
  const points = Array.from(box.querySelectorAll('.how__marker')).map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top }
  })
  size.value = { w: rect.width, h: rect.height }
  if (points.length < 2) return
  const horizontal = Math.abs(points[1].x - points[0].x) > Math.abs(points[1].y - points[0].y)
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (horizontal) {
      const dx = (b.x - a.x) / 2
      const amp = i % 2 ? -70 : 70
      d += ` C ${a.x + dx} ${a.y + amp}, ${b.x - dx} ${b.y + amp}, ${b.x} ${b.y}`
    } else {
      const dy = (b.y - a.y) / 2
      const amp = i % 2 ? 22 : -22
      d += ` C ${a.x + amp} ${a.y + dy}, ${b.x + amp} ${b.y - dy}, ${b.x} ${b.y}`
    }
  }
  pathD.value = d
}

let resizeObserver = null
let trigger = null

onMounted(() => {
  buildPath()
  resizeObserver = new ResizeObserver(buildPath)
  if (wrap.value) resizeObserver.observe(wrap.value)
  if (!motionOK || !wrap.value) return
  trigger = ScrollTrigger.create({
    trigger: wrap.value,
    start: 'top 75%',
    end: 'bottom 55%',
    scrub: 0.6,
    onUpdate: (self) => {
      progress.value = self.progress
    },
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  trigger?.kill()
})

/** Chiziq qadamga yetib kelganmi */
const reached = (index, total) => progress.value >= (index / Math.max(1, total - 1)) * 0.98
</script>

<template>
  <section id="qanday-ishlaydi" class="section how" aria-labelledby="how-title">
    <div class="container-x">
      <div class="showcase-head">
        <SectionHeading id="how-title" :title="t('how.title')" :lead="t('how.subtitle')" />
        <ShowcaseGlobe variant="arcs" class="showcase-head__globe" />
      </div>

      <div ref="wrap" class="how__wrap mt-14 lg:mt-20">
        <svg class="how__svg" :viewBox="`0 0 ${size.w} ${size.h}`" :width="size.w" :height="size.h" aria-hidden="true">
          <defs>
            <linearGradient id="how-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" class="how__stop-a" />
              <stop offset="1" class="how__stop-b" />
            </linearGradient>
          </defs>
          <path class="how__track" :d="pathD" />
          <path class="how__line" :d="pathD" pathLength="1" :style="{ strokeDashoffset: 1 - progress }" />
        </svg>

        <ol class="how__steps">
          <li v-for="(step, i) in tm('how.steps')" :key="step.title" class="how__step" :class="{ 'is-reached': reached(i, 3) }">
            <span class="how__marker" aria-hidden="true">{{ i + 1 }}</span>
            <div class="how__content">
              <h3 class="how__title">{{ step.title }}</h3>
              <p class="how__text">{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style>
.how__wrap {
  position: relative;
}
.how__svg {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
  pointer-events: none;
}
.how__stop-a {
  stop-color: hsl(var(--grad-from));
}
.how__stop-b {
  stop-color: hsl(var(--grad-to));
}
.how__track {
  fill: none;
  stroke: hsl(var(--line));
  stroke-width: 2;
  stroke-dasharray: 3 7;
  stroke-linecap: round;
}
.how__line {
  fill: none;
  stroke: url(#how-gradient);
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-dasharray: 1;
}
.how__steps {
  position: relative;
  display: grid;
  gap: 2.8rem;
}
.how__step {
  display: flex;
  gap: 1.2rem;
}
.how__marker {
  position: relative;
  display: grid;
  place-items: center;
  width: 3.4rem;
  height: 3.4rem;
  flex: none;
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 800;
  color: hsl(var(--muted));
  background: hsl(var(--bg));
  border: 2px solid hsl(var(--line));
  transition:
    color 0.4s ease,
    background-color 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}
.how__step.is-reached .how__marker {
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 8px hsl(var(--primary) / 0.15);
}
.how__title {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.3;
}
.how__text {
  margin-top: 0.45rem;
  color: hsl(var(--fg-soft));
  font-size: 0.98rem;
  line-height: 1.6;
  max-width: 40ch;
}
@media (min-width: 900px) {
  .how__steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2.5rem;
  }
  .how__step {
    flex-direction: column;
    gap: 1.4rem;
  }
  .how__step:nth-child(2) {
    margin-top: 5rem;
  }
}
</style>
