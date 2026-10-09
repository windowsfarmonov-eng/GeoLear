// ─────────────────────────────────────────────────────────────────────────────
//  Portallarga havolalar — saytdagi BARCHA kirish tugmalari shu fayldan oladi.
//  Domenni o'zgartirish uchun .env faylida VITE_ADMIN_URL / VITE_USER_URL ni
//  almashtiring (yoki pastdagi standart qiymatlarni tahrirlang).
// ─────────────────────────────────────────────────────────────────────────────

const trimSlash = (url) => url.replace(/\/+$/, '')

export const ADMIN_URL = trimSlash(import.meta.env.VITE_ADMIN_URL || 'https://geolearn-modified1-admin.vercel.app')
export const USER_URL = trimSlash(import.meta.env.VITE_USER_URL || 'https://geolearn-modified1.vercel.app')

export const links = {
  teacherLogin: `${ADMIN_URL}/dashboard`, // O'qituvchi paneli (kirmagan bo'lsa login'ga yo'naltiradi)
  studentLogin: `${USER_URL}/login`, // O'quvchi kirishi
  studentRegister: `${USER_URL}/register`, // O'quvchi ro'yxatdan o'tishi
}
