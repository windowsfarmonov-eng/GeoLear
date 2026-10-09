import { Mesh, NoColorSpace, SRGBColorSpace, Texture, Vector3, WebGLRenderer } from 'three'
import { onPauseChange, pauseState } from './pause'

// Oyna (modal) ochilganda orqadagi sahnalar to'xtaydi,
// faqat `foreground: true` bilan yaratilgan (oyna ichidagi) sahna ishlaydi.
const stages = new Set()
onPauseChange(() => {
  for (const s of stages) s.updateLoop()
})

/**
 * WebGL renderer + o'lcham kuzatuvchisi + faqat ko'rinib turganda ishlaydigan kadr sikli.
 * Ko'rinmayotgan sahnalar render qilinmaydi (IntersectionObserver + Page Visibility).
 * Moslashuvchan aniqlik: kadrlar sekinlashsa piksel zichligi (DPR) pasayadi, tezlashsa — qaytadi.
 */
export class Stage {
  renderer
  width = 1
  height = 1
  onResize = null
  onFrame = null
  onContextLost = null

  visible = false
  frame = 0
  last = 0
  disposed = false
  resizeObserver
  intersectionObserver

  options

  // moslashuvchan DPR
  maxRatio = 1
  ratio = 1
  frameSum = 0
  frameCount = 0
  lastAdapt = 0

  constructor(options) {
    this.options = options
    const { canvas, quality } = options
    const device = window.devicePixelRatio || 1
    this.renderer = new WebGLRenderer({
      canvas,
      // yuqori DPR ekranda MSAA ortiqcha — piksellar o'zi mayda
      antialias: quality === 'full' && device < 1.5,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    })
    this.maxRatio = Math.min(device, quality === 'full' ? 1.5 : 1.25)
    this.ratio = this.maxRatio
    this.renderer.setPixelRatio(this.ratio)
    stages.add(this)
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.setClearColor(0x000000, 0)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(options.container)

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting
        this.updateLoop()
      },
      { rootMargin: options.rootMargin ?? '150px 0px' },
    )
    this.intersectionObserver.observe(options.container)

    document.addEventListener('visibilitychange', this.updateLoop)
    canvas.addEventListener('webglcontextlost', this.handleContextLost, false)
    this.resize()
  }

  get isRunning() {
    return this.frame !== 0
  }

  resize() {
    if (this.disposed) return
    const rect = this.options.container.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    if (width === this.width && height === this.height) return
    this.width = width
    this.height = height
    this.renderer.setSize(width, height, false)
    this.onResize?.(width, height)
  }

  /** Sahna tayyor bo'lgach chaqiriladi — ko'rinib turgan bo'lsa siklni boshlaydi */
  start() {
    this.updateLoop()
  }

  updateLoop = () => {
    if (this.disposed) return
    const paused = pauseState.background && !this.options.foreground
    const shouldRun = this.visible && !document.hidden && this.onFrame !== null && !paused
    if (shouldRun && !this.frame) {
      this.last = performance.now()
      this.frame = requestAnimationFrame(this.tick)
    } else if (!shouldRun && this.frame) {
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  tick = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now
    this.onFrame?.(dt, now / 1000)
    this.adapt(dt, now)
    this.frame = this.disposed ? 0 : requestAnimationFrame(this.tick)
  }

  /** O'rtacha kadr vaqtiga qarab piksel zichligini moslash */
  adapt(dt, now) {
    if (dt <= 0 || dt >= 0.05) return
    this.frameSum += dt
    this.frameCount++
    if (this.frameCount < 30 || now - this.lastAdapt < 1200) return
    const avg = this.frameSum / this.frameCount
    this.frameSum = 0
    this.frameCount = 0
    let next = this.ratio
    if (avg > 1 / 48 && this.ratio > 0.6) next = Math.max(0.6, this.ratio - 0.2)
    else if (avg < 1 / 58 && this.ratio < this.maxRatio) next = Math.min(this.maxRatio, this.ratio + 0.1)
    if (next !== this.ratio) {
      this.ratio = next
      this.lastAdapt = now
      this.renderer.setPixelRatio(next)
      this.renderer.setSize(this.width, this.height, false)
    }
  }

  handleContextLost = (event) => {
    event.preventDefault()
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.onContextLost?.()
  }

  dispose() {
    this.disposed = true
    stages.delete(this)
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', this.updateLoop)
    this.options.canvas.removeEventListener('webglcontextlost', this.handleContextLost)
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}

// ───────────────────────────── yordamchilar ─────────────────────────────

const imageCache = new Map()

/** Rasmni bir marta yuklaydi (bir nechta sahna bir xil rasmni ishlatsa ham) */
export function loadImage(url) {
  let pending = imageCache.get(url)
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Rasm yuklanmadi: ${url}`))
      img.src = url
    }).then(async (img) => {
      try {
        await img.decode()
      } catch {
        /* ba'zi brauzerlarda decode() kerak emas */
      }
      return img
    })
    imageCache.set(url, pending)
  }
  return pending
}

export async function loadTexture(url, { srgb = true, anisotropy = 4 } = {}) {
  const image = await loadImage(url)
  const texture = new Texture(image)
  texture.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  return texture
}

/** Rasm piksellarini o'qish (relyef balandliklari uchun) */
export async function readPixels(url) {
  const image = await loadImage(url)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D kontekst yo‘q')
  ctx.drawImage(image, 0, 0)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

const DEG = Math.PI / 180

/** Kenglik/uzunlik → shar sirtidagi nuqta (three.js SphereGeometry UV'lariga mos) */
export function latLonToVector3(lat, lon, radius = 1, target = new Vector3()) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return target.set(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta))
}

/** Shar (spin) guruhining Y-burchagi: shu uzunlik kameraga (+Z) qaraydi */
export function spinToFaceLongitude(lon) {
  return -(lon + 90) * DEG
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smoothstep = (a, b, v) => {
  const x = clamp01((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
export const lerp = (a, b, t) => a + (b - a) * t
/** Kadr tezligiga bog'liq bo'lmagan yumshoq yaqinlashish */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt))

/** Sahnadagi barcha geometriya, material va teksturalarni bo'shatish */
export function disposeObject(root) {
  root.traverse((node) => {
    const mesh = node
    mesh.geometry?.dispose()
    const material = mesh.material
    const materials = Array.isArray(material) ? material : material ? [material] : []
    for (const m of materials) {
      for (const value of Object.values(m)) {
        if (value instanceof Texture) value.dispose()
      }
      const uniforms = m.uniforms
      if (uniforms) {
        for (const u of Object.values(uniforms)) if (u.value instanceof Texture) u.value.dispose()
      }
      m.dispose()
    }
  })
}
