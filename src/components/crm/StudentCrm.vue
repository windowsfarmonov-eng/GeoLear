<script setup>
// Planshet ekranidagi jonli o'quvchi portali namoyishi. Tepadagi menyu yoki yonidagi ro'yxat bosilganda
// bo'lim almashadi; har bir bo'limning o'z kichik interaktivligi bor (test, uy ishini topshirish, o'yin kodi, AI…).
// Ekran 740px kenglikda chiziladi va planshetga moslab masshtablanadi (TeacherCrm bilan bir xil usul).
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import AppLogoMark from '../ui/AppLogoMark.vue'
import { studentData, studentIcons, studentViews } from '../../content/studentCrm'
import { locale } from '../../i18n'

const view = defineModel('view', { type: String, default: 'dashboard' })

const BASE_W = 740
const BASE_H = 542

const d = computed(() => studentData[locale.value] ?? studentData.uz)
const nav = computed(() => studentViews.map((key, i) => ({ key, icon: studentIcons[i], label: d.value.nav[i] })))

// ── masshtab
const fit = ref(null)
const scale = ref(0.6)
const height = ref(BASE_H)
let resizeObserver = null

// ── dashboard
const period = ref(0)
const bars = computed(() => (period.value === 0 ? d.value.dashboard.bars : d.value.dashboard.bars.slice(-7)))
const barMax = computed(() => Math.max(...bars.value, 1))

// ── darslar
const topicIndex = ref(2)
const quiz = ref(false)
const picked = ref(-1)
const topic = computed(() => d.value.lessons.topics[topicIndex.value])
function openTopic(i) {
  topicIndex.value = i
  quiz.value = false
  picked.value = -1
}

// ── uy ishlari: «Topshirish» bosilganda holat almashadi
const submitted = ref([])
const hwStatus = (item, i) => (item.status === 0 && submitted.value.includes(i) ? 1 : item.status)

// ── o'yinlar
const typed = ref('')
const joined = ref(false)
const players = ref(12)
let typeTimer = 0
let joinTimer = 0
function typeCode() {
  window.clearInterval(typeTimer)
  typed.value = ''
  const code = d.value.games.code
  typeTimer = window.setInterval(() => {
    typed.value = code.slice(0, typed.value.length + 1)
    if (typed.value.length >= code.length) window.clearInterval(typeTimer)
  }, 110)
}
function join() {
  if (typed.value.length < d.value.games.code.length) return
  joined.value = true
  players.value = 12
  window.clearInterval(joinTimer)
  joinTimer = window.setInterval(() => {
    if (players.value < 24) players.value++
    else window.clearInterval(joinTimer)
  }, 700)
}
function leave() {
  joined.value = false
  typed.value = ''
  window.clearInterval(joinTimer)
}

// ── reyting, video
const ratingTab = ref(0)
const playing = ref(-1)
const watchedNow = ref([])
let playTimer = 0
function play(i) {
  playing.value = i
  window.clearTimeout(playTimer)
  playTimer = window.setTimeout(() => {
    if (!watchedNow.value.includes(i)) watchedNow.value = [...watchedNow.value, i]
    playing.value = -1
  }, 2600)
}

// ── AI: savol bosilganda javob «yozib» chiqadi
const chatIndex = ref(-1)
const answer = ref('')
let aiTimer = 0
function ask(i) {
  chatIndex.value = i
  answer.value = ''
  window.clearInterval(aiTimer)
  const full = d.value.ai.chats[i].a
  aiTimer = window.setInterval(() => {
    answer.value = full.slice(0, answer.value.length + 3)
    if (answer.value.length >= full.length) window.clearInterval(aiTimer)
  }, 28)
}

function onEnterView() {
  if (view.value === 'games' && !joined.value) typeCode()
  if (view.value === 'ai' && chatIndex.value < 0) ask(0)
}
watch(view, onEnterView)
watch(locale, () => {
  if (view.value === 'ai' && chatIndex.value >= 0) ask(chatIndex.value)
  if (view.value === 'games' && !joined.value) typeCode()
})

// Maket kichraytirib ko'rsatiladi — klaviatura fokusi uning ichiga kirmaydi (bo'limlarni yonidagi ro'yxat ochadi)
function skipInTabOrder() {
  fit.value?.querySelectorAll('button, input, select, textarea, a[href]').forEach((el) => {
    if (el.tabIndex !== -1) el.tabIndex = -1
  })
}

onMounted(() => {
  const el = fit.value
  if (!el) return
  resizeObserver = new ResizeObserver(([entry]) => {
    const { width, height: h } = entry.contentRect
    scale.value = width / BASE_W
    height.value = width > 0 ? Math.max(480, Math.round(h / scale.value)) : BASE_H
  })
  resizeObserver.observe(el)
  onEnterView()
  skipInTabOrder()
})
onUpdated(skipInTabOrder)
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.clearInterval(typeTimer)
  window.clearInterval(joinTimer)
  window.clearInterval(aiTimer)
  window.clearTimeout(playTimer)
})
</script>

<template>
  <div ref="fit" class="scrm-fit">
    <div class="scrm" :style="{ width: `${BASE_W}px`, height: `${height}px`, transform: `scale(${scale})` }">
      <header class="scrm-top">
        <div class="scrm-logo">
          <AppLogoMark :size="28" />
        </div>
        <nav class="scrm-nav">
          <button
            v-for="item in nav"
            :key="item.key"
            type="button"
            class="scrm-nav__item"
            :class="{ 'is-active': item.key === view }"
            @click="view = item.key"
          >
            {{ item.label }}
          </button>
        </nav>
        <span class="scrm-points"><AppIcon name="trophy" :size="14" /> {{ d.user.points }}</span>
        <span class="scrm-avatar">{{ d.user.initial }}</span>
      </header>

      <main class="scrm-main">
        <Transition name="scrm-view" mode="out-in">
          <!-- ── Dashboard -->
          <div v-if="view === 'dashboard'" key="dashboard" class="scrm-view">
            <h3 class="scrm-hello">{{ d.dashboard.hello }}</h3>
            <p class="scrm-sub">{{ d.dashboard.sub }}</p>
            <div class="scrm-stats">
              <button type="button" class="scrm-stat scrm-stat--rank" @click="view = 'rating'">
                <small>{{ d.dashboard.rank.label }}</small>
                <b>{{ d.dashboard.rank.value }}</b>
                <span>{{ d.dashboard.rank.note }}</span>
              </button>
              <div v-for="s in d.dashboard.stats" :key="s.label" class="scrm-stat">
                <small>{{ s.label }}</small>
                <b>{{ s.value }}</b>
                <span :class="{ 'is-plain': s.plain }">{{ s.note }}</span>
              </div>
            </div>
            <div class="scrm-row">
              <section class="scrm-card scrm-grow">
                <header class="scrm-card__head">
                  <h4>{{ d.dashboard.chartTitle }}</h4>
                  <div class="scrm-seg">
                    <button v-for="(p, i) in d.dashboard.periods" :key="p" type="button" :class="{ 'is-on': period === i }" @click="period = i">
                      {{ p }}
                    </button>
                  </div>
                </header>
                <div class="scrm-bars">
                  <div v-for="(v, i) in bars" :key="`${period}-${i}`" class="scrm-bars__col">
                    <span :class="{ 'is-last': i === bars.length - 1 }" :style="{ height: `${Math.max(3, (v / barMax) * 100)}%`, '--i': i }" />
                    <em>{{ i + 1 }}</em>
                  </div>
                </div>
              </section>
              <section class="scrm-card scrm-side">
                <h4>{{ d.dashboard.nextTitle }}</h4>
                <button v-for="n in d.dashboard.next" :key="n.title" type="button" class="scrm-task" @click="view = n.view">
                  <span>{{ n.title }}</span>
                  <i>{{ n.tag }}</i>
                </button>
              </section>
            </div>
          </div>

          <!-- ── Kuchli tomonlar -->
          <div v-else-if="view === 'strengths'" key="strengths" class="scrm-view">
            <div class="scrm-row">
              <section class="scrm-card scrm-grow">
                <header class="scrm-card__head">
                  <h4>{{ d.strengths.strongTitle }}</h4>
                  <p class="scrm-legend"><i class="is-me" />{{ d.strengths.legend[0] }} <i />{{ d.strengths.legend[1] }}</p>
                </header>
                <div v-for="(s, i) in d.strengths.strong" :key="s.name" class="scrm-skill" :style="{ '--i': i }">
                  <span>{{ s.name }}</span>
                  <div class="scrm-skill__bars">
                    <i class="is-me" :style="{ width: `${s.me}%` }" />
                    <i :style="{ width: `${s.cls}%` }" />
                  </div>
                  <b>{{ s.me }}%</b>
                </div>
              </section>
              <section class="scrm-card scrm-grow">
                <header class="scrm-card__head">
                  <h4 class="is-warn">{{ d.strengths.weakTitle }}</h4>
                </header>
                <div v-for="(s, i) in d.strengths.weak" :key="s.name" class="scrm-skill is-weak" :style="{ '--i': i }">
                  <span>{{ s.name }}</span>
                  <div class="scrm-skill__bars">
                    <i class="is-me" :style="{ width: `${s.me}%` }" />
                    <i :style="{ width: `${s.cls}%` }" />
                  </div>
                  <b>{{ s.me }}%</b>
                </div>
                <button type="button" class="scrm-btn scrm-btn--ghost" @click="view = 'lessons'">
                  <AppIcon name="rotate" :size="14" /> {{ d.strengths.repeat }}
                </button>
              </section>
            </div>
            <section class="scrm-card">
              <h4>{{ d.strengths.compareTitle }}</h4>
              <div v-for="(c, i) in d.strengths.compare" :key="c.label" class="scrm-compare">
                <span>{{ c.label }}</span>
                <div><i :class="{ 'is-me': i === 0 }" :style="{ width: `${c.value}%` }" /></div>
                <b>{{ c.value }}%</b>
              </div>
            </section>
          </div>

          <!-- ── Darslar -->
          <div v-else-if="view === 'lessons'" key="lessons" class="scrm-view scrm-row scrm-row--fill">
            <section class="scrm-card scrm-topics">
              <h4>{{ d.lessons.unit }}</h4>
              <button
                v-for="(tp, i) in d.lessons.topics"
                :key="tp.title"
                type="button"
                class="scrm-topic"
                :class="{ 'is-active': i === topicIndex }"
                @click="openTopic(i)"
              >
                <span class="scrm-topic__num">{{ i + 1 }}</span>
                <span class="scrm-topic__title">{{ tp.title }}</span>
                <span class="scrm-topic__bar"><i :style="{ width: `${tp.progress}%` }" /></span>
              </button>
            </section>
            <section class="scrm-card scrm-grow scrm-lesson">
              <template v-if="!quiz">
                <h4>{{ topic.title }}</h4>
                <p class="scrm-lesson__text">{{ topic.text }}</p>
                <p class="scrm-lesson__read">{{ d.lessons.read }}: {{ topic.progress }}%</p>
                <button type="button" class="scrm-btn" @click="quiz = true"><AppIcon name="play" :size="14" /> {{ d.lessons.start }}</button>
              </template>
              <template v-else>
                <h4>{{ d.lessons.question }}</h4>
                <div class="scrm-answers">
                  <button
                    v-for="(a, i) in d.lessons.answers"
                    :key="a"
                    type="button"
                    :class="{ 'is-right': picked >= 0 && i === d.lessons.correct, 'is-wrong': picked === i && i !== d.lessons.correct }"
                    :disabled="picked >= 0"
                    @click="picked = i"
                  >
                    {{ a }}
                  </button>
                </div>
                <p v-if="picked >= 0" class="scrm-verdict" :class="{ 'is-bad': picked !== d.lessons.correct }">
                  {{ picked === d.lessons.correct ? d.lessons.right : d.lessons.wrong }}
                </p>
                <button type="button" class="scrm-btn scrm-btn--ghost" @click="openTopic(topicIndex)">{{ d.lessons.back }}</button>
              </template>
            </section>
          </div>

          <!-- ── Uy ishlari -->
          <div v-else-if="view === 'homework'" key="homework" class="scrm-view">
            <section class="scrm-card">
              <h4>{{ d.homework.title }}</h4>
              <div v-for="(hw, i) in d.homework.items" :key="hw.title" class="scrm-hw">
                <span class="scrm-hw__icon"><AppIcon name="clipboard" :size="16" /></span>
                <div>
                  <b>{{ hw.title }}</b>
                  <small>{{ hwStatus(hw, i) === 1 && hw.status === 0 ? d.homework.waiting : hw.due }}</small>
                </div>
                <button v-if="hwStatus(hw, i) === 0" type="button" class="scrm-btn" @click="submitted = [...submitted, i]">
                  <AppIcon name="upload" :size="14" /> {{ d.homework.submit }}
                </button>
                <span class="scrm-badge" :class="`is-${hwStatus(hw, i)}`">{{ d.homework.statuses[hwStatus(hw, i)] }}</span>
              </div>
            </section>
          </div>

          <!-- ── O'yinlar -->
          <div v-else-if="view === 'games'" key="games" class="scrm-view scrm-center">
            <section v-if="!joined" class="scrm-card scrm-join">
              <span class="scrm-join__icon"><AppIcon name="gamepad" :size="26" /></span>
              <h4>{{ d.games.title }}</h4>
              <p>{{ d.games.text }}</p>
              <button type="button" class="scrm-code" :aria-label="d.games.type" @click="typeCode">
                <span v-for="i in 6" :key="i" :class="{ 'is-filled': typed[i - 1] }">{{ typed[i - 1] ?? '' }}</span>
              </button>
              <button type="button" class="scrm-btn scrm-btn--lg" :disabled="typed.length < 6" @click="join">{{ d.games.join }}</button>
            </section>
            <section v-else class="scrm-card scrm-join">
              <span class="scrm-join__icon is-ok"><AppIcon name="check" :size="26" :stroke="2.4" /></span>
              <h4>{{ d.games.joined }}</h4>
              <p>{{ d.games.topic }}</p>
              <p class="scrm-join__count"><b>{{ players }}</b> {{ d.games.players }}</p>
              <p class="scrm-join__wait"><i />{{ d.games.wait }}</p>
              <button type="button" class="scrm-btn scrm-btn--ghost" @click="leave">{{ d.games.leave }}</button>
            </section>
          </div>

          <!-- ── Reyting -->
          <div v-else-if="view === 'rating'" key="rating" class="scrm-view">
            <section class="scrm-card">
              <header class="scrm-card__head">
                <h4><AppIcon name="trophy" :size="16" /> {{ d.nav[5] }}</h4>
                <div class="scrm-seg">
                  <button v-for="(tb, i) in d.rating.tabs" :key="tb" type="button" :class="{ 'is-on': ratingTab === i }" @click="ratingTab = i">
                    {{ tb }}
                  </button>
                </div>
              </header>
              <div
                v-for="(p, i) in d.rating.lists[ratingTab]"
                :key="`${ratingTab}-${p.name}`"
                class="scrm-rank"
                :class="{ 'is-me': p.me }"
                :style="{ '--i': i }"
              >
                <span class="scrm-rank__place" :class="`is-${p.place ?? i + 1}`">{{ p.place ?? i + 1 }}</span>
                <span class="scrm-rank__avatar" :style="{ '--h': p.hue }">{{ p.name[0] }}</span>
                <span class="scrm-rank__name">{{ p.name }} <em v-if="p.me">{{ d.rating.you }}</em></span>
                <b>{{ p.score.toLocaleString('ru-RU') }} <small>{{ d.rating.pts }}</small></b>
              </div>
            </section>
          </div>

          <!-- ── Videodarslar -->
          <div v-else-if="view === 'videos'" key="videos" class="scrm-view">
            <div class="scrm-videos">
              <button v-for="(v, i) in d.videos.items" :key="v.title" type="button" class="scrm-video" :class="{ 'is-playing': playing === i }" @click="play(i)">
                <span class="scrm-video__thumb" :style="{ '--h': v.hue }">
                  <span class="scrm-video__play"><AppIcon name="play" :size="18" /></span>
                  <em>{{ v.time }}</em>
                  <i class="scrm-video__progress" />
                </span>
                <b>{{ v.title }}</b>
                <small v-if="playing === i">{{ d.videos.watch }}</small>
                <small v-else-if="v.done || watchedNow.includes(i)" class="is-done"><AppIcon name="check" :size="12" :stroke="2.4" /> {{ d.videos.watched }}</small>
                <small v-else>{{ v.time }}</small>
              </button>
            </div>
          </div>

          <!-- ── AI yordamchi -->
          <div v-else key="ai" class="scrm-view scrm-row scrm-row--fill">
            <section class="scrm-card scrm-grow scrm-chat">
              <header class="scrm-card__head">
                <h4><AppIcon name="bot" :size="16" /> {{ d.ai.title }}</h4>
                <p class="scrm-online"><i />{{ d.ai.online }}</p>
              </header>
              <div class="scrm-chat__body">
                <p class="scrm-msg">{{ d.ai.hello }}</p>
                <template v-if="chatIndex >= 0">
                  <p class="scrm-msg is-me">{{ d.ai.chats[chatIndex].q }}</p>
                  <p class="scrm-msg">{{ answer }}<span v-if="answer.length < d.ai.chats[chatIndex].a.length" class="scrm-caret" /></p>
                </template>
              </div>
              <div class="scrm-chat__input">
                <span>{{ d.ai.placeholder }}</span>
                <AppIcon name="send" :size="16" />
              </div>
            </section>
            <section class="scrm-card scrm-side scrm-asks">
              <button v-for="(c, i) in d.ai.chats" :key="c.q" type="button" :class="{ 'is-on': chatIndex === i }" @click="ask(i)">
                <AppIcon name="sparkles" :size="14" /> {{ c.q }}
              </button>
            </section>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style>
.scrm-fit {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.scrm {
  --s-bg: #11151d;
  --s-panel: #1a202b;
  --s-panel-2: #212836;
  --s-line: #262e3c;
  --s-fg: #eef2f7;
  --s-soft: #b9c3d0;
  --s-muted: #8a96a8;
  --s-teal: #2ec4b6;
  --s-teal-2: #5be3d2;
  --s-blue: #3b9eea;
  --s-warn: #f0b048;
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  display: flex;
  flex-direction: column;
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.45;
  color: var(--s-fg);
  background: var(--s-bg);
  user-select: none;
  -webkit-user-select: none;
}
:where(.scrm h3, .scrm h4, .scrm p) {
  margin: 0;
}
.scrm button {
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.scrm-top {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 54px;
  padding: 0 16px;
  border-bottom: 1px solid var(--s-line);
}
.scrm-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 780;
  letter-spacing: -0.02em;
}
.scrm-nav {
  display: flex;
  flex: 1;
  gap: 2px;
  min-width: 0;
}
.scrm-nav__item {
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 560;
  white-space: nowrap;
  color: var(--s-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.scrm-nav__item:hover {
  color: var(--s-fg);
}
.scrm-nav__item.is-active {
  color: var(--s-teal-2);
  background: color-mix(in srgb, var(--s-teal) 16%, transparent);
}
.scrm-points {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 700;
  color: var(--s-warn);
  background: color-mix(in srgb, var(--s-warn) 13%, transparent);
}
.scrm-avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-weight: 750;
  color: #06231f;
  background: linear-gradient(135deg, var(--s-teal-2), var(--s-teal));
}
.scrm-main {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
}
.scrm-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.scrm-view-enter-active,
.scrm-view-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.scrm-view-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.scrm-view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.scrm-hello {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.scrm-sub {
  margin-top: -10px;
  color: var(--s-muted);
}
.scrm-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: var(--s-panel);
  border: 1px solid var(--s-line);
}
.scrm-card h4 {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14.5px;
  font-weight: 720;
  letter-spacing: -0.01em;
}
.scrm-card h4.is-warn {
  color: var(--s-warn);
}
.scrm-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.scrm-row {
  display: flex;
  gap: 14px;
  min-height: 0;
}
.scrm-row--fill {
  flex-direction: row;
}
.scrm-row--fill > .scrm-card {
  height: 100%;
}
.scrm-grow {
  flex: 1;
  min-width: 0;
}
.scrm-side {
  width: 205px;
  flex: none;
}
.scrm-center {
  align-items: center;
  justify-content: center;
}
/* statistika */
.scrm-stats {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr 1fr;
  gap: 12px;
}
.scrm-stat {
  display: grid;
  gap: 2px;
  padding: 11px 13px;
  border-radius: 16px;
  text-align: left;
  background: var(--s-panel);
  border: 1px solid var(--s-line);
}
.scrm-stat small {
  font-size: 12px;
  color: var(--s-muted);
}
.scrm-stat b {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.scrm-stat span {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--s-teal-2);
}
.scrm-stat span.is-plain {
  color: var(--s-muted);
}
.scrm-stat--rank {
  border-color: transparent;
  background: linear-gradient(120deg, #2aa79b, #2a6fb0);
  transition: filter 0.2s ease;
}
.scrm-stat--rank:hover {
  filter: brightness(1.1);
}
.scrm-stat--rank small,
.scrm-stat--rank span {
  color: #fff;
}
.scrm-seg {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--s-panel-2);
}
.scrm-seg button {
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 620;
  color: var(--s-muted);
}
.scrm-seg button.is-on {
  color: #06231f;
  background: var(--s-teal-2);
}
.scrm-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 132px;
  padding-top: 6px;
}
.scrm-bars__col {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
  height: 100%;
}
.scrm-bars__col span {
  width: 100%;
  max-width: 34px;
  border-radius: 7px;
  background: #2c3648;
  transform-origin: bottom;
  animation: scrm-grow 0.5s cubic-bezier(0.2, 0.9, 0.25, 1) both;
  animation-delay: calc(var(--i) * 25ms);
}
.scrm-bars__col span.is-last {
  background: linear-gradient(180deg, var(--s-teal-2), var(--s-blue));
}
.scrm-bars__col em {
  font-size: 10.5px;
  font-style: normal;
  color: var(--s-muted);
}
@keyframes scrm-grow {
  from {
    transform: scaleY(0);
  }
}
.scrm-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  text-align: left;
  background: var(--s-panel-2);
  transition: background-color 0.2s ease;
}
.scrm-task:hover {
  background: #283142;
}
.scrm-task i {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
  font-weight: 650;
  color: #8cc6ff;
  background: color-mix(in srgb, var(--s-blue) 15%, transparent);
}
/* kuchli tomonlar */
.scrm-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--s-muted);
}
.scrm-legend i {
  width: 10px;
  height: 4px;
  margin-left: 6px;
  border-radius: 2px;
  background: #4a566b;
}
.scrm-legend i.is-me {
  margin-left: 0;
  background: var(--s-teal);
}
.scrm-skill {
  display: grid;
  grid-template-columns: 1fr 44%;
  grid-template-areas: 'name value' 'bars bars';
  gap: 5px 10px;
  align-items: center;
}
.scrm-skill > span {
  grid-area: name;
  font-weight: 600;
}
.scrm-skill > b {
  grid-area: value;
  justify-self: end;
  color: var(--s-teal-2);
}
.scrm-skill.is-weak > b {
  color: var(--s-warn);
}
.scrm-skill__bars {
  grid-area: bars;
  display: grid;
  gap: 3px;
}
.scrm-skill__bars i,
.scrm-compare div i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: #4a566b;
  transform-origin: left;
  animation: scrm-wide 0.6s cubic-bezier(0.2, 0.9, 0.25, 1) both;
  animation-delay: calc(var(--i, 0) * 60ms);
}
.scrm-skill__bars i.is-me,
.scrm-compare div i.is-me {
  height: 7px;
  background: linear-gradient(90deg, var(--s-teal), var(--s-blue));
}
.scrm-skill.is-weak .scrm-skill__bars i.is-me {
  background: linear-gradient(90deg, #e8963a, var(--s-warn));
}
@keyframes scrm-wide {
  from {
    transform: scaleX(0);
  }
}
.scrm-compare {
  display: grid;
  grid-template-columns: 120px 1fr 44px;
  gap: 10px;
  align-items: center;
  color: var(--s-soft);
}
.scrm-compare div {
  border-radius: 4px;
  background: var(--s-panel-2);
}
.scrm-compare b {
  text-align: right;
  color: var(--s-fg);
}
/* tugmalar */
.scrm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: flex-start;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  color: #06231f !important;
  background: linear-gradient(90deg, var(--s-teal-2), #6cc4f5);
  transition: filter 0.2s ease;
}
.scrm-btn:hover {
  filter: brightness(1.1);
}
.scrm-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.scrm-btn--ghost {
  color: var(--s-fg) !important;
  background: var(--s-panel-2);
  border: 1px solid var(--s-line);
}
.scrm-btn--lg {
  align-self: center;
  padding: 10px 34px;
  font-size: 14px;
}
/* darslar */
.scrm-topics {
  width: 270px;
  flex: none;
  gap: 6px;
}
.scrm-topics h4 {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--s-soft);
}
.scrm-topic {
  display: grid;
  grid-template-columns: 26px 1fr;
  grid-template-areas: 'num title' 'num bar';
  gap: 5px 10px;
  align-items: center;
  padding: 9px 10px;
  border-radius: 12px;
  text-align: left;
  transition: background-color 0.2s ease;
}
.scrm-topic:hover {
  background: var(--s-panel-2);
}
.scrm-topic.is-active {
  background: color-mix(in srgb, var(--s-teal) 13%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--s-teal) 28%, transparent);
}
.scrm-topic__num {
  grid-area: num;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-weight: 750;
  color: var(--s-teal-2);
  background: var(--s-panel-2);
}
.scrm-topic__title {
  grid-area: title;
  font-weight: 620;
  line-height: 1.3;
}
.scrm-topic__bar {
  grid-area: bar;
  height: 4px;
  border-radius: 2px;
  background: var(--s-panel-2);
}
.scrm-topic__bar i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--s-teal);
}
.scrm-lesson {
  gap: 14px;
}
.scrm-lesson h4 {
  font-size: 18px;
  line-height: 1.3;
}
.scrm-lesson__text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--s-soft);
}
.scrm-lesson__read {
  font-size: 12px;
  color: var(--s-muted);
}
.scrm-answers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.scrm-answers button {
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 650;
  text-align: left;
  background: var(--s-panel-2);
  border: 1px solid var(--s-line);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}
.scrm-answers button:not(:disabled):hover {
  border-color: var(--s-teal);
}
.scrm-answers button.is-right {
  color: #06231f;
  background: var(--s-teal-2);
  border-color: var(--s-teal-2);
}
.scrm-answers button.is-wrong {
  background: #5a2630;
  border-color: #ef6464;
}
.scrm-verdict {
  font-weight: 700;
  color: var(--s-teal-2);
}
.scrm-verdict.is-bad {
  color: #ff9d9d;
}
/* uy ishlari */
.scrm-hw {
  display: grid;
  grid-template-columns: 34px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 11px 12px;
  border-radius: 12px;
  background: var(--s-panel-2);
}
.scrm-hw__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--s-teal-2);
  background: color-mix(in srgb, var(--s-teal) 14%, transparent);
}
.scrm-hw div {
  display: grid;
}
.scrm-hw small {
  font-size: 11.5px;
  color: var(--s-muted);
}
.scrm-hw .scrm-btn {
  align-self: center;
}
.scrm-badge {
  min-width: 92px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  text-align: center;
}
.scrm-badge.is-0 {
  color: #8cc6ff;
  background: color-mix(in srgb, var(--s-blue) 18%, transparent);
}
.scrm-badge.is-1 {
  color: var(--s-warn);
  background: color-mix(in srgb, var(--s-warn) 15%, transparent);
}
.scrm-badge.is-2 {
  color: var(--s-teal-2);
  background: color-mix(in srgb, var(--s-teal) 16%, transparent);
}
/* o'yinlar */
.scrm-join {
  align-items: center;
  gap: 12px;
  width: 430px;
  padding: 24px;
  text-align: center;
}
.scrm-join h4 {
  font-size: 20px;
}
.scrm-join p {
  color: var(--s-soft);
}
.scrm-join__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  color: var(--s-teal-2);
  background: color-mix(in srgb, var(--s-teal) 15%, transparent);
}
.scrm-join__icon.is-ok {
  color: #06231f;
  background: var(--s-teal-2);
}
.scrm-code {
  display: flex;
  gap: 8px;
  margin: 6px 0;
}
.scrm-code span {
  display: grid;
  place-items: center;
  width: 46px;
  height: 56px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 800;
  background: var(--s-panel-2);
  border: 1.5px solid var(--s-line);
  transition: border-color 0.2s ease;
}
.scrm-code span.is-filled {
  border-color: var(--s-teal);
}
.scrm-join__count b {
  font-size: 22px;
  color: var(--s-fg);
}
.scrm-join__wait {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}
.scrm-join__wait i,
.scrm-online i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--s-teal);
  animation: pulse-soft 1.4s ease-in-out infinite;
}
/* reyting */
.scrm-rank {
  display: grid;
  grid-template-columns: 30px 34px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--s-panel-2);
  animation: scrm-in 0.35s ease both;
  animation-delay: calc(var(--i) * 45ms);
}
@keyframes scrm-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
}
.scrm-rank.is-me {
  background: color-mix(in srgb, var(--s-teal) 15%, var(--s-panel-2));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--s-teal) 40%, transparent);
}
.scrm-rank__place {
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  color: var(--s-muted);
}
.scrm-rank__place.is-1 {
  color: #ffd166;
}
.scrm-rank__place.is-2 {
  color: #cfd8e3;
}
.scrm-rank__place.is-3 {
  color: #e2a172;
}
.scrm-rank__avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-weight: 750;
  color: #fff;
  background: hsl(var(--h) 45% 32%);
}
.scrm-rank__name {
  font-weight: 620;
}
.scrm-rank__name em {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-style: normal;
  font-weight: 750;
  color: #06231f;
  background: var(--s-teal-2);
}
.scrm-rank b small {
  font-weight: 500;
  color: var(--s-muted);
}
/* video */
.scrm-videos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.scrm-video {
  display: grid;
  gap: 4px;
  padding: 10px;
  border-radius: 16px;
  text-align: left;
  background: var(--s-panel);
  border: 1px solid var(--s-line);
  transition: border-color 0.2s ease;
}
.scrm-video:hover,
.scrm-video.is-playing {
  border-color: var(--s-teal);
}
.scrm-video__thumb {
  position: relative;
  display: grid;
  place-items: center;
  height: 118px;
  margin-bottom: 6px;
  overflow: hidden;
  border-radius: 11px;
  background:
    radial-gradient(80% 90% at 20% 10%, hsl(var(--h) 60% 42% / 0.9), transparent 70%),
    linear-gradient(140deg, hsl(var(--h) 45% 22%), hsl(calc(var(--h) + 40) 40% 14%));
}
.scrm-video__play {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: #0b1220;
  background: hsl(0 0% 100% / 0.92);
  transition: transform 0.2s ease;
}
.scrm-video:hover .scrm-video__play {
  transform: scale(1.1);
}
.scrm-video.is-playing .scrm-video__play {
  opacity: 0;
}
.scrm-video__thumb em {
  position: absolute;
  right: 8px;
  bottom: 10px;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-style: normal;
  font-weight: 650;
  color: #fff;
  background: hsl(222 40% 6% / 0.75);
}
.scrm-video__progress {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: var(--s-teal-2);
  transform: scaleX(0);
  transform-origin: left;
}
.scrm-video.is-playing .scrm-video__progress {
  transform: scaleX(1);
  transition: transform 2.6s linear;
}
.scrm-video b {
  font-size: 13.5px;
  font-weight: 680;
}
.scrm-video small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--s-muted);
}
.scrm-video small.is-done {
  color: var(--s-teal-2);
}
/* AI */
.scrm-online {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--s-teal-2);
}
.scrm-chat__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
}
.scrm-msg {
  align-self: flex-start;
  max-width: 86%;
  padding: 10px 13px;
  border-radius: 14px 14px 14px 4px;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--s-soft);
  background: var(--s-panel-2);
}
.scrm-msg.is-me {
  align-self: flex-end;
  border-radius: 14px 14px 4px 14px;
  font-weight: 620;
  color: #06231f;
  background: var(--s-teal-2);
}
.scrm-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: var(--s-teal-2);
  animation: pulse-soft 0.8s steps(2) infinite;
}
.scrm-chat__input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: 12px;
  color: var(--s-muted);
  background: var(--s-panel-2);
  border: 1px solid var(--s-line);
}
.scrm-asks {
  gap: 8px;
}
.scrm-asks button {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 10px 11px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
  background: var(--s-panel-2);
  border: 1px solid transparent;
  transition: border-color 0.2s ease;
}
.scrm-asks button svg {
  flex: none;
  margin-top: 2px;
  color: var(--s-warn);
}
.scrm-asks button:hover,
.scrm-asks button.is-on {
  border-color: var(--s-teal);
}
@media (prefers-reduced-motion: reduce) {
  .scrm *,
  .scrm *::before {
    animation: none !important;
    transition: none !important;
  }
}
</style>
