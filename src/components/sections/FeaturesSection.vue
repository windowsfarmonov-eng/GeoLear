<script setup>
// Imkoniyatlar — bento grid. Har bir kartochkada kichik 3D ikonka (bitta umumiy
// WebGL canvas'da scissor bilan chiziladi): sekin aylanadi, hover'da kattalashadi.
import { computed, ref } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import { device } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import { t } from '../../i18n'

const features = [
  { key: 'lessons', kind: 'book', icon: 'book' },
  { key: 'games', kind: 'gamepad', icon: 'gamepad' },
  { key: 'rating', kind: 'trophy', icon: 'trophy' },
  { key: 'video', kind: 'film', icon: 'video' },
  { key: 'ai', kind: 'robot', icon: 'bot' },
  { key: 'homework', kind: 'clipboard', icon: 'clipboard' },
  { key: 'stats', kind: 'chart', icon: 'chart' },
]

const grid = ref(null)
const canvas = ref(null)
const enabled = device.tier !== 'static'

const { status } = useScene(
  grid,
  async ({ ready }) => {
    const { createFeatureIcons } = await import('../three/engine/featureIcons')
    if (!grid.value || !canvas.value) throw new Error('Bento grid topilmadi')
    const slots = features.map((feature) => {
      const card = grid.value.querySelector(`[data-feature="${feature.key}"]`)
      return { kind: feature.kind, card, el: card.querySelector('.bento__slot') }
    })
    return createFeatureIcons({
      canvas: canvas.value,
      container: grid.value,
      quality: device.tier === 'full' ? 'full' : 'lite',
      slots,
      onFirstFrame: ready,
    })
  },
  { enabled },
)

const live = computed(() => status.value === 'ready')
</script>

<template>
  <section id="imkoniyatlar" class="section" aria-labelledby="features-title">
    <div class="container-x">
      <SectionHeading id="features-title" :title="t('features.title')" :lead="t('features.subtitle')" />

      <div ref="grid" class="bento mt-12 lg:mt-16" :class="{ 'is-live': live }">
        <article
          v-for="(feature, i) in features"
          :key="feature.key"
          v-reveal="(i % 3) * 70"
          class="bento__card glass"
          :class="`bento__card--${feature.key}`"
          :data-feature="feature.key"
        >
          <div class="bento__slot" aria-hidden="true">
            <span class="bento__fallback">
              <AppIcon :name="feature.icon" :size="feature.key === 'lessons' ? 56 : 34" :stroke="1.5" />
            </span>
          </div>
          <div class="bento__body">
            <h3 class="h3">{{ t(`features.items.${feature.key}.title`) }}</h3>
            <p class="bento__text">{{ t(`features.items.${feature.key}.text`) }}</p>
          </div>
        </article>
        <canvas v-if="enabled && status !== 'failed'" ref="canvas" class="bento__canvas" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<style>
.bento {
  position: relative;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
}
.bento__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.bento__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.5rem;
  border-radius: 26px;
  overflow: hidden;
}
.bento__card:hover {
  border-color: hsl(var(--primary) / 0.45);
}
.bento__card::before {
  content: '';
  position: absolute;
  inset: auto -30% -60% auto;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, hsl(var(--primary) / 0.18), transparent 70%);
  pointer-events: none;
  transition: opacity 0.4s ease;
  opacity: 0.6;
}
.bento__card:hover::before {
  opacity: 1;
}
.bento__slot {
  position: relative;
  width: 112px;
  height: 112px;
  flex: none;
}
.bento__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  color: hsl(var(--primary-strong));
  background: radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.06) 70%);
  transition: opacity 0.5s ease;
}
.bento.is-live .bento__fallback {
  opacity: 0;
}
.bento__body {
  position: relative;
}
.bento__text {
  margin-top: 0.5rem;
  font-size: 0.97rem;
  line-height: 1.55;
  color: hsl(var(--fg-soft));
  max-width: 46ch;
}
@media (min-width: 640px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'lessons lessons'
      'games games'
      'rating video'
      'ai ai'
      'homework stats';
  }
  .bento__card--games,
  .bento__card--ai {
    flex-direction: row;
    align-items: center;
  }
  .bento__card--lessons {
    grid-area: lessons;
  }
  .bento__card--games {
    grid-area: games;
  }
  .bento__card--rating {
    grid-area: rating;
  }
  .bento__card--video {
    grid-area: video;
  }
  .bento__card--ai {
    grid-area: ai;
  }
  .bento__card--homework {
    grid-area: homework;
  }
  .bento__card--stats {
    grid-area: stats;
  }
}
@media (min-width: 1024px) {
  .bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-areas:
      'lessons lessons games games'
      'lessons lessons rating video'
      'ai ai homework stats';
  }
  .bento__card--lessons {
    justify-content: space-between;
    padding: 2rem;
  }
  .bento__card--lessons .bento__slot {
    width: min(100%, 300px);
    height: 260px;
    align-self: center;
    margin-block: auto;
  }
  .bento__card--lessons .h3 {
    font-size: 1.6rem;
    letter-spacing: -0.025em;
  }
}
@media (max-width: 639px) {
  .bento__card {
    flex-direction: row;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.2rem;
  }
  .bento__slot {
    width: 84px;
    height: 84px;
  }
  .bento__card--lessons {
    flex-direction: column;
  }
  .bento__card--lessons .bento__slot {
    width: 100%;
    height: 180px;
  }
}
</style>
