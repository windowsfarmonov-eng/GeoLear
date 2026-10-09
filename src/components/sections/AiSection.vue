<script setup>
// AI yordamchi: suzib turuvchi 3D «orb» (shisha shar, ichida teal nur) va chat namoyishi —
// savol yoziladi, AI javobi typing effekt bilan chiqadi. AI «yozayotganda» orb jonlanadi.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'
import { device, motionOK } from '../../composables/useDevice'
import { useScene } from '../../composables/useScene'
import { useInView } from '../../composables/useInView'
import { theme } from '../../composables/useTheme'
import { locale, t, tm } from '../../i18n'

const capIcons = ['image', 'sparkles', 'mic', 'clip', 'database']

const orbBox = ref(null)
const canvas = ref(null)
const chat = ref(null)
const enabled = device.tier !== 'static'

const { status, handle } = useScene(
  orbBox,
  async ({ ready }) => {
    const { createAiOrb } = await import('../three/engine/aiOrb')
    if (!canvas.value || !orbBox.value) throw new Error('Orb konteyneri topilmadi')
    return createAiOrb({
      canvas: canvas.value,
      container: orbBox.value,
      quality: device.tier === 'full' ? 'full' : 'lite',
      dark: theme.value === 'dark',
      onFirstFrame: ready,
    })
  },
  { enabled },
)
const live = computed(() => status.value === 'ready')

// ── Chat namoyishi
const messages = computed(() => tm('ai.messages'))
const log = ref([])
const draft = ref('')
const aiTyping = ref(false)
const inView = useInView(chat, { threshold: 0.3 })

let generation = 0
let bubbleId = 0
const wait = (ms, gen) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => (gen === generation ? resolve() : reject(new Error('stop'))), ms)
  })

function setActivity(value) {
  handle.value?.setActivity(value)
}

function showStatic() {
  log.value = messages.value.slice(0, 2).flatMap((m) => [
    { id: ++bubbleId, role: 'user', text: m.q },
    { id: ++bubbleId, role: 'ai', text: m.a },
  ])
  draft.value = ''
  aiTyping.value = false
}

async function play() {
  const gen = ++generation
  log.value = []
  draft.value = ''
  try {
    let index = 0
    while (gen === generation) {
      const { q, a } = messages.value[index % messages.value.length]
      await wait(700, gen)
      for (let i = 1; i <= q.length; i++) {
        draft.value = q.slice(0, i)
        await wait(32, gen)
      }
      await wait(350, gen)
      draft.value = ''
      log.value = [...log.value, { id: ++bubbleId, role: 'user', text: q }].slice(-3)
      aiTyping.value = true
      setActivity(1)
      await wait(1000, gen)
      aiTyping.value = false
      const bubble = { id: ++bubbleId, role: 'ai', text: '' }
      log.value = [...log.value, bubble].slice(-4)
      const words = a.split(' ')
      for (let i = 1; i <= words.length; i++) {
        bubble.text = words.slice(0, i).join(' ')
        log.value = [...log.value]
        await wait(55, gen)
      }
      setActivity(0)
      await wait(2600, gen)
      index++
    }
  } catch {
    /* to'xtatildi */
  }
}

function stop() {
  generation++
  aiTyping.value = false
  setActivity(0)
}

if (!motionOK) showStatic()

watch(inView, (visible) => {
  if (!motionOK) return
  if (visible) void play()
  else stop()
})

watch(locale, () => {
  if (!motionOK) showStatic()
  else if (inView.value) void play()
})

onBeforeUnmount(stop)
</script>

<template>
  <section id="ai" class="section ai" aria-labelledby="ai-title">
    <div class="container-x">
      <div class="head-split">
        <SectionHeading id="ai-title" :title="t('ai.title')" :lead="t('ai.subtitle')" />
        <aside v-reveal="120" class="head-aside glass">
          <p class="head-aside__title">{{ t('ai.examplesTitle') }}</p>
          <ul class="ask-list">
            <li v-for="q in tm('ai.examples')" :key="q" class="ask-list__item">
              <AppIcon name="sparkles" :size="16" />
              {{ q }}
            </li>
          </ul>
        </aside>
      </div>

      <div class="ai__grid mt-12 lg:mt-16">
        <div class="ai__orb-col">
          <div ref="orbBox" class="ai-orb" :class="{ 'is-live': live }">
            <div class="ai-orb__fallback" aria-hidden="true">
              <span class="ai-orb__core" />
            </div>
            <canvas v-if="enabled && status !== 'failed'" ref="canvas" class="ai-orb__canvas" role="img" :aria-label="t('a11y.orb')" />
          </div>
          <ul class="ai__caps">
            <li v-for="(cap, i) in tm('ai.caps')" :key="cap" v-reveal="i * 50" class="ai__cap">
              <AppIcon :name="capIcons[i] ?? 'sparkles'" :size="17" />
              {{ cap }}
            </li>
          </ul>
        </div>

        <div class="ai__chat-col">
          <div ref="chat" class="chat glass">
            <div class="chat__head">
              <span class="chat__avatar" aria-hidden="true">
                <AppIcon name="sparkles" :size="18" />
              </span>
              <div>
                <p class="chat__name">{{ t('ai.chatTitle') }}</p>
                <p class="chat__status"><span class="chat__online" />{{ t('ai.online') }}</p>
              </div>
            </div>

            <ul class="sr-only">
              <li v-for="m in messages" :key="m.q">{{ m.q }} — {{ m.a }}</li>
            </ul>

            <div class="chat__body" aria-hidden="true">
              <TransitionGroup name="bubble">
                <p v-for="bubble in log" :key="bubble.id" class="bubble" :class="`bubble--${bubble.role}`">
                  {{ bubble.text }}
                </p>
                <p v-if="aiTyping" key="typing" class="bubble bubble--ai bubble--typing">
                  <span /><span /><span />
                  <em class="sr-only">{{ t('ai.typing') }}</em>
                </p>
              </TransitionGroup>
            </div>

            <div class="chat__input" aria-hidden="true">
              <span class="chat__draft" :class="{ 'is-empty': !draft }"
                >{{ draft || t('ai.placeholder') }}<i v-if="draft" class="chat__caret"
              /></span>
              <span class="chat__send"><AppIcon name="send" :size="18" /></span>
            </div>
          </div>

          <div v-reveal class="ai__safety">
            <span class="ai__safety-icon" aria-hidden="true"><AppIcon name="shield" :size="22" /></span>
            <div>
              <h3 class="h3">{{ t('ai.safetyTitle') }}</h3>
              <p class="mt-1 text-[0.95rem] leading-relaxed text-fg-soft">{{ t('ai.safetyText') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.ai__grid {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .ai__grid {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: center;
    gap: 3rem;
  }
}
.ai-orb {
  position: relative;
  width: min(100%, 28.75rem);
  aspect-ratio: 1;
  margin-inline: auto;
}
.ai-orb__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.ai-orb.is-live .ai-orb__canvas {
  opacity: 1;
}
.ai-orb__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transition: opacity 0.8s ease;
}
.ai-orb.is-live .ai-orb__fallback {
  opacity: 0;
}
.ai-orb__fallback::before {
  content: '';
  position: absolute;
  width: 92%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, hsl(var(--primary) / 0.32), transparent 62%);
}
.ai-orb__core {
  position: relative;
  width: 52%;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, hsl(0 0% 100% / 0.7), transparent 18%),
    radial-gradient(circle at 50% 55%, hsl(172 85% 62%), hsl(176 80% 32%) 45%, hsl(205 70% 12%) 80%);
  box-shadow:
    0 0 0 1px hsl(174 70% 70% / 0.35),
    0 0 80px -10px hsl(174 80% 50% / 0.6),
    inset 0 -20px 40px hsl(205 80% 8% / 0.6);
}
.ai__caps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.ai__cap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 560;
  color: hsl(var(--fg-soft));
  background: hsl(var(--fg) / 0.04);
  border: 1px solid hsl(var(--line));
}
.ai__cap svg {
  color: hsl(var(--primary-strong));
}
.chat {
  display: flex;
  flex-direction: column;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.chat__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid hsl(var(--glass-line));
}
.chat__avatar {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  color: hsl(var(--primary-fg));
  background: linear-gradient(145deg, hsl(var(--primary-strong)), hsl(var(--accent)));
}
.chat__name {
  font-weight: 680;
  line-height: 1.2;
}
.chat__status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: hsl(var(--muted));
}
.chat__online {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: hsl(var(--success));
}
.chat__body {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.6rem;
  height: 22.5rem;
  padding: 1.2rem;
  overflow: hidden;
}
.bubble {
  max-width: 86%;
  padding: 0.7rem 0.95rem;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
}
.bubble--user {
  align-self: flex-end;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
  border-bottom-right-radius: 6px;
}
.bubble--ai {
  align-self: flex-start;
  background: hsl(var(--fg) / 0.06);
  border: 1px solid hsl(var(--glass-line));
  border-bottom-left-radius: 6px;
}
.bubble--typing {
  display: inline-flex;
  gap: 5px;
  padding: 0.85rem 1rem;
}
.bubble--typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: hsl(var(--muted));
  animation: typing 1.1s ease-in-out infinite;
}
.bubble--typing span:nth-child(2) {
  animation-delay: 0.15s;
}
.bubble--typing span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
.bubble-enter-active,
.bubble-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.4s var(--ease-out-expo);
}
.bubble-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
.bubble-leave-to {
  opacity: 0;
}
.bubble-leave-active {
  position: absolute;
}
.bubble-move {
  transition: transform 0.4s var(--ease-out-expo);
}
.chat__input {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 1rem 1rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border-radius: 999px;
  background: hsl(var(--fg) / 0.05);
  border: 1px solid hsl(var(--glass-line));
}
.chat__draft {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.93rem;
}
.chat__draft.is-empty {
  color: hsl(var(--muted));
}
.chat__caret {
  display: inline-block;
  width: 1.5px;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: hsl(var(--primary-strong));
  animation: blink 1s steps(1) infinite;
}
.chat__send {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
}
.ai__safety {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1.2rem 1.3rem;
  border-radius: 22px;
  border: 1px solid hsl(var(--primary) / 0.3);
  background: hsl(var(--primary) / 0.07);
}
.ai__safety-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 14px;
  color: hsl(var(--primary-strong));
  background: hsl(var(--primary) / 0.14);
}
@media (max-width: 639px) {
  .chat__body {
    height: 21.25rem;
  }
}
</style>
