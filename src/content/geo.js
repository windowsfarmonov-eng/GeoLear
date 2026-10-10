// O'rta Osiyo xaritasidagi yozuvlar (3D relyef sahnasi va statik fallback uchun).
// lat/lon — geografik koordinatalar; priority 1 — telefonda ham ko'rinadi.

export const TASHKENT = { lat: 41.2995, lon: 69.2401 }

/** «Sho'ng'ish» bo'limi skrollining shu qismigacha — globusdan relyef xaritaga tushish, keyin xarita joyida turadi */
export const DIVE_END = 0.8

/** O'rta Osiyo markazi (globusni shu nuqtaga burish uchun) */
export const CENTRAL_ASIA_CENTER = { lat: 41.5, lon: 65 }

// priority: 1 — hamma ekranda (telefonda ham), 2 — planshet va kattaroq, 3 — faqat keng ekranda.
// Ekranda joy yetmasa, kamroq muhim yozuv avtomatik suriladi yoki bosiladigan nuqtaga aylanadi (diveScene.js).
// water — ko'lning o'zi egallagan joy [lat0, lon0, lat1, lon1]: yozuvlar uni yopmaydi, nomi yoniga qo'yiladi.
export const mapLabels = [
  // suv havzalari va daryolar
  { key: 'caspian', lat: 41.6, lon: 51.4, kind: 'water', priority: 1 },
  { key: 'aral', lat: 45.2, lon: 60.45, kind: 'water', priority: 1, water: [[44.45, 58.25, 45.9, 58.95], [46.1, 59.5, 46.8, 61.95]] },
  { key: 'amu', lat: 40.35, lon: 62.6, kind: 'river', priority: 1 },
  { key: 'syr', lat: 44.55, lon: 66.0, kind: 'river', priority: 1 },
  { key: 'zarafshon', lat: 39.85, lon: 65.6, kind: 'river', priority: 2 },
  { key: 'issykkul', lat: 42.45, lon: 77.3, kind: 'water', priority: 2, water: [[42.15, 76.3, 42.75, 78.3]] },
  { key: 'balkhash', lat: 46.3, lon: 75.2, kind: 'water', priority: 2, water: [[45.1, 73.4, 46.9, 74.7], [46.2, 74.7, 46.9, 79.3]] },
  { key: 'aydarkul', lat: 40.95, lon: 66.9, kind: 'water', priority: 3, water: [[40.5, 66.65, 41.0, 67.85]] },
  { key: 'sarygamysh', lat: 41.9, lon: 57.4, kind: 'water', priority: 3, water: [[41.5, 57.0, 42.35, 57.8]] },
  { key: 'karabogaz', lat: 41.3, lon: 53.6, kind: 'water', priority: 3, water: [[40.75, 52.9, 42.1, 54.5]] },
  { key: 'atrek', lat: 37.75, lon: 55.6, kind: 'river', priority: 3 },
  { key: 'harirud', lat: 36.4, lon: 61.15, kind: 'river', priority: 3 },
  // tog'lar
  { key: 'tianshan', lat: 41.7, lon: 74.3, kind: 'mountain', priority: 1 },
  { key: 'pamir', lat: 38.35, lon: 73.3, kind: 'mountain', priority: 1 },
  { key: 'kopetdag', lat: 38.05, lon: 57.6, kind: 'mountain', priority: 2 },
  { key: 'hindukush', lat: 35.9, lon: 69.8, kind: 'mountain', priority: 2 },
  { key: 'hisor', lat: 39.05, lon: 68.4, kind: 'mountain', priority: 3 },
  { key: 'turkiston', lat: 39.65, lon: 69.7, kind: 'mountain', priority: 3 },
  { key: 'oloy', lat: 39.7, lon: 72.6, kind: 'mountain', priority: 3 },
  { key: 'chotqol', lat: 41.55, lon: 70.6, kind: 'mountain', priority: 3 },
  { key: 'nurota', lat: 40.5, lon: 66.3, kind: 'mountain', priority: 3 },
  { key: 'qoratov', lat: 43.5, lon: 69.0, kind: 'mountain', priority: 3 },
  // cho'l, dasht, vodiy va pasttekisliklar
  { key: 'kyzylkum', lat: 42.3, lon: 64.2, kind: 'desert', priority: 1 },
  { key: 'karakum', lat: 39.0, lon: 59.6, kind: 'desert', priority: 1 },
  { key: 'ustyurt', lat: 43.7, lon: 56.4, kind: 'desert', priority: 2 },
  { key: 'fergana', lat: 40.55, lon: 71.9, kind: 'valley', priority: 2 },
  { key: 'betpakdala', lat: 45.9, lon: 70.0, kind: 'desert', priority: 2 },
  { key: 'mirzachol', lat: 40.45, lon: 68.25, kind: 'desert', priority: 3 },
  { key: 'muyunqum', lat: 44.3, lon: 71.3, kind: 'desert', priority: 3 },
  { key: 'turan', lat: 43.1, lon: 61.9, kind: 'plain', priority: 3 },
  // davlatlar
  { key: 'uzbekistan', lat: 41.35, lon: 63.2, kind: 'country', priority: 2 },
  { key: 'kazakhstan', lat: 46.8, lon: 66.5, kind: 'country', priority: 2 },
  { key: 'turkmenistan', lat: 40.1, lon: 57.0, kind: 'country', priority: 2 },
  { key: 'kyrgyzstan', lat: 40.95, lon: 75.4, kind: 'country', priority: 2 },
  { key: 'tajikistan', lat: 38.75, lon: 70.8, kind: 'country', priority: 2 },
  { key: 'afghanistan', lat: 36.4, lon: 66.0, kind: 'country', priority: 2 },
  { key: 'iran', lat: 36.5, lon: 57.2, kind: 'country', priority: 3 },
  { key: 'china', lat: 40.0, lon: 78.6, kind: 'country', priority: 3 },
  { key: 'tashkent', lat: TASHKENT.lat, lon: TASHKENT.lon, kind: 'city', priority: 1 },
]

/** Relyef xaritasidagi bosiladigan shaharlar (3D nur ustunlari + galereya) */
export const diveCities = [
  { key: 'tashkent', lat: 41.3, lon: 69.24, capital: true, uz: 'Toshkent', ru: 'Ташкент' },
  { key: 'samarkand', lat: 39.65, lon: 66.96, uz: 'Samarqand', ru: 'Самарканд' },
  { key: 'bukhara', lat: 39.77, lon: 64.42, uz: 'Buxoro', ru: 'Бухара' },
  { key: 'khiva', lat: 41.38, lon: 60.36, uz: 'Xiva', ru: 'Хива' },
  { key: 'nukus', lat: 42.46, lon: 59.6, uz: 'Nukus', ru: 'Нукус' },
  { key: 'termez', lat: 37.22, lon: 67.28, uz: 'Termiz', ru: 'Термез' },
  { key: 'andijan', lat: 40.78, lon: 72.34, uz: 'Andijon', ru: 'Андижан' },
  { key: 'qarshi', lat: 38.86, lon: 65.79, uz: 'Qarshi', ru: 'Карши' },
  { key: 'almaty', lat: 43.24, lon: 76.89, uz: 'Olmaota', ru: 'Алматы' },
  { key: 'bishkek', lat: 42.87, lon: 74.59, uz: 'Bishkek', ru: 'Бишкек' },
  { key: 'dushanbe', lat: 38.56, lon: 68.77, uz: 'Dushanbe', ru: 'Душанбе' },
  { key: 'ashgabat', lat: 37.95, lon: 58.38, uz: 'Ashxobod', ru: 'Ашхабад' },
]
