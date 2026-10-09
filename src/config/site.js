// Aloqa ma'lumotlari — hozircha placeholder. O'zingiznikiga almashtiring.
export const contacts = {
  telegram: { label: '@geolearn_uz', href: 'https://t.me/geolearn_uz' },
  email: { label: 'info@geolearn.uz', href: 'mailto:info@geolearn.uz' },
  phone: { label: '+998 90 000 00 00', href: 'tel:+998900000000' },
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://geolearn.uz').replace(/\/+$/, '')

/** Header menyusidagi bo'limlar (id — sahifadagi section id'si) */
export const navSections = [
  { id: 'imkoniyatlar', key: 'nav.features' },
  { id: 'oqituvchilar', key: 'nav.teachers' },
  { id: 'oquvchilar', key: 'nav.students' },
  { id: 'ai', key: 'nav.ai' },
  { id: 'faq', key: 'nav.faq' },
]
