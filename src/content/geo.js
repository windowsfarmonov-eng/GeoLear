// O'rta Osiyo xaritasidagi yozuvlar (3D relyef sahnasi va statik fallback uchun).
// lat/lon — geografik koordinatalar; priority 1 — telefonda ham ko'rinadi.

export const TASHKENT = { lat: 41.2995, lon: 69.2401 }

/** «Sho'ng'ish» bo'limi skrollining shu qismigacha — globusdan relyef xaritaga tushish, keyin xarita joyida turadi */
export const DIVE_END = 0.8

/** O'rta Osiyo markazi (globusni shu nuqtaga burish uchun) */
export const CENTRAL_ASIA_CENTER = { lat: 41.5, lon: 65 }

export const mapLabels = [
  { key: 'caspian', lat: 41.6, lon: 51.4, kind: 'water', priority: 1 },
  { key: 'aral', lat: 45.35, lon: 59.9, kind: 'water', priority: 1 },
  { key: 'amu', lat: 40.35, lon: 62.6, kind: 'river', priority: 1 },
  { key: 'syr', lat: 44.55, lon: 66.0, kind: 'river', priority: 1 },
  { key: 'tianshan', lat: 41.7, lon: 74.3, kind: 'mountain', priority: 1 },
  { key: 'pamir', lat: 38.35, lon: 73.3, kind: 'mountain', priority: 1 },
  { key: 'kyzylkum', lat: 42.3, lon: 64.2, kind: 'desert', priority: 1 },
  { key: 'karakum', lat: 39.0, lon: 59.6, kind: 'desert', priority: 1 },
  { key: 'tashkent', lat: TASHKENT.lat, lon: TASHKENT.lon, kind: 'city', priority: 1 },
  { key: 'zarafshon', lat: 39.85, lon: 65.6, kind: 'river', priority: 2 },
  { key: 'ustyurt', lat: 43.7, lon: 56.4, kind: 'desert', priority: 2 },
  { key: 'kopetdag', lat: 38.05, lon: 57.6, kind: 'mountain', priority: 2 },
  { key: 'fergana', lat: 40.55, lon: 71.9, kind: 'valley', priority: 2 },
  { key: 'issykkul', lat: 42.45, lon: 77.3, kind: 'water', priority: 2 },
  { key: 'balkhash', lat: 46.3, lon: 75.2, kind: 'water', priority: 2 },
]

/** Relyef xaritasidagi bosiladigan shaharlar (3D nur ustunlari + galereya) */
export const diveCities = [
  { key: 'tashkent', lat: 41.3, lon: 69.24, capital: true },
  { key: 'samarkand', lat: 39.65, lon: 66.96 },
  { key: 'bukhara', lat: 39.77, lon: 64.42 },
  { key: 'khiva', lat: 41.38, lon: 60.36 },
  { key: 'nukus', lat: 42.46, lon: 59.6 },
  { key: 'termez', lat: 37.22, lon: 67.28 },
  { key: 'andijan', lat: 40.78, lon: 72.34 },
  { key: 'qarshi', lat: 38.86, lon: 65.79 },
  { key: 'almaty', lat: 43.24, lon: 76.89 },
  { key: 'bishkek', lat: 42.87, lon: 74.59 },
  { key: 'dushanbe', lat: 38.56, lon: 68.77 },
  { key: 'ashgabat', lat: 37.95, lon: 58.38 },
]
