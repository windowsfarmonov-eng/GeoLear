import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  Quaternion,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
} from 'three'
import { latLonToVector3, smoothstep } from './core'
import { buildSatellite, orbitLine } from './globeShowcase'
import { CENTRAL_ASIA_CENTER, diveCities } from '../../../content/geo'

// «O'rta Osiyoga sho'ng'ish» sahnasidagi jonli qatlam:
//   yaqinlashishda — orbitadagi sun'iy yo'ldoshlar va O'rta Osiyo ustidagi radar to'lqinlari;
//   relyef ko'tarilgach — shahar nur ustunlari, uchayotgan samolyotlar (iz bilan), daryolar bo'ylab
//   Orolga oqayotgan zarrachalar, g'arbdan esayotgan shamol oqimlari (havo massalari), suzuvchi
//   bulutlar, cho'qqilardagi bayroqlar va havoda yaltirab turgan zarralar.
// Relyef obyektlari to'liq ko'tarilgan (rise = 1) holat uchun joylashtiriladi — ular faqat
// shundan keyin ko'rinadi.

const TEAL = new Color('#4ff0d8')
const SAND = new Color('#ffcf6b')
const RIVER = new Color('#aef3ff')
const UP = new Vector3(0, 1, 0)
const Z = new Vector3(0, 0, 1)

const CITIES = diveCities
const city = (key) => CITIES.find((c) => c.key === key)

const FLIGHTS = [
  ['tashkent', 'samarkand'],
  ['samarkand', 'bukhara'],
  ['tashkent', 'almaty'],
  ['dushanbe', 'tashkent'],
  ['bukhara', 'khiva'],
  ['ashgabat', 'bukhara'],
  ['bishkek', 'andijan'],
  ['termez', 'qarshi'],
]

const PEAKS = [
  { lat: 38.94, lon: 72.02, color: '#ffcf6b' }, // Ismoil Somoniy — O'rta Osiyodagi eng baland
  { lat: 39.34, lon: 72.88, color: '#ff7a7a' }, // Lenin cho'qqisi
  { lat: 38.92, lon: 68.28, color: '#4ff0d8' }, // Hazrati Sulton — O'zbekistondagi eng baland
  { lat: 41.52, lon: 70.03, color: '#7cb8ff' }, // Katta Chimyon
]

const RIVER_PATHS = ['amu', 'syr', 'zarafshon']

const vertexUv = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(uColor, pow(1.0 - vUv.y, 1.6) * uOpacity);
  #include <colorspace_fragment>
}
`

// Samolyot izi: «bosh» (uHead) ortidan so'nib boruvchi nurli chiziq
const trailFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uHead;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = uHead - vUv.x;
  float a = smoothstep(0.32, 0.0, d) * step(0.0, d);
  float path = 0.08;
  gl_FragColor = vec4(uColor, (a * 0.9 + path) * uOpacity);
  #include <colorspace_fragment>
}
`

// Shamol oqimi: tube bo'ylab siljib boruvchi «kometa» chiziqchalar
const windFragment = /* glsl */ `
uniform float uTime;
uniform float uOffset;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float f = fract(vUv.x * 3.0 - uTime * 0.09 + uOffset);
  float streak = smoothstep(0.0, 0.42, f) * smoothstep(0.5, 0.42, f);
  float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
  gl_FragColor = vec4(vec3(0.92, 0.98, 1.0), streak * edge * uOpacity);
  #include <colorspace_fragment>
}
`

const flagVertex = /* glsl */ `
uniform float uTime;
uniform float uSeed;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float k = uv.x;
  p.z += sin(uv.x * 7.0 - uTime * 6.0 + uSeed) * 0.0011 * k;
  p.y += sin(uv.x * 5.0 - uTime * 4.0 + uSeed) * 0.0004 * k;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`
const flagFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float shade = 0.75 + 0.25 * sin(vUv.x * 7.0);
  gl_FragColor = vec4(uColor * shade, uOpacity);
  #include <colorspace_fragment>
}
`

const pointsVertex = /* glsl */ `
attribute float aSize;
attribute float aSeed;
attribute float aAlpha;
uniform float uTime;
uniform float uPixelRatio;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * (1.0 / -mv.z);
  vAlpha = aAlpha * (0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 30.0));
  gl_Position = projectionMatrix * mv;
}
`
const pointsFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`

function cloudTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const blobs = [
    [0.5, 0.55, 0.3],
    [0.32, 0.6, 0.22],
    [0.68, 0.6, 0.22],
    [0.42, 0.45, 0.2],
    [0.6, 0.46, 0.18],
  ]
  for (const [x, y, r] of blobs) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.45)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/** Tasodifiy, lekin har safar bir xil (seed) */
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function createDiveExtras({ scene, earth, terrain, quality, pixelRatio }) {
  const full = quality === 'full'
  const exag = terrain.exaggeration
  const [lon0, lat0, lon1, lat1] = terrain.bounds
  const random = rng(42)
  const spin = earth.spin

  /** Relyef sirtidagi nuqta (to'liq ko'tarilgan holat) + qo'shimcha balandlik */
  const ground = (lat, lon, lift = 0, target = new Vector3()) =>
    latLonToVector3(lat, lon, 1.0008 + terrain.heightAt(lat, lon) * exag + lift, target)
  const normalAt = (lat, lon) => latLonToVector3(lat, lon, 1)

  // standart materiallar (samolyot, bayroq dastasi, sun'iy yo'ldosh) uchun yorug'lik
  const hemi = new HemisphereLight('#dff3ff', '#2a2f38', 1.4)
  const sunLight = new DirectionalLight('#ffffff', 2.2)
  sunLight.position.set(-3, 4, 4)
  scene.add(hemi, sunLight)

  const families = []
  const family = (group, show) => {
    families.push({ group, show, value: 0 })
    return group
  }

  // ───────────── 1. Yaqinlashish: sun'iy yo'ldoshlar ─────────────
  const orbits = family(new Group(), (p) => 1 - smoothstep(0.16, 0.3, p))
  scene.add(orbits)
  const satellites = [
    { r: 1.3, rot: [0.5, 0, -0.4], speed: 0.32, phase: 0 },
    { r: 1.42, rot: [-0.35, 0.3, 0.55], speed: -0.22, phase: 2.4 },
  ].map((def) => {
    const g = new Group()
    g.rotation.set(...def.rot)
    g.add(orbitLine(def.r, '#7fe8dc', 0.28))
    const sat = buildSatellite()
    sat.group.scale.setScalar(0.85)
    g.add(sat.group)
    orbits.add(g)
    return { def, sat }
  })

  // ───────────── 2. Radar to'lqinlari O'rta Osiyo ustida ─────────────
  const scan = family(new Group(), (p) => smoothstep(0.0, 0.08, p) * (1 - smoothstep(0.3, 0.42, p)))
  spin.add(scan)
  const caNormal = normalAt(CENTRAL_ASIA_CENTER.lat, CENTRAL_ASIA_CENTER.lon)
  const scanRings = [0, 1, 2].map(() => {
    const ring = new Mesh(
      new RingGeometry(0.965, 1, 96),
      new MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide, blending: AdditiveBlending }),
    )
    ring.position.copy(caNormal).multiplyScalar(1.006)
    ring.quaternion.setFromUnitVectors(Z, caNormal)
    ring.renderOrder = 6
    scan.add(ring)
    return ring
  })

  // ───────────── 3. Shaharlar: nur ustuni + nuqta + to'lqin halqa ─────────────
  const cities = family(new Group(), (p) => smoothstep(0.6, 0.7, p))
  spin.add(cities)
  const beamGeometry = new CylinderGeometry(0.0012, 0.0012, 1, 8, 1, true).translate(0, 0.5, 0)
  const cityPins = CITIES.map((c, i) => {
    const color = c.capital ? SAND : TEAL
    const base = ground(c.lat, c.lon, 0.0005)
    const normal = normalAt(c.lat, c.lon)
    const g = new Group()
    g.position.copy(base)
    g.quaternion.setFromUnitVectors(UP, normal)
    const beamMat = new ShaderMaterial({
      uniforms: { uColor: { value: color }, uOpacity: { value: 0 } },
      vertexShader: vertexUv,
      fragmentShader: beamFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const beam = new Mesh(beamGeometry, beamMat)
    const height = c.capital ? 0.05 : 0.03
    beam.scale.set(c.capital ? 1.6 : 1, height, c.capital ? 1.6 : 1)
    beam.renderOrder = 7
    g.add(beam)
    const dot = new Mesh(new SphereGeometry(c.capital ? 0.0032 : 0.0022, 12, 8), new MeshBasicMaterial({ color, transparent: true }))
    dot.renderOrder = 7
    g.add(dot)
    const ringMat = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })
    const ring = new Mesh(new RingGeometry(0.0034, 0.0046, 32), ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.renderOrder = 7
    g.add(ring)
    cities.add(g)
    return { key: c.key, base, beam, beamMat, dot, ring, ringMat, height, phase: i * 0.17 }
  })

  // ───────────── 4. Samolyotlar va ularning izi ─────────────
  const flights = family(new Group(), (p) => smoothstep(0.64, 0.74, p))
  spin.add(flights)
  const planeBody = new MeshStandardMaterial({ color: '#f4f7fb', roughness: 0.35, metalness: 0.2 })
  const planeAccent = new MeshStandardMaterial({ color: '#2fb1a4', roughness: 0.4, metalness: 0.2, emissive: '#0b4d47', emissiveIntensity: 0.6 })
  const buildPlane = () => {
    const g = new Group()
    const body = new Mesh(new CylinderGeometry(0.00055, 0.00085, 0.0095, 8), planeBody)
    body.rotation.x = Math.PI / 2
    g.add(body)
    const nose = new Mesh(new ConeGeometry(0.00055, 0.0018, 8), planeBody)
    nose.rotation.x = Math.PI / 2
    nose.position.z = 0.0056
    g.add(nose)
    const wing = new Mesh(new BoxGeometry(0.0105, 0.00022, 0.0022), planeAccent)
    wing.position.z = 0.0006
    g.add(wing)
    const tail = new Mesh(new BoxGeometry(0.0038, 0.00018, 0.0012), planeAccent)
    tail.position.z = -0.0042
    g.add(tail)
    const fin = new Mesh(new BoxGeometry(0.00018, 0.0018, 0.0014), planeAccent)
    fin.position.set(0, 0.0009, -0.0042)
    g.add(fin)
    const light = new Mesh(new SphereGeometry(0.00045, 6, 4), new MeshBasicMaterial({ color: '#ff5d5d' }))
    light.position.set(-0.0052, 0, 0.0006)
    g.add(light)
    g.scale.setScalar(0.75)
    return { group: g, light }
  }
  const flightCount = full ? FLIGHTS.length : 4
  const tmpM = new Matrix4()
  const planes = FLIGHTS.slice(0, flightCount).map(([from, to], i) => {
    const a = city(from)
    const b = city(to)
    const samples = 80
    const pts = []
    const normals = []
    for (let k = 0; k <= samples; k++) {
      const t = k / samples
      const lat = a.lat + (b.lat - a.lat) * t
      const lon = a.lon + (b.lon - a.lon) * t
      const cruise = 0.012 + Math.sin(Math.PI * t) * 0.016
      // tog'lar ustidan o'tganda balandroq ucha boshlaydi
      pts.push(ground(lat, lon, cruise))
      normals.push(normalAt(lat, lon))
    }
    const curve = new CatmullRomCurve3(pts)
    const trailMat = new ShaderMaterial({
      uniforms: { uColor: { value: i % 2 ? SAND : TEAL }, uHead: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: vertexUv,
      fragmentShader: trailFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const trail = new Mesh(new TubeGeometry(curve, 96, 0.00055, 5, false), trailMat)
    trail.renderOrder = 8
    flights.add(trail)
    const plane = buildPlane()
    flights.add(plane.group)
    return { curve, normals, trailMat, plane, speed: 0.07 + (i % 3) * 0.015, offset: i * 0.29 }
  })

  // ───────────── 5. Daryolar bo'ylab oqim zarrachalari ─────────────
  const flow = family(new Group(), (p) => smoothstep(0.6, 0.72, p))
  spin.add(flow)
  const riverSamples = []
  for (const name of RIVER_PATHS) {
    const path = terrain.rivers[name]?.[0]
    if (!path || path.length < 2) continue
    const flat = new CatmullRomCurve3(path.map(([lon, lat]) => new Vector3(lon, lat, 0)))
    const spaced = flat.getSpacedPoints(full ? 260 : 160)
    riverSamples.push({ name, positions: spaced.map((v) => ground(v.y, v.x, 0.0028)) })
  }
  const perRiver = full ? 90 : 50
  const flowCount = riverSamples.length * perRiver
  const flowPos = new Float32Array(flowCount * 3)
  const flowSize = new Float32Array(flowCount)
  const flowSeed = new Float32Array(flowCount)
  const flowAlpha = new Float32Array(flowCount)
  const flowState = []
  riverSamples.forEach((river, r) => {
    for (let k = 0; k < perRiver; k++) {
      const idx = r * perRiver + k
      flowSize[idx] = (river.name === 'zarafshon' ? 5 : 7) + random() * 5
      flowSeed[idx] = random()
      flowState.push({ river, offset: k / perRiver + random() * 0.01, speed: 0.035 + random() * 0.015 })
    }
  })
  const flowGeometry = new BufferGeometry()
  flowGeometry.setAttribute('position', new BufferAttribute(flowPos, 3))
  flowGeometry.setAttribute('aSize', new BufferAttribute(flowSize, 1))
  flowGeometry.setAttribute('aSeed', new BufferAttribute(flowSeed, 1))
  flowGeometry.setAttribute('aAlpha', new BufferAttribute(flowAlpha, 1))
  const flowMat = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uColor: { value: RIVER }, uOpacity: { value: 0 } },
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const flowPoints = new Points(flowGeometry, flowMat)
  flowPoints.frustumCulled = false
  flowPoints.renderOrder = 8
  flow.add(flowPoints)

  // ───────────── 6. Shamol oqimlari (havo massalari g'arbdan sharqqa) ─────────────
  const wind = family(new Group(), (p) => smoothstep(0.7, 0.82, p))
  spin.add(wind)
  const windLines = full ? 9 : 6
  const windMats = []
  for (let i = 0; i < windLines; i++) {
    const baseLat = lat0 + 1.6 + (i / (windLines - 1)) * (lat1 - lat0 - 3)
    const pts = []
    for (let k = 0; k <= 40; k++) {
      const lon = lon0 + 2.5 + (k / 40) * (lon1 - lon0 - 5)
      const lat = baseLat + Math.sin(lon * 0.22 + i * 1.7) * 0.9
      pts.push(latLonToVector3(lat, lon, 1.0008 + 0.044 + Math.sin(k * 0.3 + i) * 0.004))
    }
    const mat = new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOffset: { value: random() }, uOpacity: { value: 0 } },
      vertexShader: vertexUv,
      fragmentShader: windFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    windMats.push(mat)
    const tube = new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 120, 0.00045, 4, false), mat)
    tube.renderOrder = 9
    wind.add(tube)
  }

  // ───────────── 7. Bulutlar ─────────────
  const clouds = family(new Group(), (p) => smoothstep(0.58, 0.7, p))
  spin.add(clouds)
  const cloudTex = cloudTexture()
  const cloudList = Array.from({ length: full ? 16 : 9 }, () => {
    const material = new SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0, depthWrite: false, color: '#ffffff' })
    const sprite = new Sprite(material)
    const size = 0.035 + random() * 0.035
    sprite.scale.set(size * 1.6, size, 1)
    sprite.renderOrder = 10
    clouds.add(sprite)
    return {
      sprite,
      material,
      lat: lat0 + 1.5 + random() * (lat1 - lat0 - 3),
      lon: lon0 + random() * (lon1 - lon0),
      alt: 0.052 + random() * 0.018,
      speed: 0.35 + random() * 0.4,
      max: 0.14 + random() * 0.14,
    }
  })

  // ───────────── 8. Cho'qqilardagi bayroqlar ─────────────
  const flags = family(new Group(), (p) => smoothstep(0.66, 0.76, p))
  spin.add(flags)
  const poleMat = new MeshBasicMaterial({ color: '#dfe7ef', transparent: true })
  const flagMats = PEAKS.map((peak, i) => {
    const g = new Group()
    g.position.copy(ground(peak.lat, peak.lon, 0))
    g.quaternion.setFromUnitVectors(UP, normalAt(peak.lat, peak.lon))
    const pole = new Mesh(new CylinderGeometry(0.00028, 0.00028, 0.014, 6).translate(0, 0.007, 0), poleMat)
    g.add(pole)
    const mat = new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: i * 1.7 }, uColor: { value: new Color(peak.color) }, uOpacity: { value: 0 } },
      vertexShader: flagVertex,
      fragmentShader: flagFragment,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    })
    const cloth = new Mesh(new PlaneGeometry(0.0075, 0.0045, 8, 1).translate(0.00375, 0, 0), mat)
    cloth.position.y = 0.0118
    cloth.renderOrder = 9
    g.add(cloth)
    flags.add(g)
    return mat
  })

  // ───────────── 9. Havodagi yaltiroq zarralar ─────────────
  const motes = family(new Group(), (p) => smoothstep(0.6, 0.74, p))
  spin.add(motes)
  const moteCount = full ? 320 : 140
  const motePos = new Float32Array(moteCount * 3)
  const moteBase = []
  const moteSize = new Float32Array(moteCount)
  const moteSeed = new Float32Array(moteCount)
  const moteAlpha = new Float32Array(moteCount)
  for (let i = 0; i < moteCount; i++) {
    const lat = lat0 + random() * (lat1 - lat0)
    const lon = lon0 + random() * (lon1 - lon0)
    const fx = Math.min(lon - lon0, lon1 - lon) / (lon1 - lon0)
    const fy = Math.min(lat - lat0, lat1 - lat) / (lat1 - lat0)
    moteBase.push({ lat, lon, alt: 0.008 + random() * 0.06, phase: random() * 6.28 })
    moteSize[i] = 2.5 + random() * 4
    moteSeed[i] = random()
    moteAlpha[i] = smoothstep(0, 0.12, fx) * smoothstep(0, 0.16, fy) * (0.5 + random() * 0.5)
  }
  const moteGeometry = new BufferGeometry()
  moteGeometry.setAttribute('position', new BufferAttribute(motePos, 3))
  moteGeometry.setAttribute('aSize', new BufferAttribute(moteSize, 1))
  moteGeometry.setAttribute('aSeed', new BufferAttribute(moteSeed, 1))
  moteGeometry.setAttribute('aAlpha', new BufferAttribute(moteAlpha, 1))
  const moteMat = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new Color('#ffe6a8') }, uOpacity: { value: 0 } },
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const motePoints = new Points(moteGeometry, moteMat)
  motePoints.frustumCulled = false
  motePoints.renderOrder = 9
  motes.add(motePoints)
  const moteGround = moteBase.map((m) => terrain.heightAt(m.lat, m.lon) * exag)

  // ───────────── kadr sikli ─────────────
  const tmp = new Vector3()
  const tmp2 = new Vector3()
  const q = new Quaternion()

  function update(time, dt, p) {
    for (const f of families) {
      f.value = f.show(p)
      f.group.visible = f.value > 0.002
    }
    const [vOrbit, vScan, vCity, vFlight, vFlow, vWind, vCloud, vFlag, vMote] = families.map((f) => f.value)

    if (orbits.visible) {
      for (const { def, sat } of satellites) {
        const a = time * def.speed + def.phase
        sat.group.position.set(Math.cos(a) * def.r, 0, Math.sin(a) * def.r)
        sat.group.rotation.y = -a
        sat.light.visible = Math.sin(time * 6 + def.phase) > 0
      }
      orbits.traverse((node) => {
        if (node.material && node.material.opacity !== undefined && node.isLine) node.material.opacity = 0.28 * vOrbit
      })
      orbits.scale.setScalar(0.9 + 0.1 * vOrbit)
    }

    if (scan.visible) {
      scanRings.forEach((ring, i) => {
        const phase = (time * 0.32 + i / 3) % 1
        ring.scale.setScalar(0.02 + phase * 0.3)
        ring.material.opacity = 0.75 * (1 - phase) * vScan
      })
    }

    if (cities.visible) {
      for (const pin of cityPins) {
        const grow = smoothstep(pin.phase * 0.5, pin.phase * 0.5 + 0.5, vCity)
        pin.beam.scale.y = pin.height * grow
        pin.beamMat.uniforms.uOpacity.value = 0.85 * grow
        pin.dot.material.opacity = grow
        const ph = (time * 0.7 + pin.phase) % 1
        pin.ring.scale.setScalar(1 + ph * 2.4)
        pin.ringMat.opacity = 0.9 * (1 - ph) * (1 - ph) * grow
      }
    }

    if (flights.visible) {
      for (const f of planes) {
        const t = (time * f.speed + f.offset) % 1
        const fade = smoothstep(0, 0.06, t) * smoothstep(1, 0.92, t) * vFlight
        f.curve.getPointAt(t, tmp)
        f.curve.getPointAt(Math.min(1, t + 0.01), tmp2)
        const n = f.normals[Math.round(t * (f.normals.length - 1))]
        tmpM.lookAt(tmp2, tmp, n)
        q.setFromRotationMatrix(tmpM)
        f.plane.group.position.copy(tmp)
        f.plane.group.quaternion.copy(q)
        f.plane.group.visible = fade > 0.02
        f.plane.group.scale.setScalar(0.75 * (0.6 + 0.4 * fade))
        f.plane.light.visible = Math.sin(time * 9 + f.offset * 10) > 0.3
        f.trailMat.uniforms.uHead.value = t
        f.trailMat.uniforms.uOpacity.value = fade
      }
    }

    if (flow.visible) {
      flowState.forEach((s, i) => {
        const u = (s.offset + time * s.speed) % 1
        const list = s.river.positions
        const x = u * (list.length - 1)
        const k = Math.floor(x)
        const a = list[k]
        const b = list[Math.min(list.length - 1, k + 1)]
        tmp.lerpVectors(a, b, x - k)
        flowPos[i * 3] = tmp.x
        flowPos[i * 3 + 1] = tmp.y
        flowPos[i * 3 + 2] = tmp.z
        flowAlpha[i] = smoothstep(0, 0.05, u) * smoothstep(1, 0.93, u)
      })
      flowGeometry.attributes.position.needsUpdate = true
      flowGeometry.attributes.aAlpha.needsUpdate = true
      flowMat.uniforms.uTime.value = time
      flowMat.uniforms.uOpacity.value = vFlow
    }

    if (wind.visible) {
      for (const mat of windMats) {
        mat.uniforms.uTime.value = time
        mat.uniforms.uOpacity.value = 0.38 * vWind
      }
    }

    if (clouds.visible) {
      for (const c of cloudList) {
        c.lon += c.speed * dt
        if (c.lon > lon1 + 1) c.lon = lon0 - 1
        const fx = Math.min(c.lon - lon0, lon1 - c.lon) / (lon1 - lon0)
        latLonToVector3(c.lat, c.lon, 1.0008 + c.alt, c.sprite.position)
        c.material.opacity = c.max * smoothstep(-0.02, 0.1, fx) * vCloud
      }
    }

    if (flags.visible) {
      poleMat.opacity = vFlag
      for (const mat of flagMats) {
        mat.uniforms.uTime.value = time
        mat.uniforms.uOpacity.value = vFlag
      }
    }

    if (motes.visible) {
      moteBase.forEach((m, i) => {
        const lift = moteGround[i] + m.alt + Math.sin(time * 0.6 + m.phase) * 0.004
        latLonToVector3(m.lat, m.lon + Math.sin(time * 0.1 + m.phase) * 0.15, 1.0008 + lift, tmp)
        motePos[i * 3] = tmp.x
        motePos[i * 3 + 1] = tmp.y
        motePos[i * 3 + 2] = tmp.z
      })
      moteGeometry.attributes.position.needsUpdate = true
      moteMat.uniforms.uTime.value = time
      moteMat.uniforms.uOpacity.value = vMote
    }
  }

  return {
    update,
    /** Shahar nuqtalari (spin guruhi koordinatalarida) va ularning ko'rinish darajasi */
    cityAnchors: cityPins.map((pin) => ({ key: pin.key, position: pin.base })),
    cityVisibility: () => families[2].value,
    setTheme(dark) {
      hemi.intensity = dark ? 1.4 : 1.8
      moteMat.uniforms.uColor.value.set(dark ? '#ffe6a8' : '#fff4d6')
    },
    dispose() {
      cloudTex.dispose()
    },
  }
}
