<script setup>
// Jonli o'yin namoyishi: 3D kod paneli, o'quvchi avatarlari «uchib kirib» qo'shiladi,
// natijalar jadvali real vaqtdagidek yangilanadi. Faqat ko'rinib turganda ishlaydi.
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import { useInView } from '../../composables/useInView'
import { motionOK } from '../../composables/useDevice'
import { gsap } from '../../composables/useSmoothScroll'
import { t, tm } from '../../i18n'

const CODE = 'A3F9C1'
const players = [
  { name: 'Aziza', hue: 174 },
  { name: 'Bekzod', hue: 205 },
  { name: 'Dilnoza', hue: 330 },
  { name: 'Jasur', hue: 38 },
  { name: 'Malika', hue: 268 },
  { name: 'Sardor', hue: 145 },
  { name: 'Nilufar', hue: 12 },
  { name: 'Timur', hue: 190 },
]
const ROW_H = 46
const answerColors = ['#e5484d', '#3e8bff', '#f5b82e', '#2fb67c']
const CORRECT = 0

// Har bir raund uchun qo'shiladigan ballar (namoyish)
const rounds = [
  [860, 920, 640, 980, 700, 0, 820, 760],
  [900, 610, 980, 720, 940, 880, 0, 790],
  [700, 950, 860, 0, 990, 760, 910, 680],
]

const root = ref(null)
const inView = useInView(root, { threshold: 0.25 })

const state = reactive({
  codeShown: 0,
  joined: [],
  question: false,
  answered: false,
  timer: 1,
  scores: players.map(() => 0),
})

const ranking = computed(() =>
  players.map((p, i) => ({ ...p, index: i, score: state.scores[i] })).sort((a, b) => b.score - a.score || a.index - b.index),
)
const rankOf = computed(() => {
  const map = new Map()
  ranking.value.forEach((p, rank) => map.set(p.index, rank))
  return map
})

const initials = (name) => name.slice(0, 1)

// ── ketma-ketlik (har bir play() yangi «avlod»; eski sikl keyingi kutishda to'xtaydi)
let generation = 0
let timerTween = null
let scoreTween = null

const wait = (ms, gen) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => (gen === generation ? resolve() : reject(new Error('stop'))), ms)
  })

function reset() {
  state.codeShown = 0
  state.joined = []
  state.question = false
  state.answered = false
  state.timer = 1
  state.scores = players.map(() => 0)
}

function showFinal() {
  state.codeShown = CODE.length
  state.joined = players.map((_, i) => i)
  state.question = true
  state.answered = true
  state.timer = 0.35
  state.scores = players.map((_, i) => rounds[0][i] + rounds[1][i])
}

function animateScores(target) {
  const proxy = {}
  const goal = {}
  state.scores.forEach((value, i) => {
    proxy[`s${i}`] = value
    goal[`s${i}`] = target[i]
  })
  scoreTween?.kill()
  scoreTween = gsap.to(proxy, {
    ...goal,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate: () => {
      state.scores = state.scores.map((_, i) => Math.round(proxy[`s${i}`]))
    },
  })
}

async function play() {
  const gen = ++generation
  try {
    while (gen === generation) {
      reset()
      await wait(400, gen)
      for (let i = 1; i <= CODE.length; i++) {
        state.codeShown = i
        await wait(110, gen)
      }
      await wait(350, gen)
      for (let i = 0; i < players.length; i++) {
        state.joined.push(i)
        await wait(330, gen)
      }
      for (const round of rounds) {
        await wait(500, gen)
        state.question = true
        state.answered = false
        state.timer = 1
        timerTween?.kill()
        timerTween = gsap.to(state, { timer: 0, duration: 2.6, ease: 'none' })
        await wait(2100, gen)
        timerTween.kill()
        state.answered = true
        await wait(400, gen)
        animateScores(state.scores.map((score, i) => score + round[i]))
        await wait(2300, gen)
        state.question = false
        await wait(350, gen)
      }
      await wait(1800, gen)
    }
  } catch {
    /* to'xtatildi */
  }
}

function stop() {
  generation++
  timerTween?.kill()
  scoreTween?.kill()
}

if (!motionOK) showFinal()

watch(inView, (visible) => {
  if (!motionOK) return
  if (visible) void play()
  else stop()
})

onBeforeUnmount(stop)

function flyVars(i) {
  const angle = (i / players.length) * Math.PI * 2 + 0.6
  return {
    '--fx': `${Math.round(Math.cos(angle) * 320)}px`,
    '--fy': `${Math.round(Math.sin(angle) * 220 - 120)}px`,
    '--hue': String(players[i].hue),
  }
}
</script>

<template>
  <section id="oyin" ref="root" class="section game" aria-labelledby="game-title">
    <div class="container-x game__grid">
      <div class="game__copy">
        <SectionHeading id="game-title" :title="t('game.title')" :lead="t('game.subtitle')" />
        <ol class="game__steps">
          <li v-for="(step, i) in tm('game.steps')" :key="step" v-reveal="i * 80">
            <span class="game__step-num" aria-hidden="true">{{ i + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>

      <div class="game__stage" aria-hidden="true">
        <div class="game-board">
          <div class="game-board__head depth-1">
            <span class="game-live"><span class="game-live__dot" />{{ t('game.live') }}</span>
            <span class="game-demo">{{ t('game.demo') }}</span>
          </div>

          <div class="game-board__code depth-2">
            <span class="game-board__label">{{ t('game.codeLabel') }}</span>
            <div class="code-cells">
              <span v-for="(ch, i) in CODE" :key="i" class="code-cell" :class="{ 'is-shown': i < state.codeShown }">{{ ch }}</span>
            </div>
          </div>

          <div class="game-board__players depth-1">
            <div class="game-board__label">
              {{ t('game.players') }}:
              <strong class="tabular-nums">{{ state.joined.length }}</strong>
              {{ t('game.joined') }}
            </div>
            <div class="avatars">
              <span v-for="i in state.joined" :key="players[i].name" class="avatar" :style="flyVars(i)" :title="players[i].name">
                {{ initials(players[i].name) }}
              </span>
            </div>
          </div>

          <div class="game-board__bottom">
            <div class="quiz depth-2" :class="{ 'is-visible': state.question }">
              <p class="quiz__q">{{ t('game.question') }}</p>
              <div class="quiz__answers">
                <span
                  v-for="(answer, i) in tm('game.answers')"
                  :key="answer"
                  class="quiz__answer"
                  :class="{ 'is-correct': state.answered && i === CORRECT, 'is-dim': state.answered && i !== CORRECT }"
                  :style="{ '--c': answerColors[i] }"
                >
                  {{ answer }}
                </span>
              </div>
              <div class="quiz__timer"><span :style="{ transform: `scaleX(${state.timer})` }" /></div>
            </div>

            <div class="leaderboard depth-1">
              <p class="game-board__label">{{ t('game.leaderboard') }}</p>
              <ol class="leaderboard__rows" :style="{ height: `${5 * ROW_H}px` }">
                <li
                  v-for="(p, i) in players"
                  :key="p.name"
                  class="leaderboard__row"
                  :class="{ 'is-out': (rankOf.get(i) ?? 9) > 4 }"
                  :style="{ transform: `translateY(${Math.min(rankOf.get(i) ?? 0, 5) * ROW_H}px)`, '--hue': String(p.hue) }"
                >
                  <span class="leaderboard__rank">{{ (rankOf.get(i) ?? 0) + 1 }}</span>
                  <span class="leaderboard__avatar">{{ initials(p.name) }}</span>
                  <span class="leaderboard__name">{{ p.name }}</span>
                  <span class="leaderboard__score tabular-nums">{{ Math.round(state.scores[i]) }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.game__grid {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .game__grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    align-items: center;
    gap: 3rem;
  }
}
.game__steps {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
}
.game__steps li {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-weight: 560;
}
.game__step-num {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  flex: none;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 700;
  color: hsl(var(--primary-fg));
  background: hsl(var(--primary));
}
.game-board {
  position: relative;
  display: grid;
  gap: 1.1rem;
  padding: clamp(1rem, 2.5vw, 1.6rem);
  border-radius: 28px;
  background:
    radial-gradient(90% 60% at 100% 0%, hsl(var(--primary) / 0.2), transparent 60%),
    linear-gradient(180deg, hsl(var(--surface)), hsl(var(--surface-2)));
  border: 1px solid hsl(var(--glass-line));
  box-shadow: var(--shadow-lg);
  transform: perspective(1500px) rotateX(calc(8deg + var(--rx))) rotateY(calc(-12deg + var(--ry)));
}
@media (max-width: 767px) {
  .game-board {
    transform: perspective(1500px) rotateX(calc(4deg + var(--rx))) rotateY(calc(-4deg + var(--ry)));
  }
}
.game-board__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.game-live {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff6b6b;
  background: hsl(0 80% 60% / 0.12);
}
.game-live__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-soft 1.4s ease-in-out infinite;
}
.game-demo {
  font-size: 0.78rem;
  font-weight: 600;
  color: hsl(var(--muted));
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px dashed hsl(var(--line));
}
.game-board__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: hsl(var(--muted));
}
.game-board__label strong {
  color: hsl(var(--fg));
}
.code-cells {
  display: flex;
  gap: clamp(0.3rem, 1vw, 0.55rem);
  margin-top: 0.45rem;
  perspective: 600px;
}
.code-cell {
  display: grid;
  place-items: center;
  width: clamp(2.3rem, 6vw, 3.4rem);
  aspect-ratio: 0.82;
  border-radius: 12px;
  font-size: clamp(1.4rem, 3.4vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: hsl(var(--fg));
  background: hsl(var(--bg-deep));
  border: 1px solid hsl(var(--primary) / 0.35);
  box-shadow:
    inset 0 -3px 0 hsl(var(--primary) / 0.35),
    0 10px 24px -14px hsl(var(--primary) / 0.8);
  opacity: 0;
  transform: rotateX(-90deg);
  transition:
    opacity 0.3s ease,
    transform 0.45s cubic-bezier(0.2, 1.4, 0.4, 1);
}
.code-cell.is-shown {
  opacity: 1;
  transform: rotateX(0);
}
.avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-height: 2.6rem;
  margin-top: 0.5rem;
}
.avatar,
.leaderboard__avatar {
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, hsl(var(--hue) 70% 58%), hsl(var(--hue) 70% 40%));
}
.avatar {
  width: 2.4rem;
  height: 2.4rem;
  font-size: 0.95rem;
  box-shadow:
    0 0 0 2px hsl(var(--surface)),
    0 8px 18px -8px hsl(var(--hue) 70% 40%);
  animation: avatar-in 0.75s cubic-bezier(0.2, 0.9, 0.25, 1.1) both;
}
@keyframes avatar-in {
  from {
    opacity: 0;
    transform: translate3d(var(--fx), var(--fy), 260px) scale(1.8) rotate(-30deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.game-board__bottom {
  display: grid;
  gap: 1rem;
}
@media (min-width: 640px) {
  .game-board__bottom {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }
}
.quiz {
  padding: 1rem;
  border-radius: 18px;
  background: hsl(var(--bg-deep) / 0.6);
  border: 1px solid hsl(var(--line));
}
/* savol chiqquncha kartochka bo'sh turadi (xira matn o'qilmaydi — kontrast talabi) */
.quiz > * {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.quiz.is-visible > * {
  opacity: 1;
}
.quiz__q {
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.4;
}
.quiz__answers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
  margin-top: 0.8rem;
}
.quiz__answer {
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  /* to'q matn: sariq va yashil fonda ham o'qiladi (kontrast 4.5:1 dan yuqori) */
  color: #10131a;
  background: var(--c);
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.quiz__answer.is-dim {
  color: hsl(0 0% 100% / 0.92);
  background: color-mix(in srgb, var(--c) 30%, #151922);
}
.quiz__answer.is-correct {
  transform: scale(1.04);
  box-shadow:
    0 0 0 2px hsl(var(--surface)),
    0 0 0 4px var(--c);
}
.quiz__timer {
  height: 5px;
  margin-top: 0.85rem;
  border-radius: 999px;
  overflow: hidden;
  background: hsl(var(--fg) / 0.08);
}
.quiz__timer span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
  transform-origin: left center;
}
.leaderboard__rows {
  position: relative;
  margin-top: 0.5rem;
  overflow: hidden;
}
.leaderboard__row {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  height: 40px;
  padding: 0 0.7rem;
  border-radius: 12px;
  background: hsl(var(--fg) / 0.04);
  transition:
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.4s ease;
}
.leaderboard__row.is-out {
  opacity: 0;
}
.leaderboard__rank {
  width: 1.1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: hsl(var(--muted));
}
.leaderboard__avatar {
  width: 1.65rem;
  height: 1.65rem;
  font-size: 0.75rem;
  flex: none;
}
.leaderboard__name {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.leaderboard__score {
  font-size: 0.88rem;
  font-weight: 700;
  color: hsl(var(--primary-strong));
}
</style>
