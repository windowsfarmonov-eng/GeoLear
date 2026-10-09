import { PerspectiveCamera, Scene, Vector3 } from 'three'
import { Stage, damp, disposeObject, lerp, smoothstep, spinToFaceLongitude } from './core'
import { Earth, loadEarthTextures } from './earth'
import { buildTerrain, loadTerrainSource } from './terrain'
import { createStars } from './stars'
import { createDiveExtras } from './diveExtras'
import { CENTRAL_ASIA_CENTER, DIVE_END } from '../../../content/geo'

const DEG = Math.PI / 180
// O'rta Osiyo yarim o'lchamlari birlik sharda (kenglik 13°, uzunlik 30° × cos 41.5°)
const HALF_HEIGHT = 6.5 * DEG
const HALF_WIDTH = 15 * DEG * Math.cos(41.5 * DEG)

const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10)

export async function createDiveScene(options) {
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality: options.quality, rootMargin: '50px 0px' })
  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.005, 200)

  const [textures, terrainSource] = await Promise.all([loadEarthTextures(options.quality), loadTerrainSource()])
  const earth = new Earth(textures, { quality: options.quality, clouds: true, marker: false })
  earth.uniforms.uGrid.value = 0.35
  scene.add(earth.root)

  const terrain = buildTerrain(terrainSource, { quality: options.quality, overlay: textures.overlay })
  earth.spin.add(terrain.group)

  const stars = options.quality === 'full' ? createStars(1100, stage.renderer.getPixelRatio()) : null
  if (stars) scene.add(stars.points)

  // jonli qatlam: yo'ldoshlar, shaharlar, samolyotlar, daryo oqimi, shamol, bulutlar, bayroqlar
  const extras = createDiveExtras({ scene, earth, terrain, quality: options.quality, pixelRatio: stage.renderer.getPixelRatio() })

  let atmosphere = earth.atmosphereUniforms.uStrength.value
  const applyTheme = (dark) => {
    earth.setTheme(dark)
    atmosphere = earth.atmosphereUniforms.uStrength.value
    stars?.setVisible(dark)
    extras.setTheme(dark)
  }
  applyTheme(options.dark)

  const spinTarget = spinToFaceLongitude(CENTRAL_ASIA_CENTER.lon)
  const tiltTarget = CENTRAL_ASIA_CENTER.lat * DEG

  // ── Kamera yo'li (skroll progressiga bog'liq)
  let keyframes = []
  let narrow = false
  let wide = false
  stage.onResize = (width, height) => {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    narrow = width < 640
    wide = width >= 1024
    const tanHalf = Math.tan((camera.fov / 2) * DEG)
    const fitByHeight = (HALF_HEIGHT * 1.12) / tanHalf
    // portret ekranda hudud kengligining ~55% ko'rinadi (markazda O'zbekiston) — relyef va yozuvlar yirikroq
    const portrait = camera.aspect < 1
    const fitByWidth = ((HALF_WIDTH * 1.04) / (tanHalf * camera.aspect)) * (portrait ? 0.46 : 1)
    const fit = Math.max(fitByHeight, fitByWidth)
    const oblique = fit * 1.12
    // telefonda kamera kamroq egiladi — xarita balandroq ko'rinadi, yozuvlarga joy ko'p
    const tilt = (portrait ? 34 : 52) * DEG
    // telefonda xarita yuqoridagi maslahat va pastdagi panel o'rtasida tursin
    const finalLookY = portrait ? -0.02 : 0.02
    keyframes = [
      {
        p: 0,
        pos: new Vector3(0, 0.05, 1 + 4.7 * Math.max(1, 1 / camera.aspect) * (camera.aspect < 1 ? 0.75 : 1)),
        look: new Vector3(0, 0, 0),
      },
      { p: 0.34, pos: new Vector3(0, 0, 1 + fit * 2.1), look: new Vector3(0, 0, 0.6) },
      { p: 0.55, pos: new Vector3(0, -0.06 * fit, 1 + fit * 1.05), look: new Vector3(0, 0, 1) },
      // oxirida kamera pastga egiladi, lekin yonga (o'ngga) burilmaydi
      {
        p: 0.8,
        pos: new Vector3(0, -Math.sin(tilt) * oblique, 1 + Math.cos(tilt) * oblique),
        look: new Vector3(0, finalLookY, 1),
      },
      {
        p: 1,
        pos: new Vector3(0, -Math.sin(tilt) * oblique, 1 + Math.cos(tilt) * oblique),
        look: new Vector3(0, finalLookY, 1),
      },
    ]
  }
  stage.onResize(stage.width, stage.height)

  const look = new Vector3()
  const placeCamera = (p) => {
    let i = 0
    while (i < keyframes.length - 2 && p > keyframes[i + 1].p) i++
    const a = keyframes[i]
    const b = keyframes[i + 1]
    const t = ease(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))))
    camera.position.lerpVectors(a.pos, b.pos, t)
    look.lerpVectors(a.look, b.look, t)
    camera.lookAt(look)
  }

  // ── Yozuvlar va shahar tugmalari (HTML) — bir-birining ustiga tushmasdan joylashtiriladi.
  // Har kadrda muhimroq element birinchi joy oladi, keyingisi bo'sh joy qidiradi (markaz → tepa → past →
  // o'ng → chap). Joy topilmasa yozuv silliq yashiriladi, shahar esa ixcham nuqtaga aylanadi (bosiladi,
  // ustiga kelganda nomi chiqadi). Oldingi joy imkon qadar saqlanadi — yozuvlar sakrab turmaydi.
  const KIND_RANK = { water: 0, mountain: 1, desert: 2, river: 3, valley: 4, plain: 5, country: 6 }
  const labelItems = options.labels.map((label) => ({
    ...label,
    type: 'label',
    // 1-darajali tabiiy obyektlar (Tyan-Shan, Amudaryo…) poytaxtdan keyin, boshqa shaharlardan oldin joy oladi
    rank: (label.priority === 1 ? 10 : 100 * label.priority) + (KIND_RANK[label.kind] ?? 5),
    w: 0,
    h: 0,
    ax: 0,
    ay: 0,
    ox: 0,
    oy: 0,
    x: null,
    y: null,
    mode: 0,
    shown: false,
    fade: 0,
    alpha: -1,
    tx: null,
  }))
  const cityItems = (options.cityEls ?? [])
    .map(({ el, key }, index) => ({ el, key, index, anchor: extras.cityAnchors.find((a) => a.key === key) }))
    .filter((c) => c.anchor)
    .map((c) => {
      const capital = c.el.classList.contains('city-pin--capital')
      return {
        ...c,
        type: 'city',
        rank: capital ? 0 : 30 + c.index,
        w: 0,
        h: 0,
        cw: 0,
        ch: 0,
        ax: 0,
        ay: 0,
        base: 0,
        x: null,
        y: null,
        mode: 'top',
        compact: false,
        fade: 0,
        alpha: -1,
        tx: null,
      }
    })
  const allItems = [...cityItems, ...labelItems].sort((a, b) => a.rank - b.rank)
  const obstacleEls = options.obstacles ?? []
  let obstacles = []
  let measured = false
  let obstacleTimer = 0

  /** Elementlar o'lchamini o'qish (boshida, til almashganda) */
  const measure = () => {
    for (const item of labelItems) {
      item.w = item.el.offsetWidth
      item.h = item.el.offsetHeight
    }
    for (const city of cityItems) {
      const wasCompact = city.el.classList.contains('is-compact')
      city.el.classList.remove('is-compact')
      city.w = city.el.offsetWidth
      city.h = city.el.offsetHeight
      city.el.classList.add('is-compact')
      city.cw = city.el.offsetWidth
      city.ch = city.el.offsetHeight
      if (!wasCompact) city.el.classList.remove('is-compact')
    }
    measured = labelItems.length === 0 || labelItems.some((i) => i.w > 0)
  }

  /** To'siqlar: sayt sarlavhasi, izoh paneli, maslahat yozuvi (kadr boshida o'qiladi — layout toza) */
  const readObstacles = () => {
    const box = options.container.getBoundingClientRect()
    obstacles = []
    for (const el of obstacleEls) {
      if (!el || +getComputedStyle(el).opacity < 0.05) continue
      const r = el.getBoundingClientRect()
      if (r.width < 1 || r.bottom < box.top || r.top > box.bottom) continue
      obstacles.push({ l: r.left - box.left - 6, t: r.top - box.top - 6, r: r.right - box.left + 6, b: r.bottom - box.top + 6 })
    }
  }

  const placed = []
  // owner — shu joyni oldindan band qilgan shahar (o'zi uchun to'siq hisoblanmaydi)
  const free = (l, t, r, b, width, height, margin, owner = null) => {
    if (l < 4 || t < 4 || r > width - 4 || b > height - 4) return false
    for (const q of placed) {
      if (q.owner !== null && q.owner === owner) continue
      if (l - margin < q.r && r + margin > q.l && t - margin < q.b && b + margin > q.t) return false
    }
    return true
  }
  const occupy = (l, t, r, b, owner = null) => placed.push({ l, t, r, b, owner })

  // shahar tugmasining nur ustuni tepasiga nisbatan joylari
  const cityModes = {
    top: (ax, ay, w, h) => [ax - w / 2, ay - 14 - h, ax + w / 2, ay - 14],
    right: (ax, ay, w, h) => [ax + 10, ay - h / 2, ax + 10 + w, ay + h / 2],
    left: (ax, ay, w, h) => [ax - 10 - w, ay - h / 2, ax - 10, ay + h / 2],
    bottom: (ax, ay, w, h) => [ax - w / 2, ay + 10, ax + w / 2, ay + 10 + h],
  }
  const cityTranslate = {
    top: '-50% calc(-100% - 14px)',
    right: '10px -50%',
    left: 'calc(-100% - 10px) -50%',
    bottom: '-50% 10px',
  }
  const CITY_ORDER = ['top', 'right', 'left', 'bottom']
  // yozuvning nuqtaga nisbatan siljishlari (o'z o'lchamiga ko'ra): markaz, tepa, past, o'ng, chap
  const LABEL_SHIFTS = [
    [0, 0],
    [0, -1],
    [0, 1],
    [0.62, 0],
    [-0.62, 0],
    [0.5, -1],
    [-0.5, -1],
    [0.5, 1],
    [-0.5, 1],
    [0, -2],
    [0, 2],
  ]
  const SHIFT_ORDER = LABEL_SHIFTS.map((_, i) => i)

  const labelPoint = new Vector3()
  const cityWorld = new Vector3()
  const projected = new Vector3()
  const toCamera = new Vector3()
  const normal = new Vector3()
  const view = { facing: 0, x: 0, y: 0, front: false }
  const project = (world) => {
    normal.copy(world).normalize()
    toCamera.copy(camera.position).sub(world).normalize()
    view.facing = normal.dot(toCamera)
    projected.copy(world).project(camera)
    view.x = (projected.x * 0.5 + 0.5) * stage.width
    view.y = (-projected.y * 0.5 + 0.5) * stage.height
    view.front = projected.z < 1
    return view
  }

  // butun pikselga yaxlitlab, faqat o'zgarganda yozamiz — yozuvlar jimirlamasin
  const write = (item, x, y, translate, opacity) => {
    const px = Math.round(x)
    const py = Math.round(y)
    if (px !== item.x || py !== item.y) {
      item.x = px
      item.y = py
      item.el.style.transform = `translate3d(${px}px, ${py}px, 0)`
    }
    if (translate !== item.tx) {
      item.tx = translate
      item.el.style.translate = translate
    }
    const a = Math.round(opacity * 50) / 50
    if (a !== item.alpha) {
      item.alpha = a
      item.el.style.opacity = String(a)
      item.el.style.visibility = a > 0.08 ? 'visible' : 'hidden'
    }
  }

  const layout = (labelAlpha, dt) => {
    const { width, height } = stage
    const cityVis = extras.cityVisibility()
    if (labelAlpha <= 0.001 && cityVis <= 0.001) {
      for (const item of allItems) {
        item.fade = 0
        item.shown = false
        if (item.alpha !== 0) write(item, item.x ?? 0, item.y ?? 0, item.tx ?? '', 0)
      }
      return
    }
    if (!measured) measure()
    obstacleTimer -= dt
    if (obstacleTimer <= 0) {
      readObstacles()
      obstacleTimer = 0.25
    }
    placed.length = 0
    for (const o of obstacles) occupy(o.l, o.t, o.r, o.b)
    const maxPriority = narrow ? 1 : wide ? 3 : 2
    const step = 1 - Math.exp(-12 * dt)

    // shahar nuqtalari (nur ustunlari tepasi) — yozuvlar ularni yopmasin
    for (const city of cityItems) {
      cityWorld.copy(city.anchor.position).applyMatrix4(earth.spin.matrixWorld)
      const pr = project(cityWorld)
      const inside = pr.front && pr.x > 10 && pr.x < width - 10 && pr.y > 10 && pr.y < height - 10
      city.ax = pr.x
      city.ay = pr.y
      city.base = inside ? cityVis * smoothstep(0.05, 0.3, pr.facing) : 0
      if (city.base > 0.05) {
        // nur ustuni tepasi + ixcham nuqta joyi oldindan band: hech qaysi yozuv shahar nuqtasini yopmaydi
        occupy(pr.x - 6, pr.y - 6, pr.x + 6, pr.y + 6, city)
        const [l, t, r, b] = cityModes.top(pr.x, pr.y, city.cw, city.ch)
        occupy(l, t, r, b, city)
      }
    }

    for (const item of allItems) {
      if (item.type === 'city') {
        const city = item
        let target = 0
        if (city.base > 0.05) {
          const margin = city.fade < 0.5 ? 4 : 2
          let mode = null
          for (const m of [city.mode, ...CITY_ORDER]) {
            const [l, t, r, b] = cityModes[m](city.ax, city.ay, city.w, city.h)
            if (free(l, t, r, b, width, height, margin, city)) {
              mode = m
              occupy(l, t, r, b)
              break
            }
          }
          if (mode) {
            city.mode = mode
            if (city.compact) {
              city.compact = false
              city.el.classList.remove('is-compact')
            }
          } else {
            // joy yo'q — ixcham nuqta: doim ko'rinadi va bosiladi, nomi hover/fokusda chiqadi
            city.mode = 'top'
            if (!city.compact) {
              city.compact = true
              city.el.classList.add('is-compact')
            }
            // ixcham joy oldindan band qilingan
          }
          target = 1
        }
        city.fade += (target - city.fade) * step
        write(city, city.ax, city.ay, cityTranslate[city.mode], city.base * city.fade)
        continue
      }

      const label = item
      let target = 0
      let base = 0
      if (labelAlpha > 0.001 && label.priority <= maxPriority && label.w > 0) {
        terrain.surfacePoint(label.lat, label.lon, 0.004, labelPoint)
        labelPoint.applyMatrix4(earth.spin.matrixWorld)
        const pr = project(labelPoint)
        const inside = pr.front && pr.x > -40 && pr.x < width + 40 && pr.y > -20 && pr.y < height + 20
        base = inside ? labelAlpha * smoothstep(0.05, 0.3, pr.facing) : 0
        label.ax = pr.x
        label.ay = pr.y
        if (base > 0.05) {
          const margin = label.shown ? 3 : 7
          for (const mi of [label.mode, ...SHIFT_ORDER]) {
            const [sx, sy] = LABEL_SHIFTS[mi]
            const ox = sx * label.w
            const oy = sy * (label.h + 3)
            const l = pr.x + ox - label.w / 2
            const t = pr.y + oy - label.h / 2
            if (free(l, t, l + label.w, t + label.h, width, height, margin)) {
              occupy(l, t, l + label.w, t + label.h)
              label.mode = mi
              label.ox = ox
              label.oy = oy
              target = 1
              break
            }
          }
        }
      }
      label.shown = target === 1
      label.fade += (target - label.fade) * step
      write(label, label.ax + label.ox, label.ay + label.oy, '-50% -50%', base * label.fade)
    }
  }

  let progress = options.progress.value
  let firstFrame = true
  stage.onFrame = (dt, time) => {
    progress = damp(progress, options.progress.value, 7, dt)
    // p — sho'ng'ish bosqichi (0…1); oxirida xarita joyida turadi
    const p = Math.min(1, progress / DIVE_END)

    const approach = ease(smoothstep(0, 0.34, p))
    const idle = Math.sin(time * 0.25) * 0.05 * (1 - smoothstep(0, 0.15, p))
    earth.spin.rotation.y = spinTarget - lerp(0.95, 0, approach) + idle
    earth.root.rotation.x = lerp(0.24, tiltTarget, approach)

    earth.setCloudOpacity(1 - smoothstep(0.1, 0.3, p))
    earth.uniforms.uHighlight.value = 1 - 0.85 * smoothstep(0.36, 0.52, p)
    const dim = smoothstep(0.36, 0.62, p)
    earth.uniforms.uDim.value = dim
    earth.uniforms.uGrid.value = 0.35 * (1 - smoothstep(0.3, 0.5, p))
    earth.atmosphereUniforms.uStrength.value = atmosphere * (1 - 0.85 * smoothstep(0.3, 0.6, p))
    terrain.setDim(dim)

    terrain.setOpacity(smoothstep(0.33, 0.42, p))
    terrain.setRise(smoothstep(0.38, 0.62, p))
    terrain.setStyle(smoothstep(0.37, 0.55, p))
    terrain.setDraw(smoothstep(0.5, 0.76, p))

    earth.update(time)
    terrain.update(time)
    extras.update(time, dt, p)
    stars?.update(time)
    placeCamera(p)
    // boshida globus matndan bo'sh tomonda turadi (katta ekranda o'ngda, telefonda pastroqda)
    const offset = 1 - smoothstep(0.04, 0.34, p)
    const { width, height } = stage
    camera.setViewOffset(width, height, wide ? -width * 0.19 * offset : 0, wide ? 0 : -height * 0.12 * offset, width, height)
    camera.updateProjectionMatrix()
    scene.updateMatrixWorld()
    layout(smoothstep(0.64, 0.74, p), dt)
    stage.renderer.render(scene, camera)

    if (firstFrame) {
      firstFrame = false
      options.onFirstFrame?.()
    }
  }
  stage.onContextLost = () => options.onContextLost?.()
  stage.start()

  return {
    setTheme: applyTheme,
    /** Til almashganda yozuvlar kengligi o'zgaradi — qayta o'lchash */
    remeasure() {
      measure()
    },
    dispose() {
      extras.dispose()
      disposeObject(scene)
      stage.dispose()
    },
  }
}
