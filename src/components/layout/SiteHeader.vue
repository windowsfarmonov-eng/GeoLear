<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppLogo from '../ui/AppLogo.vue'
import AppIcon from '../ui/AppIcon.vue'
import LangSwitch from '../ui/LangSwitch.vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import { links } from '../../config/links'
import { navSections } from '../../config/site'
import { scrollToSection, startScroll, stopScroll } from '../../composables/useSmoothScroll'
import { flyToPortal } from '../../composables/useFlyTransition'
import { theme } from '../../composables/useTheme'
import { t } from '../../i18n'

const scrolled = ref(false)
const menuOpen = ref(false)
const active = ref('')
const menuButton = ref(null)
const menuPanel = ref(null)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

function go(id) {
  menuOpen.value = false
  startScroll()
  scrollToSection(id)
}

function portal(event, href) {
  menuOpen.value = false
  flyToPortal(event, href)
}

function onKeydown(event) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    menuOpen.value = false
    menuButton.value?.focus()
    return
  }
  // Menyu ochiq paytda fokus menyu ichida aylanadi
  if (event.key === 'Tab' && menuPanel.value) {
    const focusables = Array.from(menuPanel.value.querySelectorAll('a, button')).filter((el) => !el.hasAttribute('disabled'))
    const all = [menuButton.value, ...focusables].filter(Boolean)
    const first = all[0]
    const last = all[all.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(menuOpen, async (open) => {
  if (open) {
    stopScroll()
    await nextTick()
    menuPanel.value?.querySelector('a')?.focus()
  } else {
    startScroll()
  }
})

const desktop = window.matchMedia('(min-width: 1280px)')
const closeOnDesktop = () => {
  if (desktop.matches) menuOpen.value = false
}

let spy = null
onMounted(() => {
  // scrollY'ni keyingi kadrda o'qiymiz: mount paytida majburiy (sinxron) layout bo'lmasin
  requestAnimationFrame(onScroll)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  desktop.addEventListener('change', closeOnDesktop)
  const visible = new Set()
  spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      active.value = navSections.map((s) => s.id).find((id) => visible.has(id)) ?? ''
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  for (const section of navSections) {
    const el = document.getElementById(section.id)
    if (el) spy.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  desktop.removeEventListener('change', closeOnDesktop)
  spy?.disconnect()
})
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled || menuOpen }">
    <div class="container-x flex h-[68px] items-center gap-3 lg:h-[76px]">
      <a href="#top" class="shrink-0 rounded-lg" :aria-label="t('a11y.home')" @click.prevent="go('top')">
        <AppLogo />
      </a>

      <nav :aria-label="t('a11y.mainNav')" class="ml-6 hidden xl:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in navSections" :key="item.id">
            <a :href="`#${item.id}`" class="nav-link" :aria-current="active === item.id ? 'true' : undefined" @click.prevent="go(item.id)">
              {{ t(item.key) }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <LangSwitch />
        <ThemeToggle class="hidden md:grid" />
        <a
          :href="links.teacherLogin"
          class="btn btn-outline hidden md:inline-flex"
          @click="portal($event, links.teacherLogin)"
        >
          {{ t('cta.teacherPanel') }}
        </a>
        <a
          :href="links.studentLogin"
          class="btn btn-primary hidden sm:inline-flex"
          @click="portal($event, links.studentLogin)"
        >
          {{ t('cta.studentLogin') }}
        </a>
        <button
          ref="menuButton"
          type="button"
          class="grid size-11 place-items-center rounded-full border border-line text-fg xl:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="20" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="menuOpen" id="mobile-menu" ref="menuPanel" class="mobile-menu xl:hidden" data-lenis-prevent>
        <nav :aria-label="t('a11y.mainNav')" class="container-x">
          <ul class="grid gap-1 py-4">
            <li v-for="item in navSections" :key="item.id">
              <a :href="`#${item.id}`" class="mobile-menu__link" @click.prevent="go(item.id)">
                {{ t(item.key) }}
              </a>
            </li>
          </ul>
          <div class="flex items-center gap-3 border-t border-line py-5 md:hidden">
            <ThemeToggle />
            <span class="text-[0.95rem] text-muted" aria-hidden="true">{{ theme === 'dark' ? t('a11y.toLight') : t('a11y.toDark') }}</span>
          </div>
          <div class="grid gap-3 pb-8 sm:grid-cols-2 md:hidden">
            <a :href="links.studentLogin" class="btn btn-lg btn-primary" @click="portal($event, links.studentLogin)">
              {{ t('cta.studentLogin') }}
            </a>
            <a :href="links.teacherLogin" class="btn btn-lg btn-outline" @click="portal($event, links.teacherLogin)">
              {{ t('cta.teacherPanel') }}
            </a>
            <a :href="links.studentRegister" class="btn btn-ghost sm:col-span-2" @click="portal($event, links.studentRegister)">
              {{ t('cta.register') }}
            </a>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style>
.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 60;
  transition:
    background-color 0.35s ease,
    border-color 0.35s ease,
    backdrop-filter 0.35s ease;
  border-bottom: 1px solid transparent;
}
.site-header.is-scrolled {
  background: hsl(var(--bg) / 0.72);
  border-bottom-color: hsl(var(--line) / 0.7);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
}
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 0.8rem;
  border-radius: 999px;
  font-size: 0.93rem;
  font-weight: 540;
  color: hsl(var(--fg-soft));
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}
.nav-link:hover {
  color: hsl(var(--fg));
  background: hsl(var(--fg) / 0.06);
}
.nav-link[aria-current='true'] {
  color: hsl(var(--fg));
}
.nav-link[aria-current='true']::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: hsl(var(--primary-strong));
}
.mobile-menu {
  max-height: calc(100svh - 68px);
  overflow-y: auto;
  background: hsl(var(--bg) / 0.96);
  border-bottom: 1px solid hsl(var(--line));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.mobile-menu__link {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 0 0.25rem;
  font-size: 1.35rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  border-radius: 10px;
}
.mobile-menu__link:hover {
  color: hsl(var(--primary-strong));
}
</style>
