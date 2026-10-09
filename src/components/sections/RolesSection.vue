<script setup>
import SectionHeading from '../ui/SectionHeading.vue'
import RoleCard from '../role/RoleCard.vue'
import { t } from '../../i18n'
</script>

<template>
  <section id="kirish" class="section roles" aria-labelledby="roles-title">
    <div class="container-x">
      <SectionHeading id="roles-title" align="center" gradient :title="t('roles.title')" :lead="t('roles.subtitle')" />
      <div class="roles__grid mt-12 lg:mt-16">
        <div v-reveal class="roles__cell"><RoleCard role="teacher" /></div>
        <div v-reveal="100" class="roles__cell"><RoleCard role="student" /></div>
      </div>
    </div>
  </section>
</template>

<style>
.roles__grid {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 900px) {
  .roles__grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.75rem;
  }
}
</style>
