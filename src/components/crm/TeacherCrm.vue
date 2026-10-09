<script setup>
// Noutbuk ekranidagi jonli CRM namoyishi (o'qituvchi paneli). Chap menyudagi bo'lim bosilganda
// ekrandagi ma'lumotlar almashadi; har bir bo'limning o'z kichik interaktivligi bor.
// Panel 1120px kenglikda chiziladi va ekranga moslab masshtablanadi.
// Bo'limlar faqat foydalanuvchi bosganda almashadi (o'zi aylanmaydi).
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import AppLogoMark from '../ui/AppLogoMark.vue'
import { crmData, crmIcons, crmViews } from '../../content/crm'
import { locale, tm } from '../../i18n'

const view = defineModel('view', { type: String, default: 'dashboard' })

const BASE_W = 1120
const BASE_H = 728

const d = computed(() => crmData[locale.value] ?? crmData.uz)
const nav = computed(() => {
  const items = tm('teachers.items') ?? []
  return crmViews.map((key, i) => ({ key, icon: crmIcons[i], label: items[i]?.title ?? key }))
})
const current = computed(() => nav.value.find((item) => item.key === view.value) ?? nav.value[0])

// ── masshtab
const fit = ref(null)
const scale = ref(0.6)
const height = ref(BASE_H)
let resizeObserver = null

watch(view, () => onEnterView())

function select(key) {
  view.value = key
}

// ── bo'limlar holati
const period = ref(0)
const chart = computed(() => (period.value === 0 ? d.value.dashboard.week : d.value.dashboard.month))

const activeFilter = ref(-1)
const activeRows = computed(() => {
  const rows = d.value.active.rows
  if (activeFilter.value < 0) return rows
  const name = d.value.active.filters[activeFilter.value]
  return rows.filter((r) => r.cls === name)
})

const classIndex = ref(0)
const topicIndex = ref(0)
const topic = computed(() => d.value.lessons.topics[topicIndex.value])

const score = ref(86)
const saved = ref(false)
watch(score, () => (saved.value = false))

const gameState = ref('lobby')
const joined = ref(0)
let joinTimer = 0
function runJoin() {
  window.clearInterval(joinTimer)
  joined.value = 0
  joinTimer = window.setInterval(() => {
    joined.value = Math.min(d.value.games.players.length, joined.value + 1)
    if (joined.value >= d.value.games.players.length) window.clearInterval(joinTimer)
  }, 380)
}
function startGame() {
  gameState.value = 'done'
}
function newGame() {
  gameState.value = 'lobby'
  runJoin()
}

const resultsTab = ref(0)

const chatIndex = ref(0)
const typed = ref('')
let typeTimer = 0
function askAi(i) {
  chatIndex.value = i
  window.clearInterval(typeTimer)
  typed.value = ''
  const full = d.value.ai.chats[i].a
  let k = 0
  typeTimer = window.setInterval(() => {
    k += 3
    typed.value = full.slice(0, k)
    if (k >= full.length) window.clearInterval(typeTimer)
  }, 24)
}

const logFilter = ref(0)
const openLog = ref(1)
const logRows = computed(() => (logFilter.value === 1 ? d.value.logs.rows.filter((r) => r.flag) : d.value.logs.rows))
const flaggedCount = computed(() => d.value.logs.rows.filter((r) => r.flag).length)

const crmTheme = ref(0)
const crmLang = ref(0)
const toggles = ref([true, true, false])

const videoLink = ref('')

function onEnterView() {
  if (view.value === 'games') {
    gameState.value = 'lobby'
    runJoin()
  }
  if (view.value === 'ai') askAi(chatIndex.value)
}
watch(locale, () => {
  if (view.value === 'ai') askAi(chatIndex.value)
})

onMounted(() => {
  const el = fit.value
  if (!el) return
  resizeObserver = new ResizeObserver(([entry]) => {
    const { width, height: h } = entry.contentRect
    scale.value = width / BASE_W
    // ekran nisbati qanday bo'lsa ham panel uni to'liq qoplaydi
    height.value = width > 0 ? Math.max(600, Math.round(h / scale.value)) : BASE_H
  })
  resizeObserver.observe(el)
  onEnterView()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.clearInterval(joinTimer)
  window.clearInterval(typeTimer)
})

const pct = (v, max = 100) => `${Math.round((v / max) * 100)}%`
</script>

<template>
  <div ref="fit" class="crm-fit">
    <div
      class="crm"
      :class="{ 'is-light': crmTheme === 1 }"
      :style="{ width: `${BASE_W}px`, height: `${height}px`, transform: `scale(${scale})` }"
    >
      <!-- ── Chap menyu -->
      <aside class="crm-side">
        <div class="crm-logo">
          <AppLogoMark :size="30" />
          <span><span class="crm-logo__geo">Geo</span><span class="crm-logo__learn">Learn</span></span>
        </div>
        <nav class="crm-nav">
          <button
            v-for="item in nav"
            :key="item.key"
            type="button"
            class="crm-nav__item"
            :class="{ 'is-active': item.key === view }"
            @click="select(item.key)"
          >
            <AppIcon :name="item.icon" :size="17" />
            <span>{{ item.label }}</span>
            <span v-if="item.key === 'logs'" class="crm-nav__count">{{ flaggedCount }}</span>
            <span v-if="item.key === 'active'" class="crm-nav__live" />
          </button>
        </nav>
        <div class="crm-school">
          <span class="crm-school__logo">12</span>
          <div>
            <b>{{ d.brand.school }}</b>
            <small>{{ d.brand.role }}</small>
          </div>
        </div>
      </aside>

      <!-- ── Asosiy qism -->
      <section class="crm-main">
        <header class="crm-top">
          <div class="crm-top__title">
            <h4>{{ current.label }}</h4>
            <p>{{ view === 'dashboard' ? d.date : d.subtitles[view] }}</p>
          </div>
          <div class="crm-search">
            <AppIcon name="search" :size="16" />
            <span>{{ d.search }}</span>
          </div>
          <button
            type="button"
            class="crm-iconbtn"
            :aria-label="locale === 'ru' ? 'Сменить тему' : 'Mavzuni almashtirish'"
            @click="crmTheme = crmTheme ? 0 : 1"
          >
            <AppIcon :name="crmTheme ? 'sun' : 'moon'" :size="17" />
          </button>
          <span class="crm-iconbtn crm-bell"><AppIcon name="bell" :size="17" /><i /></span>
          <span class="crm-avatar">{{ d.brand.user }}</span>
        </header>

        <div class="crm-body">
          <Transition name="crm-view" mode="out-in">
            <!-- 1. Boshqaruv paneli -->
            <div v-if="view === 'dashboard'" key="dashboard" class="crm-view">
              <div class="crm-stats">
                <div v-for="s in d.dashboard.stats" :key="s.label" class="crm-card crm-stat">
                  <div class="crm-stat__top">
                    <span>{{ s.label }}</span>
                    <em v-if="s.badge" class="crm-badge" :class="s.live ? 'is-ok' : 'is-info'"><i v-if="s.live" class="crm-dot" />{{ s.badge }}</em>
                  </div>
                  <b class="crm-stat__value">{{ s.value }}</b>
                  <small :class="`tone-${s.tone ?? 'muted'}`">{{ s.note }}</small>
                </div>
              </div>
              <div class="crm-row">
                <div class="crm-card crm-chart">
                  <div class="crm-card__head">
                    <h5>{{ d.dashboard.chartTitle }}</h5>
                    <div class="crm-legend">
                      <span><i class="is-a" />{{ d.dashboard.legend[0] }}</span>
                      <span><i class="is-b" />{{ d.dashboard.legend[1] }}</span>
                    </div>
                    <div class="crm-seg">
                      <button
                        v-for="(p, i) in d.dashboard.periods"
                        :key="p"
                        type="button"
                        :class="{ 'is-on': period === i }"
                        @click="period = i"
                      >
                        {{ p }}
                      </button>
                    </div>
                  </div>
                  <div class="crm-bars">
                    <div v-for="(label, i) in chart.labels" :key="label" class="crm-bars__col">
                      <div class="crm-bars__pair">
                        <span class="is-a" :style="{ height: `${chart.a[i]}%` }"><em>{{ chart.a[i] }}</em></span>
                        <span class="is-b" :style="{ height: `${chart.b[i]}%` }" />
                      </div>
                      <small>{{ label }}</small>
                    </div>
                  </div>
                </div>
                <div class="crm-card crm-people">
                  <div class="crm-card__head">
                    <h5>{{ d.dashboard.activeTitle }}</h5>
                    <small>{{ d.dashboard.activeTag }}</small>
                  </div>
                  <ul>
                    <li v-for="p in d.dashboard.active" :key="p.name">
                      <span class="crm-ava" :style="{ '--h': p.hue }">{{ p.initial }}<i /></span>
                      <div>
                        <b>{{ p.name }}</b>
                        <small>{{ p.doing }}</small>
                      </div>
                      <em>{{ p.cls }}</em>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="crm-card crm-hw">
                <div class="crm-card__head">
                  <h5>{{ d.dashboard.hwTitle }}</h5>
                  <small>{{ d.dashboard.hwTag }}</small>
                </div>
                <div class="crm-hw__list">
                  <div v-for="h in d.dashboard.hw" :key="h.title" class="crm-hw__item">
                    <AppIcon name="clipboard" :size="16" />
                    <span>{{ h.title }}</span>
                    <em class="crm-badge" :class="`is-${h.tone}`">{{ h.badge }}</em>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Faol o'quvchilar -->
            <div v-else-if="view === 'active'" key="active" class="crm-view">
              <div class="crm-toolbar">
                <div class="crm-online">
                  <i class="crm-dot crm-dot--lg" />
                  <b>{{ d.active.title }}: 23</b>
                </div>
                <div class="crm-chips">
                  <button type="button" :class="{ 'is-on': activeFilter === -1 }" @click="activeFilter = -1">{{ d.active.all }}</button>
                  <button
                    v-for="(f, i) in d.active.filters"
                    :key="f"
                    type="button"
                    :class="{ 'is-on': activeFilter === i }"
                    @click="activeFilter = i"
                  >
                    {{ f }}
                  </button>
                </div>
              </div>
              <TransitionGroup tag="ul" name="crm-list" class="crm-card crm-live">
                <li v-for="r in activeRows" :key="r.name">
                  <span class="crm-ava" :style="{ '--h': r.hue }">{{ r.initial }}<i /></span>
                  <div class="crm-live__who">
                    <b>{{ r.name }}</b>
                    <small>{{ r.cls }}</small>
                  </div>
                  <div class="crm-live__doing">
                    <span>{{ r.doing }}</span>
                    <div class="crm-progress"><i :style="{ width: `${r.progress}%` }" /></div>
                  </div>
                  <em class="crm-live__detail">{{ r.detail }}</em>
                  <small class="crm-live__time"><AppIcon name="clock" :size="13" /> {{ r.min }} {{ d.active.online }}</small>
                </li>
              </TransitionGroup>
            </div>

            <!-- 3. Sinflar -->
            <div v-else-if="view === 'classes'" key="classes" class="crm-view crm-split">
              <div>
                <div class="crm-toolbar">
                  <button type="button" class="crm-btn is-primary"><AppIcon name="plus" :size="15" />{{ d.classes.add.replace('+ ', '') }}</button>
                  <button type="button" class="crm-btn"><AppIcon name="upload" :size="15" />{{ d.classes.upload }}</button>
                </div>
                <div class="crm-classes">
                  <button
                    v-for="(c, i) in d.classes.items"
                    :key="c.name"
                    type="button"
                    class="crm-card crm-class"
                    :class="{ 'is-on': classIndex === i }"
                    @click="classIndex = i"
                  >
                    <div class="crm-class__top">
                      <b>{{ c.name }}</b>
                      <em>{{ c.avg }}%</em>
                    </div>
                    <small>{{ c.count }} {{ d.classes.students }}</small>
                    <div class="crm-progress"><i :style="{ width: `${c.avg}%` }" /></div>
                    <small class="crm-class__topic">{{ d.classes.topic }}: {{ c.topic }}</small>
                  </button>
                </div>
              </div>
              <div class="crm-card crm-roster">
                <div class="crm-card__head">
                  <h5>{{ d.classes.listTitle }} · {{ d.classes.items[classIndex].name }}</h5>
                </div>
                <TransitionGroup tag="ul" name="crm-list">
                  <li v-for="(p, k) in d.classes.items[classIndex].students" :key="`${classIndex}-${p.name}`">
                    <span class="crm-rank">{{ k + 1 }}</span>
                    <span class="crm-ava" :style="{ '--h': p.hue }">{{ p.initial }}</span>
                    <b>{{ p.name }}</b>
                    <em>{{ p.score }}%</em>
                  </li>
                </TransitionGroup>
                <div class="crm-ring" :style="{ '--v': d.classes.items[classIndex].avg }">
                  <span>
                    <b>{{ d.classes.items[classIndex].avg }}%</b>
                    <small>{{ d.classes.avg }}</small>
                  </span>
                </div>
              </div>
            </div>

            <!-- 4. Darslar va mavzular -->
            <div v-else-if="view === 'lessons'" key="lessons" class="crm-view crm-split crm-split--lessons">
              <div class="crm-card crm-topics">
                <div class="crm-card__head">
                  <h5>{{ d.lessons.unit }}</h5>
                </div>
                <button
                  v-for="(tp, i) in d.lessons.topics"
                  :key="tp.title"
                  type="button"
                  class="crm-topic"
                  :class="{ 'is-on': topicIndex === i }"
                  @click="topicIndex = i"
                >
                  <span class="crm-topic__num">{{ i + 1 }}</span>
                  <span class="crm-topic__title">{{ tp.title }}</span>
                  <em class="crm-badge" :class="tp.status === 'published' ? 'is-ok' : 'is-muted'">
                    {{ tp.status === 'published' ? d.lessons.published : d.lessons.draft }}
                  </em>
                </button>
              </div>
              <Transition name="crm-view" mode="out-in">
                <div :key="topicIndex" class="crm-card crm-topic-detail">
                  <div class="crm-topic-detail__head">
                    <em class="crm-badge is-info"><AppIcon name="file" :size="12" /> {{ d.lessons.fromPdf }}</em>
                    <h5>{{ topic.title }}</h5>
                  </div>
                  <div class="crm-mini-stats">
                    <div>
                      <b>{{ topic.q }}</b><small>{{ d.lessons.statLabels[0] }}</small>
                    </div>
                    <div>
                      <b>{{ topic.avg ? `${topic.avg}%` : '—' }}</b><small>{{ d.lessons.statLabels[1] }}</small>
                    </div>
                    <div>
                      <b>{{ topic.views || '—' }}</b><small>{{ d.lessons.statLabels[2] }}</small>
                    </div>
                  </div>
                  <div class="crm-question">
                    <small>{{ d.lessons.sample }}</small>
                    <p>{{ topic.question }}</p>
                    <ul>
                      <li v-for="(o, k) in topic.options" :key="o" :class="{ 'is-correct': k === topic.correct }">
                        <span>{{ 'ABCD'[k] }}</span>{{ o }}
                        <AppIcon v-if="k === topic.correct" name="check" :size="15" :stroke="2.4" />
                      </li>
                    </ul>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 5. Uy ishlari -->
            <div v-else-if="view === 'homework'" key="homework" class="crm-view">
              <div class="crm-card crm-table">
                <div class="crm-table__row crm-table__head">
                  <span v-for="col in d.homework.cols" :key="col">{{ col }}</span>
                </div>
                <div v-for="r in d.homework.rows" :key="r.title" class="crm-table__row">
                  <b>{{ r.title }}</b>
                  <span>{{ r.cls }}</span>
                  <span>{{ r.due }}</span>
                  <span class="crm-table__done">
                    <div class="crm-progress"><i :style="{ width: pct(r.done, r.total) }" /></div>
                    {{ r.done }}/{{ r.total }}
                    <em v-if="r.late" class="crm-late">{{ r.late }} {{ d.homework.late }}</em>
                  </span>
                  <span><em class="crm-badge" :class="`is-${r.tone}`">{{ r.status }}</em></span>
                </div>
              </div>
              <div class="crm-card crm-review">
                <div class="crm-review__who">
                  <span class="crm-ava crm-ava--lg" :style="{ '--h': d.homework.reviewStudent.hue }">{{ d.homework.reviewStudent.initial }}</span>
                  <div>
                    <b>{{ d.homework.reviewStudent.name }} · {{ d.homework.reviewStudent.cls }}</b>
                    <small>{{ d.homework.reviewTitle }}: {{ d.homework.reviewTask }}</small>
                    <em class="crm-badge is-warn">{{ d.homework.reviewLate }}</em>
                  </div>
                </div>
                <div class="crm-review__score">
                  <div class="crm-review__score-top">
                    <span>{{ d.homework.scoreLabel }}</span>
                    <b>{{ score }}<small>/100</small></b>
                  </div>
                  <input v-model.number="score" type="range" min="0" max="100" class="crm-range" :style="{ '--rv': `${score}%` }" />
                  <p class="crm-review__comment">{{ d.homework.comment }}</p>
                </div>
                <button type="button" class="crm-btn is-primary crm-review__save" :class="{ 'is-done': saved }" @click="saved = true">
                  <AppIcon :name="saved ? 'check' : 'send'" :size="15" />{{ saved ? d.homework.saved : d.homework.save }}
                </button>
              </div>
            </div>

            <!-- 6. Jonli o'yinlar -->
            <div v-else-if="view === 'games'" key="games" class="crm-view">
              <Transition name="crm-view" mode="out-in">
                <div v-if="gameState === 'lobby'" key="lobby" class="crm-game">
                  <div class="crm-card crm-game__code">
                    <small>{{ d.games.code }}</small>
                    <b>482 913</b>
                    <div class="crm-game__settings">
                      <div v-for="s in d.games.settings" :key="s.label">
                        <small>{{ s.label }}</small><span>{{ s.value }}</span>
                      </div>
                    </div>
                    <button type="button" class="crm-btn is-primary is-big" :disabled="joined < 3" @click="startGame">
                      <AppIcon name="play" :size="16" />{{ d.games.start }}
                    </button>
                  </div>
                  <div class="crm-card crm-game__players">
                    <div class="crm-card__head">
                      <h5>{{ d.games.joining }}</h5>
                      <em class="crm-badge is-ok"><i class="crm-dot" />{{ joined }}/{{ d.games.players.length }}</em>
                    </div>
                    <TransitionGroup tag="div" name="crm-pop" class="crm-game__grid">
                      <span v-for="p in d.games.players.slice(0, joined)" :key="p.name" class="crm-player">
                        <span class="crm-ava" :style="{ '--h': p.hue }">{{ p.initial }}</span>{{ p.name.split(' ')[0] }}
                      </span>
                    </TransitionGroup>
                  </div>
                </div>
                <div v-else key="done" class="crm-card crm-podium">
                  <div class="crm-card__head">
                    <h5><AppIcon name="trophy" :size="18" /> {{ d.games.finished }}</h5>
                    <button type="button" class="crm-btn" @click="newGame"><AppIcon name="gamepad" :size="15" />{{ d.games.again }}</button>
                  </div>
                  <div class="crm-podium__stage">
                    <div v-for="(p, i) in d.games.podium" :key="p.name" class="crm-podium__place" :class="`is-${i}`">
                      <span class="crm-ava crm-ava--lg" :style="{ '--h': p.hue }">{{ p.initial }}</span>
                      <b>{{ p.name }}</b>
                      <small>{{ p.score }} {{ d.games.points }}</small>
                      <div class="crm-podium__block">{{ [2, 1, 3][i] }}</div>
                    </div>
                  </div>
                  <ul class="crm-podium__rest">
                    <li v-for="(p, i) in d.games.rest" :key="p.name">
                      <span class="crm-rank">{{ i + 4 }}</span>
                      <span class="crm-ava" :style="{ '--h': p.hue }">{{ p.initial }}</span>
                      <b>{{ p.name }}</b>
                      <em>{{ p.score }}</em>
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>

            <!-- 7. Natijalar va reyting -->
            <div v-else-if="view === 'results'" key="results" class="crm-view">
              <div class="crm-toolbar">
                <div class="crm-seg crm-seg--lg">
                  <button v-for="(tab, i) in d.results.tabs" :key="tab" type="button" :class="{ 'is-on': resultsTab === i }" @click="resultsTab = i">
                    {{ tab }}
                  </button>
                </div>
              </div>
              <Transition name="crm-view" mode="out-in">
                <div v-if="resultsTab === 0" key="students" class="crm-card crm-leader">
                  <div v-for="(p, i) in d.results.students" :key="p.name" class="crm-leader__row">
                    <span class="crm-medal" :class="`is-${i}`">
                      <AppIcon v-if="i < 3" name="trophy" :size="15" />
                      <template v-else>{{ i + 1 }}</template>
                    </span>
                    <span class="crm-ava" :style="{ '--h': p.hue }">{{ p.initial }}</span>
                    <div class="crm-leader__who">
                      <b>{{ p.name }}</b><small>{{ p.cls }}</small>
                    </div>
                    <div class="crm-progress crm-progress--wide"><i :style="{ width: `${p.score}%` }" /></div>
                    <b class="crm-leader__score">{{ p.score }}</b>
                    <em :class="p.trend.startsWith('-') ? 'tone-bad' : 'tone-up'">{{ p.trend }}</em>
                  </div>
                </div>
                <div v-else key="classes" class="crm-card crm-hbars">
                  <div v-for="c in d.results.classes" :key="c.name" class="crm-hbars__row">
                    <b>{{ c.name }}</b>
                    <div class="crm-hbars__track"><i :style="{ width: `${c.avg}%` }" /></div>
                    <em>{{ c.avg }}%</em>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 8. Videodarslar -->
            <div v-else-if="view === 'videos'" key="videos" class="crm-view">
              <form class="crm-addlink" @submit.prevent="videoLink = ''">
                <AppIcon name="video" :size="17" />
                <input v-model="videoLink" type="text" :placeholder="d.videos.add" />
                <button type="submit" class="crm-btn is-primary"><AppIcon name="plus" :size="15" />{{ d.videos.addBtn }}</button>
              </form>
              <div class="crm-videos">
                <div v-for="v in d.videos.items" :key="v.title" class="crm-card crm-video">
                  <div class="crm-video__thumb" :style="{ '--h': v.hue }">
                    <svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0 90 L30 52 L52 66 L84 26 L112 58 L134 40 L166 70 L200 44 L200 90 Z" />
                    </svg>
                    <span class="crm-video__play"><AppIcon name="play" :size="18" /></span>
                    <em>{{ v.dur }}</em>
                  </div>
                  <b>{{ v.title }}</b>
                  <div class="crm-progress"><i :style="{ width: pct(v.seen, 164) }" /></div>
                  <small>{{ v.seen }} / 164 {{ d.videos.watched }}</small>
                </div>
              </div>
            </div>

            <!-- 9. AI yordamchi -->
            <div v-else-if="view === 'ai'" key="ai" class="crm-view crm-split crm-split--ai">
              <div class="crm-card crm-chat">
                <div class="crm-chat__msgs">
                  <div class="crm-chat__history">
                    <div class="crm-msg is-user">{{ d.ai.chats[(chatIndex + 2) % 3].q }}</div>
                    <div class="crm-msg is-ai">
                      <span class="crm-msg__bot"><AppIcon name="bot" :size="16" /></span>
                      <p>{{ d.ai.chats[(chatIndex + 2) % 3].a }}</p>
                    </div>
                  </div>
                  <div class="crm-msg is-user">{{ d.ai.chats[chatIndex].q }}</div>
                  <div class="crm-msg is-ai">
                    <span class="crm-msg__bot"><AppIcon name="bot" :size="16" /></span>
                    <p>{{ typed }}<i v-if="typed.length < d.ai.chats[chatIndex].a.length" class="crm-caret" /></p>
                  </div>
                </div>
                <div class="crm-chat__input">
                  <AppIcon name="clip" :size="17" />
                  <span>{{ d.ai.placeholder }}</span>
                  <AppIcon name="mic" :size="17" />
                  <span class="crm-chat__send"><AppIcon name="send" :size="15" /></span>
                </div>
              </div>
              <div class="crm-ai-side">
                <div class="crm-card">
                  <div class="crm-card__head">
                    <h5>{{ d.ai.suggestions }}</h5>
                  </div>
                  <button
                    v-for="(c, i) in d.ai.chats"
                    :key="c.q"
                    type="button"
                    class="crm-suggest"
                    :class="{ 'is-on': chatIndex === i }"
                    @click="askAi(i)"
                  >
                    <AppIcon name="sparkles" :size="15" />{{ c.q }}
                  </button>
                </div>
                <div class="crm-caps">
                  <span v-for="(cap, i) in d.ai.caps" :key="cap"><AppIcon :name="['image', 'sparkles', 'mic', 'file'][i]" :size="15" />{{ cap }}</span>
                </div>
              </div>
            </div>

            <!-- 10. AI Logs -->
            <div v-else-if="view === 'logs'" key="logs" class="crm-view">
              <div class="crm-toolbar">
                <div class="crm-chips">
                  <button type="button" :class="{ 'is-on': logFilter === 0 }" @click="logFilter = 0">{{ d.logs.all }}</button>
                  <button type="button" :class="{ 'is-on': logFilter === 1 }" @click="logFilter = 1">
                    <AppIcon name="alert" :size="13" /> {{ d.logs.flagged }} ({{ flaggedCount }})
                  </button>
                </div>
              </div>
              <TransitionGroup tag="div" name="crm-list" class="crm-card crm-logs">
                <button
                  v-for="(r, i) in logRows"
                  :key="r.name + r.time"
                  type="button"
                  class="crm-log"
                  :class="{ 'is-flag': r.flag, 'is-open': openLog === i }"
                  @click="openLog = openLog === i ? -1 : i"
                >
                  <div class="crm-log__row">
                    <span class="crm-ava" :style="{ '--h': r.hue }">{{ r.initial }}</span>
                    <b>{{ r.name }}</b>
                    <small>{{ r.cls }} · {{ r.time }}</small>
                    <span class="crm-log__text">{{ r.text }}</span>
                    <em class="crm-badge" :class="r.flag ? 'is-bad' : 'is-muted'">
                      <AppIcon v-if="r.flag" name="alert" :size="12" />{{ r.flag ? d.logs.warn : d.logs.ok }}
                    </em>
                  </div>
                  <div v-if="openLog === i" class="crm-log__answer"><AppIcon name="bot" :size="15" /> {{ r.answer }}</div>
                </button>
              </TransitionGroup>
            </div>

            <!-- 11. Sozlamalar -->
            <div v-else key="settings" class="crm-view crm-settings">
              <div class="crm-card crm-set">
                <h5>{{ d.settings.theme }}</h5>
                <div class="crm-themes">
                  <button
                    v-for="(th, i) in d.settings.themes"
                    :key="th"
                    type="button"
                    class="crm-theme"
                    :class="[`is-${i}`, { 'is-on': crmTheme === i }]"
                    @click="crmTheme = i"
                  >
                    <span class="crm-theme__preview"><i /><i /><i /></span>
                    <span><AppIcon :name="i ? 'sun' : 'moon'" :size="14" /> {{ th }}</span>
                  </button>
                </div>
                <h5>{{ d.settings.language }}</h5>
                <div class="crm-seg crm-seg--lg">
                  <button v-for="(l, i) in d.settings.languages" :key="l" type="button" :class="{ 'is-on': crmLang === i }" @click="crmLang = i">
                    {{ l }}
                  </button>
                </div>
              </div>
              <div class="crm-card crm-set">
                <h5>{{ d.settings.logo }}</h5>
                <div class="crm-logo-up">
                  <span class="crm-school__logo crm-school__logo--lg">12</span>
                  <div>
                    <b>{{ d.brand.school }}</b>
                    <small>{{ d.settings.logoHint }}</small>
                  </div>
                  <button type="button" class="crm-btn"><AppIcon name="upload" :size="15" />{{ d.settings.change }}</button>
                </div>
                <h5>{{ d.settings.notifications }}</h5>
                <label v-for="(tg, i) in d.settings.toggles" :key="tg" class="crm-toggle">
                  <span>{{ tg }}</span>
                  <input v-model="toggles[i]" type="checkbox" />
                  <i />
                </label>
              </div>
            </div>
          </Transition>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.crm-fit {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.crm {
  --c-bg: #10141b;
  --c-side: #0d1117;
  --c-panel: #161c26;
  --c-panel-2: #1c2330;
  --c-line: #232b38;
  --c-fg: #e8eef5;
  --c-soft: #b6c1cf;
  --c-muted: #7f8c9e;
  --c-teal: #2ec4b6;
  --c-teal-2: #4ee0cf;
  --c-blue: #3b9eea;
  --c-warn: #f0a83a;
  --c-ok: #33c37a;
  --c-bad: #ef6464;
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.35;
  letter-spacing: 0;
  color: var(--c-fg);
  background: var(--c-bg);
  text-align: left;
  transition:
    background-color 0.4s ease,
    color 0.4s ease;
}
.crm.is-light {
  --c-bg: #f2f5f8;
  --c-side: #ffffff;
  --c-panel: #ffffff;
  --c-panel-2: #f3f6f9;
  --c-line: #e1e7ee;
  --c-fg: #17202b;
  --c-soft: #3d4a5c;
  --c-muted: #6b788a;
  --c-teal: #17a596;
  --c-teal-2: #12988a;
}
:where(.crm) *,
:where(.crm) *::before,
:where(.crm) *::after {
  box-sizing: border-box;
}
:where(.crm button) {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
:where(.crm h4, .crm h5, .crm p) {
  margin: 0;
}
:where(.crm ul) {
  list-style: none;
  margin: 0;
  padding: 0;
}
:where(.crm b) {
  font-weight: 650;
}
:where(.crm small) {
  font-size: 11.5px;
  color: var(--c-muted);
}
:where(.crm em) {
  font-style: normal;
}

/* ── menyu */
.crm-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 12px;
  background: var(--c-side);
  border-right: 1px solid var(--c-line);
  transition: background-color 0.4s ease;
}
.crm-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.02em;
}
.crm-logo svg {
  color: #8fbcf2;
}
.crm-logo__learn {
  color: #4fdc8f;
}
.crm.is-light .crm-logo svg,
.crm.is-light .crm-logo__geo {
  color: #14305c;
}
.crm.is-light .crm-logo__learn {
  color: #1f9a78;
}
.crm-nav {
  display: grid;
  gap: 2px;
}
.crm-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  color: var(--c-soft);
  font-weight: 520;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.crm-nav__item svg {
  flex: none;
  color: var(--c-muted);
  transition: color 0.2s ease;
}
.crm-nav__item:hover {
  background: color-mix(in srgb, var(--c-teal) 8%, transparent);
  color: var(--c-fg);
}
.crm-nav__item.is-active {
  color: var(--c-teal-2);
  background: color-mix(in srgb, var(--c-teal) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-teal) 22%, transparent);
}
.crm-nav__item.is-active svg {
  color: var(--c-teal-2);
}
.crm-nav__item.is-active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--c-teal);
}
.crm-nav__count {
  margin-left: auto;
  min-width: 18px;
  padding: 1px 6px;
  border-radius: 99px;
  font-size: 10.5px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  background: var(--c-bad);
}
.crm-nav__live {
  margin-left: auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-ok);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--c-ok) 60%, transparent);
  animation: crm-ping 1.6s ease-out infinite;
}
.crm-school {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--c-panel-2);
}
.crm-school div {
  display: grid;
}
.crm-school__logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-weight: 800;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--c-teal), var(--c-blue));
}
.crm-school__logo--lg {
  width: 52px;
  height: 52px;
  font-size: 17px;
}

/* ── yuqori panel */
.crm-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.crm-top {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 70px;
  padding: 0 22px;
  border-bottom: 1px solid var(--c-line);
}
.crm-top__title {
  flex: 1;
  min-width: 0;
}
.crm-top__title h4 {
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.02em;
}
.crm-top__title p {
  font-size: 12px;
  color: var(--c-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crm-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 280px;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--c-muted);
  background: var(--c-panel);
  border: 1px solid var(--c-line);
  white-space: nowrap;
  overflow: hidden;
}
.crm-iconbtn {
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--c-soft);
  border: 1px solid var(--c-line);
  background: var(--c-panel);
}
.crm-bell i {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-warn);
}
.crm-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: 750;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(135deg, var(--c-teal), var(--c-blue));
}

/* ── kontent */
.crm-body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 18px 22px;
  overflow: hidden;
}
.crm-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
}
.crm-view-enter-active,
.crm-view-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.crm-view-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.crm-view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.crm-list-enter-active,
.crm-list-leave-active,
.crm-list-move {
  transition: all 0.35s ease;
}
.crm-list-enter-from,
.crm-list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.crm-list-leave-active {
  position: absolute;
  visibility: hidden;
}
.crm-pop-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.crm-pop-enter-from {
  opacity: 0;
  transform: scale(0.6);
}

.crm-card {
  border-radius: 14px;
  background: var(--c-panel);
  border: 1px solid var(--c-line);
  transition:
    background-color 0.4s ease,
    border-color 0.25s ease;
}
.crm-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.crm-card__head h5 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 14px;
  font-weight: 700;
}
.crm-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.crm-badge.is-ok {
  color: var(--c-ok);
  background: color-mix(in srgb, var(--c-ok) 14%, transparent);
}
.crm-badge.is-info {
  color: var(--c-blue);
  background: color-mix(in srgb, var(--c-blue) 14%, transparent);
}
.crm-badge.is-warn {
  color: var(--c-warn);
  background: color-mix(in srgb, var(--c-warn) 15%, transparent);
}
.crm-badge.is-bad {
  color: var(--c-bad);
  background: color-mix(in srgb, var(--c-bad) 14%, transparent);
}
.crm-badge.is-muted {
  color: var(--c-muted);
  background: var(--c-panel-2);
}
.tone-up {
  color: var(--c-ok) !important;
}
.tone-warn {
  color: var(--c-warn) !important;
}
.tone-bad {
  color: var(--c-bad) !important;
}
.crm-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-ok);
  animation: crm-ping 1.6s ease-out infinite;
}
.crm-dot--lg {
  width: 10px;
  height: 10px;
}
@keyframes crm-ping {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--c-ok) 55%, transparent);
  }
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}
.crm-ava {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 750;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--h) 60% 52%), hsl(calc(var(--h) + 30) 65% 40%));
}
.crm-ava i {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-ok);
  border: 2px solid var(--c-panel);
}
.crm-ava--lg {
  width: 46px;
  height: 46px;
  font-size: 17px;
}
.crm-progress {
  height: 6px;
  border-radius: 99px;
  background: var(--c-panel-2);
  overflow: hidden;
}
.crm-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--c-teal), var(--c-blue));
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.crm-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 650;
  font-size: 12.5px;
  white-space: nowrap;
  border: 1px solid var(--c-line) !important;
  background: var(--c-panel) !important;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;
}
.crm-btn:active {
  transform: scale(0.96);
}
.crm-btn.is-primary {
  color: #062421 !important;
  border-color: transparent !important;
  background: var(--c-teal) !important;
}
.crm-btn.is-primary:hover {
  background: var(--c-teal-2) !important;
}
.crm-btn.is-big {
  height: 46px;
  padding: 0 22px;
  font-size: 14px;
}
.crm-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.crm-seg {
  display: inline-flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--c-panel-2);
}
.crm-seg button {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.crm-seg button.is-on {
  color: var(--c-fg);
  background: var(--c-panel);
  box-shadow: 0 2px 8px -3px rgb(0 0 0 / 0.4);
}
.crm-seg--lg button {
  padding: 8px 18px;
  font-size: 13px;
}
.crm-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.crm-chips {
  display: flex;
  gap: 6px;
}
.crm-chips button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-soft);
  border: 1px solid var(--c-line);
  transition: all 0.2s ease;
}
.crm-chips button.is-on {
  color: #062421;
  background: var(--c-teal);
  border-color: transparent;
}
.crm-rank {
  width: 22px;
  font-weight: 700;
  color: var(--c-muted);
  text-align: center;
}

/* 1. dashboard */
.crm-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.crm-stat {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
}
.crm-stat__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: var(--c-soft);
  font-size: 12.5px;
}
.crm-stat__value {
  font-size: 28px;
  font-weight: 800 !important;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.crm-row {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.crm-chart,
.crm-people,
.crm-hw {
  padding: 14px 16px;
}
.crm-chart {
  display: flex;
  flex-direction: column;
}
.crm-legend {
  display: flex;
  gap: 12px;
  font-size: 11.5px;
  color: var(--c-muted);
}
.crm-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.crm-legend i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}
.crm-legend .is-a,
.crm-bars .is-a {
  background: linear-gradient(180deg, var(--c-teal-2), var(--c-blue));
}
.crm-legend .is-b,
.crm-bars .is-b {
  background: color-mix(in srgb, var(--c-muted) 35%, var(--c-panel-2));
}
.crm-bars {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding-top: 6px;
  background: repeating-linear-gradient(0deg, transparent 0 calc(25% - 1px), var(--c-line) calc(25% - 1px) 25%) 0 0 / 100% calc(100% - 22px) no-repeat;
}
.crm-bars__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.crm-bars__pair {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
}
.crm-bars__pair span {
  position: relative;
  width: 34%;
  max-width: 26px;
  border-radius: 6px 6px 3px 3px;
  transition: height 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.crm-bars__pair em {
  position: absolute;
  left: 50%;
  bottom: 100%;
  translate: -50% -4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-soft);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.crm-bars__col:hover em {
  opacity: 1;
}
.crm-people ul {
  display: grid;
  gap: 10px;
}
.crm-people li {
  display: flex;
  align-items: center;
  gap: 10px;
}
.crm-people li div {
  flex: 1;
  display: grid;
  min-width: 0;
}
.crm-people li small {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crm-people li em,
.crm-live__detail {
  font-size: 12px;
  color: var(--c-muted);
}
.crm-hw__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.crm-hw__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--c-panel-2);
}
.crm-hw__item svg {
  color: var(--c-teal);
  flex: none;
}
.crm-hw__item span {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 2. active */
.crm-online {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}
.crm-live {
  position: relative;
  display: grid;
  gap: 0;
  padding: 6px 16px;
}
.crm-live li {
  display: grid;
  grid-template-columns: 32px 170px minmax(0, 1fr) 60px 70px;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-line);
}
.crm-live li:last-child {
  border-bottom: 0;
}
.crm-live__who {
  display: grid;
}
.crm-live__doing {
  display: grid;
  gap: 6px;
}
.crm-live__time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

/* 3. classes */
.crm-split {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 14px;
}
.crm-split > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.crm-classes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.crm-class {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}
.crm-class:hover {
  border-color: color-mix(in srgb, var(--c-teal) 40%, var(--c-line));
}
.crm-class.is-on {
  border-color: var(--c-teal);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-teal) 15%, transparent);
}
.crm-class__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.crm-class__top b {
  font-size: 22px;
  font-weight: 800 !important;
  letter-spacing: -0.02em;
}
.crm-class__top em {
  font-weight: 750;
  color: var(--c-teal-2);
}
.crm-class__topic {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crm-roster {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
}
.crm-roster ul {
  position: relative;
  display: grid;
  gap: 8px;
}
.crm-roster li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--c-panel-2);
}
.crm-roster li b {
  flex: 1;
}
.crm-roster li em {
  font-weight: 700;
  color: var(--c-teal-2);
}
.crm-ring {
  --v: 80;
  margin: auto auto 6px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--c-teal) calc(var(--v) * 1%), var(--c-panel-2) 0);
  transition: --v 0.6s ease;
}
.crm-ring span {
  display: grid;
  place-items: center;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: var(--c-panel);
}
.crm-ring b {
  font-size: 28px;
  font-weight: 800 !important;
}
@property --v {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

/* 4. lessons */
.crm-split--lessons {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
}
.crm-topics {
  padding: 14px 10px 10px;
  display: flex !important;
  flex-direction: column;
  gap: 4px !important;
}
.crm-topics .crm-card__head {
  padding: 0 6px;
  margin-bottom: 6px;
}
.crm-topic {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}
.crm-topic:hover {
  background: var(--c-panel-2);
}
.crm-topic.is-on {
  background: color-mix(in srgb, var(--c-teal) 13%, transparent);
}
.crm-topic__num {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--c-teal-2);
  background: color-mix(in srgb, var(--c-teal) 14%, transparent);
}
.crm-topic__title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 560;
}
.crm-topic-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}
.crm-topic-detail__head {
  display: grid;
  gap: 8px;
  justify-items: start;
}
.crm-topic-detail__head h5 {
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.02em;
}
.crm-mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.crm-mini-stats div {
  display: grid;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--c-panel-2);
}
.crm-mini-stats b {
  font-size: 20px;
  font-weight: 800 !important;
}
.crm-question {
  display: grid;
  gap: 10px;
}
.crm-question p {
  font-size: 14px;
  font-weight: 650;
}
.crm-question ul {
  display: grid;
  gap: 7px;
}
.crm-question li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--c-line);
}
.crm-question li span {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: var(--c-panel-2);
}
.crm-question li svg {
  margin-left: auto;
}
.crm-question li.is-correct {
  color: var(--c-ok);
  border-color: color-mix(in srgb, var(--c-ok) 45%, transparent);
  background: color-mix(in srgb, var(--c-ok) 9%, transparent);
}
.crm-question li.is-correct span {
  color: #fff;
  background: var(--c-ok);
}

/* 5. homework */
.crm-table {
  padding: 4px 16px;
}
.crm-table__row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 60px 70px minmax(0, 1.4fr) 140px;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-line);
}
.crm-table__row:last-child {
  border-bottom: 0;
}
.crm-table__head {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-muted);
  padding: 10px 0;
}
.crm-table__done {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--c-soft);
}
.crm-table__done .crm-progress {
  flex: 1;
}
.crm-late {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-warn);
}
.crm-review {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) auto;
  align-items: center;
  gap: 22px;
  padding: 18px;
}
.crm-review__who {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.crm-review__who div {
  display: grid;
  gap: 4px;
  justify-items: start;
}
.crm-review__score {
  display: grid;
  gap: 10px;
}
.crm-review__score-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--c-soft);
}
.crm-review__score-top b {
  font-size: 30px;
  font-weight: 800 !important;
  color: var(--c-teal-2);
}
.crm-review__comment {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--c-soft);
  background: var(--c-panel-2);
}
.crm-range {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--c-teal) var(--rv), var(--c-panel-2) var(--rv));
  cursor: pointer;
}
.crm-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--c-teal);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.35);
}
.crm-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--c-teal);
}
.crm-review__save.is-done {
  background: var(--c-ok) !important;
}

/* 6. games */
.crm-game {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 14px;
  height: 100%;
}
.crm-game__code {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(80% 70% at 50% 0%, color-mix(in srgb, var(--c-teal) 22%, transparent), transparent 70%),
    var(--c-panel);
}
.crm-game__code > b {
  font-size: 54px;
  font-weight: 850 !important;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(100deg, var(--c-teal-2), var(--c-blue));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.crm-game__settings {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 18px;
  margin: 6px 0 14px;
}
.crm-game__settings div {
  display: grid;
}
.crm-game__settings span {
  font-weight: 650;
}
.crm-game__players {
  padding: 16px;
}
.crm-game__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.crm-player {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  font-weight: 600;
  background: var(--c-panel-2);
}
.crm-podium {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 18px;
}
.crm-podium .crm-card__head h5 svg {
  color: var(--c-warn);
}
.crm-podium__stage {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  flex: 1;
}
.crm-podium__place {
  display: grid;
  justify-items: center;
  gap: 4px;
  width: 170px;
  animation: crm-rise 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}
.crm-podium__place.is-0 {
  animation-delay: 0.25s;
}
.crm-podium__place.is-2 {
  animation-delay: 0.45s;
}
.crm-podium__block {
  display: grid;
  place-items: center;
  width: 100%;
  margin-top: 6px;
  border-radius: 12px 12px 0 0;
  font-size: 30px;
  font-weight: 850;
  color: #fff;
}
.crm-podium__place.is-1 .crm-podium__block {
  height: 150px;
  background: linear-gradient(180deg, #f5c542, #d79a1e);
}
.crm-podium__place.is-0 .crm-podium__block {
  height: 110px;
  background: linear-gradient(180deg, #c6d0db, #8e9aa8);
}
.crm-podium__place.is-2 .crm-podium__block {
  height: 80px;
  background: linear-gradient(180deg, #e3a072, #b0683e);
}
@keyframes crm-rise {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
}
.crm-podium__rest {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.crm-podium__rest li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--c-panel-2);
}
.crm-podium__rest b {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 7. results */
.crm-leader,
.crm-hbars {
  flex: 1;
  display: grid;
  align-content: space-evenly;
  gap: 4px;
  padding: 10px 16px;
}
.crm-leader__row {
  display: grid;
  grid-template-columns: 30px 32px 190px minmax(0, 1fr) 40px 36px;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--c-line);
}
.crm-leader__row:last-child {
  border-bottom: 0;
}
.crm-leader__who {
  display: grid;
}
.crm-leader__score {
  font-size: 16px;
  text-align: right;
}
.crm-progress--wide {
  height: 8px;
}
.crm-medal {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  color: var(--c-muted);
  background: var(--c-panel-2);
}
.crm-medal.is-0 {
  color: #6b4b00;
  background: #f5c542;
}
.crm-medal.is-1 {
  color: #39434f;
  background: #c6d0db;
}
.crm-medal.is-2 {
  color: #5a2e12;
  background: #e3a072;
}
.crm-hbars__row {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 50px;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
}
.crm-hbars__row b {
  font-size: 16px;
}
.crm-hbars__track {
  height: 26px;
  border-radius: 8px;
  background: var(--c-panel-2);
  overflow: hidden;
}
.crm-hbars__track i {
  display: block;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--c-teal), var(--c-blue));
  animation: crm-grow 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes crm-grow {
  from {
    width: 0;
  }
}
.crm-hbars__row em {
  font-weight: 750;
  color: var(--c-teal-2);
}

/* 8. videos */
.crm-addlink {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 14px;
  border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--c-teal) 50%, var(--c-line));
  background: color-mix(in srgb, var(--c-teal) 5%, var(--c-panel));
}
.crm-addlink svg {
  color: var(--c-bad);
}
.crm-addlink input {
  flex: 1;
  min-width: 0;
  height: 34px;
  border: 0;
  outline: 0;
  font: inherit;
  color: var(--c-fg);
  background: transparent;
}
.crm-addlink input::placeholder {
  color: var(--c-muted);
}
.crm-videos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.crm-video {
  display: grid;
  gap: 7px;
  padding: 8px 8px 10px;
}
.crm-video > b {
  min-height: 34px;
  font-size: 12.5px;
}
.crm-video__thumb {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 8.4;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(160deg, hsl(var(--h) 60% 50%), hsl(calc(var(--h) + 40) 65% 25%));
}
.crm-video__thumb svg {
  position: absolute;
  inset: auto 0 0;
  width: 100%;
  height: 55%;
  fill: rgb(0 0 0 / 0.28);
}
.crm-video__play {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  background: rgb(255 255 255 / 0.22);
  backdrop-filter: blur(6px);
  transition: transform 0.2s ease;
}
.crm-video__thumb em {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 650;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

/* 9. ai */
.crm-split--ai {
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
}
.crm-chat {
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.crm-chat__msgs {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
  padding-bottom: 14px;
}
.crm-chat__history {
  display: flex;
  flex-direction: column;
  gap: 14px;
  opacity: 0.55;
}
.crm-msg {
  max-width: 82%;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.5;
}
.crm-msg.is-user {
  align-self: flex-end;
  color: #062421;
  background: var(--c-teal);
  border-bottom-right-radius: 4px;
}
.crm-msg.is-ai {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: var(--c-panel-2);
  border-bottom-left-radius: 4px;
}
.crm-msg__bot {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  color: var(--c-teal-2);
  background: color-mix(in srgb, var(--c-teal) 16%, transparent);
}
.crm-caret {
  display: inline-block;
  width: 7px;
  height: 14px;
  margin-left: 2px;
  vertical-align: -2px;
  background: var(--c-teal);
  animation: blink 1s steps(1) infinite;
}
.crm-chat__input {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 6px 0 14px;
  border-radius: 12px;
  color: var(--c-muted);
  border: 1px solid var(--c-line);
}
.crm-chat__input span:first-of-type {
  flex: 1;
}
.crm-chat__send {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: #062421;
  background: var(--c-teal);
}
.crm-ai-side {
  display: flex !important;
  flex-direction: column;
  gap: 12px;
}
.crm-ai-side > .crm-card {
  padding: 14px;
}
.crm-suggest {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  border: 1px solid var(--c-line) !important;
  transition: all 0.2s ease;
}
.crm-suggest svg {
  flex: none;
  margin-top: 1px;
  color: var(--c-teal);
}
.crm-suggest:hover,
.crm-suggest.is-on {
  border-color: var(--c-teal) !important;
  background: color-mix(in srgb, var(--c-teal) 9%, transparent) !important;
}
.crm-caps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.crm-caps span {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  background: var(--c-panel);
  border: 1px solid var(--c-line);
}
.crm-caps svg {
  color: var(--c-teal);
}

/* 10. logs */
.crm-logs {
  position: relative;
  display: grid;
  padding: 6px 12px;
}
.crm-log {
  display: block;
  width: 100%;
  padding: 10px 6px;
  border-bottom: 1px solid var(--c-line) !important;
}
.crm-log:last-child {
  border-bottom: 0 !important;
}
.crm-log__row {
  display: grid;
  grid-template-columns: 32px 150px 90px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.crm-log__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--c-soft);
}
.crm-log.is-flag .crm-log__text {
  color: var(--c-bad);
}
.crm-log__answer {
  display: flex;
  gap: 8px;
  margin: 10px 0 2px 44px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--c-soft);
  background: var(--c-panel-2);
  animation: crm-rise 0.35s ease both;
}
.crm-log__answer svg {
  flex: none;
  color: var(--c-teal);
}

/* 11. settings */
.crm-settings {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
}
.crm-set {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}
.crm-set h5 {
  font-size: 14px;
  font-weight: 700;
}
.crm-set h5:not(:first-child) {
  margin-top: 10px;
}
.crm-themes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.crm-theme {
  display: grid;
  gap: 8px;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid var(--c-line) !important;
  transition: border-color 0.2s ease;
}
.crm-theme.is-on {
  border-color: var(--c-teal) !important;
}
.crm-theme > span:last-child {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.crm-theme__preview {
  display: grid;
  grid-template-columns: 26% 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 5px;
  height: 84px;
  padding: 6px;
  border-radius: 8px;
  background: #0f141b;
}
.crm-theme__preview i {
  border-radius: 5px;
  background: #222b38;
}
.crm-theme__preview i:first-child {
  grid-row: span 2;
  background: #171e29;
}
.crm-theme__preview i:nth-child(2) {
  background: #2ec4b6;
}
.crm-theme.is-1 .crm-theme__preview {
  background: #eef2f6;
}
.crm-theme.is-1 .crm-theme__preview i {
  background: #ffffff;
}
.crm-theme.is-1 .crm-theme__preview i:nth-child(2) {
  background: #17a596;
}
.crm-logo-up {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--c-line);
}
.crm-logo-up div {
  flex: 1;
  display: grid;
}
.crm-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-line);
  cursor: pointer;
}
.crm-toggle:last-child {
  border-bottom: 0;
}
.crm-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.crm-toggle i {
  position: relative;
  flex: none;
  width: 42px;
  height: 24px;
  border-radius: 99px;
  background: var(--c-panel-2);
  box-shadow: inset 0 0 0 1px var(--c-line);
  transition: background-color 0.25s ease;
}
.crm-toggle i::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 5px rgb(0 0 0 / 0.3);
  transition: translate 0.25s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.crm-toggle input:checked + i {
  background: var(--c-teal);
}
.crm-toggle input:checked + i::after {
  translate: 18px 0;
}
</style>
