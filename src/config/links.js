// ─────────────────────────────────────────────────────────────────────────────
//  Portallarga havolalar — saytdagi BARCHA kirish tugmalari shu fayldan oladi.
//  Domenni o'zgartirish uchun .env faylida VITE_ADMIN_URL / VITE_USER_URL ni
//  almashtiring (yoki pastdagi standart qiymatlarni tahrirlang).
// ─────────────────────────────────────────────────────────────────────────────

const trimSlash = (url) => url.replace(/\/+$/, '')

// Hostingda (Vercel → Environment Variables) eski vaqtinchalik *.vercel.app manzili qolib ketgan bo'lsa,
// u e'tiborga olinmaydi — rasmiy .uz domeni ishlatiladi.
const fromEnv = (value) => (value && !/\.vercel\.app/i.test(value) ? value : '')

export const ADMIN_URL = trimSlash(fromEnv(import.meta.env.VITE_ADMIN_URL) || 'https://admin.geolearn.uz')
export const USER_URL = trimSlash(fromEnv(import.meta.env.VITE_USER_URL) || 'https://student.geolearn.uz')

export const links = {
  teacherLogin: `${ADMIN_URL}/dashboard`, // O'qituvchi paneli (kirmagan bo'lsa login'ga yo'naltiradi)
  studentLogin: `${USER_URL}/login`, // O'quvchi kirishi
  studentRegister: `${USER_URL}/register`, // O'quvchi ro'yxatdan o'tishi
}
