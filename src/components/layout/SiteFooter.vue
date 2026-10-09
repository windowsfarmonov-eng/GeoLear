<script setup>
import AppLogo from '../ui/AppLogo.vue'
import AppIcon from '../ui/AppIcon.vue'
import { links } from '../../config/links'
import { contacts, navSections } from '../../config/site'
import { scrollToSection } from '../../composables/useSmoothScroll'
import { flyToPortal } from '../../composables/useFlyTransition'
import { t } from '../../i18n'

const year = 2026
</script>

<template>
  <footer class="site-footer">
    <div class="container-x">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <a href="#top" class="inline-flex rounded-lg" :aria-label="t('a11y.home')" @click.prevent="scrollToSection('top')">
            <AppLogo />
          </a>
          <p class="mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-muted">{{ t('footer.about') }}</p>
        </div>

        <nav class="site-footer__col" :aria-label="t('footer.portals')">
          <h2 class="site-footer__title">{{ t('footer.portals') }}</h2>
          <ul>
            <li>
              <a :href="links.teacherLogin" @click="flyToPortal($event, links.teacherLogin)">{{ t('cta.teacherPanel') }}</a>
            </li>
            <li>
              <a :href="links.studentLogin" @click="flyToPortal($event, links.studentLogin)">{{ t('cta.studentLogin') }}</a>
            </li>
            <li>
              <a :href="links.studentRegister" @click="flyToPortal($event, links.studentRegister)">{{ t('cta.register') }}</a>
            </li>
          </ul>
        </nav>

        <nav class="site-footer__col" :aria-label="t('footer.sections')">
          <h2 class="site-footer__title">{{ t('footer.sections') }}</h2>
          <ul>
            <li v-for="item in navSections" :key="item.id">
              <a :href="`#${item.id}`" @click.prevent="scrollToSection(item.id)">{{ t(item.key) }}</a>
            </li>
          </ul>
        </nav>

        <div class="site-footer__col">
          <h2 class="site-footer__title">{{ t('footer.contact') }}</h2>
          <ul>
            <li>
              <a :href="contacts.telegram.href"><AppIcon name="send" :size="16" /> {{ contacts.telegram.label }}</a>
            </li>
            <li>
              <a :href="contacts.email.href"><AppIcon name="mail" :size="16" /> {{ contacts.email.label }}</a>
            </li>
            <li>
              <a :href="contacts.phone.href"><AppIcon name="phone" :size="16" /> {{ contacts.phone.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p>© {{ year }} GeoLearn. {{ t('footer.rights') }}</p>
        <p>{{ t('footer.credits') }}</p>
      </div>
    </div>
  </footer>
</template>

<style>
.site-footer {
  padding: clamp(56px, 8vw, 96px) 0 2rem;
  border-top: 1px solid hsl(var(--line));
  background: hsl(var(--bg-deep));
}
.site-footer__grid {
  display: grid;
  gap: 2.4rem;
}
@media (min-width: 640px) {
  .site-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .site-footer__grid {
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
  }
}
.site-footer__title {
  font-size: 0.9rem;
  font-weight: 650;
  color: hsl(var(--fg));
}
.site-footer__col ul {
  display: grid;
  gap: 0.15rem;
  margin-top: 0.8rem;
}
.site-footer__col a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 36px;
  font-size: 0.95rem;
  color: hsl(var(--muted));
  transition: color 0.2s ease;
}
.site-footer__col a:hover {
  color: hsl(var(--primary-strong));
}
.site-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6rem 2rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid hsl(var(--line));
  font-size: 0.85rem;
  color: hsl(var(--muted));
}
</style>
