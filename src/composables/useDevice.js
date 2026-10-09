// Qurilma imkoniyatlarini aniqlash: 3D sahnalar qaysi darajada ishlashini tanlaydi.
//   full   — kuchli kompyuter: to'liq sifat (yulduzlar, bulutlar, tun chiroqlari, yuqori poligon)
//   lite   — telefon / kuchsiz qurilma: kamroq poligon, zarrachalarsiz, past DPR
//   static — WebGL yo'q, prefers-reduced-motion yoki Save-Data: 3D o'rniga statik rasmlar
// Tekshirish uchun URL'ga ?tier=full|lite|static qo'shish mumkin.

function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

const media = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches

function detect() {
  const nav = navigator
  const reducedMotion = media('(prefers-reduced-motion: reduce)')
  const finePointer = media('(hover: hover) and (pointer: fine)')
  const small = media('(max-width: 767px)')
  const webgl = hasWebGL2()
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 8
  const saveData = Boolean(nav.connection?.saveData)

  let tier
  if (!webgl || reducedMotion || saveData || memory <= 2 || cores <= 2) tier = 'static'
  else if (small || !finePointer || memory <= 4 || cores <= 4) tier = 'lite'
  else tier = 'full'

  const override = new URLSearchParams(window.location.search).get('tier')
  if (override === 'full' || override === 'lite' || override === 'static') {
    tier = override === 'static' || webgl ? override : 'static'
  }

  return { tier, reducedMotion, finePointer, small, webgl }
}

/** Sahifa ochilganda bir marta aniqlanadi */
export const device = detect()

export const isStatic = device.tier === 'static'
/** Animatsiyalar ruxsat etilganmi (reduced-motion foydalanuvchilar uchun false) */
export const motionOK = !device.reducedMotion
