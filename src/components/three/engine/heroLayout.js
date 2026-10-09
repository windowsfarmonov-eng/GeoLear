// Hero globusining joylashuvi — three.js'siz sof matematika.
// 3D sahna ham, statik fallback rasm ham AYNAN shu hisob-kitobdan foydalanadi,
// shuning uchun 3D yuklanganda globus «sakramaydi».

export const HERO_FOV = 30 // gradus

/** Kartochkalar orbitasi (globus radiusi birligida) */
const RING_R = 1.34
const RING_AX = 0.35 // orbitaning tomoshabin tomon og'ishi
const RING_AZ = -0.95 // orbitaning diagonal og'ishi

const COS_AX = Math.cos(RING_AX)
const SIN_AX = Math.sin(RING_AX)
const COS_AZ = Math.cos(RING_AZ)
const SIN_AZ = Math.sin(RING_AZ)
const TAN_HALF_FOV = Math.tan(((HERO_FOV / 2) * Math.PI) / 180)

/** Orbitadagi nuqta (globus birligida) */
function ringLocal(angle) {
  const c = Math.cos(angle) * RING_R
  const s = Math.sin(angle) * RING_R
  // avval Z atrofida, keyin X atrofida burish
  const x = c * COS_AZ
  const y0 = c * SIN_AZ
  return {
    x,
    y: y0 * COS_AX - s * SIN_AX,
    z: y0 * SIN_AX + s * COS_AX,
  }
}

function distanceFor(radius, height) {
  const k = (radius / (height / 2)) * TAN_HALF_FOV
  return Math.sqrt(1 + k * k) / k
}

/** Orbitaning ekrandagi maksimal kengligi va balandligi (markazdan, px) */
function ringExtent(radius, height) {
  const d = distanceFor(radius, height)
  const focal = height / 2 / TAN_HALF_FOV
  let maxX = 0
  let maxY = 0
  for (let i = 0; i < 64; i++) {
    const p = ringLocal((i / 64) * Math.PI * 2)
    const f = focal / (d - p.z)
    maxX = Math.max(maxX, Math.abs(p.x * f))
    maxY = Math.max(maxY, Math.abs(p.y * f))
  }
  return { maxX, maxY }
}

/**
 * @param safeLeft katta ekranda matn ustunining o'ng chegarasi (px) — globus undan o'ngda turadi
 */
export function computeHeroLayout(width, height, safeLeft = 0) {
  const wide = width >= 1024
  let left, right, top, bottom, cardHalfW, cardHalfH, maxRadius
  if (wide) {
    left = Math.max(safeLeft, width * 0.4)
    // juda keng ekranlarda globus matndan uzoqlashib ketmasin
    right = Math.min(width - 28, left + 940)
    top = 92
    bottom = height - 36
    cardHalfW = 82
    cardHalfH = 26
    maxRadius = Math.min(height * 0.36, 400)
  } else {
    left = 8
    right = width - 8
    top = 12
    bottom = height - 12
    cardHalfW = 66
    cardHalfH = 20
    maxRadius = Math.min(width * 0.42, 240)
  }
  const cx = (left + right) / 2
  const cy = (top + bottom) / 2
  const halfW = Math.max(40, (right - left) / 2 - cardHalfW)
  const halfH = Math.max(40, (bottom - top) / 2 - cardHalfH)

  // radiusni ikkilik qidiruv bilan tanlaymiz: orbita (kartochkalar bilan) maydonga sig'sin
  let lo = 40
  let hi = Math.max(lo, maxRadius)
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    const { maxX, maxY } = ringExtent(mid, height)
    if (maxX <= halfW && maxY <= halfH) lo = mid
    else hi = mid
  }
  const radius = lo
  return {
    width,
    height,
    cx,
    cy,
    radius,
    distance: distanceFor(radius, height),
    focal: height / 2 / TAN_HALF_FOV,
    wide,
  }
}

/** Orbitadagi burchak → ekrandagi nuqta. scale — globusning joriy masshtabi (intro animatsiyasi) */
export function projectRing(layout, angle, scale = 1) {
  const p = ringLocal(angle)
  const x = p.x * scale
  const y = p.y * scale
  const z = p.z * scale
  const f = layout.focal / (layout.distance - z)
  const sx = layout.cx + x * f
  const sy = layout.cy - y * f
  const fromCenter = Math.hypot(sx - layout.cx, sy - layout.cy)
  return {
    x: sx,
    y: sy,
    depth: z / RING_R,
    hidden: z < 0 && fromCenter < layout.radius * scale * 1.04,
  }
}

/** Statik rejimda kartochkalar turadigan burchaklar (hammasi ko'rinadigan joylarda) */
export const STATIC_CARD_ANGLES = [2.55, 3.75, 0.35, 1.3]

/** Fallback rasmda globus radiusi rasm o'lchamining shu qismini egallaydi (render skripti bilan bir xil) */
export const FALLBACK_GLOBE_FRACTION = 0.36

/** Globusning boshlang'ich holati (fallback rasm ham aynan shu holatda chizilgan) */
export const HERO_SPIN_OFFSET = -0.12 // rad, O'rta Osiyo markazdan biroz chapda
export const HERO_TILT = 0.36 // rad, shimol tomonga og'ish

/** Toshkent markerining fallback rasmdagi joyi (rasm o'lchamiga nisbatan, 0..1) */
export const FALLBACK_MARKER = { x: 0.4851, y: 0.3475 }
