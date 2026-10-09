import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { Stage, damp, disposeObject, latLonToVector3, smoothstep, spinToFaceLongitude } from './core'
import { Earth, loadEarthTextures } from './earth'
import { createStars } from './stars'
import { CENTRAL_ASIA_CENTER, TASHKENT } from '../../../content/geo'

// Sahifaning turli joylaridagi «vitrina» globuslari. Hammasi bitta Earth shader'idan foydalanadi,
// ustiga variantga qarab qo'shimcha 3D obyektlar qo'shiladi:
//   satellite — O'rta Osiyoga qaragan globus, atrofida sun'iy yo'ldosh va Oy aylanadi
//   arcs      — Toshkentdan dunyo shaharlariga uchuvchi nurli yoylar
//   orbits    — og'ma orbitalarda aylanuvchi nurli zarrachalar (atom kabi)
//   horizon   — pastdan ko'tarilgan katta sayyora ufqi, tungi shahar chiroqlari va yoylar

const DEG = Math.PI / 180
const TEAL = new Color('#3fe0cf')
const SAND = new Color('#ffc861')

/** Toshkentdan yoylar boradigan shaharlar */
const ARC_CITIES = [
  { lat: 55.75, lon: 37.62 }, // Moskva
  { lat: 41.01, lon: 28.98 }, // Istanbul
  { lat: 25.2, lon: 55.27 }, // Dubay
  { lat: 28.61, lon: 77.21 }, // Dehli
  { lat: 39.9, lon: 116.4 }, // Pekin
  { lat: 37.57, lon: 126.98 }, // Seul
  { lat: 51.51, lon: -0.13 }, // London
  { lat: 30.04, lon: 31.24 }, // Qohira
  { lat: 1.35, lon: 103.82 }, // Singapur
  { lat: 35.68, lon: 139.69 }, // Tokio
]

const arcFragment = /* glsl */ `
uniform float uTime;
uniform float uOffset;
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float head = fract(uTime * uSpeed + uOffset) * 1.4 - 0.2;
  float trail = smoothstep(head - 0.32, head, vUv.x) * step(vUv.x, head);
  float base = 0.28;
  vec3 col = mix(uColorA, uColorB, vUv.x);
  float a = (base + trail * 1.6) * uOpacity;
  gl_FragColor = vec4(col * (0.6 + trail), a);
  #include <colorspace_fragment>
}
`
const uvVertex = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

/** Ikki nuqta orasida sharsimon (great-circle) yoy, masofaga qarab balandroq */
function buildArc(from, to, index, segments) {
  const a = latLonToVector3(from.lat, from.lon, 1)
  const b = latLonToVector3(to.lat, to.lon, 1)
  const angle = a.angleTo(b)
  const lift = 0.06 + angle * 0.28
  const points = []
  for (let i = 0; i <= 32; i++) {
    const t = i / 32
    const p = new Vector3().copy(a).lerp(b, t).normalize()
    points.push(p.multiplyScalar(1.004 + Math.sin(Math.PI * t) * lift))
  }
  const uniforms = {
    uTime: { value: 0 },
    uOffset: { value: index * 0.137 },
    uSpeed: { value: 0.22 + (index % 3) * 0.05 },
    uColorA: { value: TEAL.clone() },
    uColorB: { value: SAND.clone() },
    uOpacity: { value: 1 },
  }
  const mesh = new Mesh(
    new TubeGeometry(new CatmullRomCurve3(points), segments, 0.0058, 6, false),
    new ShaderMaterial({
      uniforms,
      vertexShader: uvVertex,
      fragmentShader: arcFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  mesh.renderOrder = 4
  return { mesh, uniforms, end: b }
}

/** Shahar nuqtasi + kengayuvchi halqa */
function buildPin(normal, color) {
  const group = new Group()
  const dot = new Mesh(new SphereGeometry(0.011, 12, 8), new MeshBasicMaterial({ color }))
  dot.position.copy(normal).multiplyScalar(1.004)
  group.add(dot)
  const ring = new Mesh(
    new RingGeometry(0.014, 0.019, 32),
    new MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: DoubleSide }),
  )
  ring.position.copy(normal).multiplyScalar(1.005)
  ring.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  ring.renderOrder = 4
  group.add(ring)
  return { group, ring }
}

export function orbitLine(radius, color, opacity) {
  const points = []
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2
    points.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  const line = new LineLoop(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  )
  line.renderOrder = 4
  return line
}

/** Kichik sun'iy yo'ldosh: oltin korpus, ikki ko'k quyosh paneli, antenna */
export function buildSatellite() {
  const g = new Group()
  const gold = new MeshStandardMaterial({ color: '#e9b85a', roughness: 0.3, metalness: 0.8 })
  const panel = new MeshStandardMaterial({ color: '#2f6fd6', roughness: 0.35, metalness: 0.4, emissive: '#0d2a66', emissiveIntensity: 0.5 })
  const frame = new MeshStandardMaterial({ color: '#cfd6df', roughness: 0.4, metalness: 0.6 })
  g.add(new Mesh(new BoxGeometry(0.06, 0.06, 0.09), gold))
  for (const side of [-1, 1]) {
    const arm = new Mesh(new CylinderGeometry(0.004, 0.004, 0.05, 6), frame)
    arm.rotation.z = Math.PI / 2
    arm.position.x = side * 0.055
    g.add(arm)
    const wing = new Mesh(new BoxGeometry(0.11, 0.004, 0.06), panel)
    wing.position.x = side * 0.135
    g.add(wing)
  }
  const dish = new Mesh(new CylinderGeometry(0.025, 0.004, 0.015, 16, 1, true), frame)
  dish.position.z = 0.055
  dish.rotation.x = Math.PI / 2
  g.add(dish)
  const light = new Mesh(new SphereGeometry(0.008, 8, 6), new MeshBasicMaterial({ color: TEAL }))
  light.position.set(0, 0.035, -0.03)
  g.add(light)
  return { group: g, light }
}

/** Low-poly Oy */
function buildMoon() {
  const geometry = new IcosahedronGeometry(0.17, 2)
  const pos = geometry.attributes.position
  const v = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = Math.sin(v.x * 31) * Math.cos(v.y * 27) * Math.sin(v.z * 23)
    v.multiplyScalar(1 + n * 0.035)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()
  return new Mesh(geometry, new MeshStandardMaterial({ color: '#c9cdd6', roughness: 0.95, flatShading: true }))
}

/** Nurli zarracha (yadro + yumshoq halo) */
function buildSpark(color, size) {
  const g = new Group()
  g.add(new Mesh(new SphereGeometry(size, 12, 8), new MeshBasicMaterial({ color })))
  const halo = new Mesh(
    new SphereGeometry(size * 2.6, 16, 12),
    new ShaderMaterial({
      uniforms: { uColor: { value: color } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(dot(vN, vV), 0.0), 2.5); gl_FragColor = vec4(uColor, f * 0.8); }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  g.add(halo)
  return g
}

export async function createGlobeShowcase(options) {
  const { variant, quality } = options
  const full = quality === 'full'
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality })
  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 0.05, 200)

  const textures = await loadEarthTextures(quality)
  const earth = new Earth(textures, { quality, clouds: full && variant !== 'horizon', marker: variant !== 'horizon' })
  earth.uniforms.uGrid.value = variant === 'arcs' ? 0.55 : 0.3
  scene.add(earth.root)

  // standart materiallar (yo'ldosh, Oy) uchun yorug'lik — quyosh Earth shader'i bilan bir tomonda
  scene.add(new HemisphereLight('#cfe9ff', '#1a2230', 1.2))
  const sunLight = new DirectionalLight('#ffffff', 2.4)
  sunLight.position.copy(earth.sun).multiplyScalar(5)
  scene.add(sunLight)

  const stars = full && variant !== 'horizon' ? createStars(700, stage.renderer.getPixelRatio()) : null
  if (stars) scene.add(stars.points)

  const updaters = []
  /** kadrga sig'ishi kerak bo'lgan radius (globus birligida) */
  let fitRadius = 1.12

  // ── Variantlar
  if (variant === 'arcs' || variant === 'horizon') {
    const segments = full ? 64 : 40
    const cities = variant === 'horizon' ? ARC_CITIES : ARC_CITIES.slice(0, full ? 10 : 7)
    const arcs = cities.map((city, i) => buildArc(TASHKENT, city, i, segments))
    const pins = arcs.map((arc, i) => buildPin(arc.end, i % 2 ? SAND : TEAL))
    for (const arc of arcs) earth.spin.add(arc.mesh)
    for (const pin of pins) earth.spin.add(pin.group)
    if (variant === 'horizon') {
      const home = buildPin(latLonToVector3(TASHKENT.lat, TASHKENT.lon, 1), TEAL)
      earth.spin.add(home.group)
      pins.push(home)
    }
    updaters.push((time) => {
      for (const arc of arcs) arc.uniforms.uTime.value = time
      pins.forEach((pin, i) => {
        const phase = (time * 0.6 + i * 0.23) % 1
        pin.ring.scale.setScalar(1 + phase * 2.2)
        pin.ring.material.opacity = 0.85 * (1 - phase) * (1 - phase)
      })
    })
  }

  if (variant === 'satellite') {
    fitRadius = 1.75
    const orbit = new Group()
    orbit.rotation.set(0.42, 0, -0.32)
    scene.add(orbit)
    orbit.add(orbitLine(1.38, '#7fe8dc', 0.35))
    const sat = buildSatellite()
    orbit.add(sat.group)

    const moonOrbit = new Group()
    moonOrbit.rotation.set(-0.2, 0, 0.18)
    scene.add(moonOrbit)
    moonOrbit.add(orbitLine(1.72, '#9fb4cc', 0.18))
    const moon = buildMoon()
    moon.scale.setScalar(0.62)
    moonOrbit.add(moon)

    updaters.push((time) => {
      const a = time * 0.45
      sat.group.position.set(Math.cos(a) * 1.38, 0, Math.sin(a) * 1.38)
      sat.group.rotation.y = -a
      sat.light.visible = Math.sin(time * 6) > 0
      const m = time * 0.12 + 2
      moon.position.set(Math.cos(m) * 1.72, 0, Math.sin(m) * 1.72)
      moon.rotation.y = time * 0.2
    })
  }

  if (variant === 'orbits') {
    fitRadius = 1.6
    const defs = [
      { r: 1.3, rot: [1.1, 0, 0.35], speed: 0.7, color: TEAL },
      { r: 1.42, rot: [-0.9, 0.4, -0.5], speed: -0.5, color: SAND },
      { r: 1.54, rot: [0.25, 0, 1.15], speed: 0.38, color: new Color('#7cb8ff') },
    ]
    const sparks = defs.map((def) => {
      const group = new Group()
      group.rotation.set(...def.rot)
      group.add(orbitLine(def.r, def.color, 0.3))
      const items = [0, Math.PI].map(() => {
        const spark = buildSpark(def.color, 0.022)
        group.add(spark)
        return spark
      })
      scene.add(group)
      return { def, items }
    })
    updaters.push((time) => {
      for (const { def, items } of sparks) {
        items.forEach((spark, i) => {
          const a = time * def.speed + i * Math.PI
          spark.position.set(Math.cos(a) * def.r, 0, Math.sin(a) * def.r)
        })
      }
    })
  }

  // ── Yo'nalish: O'rta Osiyo old tomonda
  const baseSpin = spinToFaceLongitude(variant === 'arcs' ? 72 : CENTRAL_ASIA_CENTER.lon)
  let spin = baseSpin - (variant === 'horizon' ? 0.2 : 0.6)
  let spinVelocity = 0
  let tilt = variant === 'horizon' ? 0.5 : 0.32
  let tiltTarget = tilt
  const baseTilt = tilt
  let intro = 0
  let idleUntil = 0

  // ── Kamera
  const applyLayout = (width, height) => {
    camera.aspect = width / height
    if (variant === 'horizon') {
      // sayyora pastki-o'ng burchakdan ko'tariladi
      camera.fov = 34
      camera.position.set(0, 0, 3.1)
      earth.root.position.set(width > 760 ? 0.62 * camera.aspect : 0, width > 760 ? -1.32 : -0.8, 0)
      earth.root.scale.setScalar(width > 760 ? 1 : 0.9)
    } else {
      const halfV = (camera.fov / 2) * DEG
      const halfH = Math.atan(Math.tan(halfV) * camera.aspect)
      camera.position.set(0, 0, fitRadius / Math.sin(Math.min(halfV, halfH)))
    }
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }
  stage.onResize = applyLayout
  applyLayout(stage.width, stage.height)

  // ── Sichqoncha / barmoq bilan aylantirish
  const canvas = options.canvas
  let dragging = false
  let lastX = 0
  let lastY = 0
  let lastTime = 0
  const onPointerDown = (event) => {
    if (event.button !== 0 || variant === 'horizon') return
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    lastTime = performance.now()
    spinVelocity = 0
    canvas.setPointerCapture(event.pointerId)
    canvas.classList.add('is-dragging')
  }
  const onPointerMove = (event) => {
    if (!dragging) return
    const now = performance.now()
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    const delta = dx * (2.4 / Math.max(160, stage.width))
    spin += delta
    tiltTarget = Math.min(0.9, Math.max(-0.4, tiltTarget + dy * 0.004))
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

  // ── Mavzu
  const applyTheme = (dark) => {
    earth.setTheme(dark || variant === 'horizon')
    stars?.setVisible(dark)
    if (variant === 'horizon') {
      // quyosh orqada-tepada: old tomon tunda, shahar chiroqlari va yorqin atmosfera chekkasi
      earth.sun.set(0.35, 0.75, -0.55).normalize()
      earth.atmosphereUniforms.uStrength.value = 1.5
    }
    sunLight.position.copy(earth.sun).multiplyScalar(5)
  }
  applyTheme(options.dark)

  const autoSpeed = variant === 'horizon' ? 0.035 : 0.12
  let firstFrame = true
  stage.onFrame = (dt, time) => {
    intro = Math.min(1, intro + dt / 2)
    if (!dragging) {
      spinVelocity = damp(spinVelocity, 0, 2.2, dt)
      const auto = time > idleUntil ? autoSpeed : 0
      spin += (auto * smoothstep(0, 1, intro) + spinVelocity) * dt
      tiltTarget = damp(tiltTarget, baseTilt, 0.6, dt)
    }
    tilt = damp(tilt, tiltTarget, 5, dt)
    earth.spin.rotation.y = spin
    earth.root.rotation.x = tilt
    // yumshoq «suzish»
    if (variant !== 'horizon') earth.root.position.y = Math.sin(time * 0.6) * 0.025
    const s = (variant === 'horizon' ? earth.root.scale.x : 1) * (0.9 + 0.1 * smoothstep(0, 1, intro))
    if (variant !== 'horizon') earth.root.scale.setScalar(s)

    earth.update(time)
    stars?.update(time)
    for (const update of updaters) update(time, dt)
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
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      disposeObject(scene)
      stage.dispose()
    },
  }
}
