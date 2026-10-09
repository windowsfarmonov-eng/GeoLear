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

  const terrain = buildTerrain(terrainSource, { quality: options.quality })
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
    // portret ekranda hudud kengligining ~70% ko'rinadi — relyef kattaroq va o'qilishi oson
    const fitByWidth = ((HALF_WIDTH * 1.04) / (tanHalf * camera.aspect)) * (camera.aspect < 1 ? 0.7 : 1)
    const fit = Math.max(fitByHeight, fitByWidth)
    const oblique = fit * 1.12
    const tilt = 52 * DEG
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
        look: new Vector3(0, 0.02, 1),
      },
      {
        p: 1,
        pos: new Vector3(0, -Math.sin(tilt) * oblique, 1 + Math.cos(tilt) * oblique),
        look: new Vector3(0, 0.02, 1),
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

  // ── Yozuvlar (HTML) relyef ustida
  const labelPoint = new Vector3()
  const projected = new Vector3()
  const toCamera = new Vector3()
  const normal = new Vector3()
  const placeLabels = (alpha) => {
    const { width, height } = stage
    for (const label of options.labels) {
      if (alpha <= 0.001 || (narrow && label.priority === 2)) {
        if (label.alpha !== 0) {
          label.alpha = 0
          label.el.style.opacity = '0'
          label.el.style.visibility = 'hidden'
        }
        continue
      }
      terrain.surfacePoint(label.lat, label.lon, 0.004, labelPoint)
      labelPoint.applyMatrix4(earth.spin.matrixWorld)
      normal.copy(labelPoint).normalize()
      toCamera.copy(camera.position).sub(labelPoint).normalize()
      const facing = normal.dot(toCamera)
      projected.copy(labelPoint).project(camera)
      const x = (projected.x * 0.5 + 0.5) * width
      const y = (-projected.y * 0.5 + 0.5) * height
      const inside = projected.z < 1 && x > -40 && x < width + 40 && y > -20 && y < height + 20
      // butun pikselga yaxlitlab, faqat o'zgarganda yangilaymiz — yozuvlar jimirlamasin
      const px = Math.round(x)
      const py = Math.round(y)
      if (px !== label.x || py !== label.y) {
        label.x = px
        label.y = py
        label.el.style.transform = `translate3d(${px}px, ${py}px, 0)`
      }
      const a = inside ? Math.round(alpha * smoothstep(0.05, 0.3, facing) * 50) / 50 : 0
      if (a !== label.alpha) {
        label.alpha = a
        label.el.style.opacity = String(a)
        label.el.style.visibility = a > 0.08 ? 'visible' : 'hidden'
      }
    }
  }

  // ── Bosiladigan shahar tugmalari (HTML) — 3D nur ustunlari ustida
  const cityButtons = (options.cityEls ?? [])
    .map(({ el, key }) => ({ el, anchor: extras.cityAnchors.find((a) => a.key === key) }))
    .filter((c) => c.anchor)
    .map((c) => ({ ...c, x: -1, y: -1, alpha: -1 }))
  const cityWorld = new Vector3()
  const placeCities = () => {
    const vis = extras.cityVisibility()
    const { width, height } = stage
    for (const city of cityButtons) {
      const { el, anchor } = city
      cityWorld.copy(anchor.position).applyMatrix4(earth.spin.matrixWorld)
      normal.copy(cityWorld).normalize()
      toCamera.copy(camera.position).sub(cityWorld).normalize()
      const facing = normal.dot(toCamera)
      projected.copy(cityWorld).project(camera)
      const x = (projected.x * 0.5 + 0.5) * width
      const y = (-projected.y * 0.5 + 0.5) * height
      const inside = projected.z < 1 && x > 10 && x < width - 10 && y > 10 && y < height - 10
      const alpha = Math.round((inside ? vis * smoothstep(0.05, 0.3, facing) : 0) * 50) / 50
      // butun pikselga yaxlitlab, faqat sezilarli o'zgarganda yangilaymiz — tugma jimirlamasin
      const px = Math.round(x)
      const py = Math.round(y)
      if (Math.abs(px - city.x) >= 1 || Math.abs(py - city.y) >= 1) {
        city.x = px
        city.y = py
        el.style.transform = `translate3d(${px}px, ${py}px, 0)`
      }
      if (alpha !== city.alpha) {
        city.alpha = alpha
        el.style.opacity = String(alpha)
        el.style.visibility = alpha > 0.08 ? 'visible' : 'hidden'
      }
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
    placeLabels(smoothstep(0.64, 0.74, p))
    placeCities()
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
    dispose() {
      extras.dispose()
      disposeObject(scene)
      stage.dispose()
    },
  }
}
