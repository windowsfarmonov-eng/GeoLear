import { PerspectiveCamera, Scene, Vector3 } from 'three'
import { Stage, damp, disposeObject, smoothstep, spinToFaceLongitude } from './core'
import { Earth, loadEarthTextures } from './earth'
import { createStars } from './stars'
import { HERO_FOV, HERO_SPIN_OFFSET, HERO_TILT, computeHeroLayout, projectRing } from './heroLayout'
import { CENTRAL_ASIA_CENTER } from '../../../content/geo'

const AUTO_SPIN = 0.1 // rad/s — orqa tomonda; O'rta Osiyo old tomonda bo'lganda sekinroq

export async function createHeroGlobe(options) {
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality: options.quality })
  const scene = new Scene()
  const camera = new PerspectiveCamera(HERO_FOV, 1, 0.1, 200)

  const textures = await loadEarthTextures(options.quality)
  const earth = new Earth(textures, { quality: options.quality, clouds: true })
  scene.add(earth.root)
  const stars = options.quality === 'full' ? createStars(1500, stage.renderer.getPixelRatio()) : null
  if (stars) scene.add(stars.points)

  const applyTheme = (dark) => {
    earth.setTheme(dark)
    stars?.setVisible(dark)
  }
  applyTheme(options.dark)

  // ── Yo'nalish: O'rta Osiyo old tomonda (statik fallback rasm bilan aynan bir xil holat)
  const baseSpin = spinToFaceLongitude(CENTRAL_ASIA_CENTER.lon) + HERO_SPIN_OFFSET
  let spin = baseSpin
  let spinVelocity = 0
  let tilt = HERO_TILT
  let tiltTarget = HERO_TILT
  let intro = 0
  let idleUntil = 0

  // ── Kamera: globus markazi va radiusi heroLayout bo'yicha (fallback rasm bilan bir xil)
  let layout = computeHeroLayout(stage.width, stage.height, options.safeLeft())
  const applyLayout = (width, height) => {
    layout = computeHeroLayout(width, height, options.safeLeft())
    camera.aspect = width / height
    camera.position.set(0, 0, layout.distance)
    camera.lookAt(0, 0, 0)
    camera.setViewOffset(width, height, -(layout.cx - width / 2), -(layout.cy - height / 2), width, height)
    camera.updateProjectionMatrix()
  }
  stage.onResize = applyLayout
  applyLayout(stage.width, stage.height)

  // ── Sichqoncha / barmoq bilan aylantirish (zoom yo'q)
  let dragging = false
  let lastX = 0
  let lastY = 0
  let lastTime = 0
  const canvas = options.canvas

  const onGlobe = (event) => {
    const rect = canvas.getBoundingClientRect()
    const dx = event.clientX - rect.left - layout.cx
    const dy = event.clientY - rect.top - layout.cy
    return Math.hypot(dx, dy) < layout.radius * 1.12
  }
  const onPointerDown = (event) => {
    if (event.button !== 0 || !onGlobe(event)) return
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    lastTime = performance.now()
    spinVelocity = 0
    canvas.setPointerCapture(event.pointerId)
    canvas.classList.add('is-dragging')
  }
  const onPointerMove = (event) => {
    if (!dragging) {
      const over = event.pointerType === 'mouse' && onGlobe(event)
      canvas.classList.toggle('is-grabbable', over)
      return
    }
    const now = performance.now()
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    const delta = dx * (2.2 / Math.max(120, layout.radius * 2))
    spin += delta
    tiltTarget = Math.min(0.9, Math.max(-0.25, tiltTarget + dy * 0.004))
    spinVelocity = (delta / Math.max(0.008, (now - lastTime) / 1000)) * 0.5
    lastX = event.clientX
    lastY = event.clientY
    lastTime = now
  }
  const onPointerUp = (event) => {
    if (!dragging) return
    dragging = false
    idleUntil = performance.now() / 1000 + 2
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    canvas.classList.remove('is-dragging')
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  // ── Orbitadagi kartochkalar va Toshkent yozuvi
  const markerWorld = new Vector3()
  const projected = new Vector3()
  const toCamera = new Vector3()
  let ringAngle = 0.6

  const placeOverlays = (dt) => {
    ringAngle += dt * 0.1
    const scale = earth.root.scale.x
    const appear = smoothstep(0.15, 0.7, intro)
    options.cards.forEach((card, i) => {
      const p = projectRing(layout, ringAngle + (i * Math.PI) / 2, scale)
      const cardScale = 0.86 + 0.16 * (p.depth * 0.5 + 0.5)
      const opacity = p.hidden ? 0 : (p.depth >= 0 ? 1 : 0.5 + 0.5 * smoothstep(-1, 0, p.depth)) * appear
      card.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${cardScale.toFixed(3)})`
      card.style.opacity = opacity.toFixed(3)
      card.style.zIndex = p.depth >= 0 ? '3' : '1'
    })

    const label = options.markerLabel
    if (label) {
      markerWorld.copy(earth.markerPosition).applyMatrix4(earth.spin.matrixWorld)
      toCamera.copy(camera.position).sub(markerWorld).normalize()
      const facing = projected.copy(markerWorld).normalize().dot(toCamera)
      projected.copy(markerWorld).project(camera)
      const x = (projected.x * 0.5 + 0.5) * stage.width
      const y = (-projected.y * 0.5 + 0.5) * stage.height
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      // yarim shaffof holatda matn o'qilmaydi — yozuv yo to'liq ko'rinadi, yo yashirin (o'tish CSS'da)
      label.style.opacity = facing > 0.35 && intro > 0.75 ? '1' : '0'
    }
  }

  let firstFrame = true
  stage.onFrame = (dt, time) => {
    intro = Math.min(1, intro + dt / 2.4)
    if (!dragging) {
      spinVelocity = damp(spinVelocity, 0, 2.2, dt)
      // O'rta Osiyo old tomonda bo'lganda aylanish sekinlashadi — u ko'proq ko'rinib turadi
      const facing = (1 - Math.cos(spin - baseSpin)) / 2
      const auto = time > idleUntil ? AUTO_SPIN * (0.3 + 0.7 * facing) : 0
      spin += (auto * smoothstep(0, 1, intro) + spinVelocity) * dt
    }
    if (!dragging) tiltTarget = damp(tiltTarget, HERO_TILT, 0.6, dt)
    tilt = damp(tilt, tiltTarget, 5, dt)
    earth.spin.rotation.y = spin
    earth.root.rotation.x = tilt
    earth.update(time)
    stars?.update(time)
    scene.updateMatrixWorld()
    placeOverlays(dt)
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
    relayout: () => applyLayout(stage.width, stage.height),
    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      disposeObject(scene)
      stage.dispose()
    },
  }
}
