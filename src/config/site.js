// Aloqa ma'lumotlari
export const contacts = {
  telegram: { label: '@Azamjonov2010', href: 'https://t.me/Azamjonov2010' },
  email: { label: 'info@geolearn.uz', href: 'mailto:info@geolearn.uz' },
  phone: { label: '+998 91 004 25 65', href: 'tel:+998910042565' },
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
