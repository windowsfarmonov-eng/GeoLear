import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { Stage, damp, disposeObject, lerp, smoothstep } from './core'

// Relyef obyekti uchun kichik 3D diorama: ustida relyef (qum barxanlari, tog' cho'qqilari, vodiy yoki plato),
// yon tomonlarida yer qatlamlari kesimi. Sichqoncha / barmoq bilan aylantiriladi,
// oyna pastga aylantirilganda kamera ko'tarilib, relyef balandroq bo'rtadi.

const SIZE = 2
const DEPTH = 0.42

// ── shovqin (value noise + fbm) — har obyekt uchun o'z urug'i bilan
function makeNoise(seed) {
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295
  }
  const smooth = (t) => t * t * (3 - 2 * t)
  const noise = (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = smooth(x - xi)
    const yf = smooth(y - yi)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)
    return lerp(lerp(a, b, xf), lerp(c, d, xf), yf)
  }
  const fbm = (x, y, octaves = 5) => {
    let sum = 0
    let amp = 0.5
    let freq = 1
    for (let i = 0; i < octaves; i++) {
      sum += noise(x * freq, y * freq) * amp
      freq *= 2.03
      amp *= 0.5
    }
    return sum
  }
  const ridged = (x, y, octaves = 5) => {
    let sum = 0
    let amp = 0.55
    let freq = 1
    let weight = 1
    for (let i = 0; i < octaves; i++) {
      let n = 1 - Math.abs(noise(x * freq, y * freq) * 2 - 1)
      n *= n * weight
      weight = Math.min(1, n * 1.6)
      sum += n * amp
      freq *= 2.1
      amp *= 0.5
    }
    return sum
  }
  return { noise, fbm, ridged }
}

const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r))

// ── har bir turdagi relyef: balandlik (0…~1) va rang
function buildModel(info) {
  const seed = [...info.key].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7) % 9973
  const { fbm, ridged } = makeNoise(seed)
  const look = info.look
  const c = (hex) => new Color(hex)

  if (info.type === 'desert') {
    const dark = info.key === 'karakum'
    // flat — tekis (gilli cho'l, dasht, pasttekislik): barxanlar past; hill — qoldiq tog' bor-yo'qligi
    const flat = Boolean(look.flat)
    const hilly = !dark && !flat && look.hill !== false
    const sand = c(look.sand)
    const sandDark = c(look.sandDark)
    const rock = c(dark ? '#6b5642' : '#8a5a3a')
    const crest = c(look.crest ?? (dark ? '#cdb791' : '#f0b47a'))
    const takyr = c('#d8cdb8')
    return {
      strata: look.strata ?? (dark ? ['#a48b66', '#86704f', '#6b573e', '#55432f', '#3e3022'] : ['#d4874a', '#b86c38', '#97552c', '#7a4424', '#5a321b']),
      height(x, z) {
        const warp = fbm(x * 1.6 + 3, z * 1.6) * 3.2
        const along = x * 0.82 + z * 0.57
        const wave = Math.sin(along * 15 + warp)
        // barxan: shamol tomoni qiya, ortida tik — asimmetrik to'lqin
        const dune = (Math.pow(0.5 + 0.5 * wave, 2.6) * 0.15 + Math.pow(0.5 + 0.5 * Math.sin(along * 34 + warp * 2), 3) * 0.025) * (flat ? 0.3 : 1)
        const swell = fbm(x * 1.2, z * 1.2, 4) * 0.16
        let h = 0.04 + swell + dune
        if (hilly) {
          // qoldiq tog' (Tomditov)
          const hill = gauss(x, z, 0.4, -0.32, 0.27)
          h += hill * (0.5 + ridged(x * 3.4, z * 3.4, 5) * 0.5)
        } else if (dark) {
          // Darvoza krateri
          const r = Math.hypot(x + 0.38, z - 0.32)
          h -= smoothstep(0.17, 0.05, r) * 0.14
          h += smoothstep(0.24, 0.17, r) * smoothstep(0.1, 0.17, r) * 0.03
        }
        return h
      },
      color(x, z, h, slope) {
        if (hilly) {
          const hill = gauss(x, z, 0.4, -0.32, 0.27)
          if (hill > 0.25 && h > 0.24) return rock.clone().lerp(c('#c9916a'), smoothstep(0.25, 0.8, h)).multiplyScalar(1 - Math.min(0.35, slope * 0.25))
        } else if (dark && Math.hypot(x + 0.38, z - 0.32) < 0.15) return c('#3a2a1f')
        if ((dark || flat) && fbm(x * 2.2 + 9, z * 2.2) > 0.6 && h < 0.16) return dark ? takyr : sand.clone().lerp(takyr, 0.55)
        const t = smoothstep(0.04, 0.3, h)
        const col = sandDark.clone().lerp(sand, t)
        return slope < 0.12 && h > 0.16 ? col.lerp(crest, 0.35) : col
      },
      shrubs: { color: look.shrub, count: flat ? 110 : 70, maxH: 0.16 },
      dust: look.dust ?? (dark ? '#e6cfa3' : '#ffc58c'),
      crater: dark ? { x: -0.38, z: 0.32 } : null,
    }
  }

  if (info.type === 'plateau') {
    const top = c(look.top)
    const cliff = c(look.cliff)
    const base = c(look.base)
    const salt = c('#f3efe6')
    const edge = (x, z) => -0.25 + Math.sin(z * 2.4) * 0.16 + fbm(z * 3, 1.5, 3) * 0.2
    return {
      strata: ['#efe6d2', '#e0d3b6', '#cbb894', '#b19c76', '#8f7a5a'],
      height(x, z) {
        const e = edge(x, z)
        const up = smoothstep(e - 0.03, e + 0.05, x)
        // chink tagidagi pog'onali qatlamlar
        const terrace = Math.round(up * 5) / 5
        const plat = 0.36 + fbm(x * 2, z * 2, 4) * 0.04
        const plain = 0.05 + fbm(x * 3, z * 3, 3) * 0.03 - gauss(x, z, -0.72, 0.45, 0.24) * 0.03
        return lerp(plain, plat, lerp(up, terrace, 0.45))
      },
      color(x, z, h, slope) {
        if (slope > 0.45) return cliff.clone().lerp(c('#d6c6a6'), (Math.sin(h * 90) + 1) * 0.25)
        if (h < 0.06 && gauss(x, z, -0.72, 0.45, 0.24) > 0.4) return salt
        return h > 0.3 ? top.clone().lerp(c('#b39c74'), fbm(x * 6, z * 6, 3) * 0.6) : base
      },
      shrubs: { color: '#8d8a5e', count: 40, maxH: 0.5, minH: 0.3 },
      dust: '#eadcc0',
    }
  }

  if (info.type === 'valley') {
    const floor = c(look.floor)
    const field = c(look.field)
    const rock = c(look.rock)
    const snow = c(look.snow)
    const water = c(look.water)
    const river = (x) => Math.sin(x * 3.1) * 0.09 + 0.04
    const bowl = (x, z) => {
      // g'arbda (x<0) ochiq — Xo'jand darvozasi
      const open = smoothstep(-0.55, -1, x) * smoothstep(0.35, 0, Math.abs(z))
      const r = Math.hypot(x / 0.86, z / 0.52)
      return smoothstep(0.62, 1.05, r) * (1 - open)
    }
    return {
      strata: ['#6d5a40', '#5d4c37', '#7a6b58', '#665a4a', '#4c4237'],
      height(x, z) {
        const m = bowl(x, z)
        const mountains = m * (0.28 + ridged(x * 2.4, z * 2.4) * 0.62)
        const adyr = smoothstep(0.35, 0.7, Math.hypot(x / 0.86, z / 0.52)) * 0.05
        const flat = 0.05 + fbm(x * 4, z * 4, 3) * 0.025 + adyr
        const channel = smoothstep(0.05, 0, Math.abs(z - river(x))) * 0.03 * (1 - m)
        return flat + mountains - channel
      },
      color(x, z, h, slope) {
        if (Math.abs(z - river(x)) < 0.03 && h < 0.09) return water
        if (h > 0.62) return snow
        if (h > 0.2 || slope > 0.5) return rock.clone().lerp(c('#9a8b74'), smoothstep(0.2, 0.6, h))
        // dalalar — katak-katak
        const cell = (Math.floor(x * 9) + Math.floor(z * 9 + Math.sin(x * 4))) & 1
        const g = fbm(x * 5, z * 5, 3)
        return (cell ? floor : field).clone().lerp(c('#d9c58f'), smoothstep(0.55, 0.7, g) * smoothstep(0.3, 0, Math.hypot(x, z - 0.12)))
      },
      shrubs: { color: '#3f6b33', count: 120, maxH: 0.1, round: true },
      clouds: 4,
      river,
    }
  }

  // tog'lar
  const amp = info.high ? 1.1 : info.low ? 0.62 : 0.98
  const rock = c(look.rock)
  const rockDark = c(look.rockDark)
  const grass = c(look.grass)
  const snow = c(look.snow)
  const ice = c('#cfe6f5')
  const snowLine = info.low ? 0.38 : 0.5
  return {
    strata: ['#7a6c5c', '#655949', '#8b7a65', '#574b3e', '#3f362d'],
    height(x, z) {
      // asosiy tizma — diagonal bo'ylab
      const ridgeLine = Math.exp(-((z * 0.9 - x * 0.35 - 0.05) ** 2) / 0.32)
      let h = ridged(x * 1.7 + 4, z * 1.7, 6) * amp * (0.35 + ridgeLine * 0.9)
      if (info.high) {
        // Sharqiy Pomir — baland yassi tog'li cho'l
        h = lerp(h, 0.5 + fbm(x * 3, z * 3, 3) * 0.12, smoothstep(0.25, 0.7, x) * 0.65)
      }
      return 0.03 + h * smoothstep(1.02, 0.8, Math.max(Math.abs(x), Math.abs(z))) + 0.04
    },
    color(x, z, h, slope) {
      if (h > snowLine + fbm(x * 6, z * 6, 3) * 0.12) return slope > 0.9 ? rock.clone().lerp(snow, 0.4) : h < snowLine + 0.08 ? ice : snow
      if (slope > 0.75) return rockDark
      if (h < 0.24) return grass.clone().lerp(rock, smoothstep(0.1, 0.24, h) * 0.6)
      return rock.clone().lerp(rockDark, fbm(x * 5, z * 5, 3) * 0.7)
    },
    shrubs: { color: info.low ? '#4f6b34' : '#2f5a3a', count: 110, maxH: 0.26, cone: true },
    clouds: info.low ? 3 : 6,
  }
}

// ── geometriya: relyef usti (yassi qirrali) + yon kesim (qatlamlar)
function buildTop(model, segments, rise) {
  const geo = new PlaneGeometry(SIZE, SIZE, segments, segments).toNonIndexed()
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const n = pos.count
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    pos.setY(i, model.height(x, z) * rise)
  }
  geo.computeVertexNormals()
  const colors = new Float32Array(n * 3)
  const a = new Vector3()
  const b = new Vector3()
  const cc = new Vector3()
  const nrm = new Vector3()
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    cc.fromBufferAttribute(pos, i + 2)
    nrm.subVectors(cc, b).cross(a.clone().sub(b)).normalize()
    const slope = 1 - Math.abs(nrm.y)
    const x = (a.x + b.x + cc.x) / 3
    const z = (a.z + b.z + cc.z) / 3
    const h = (a.y + b.y + cc.y) / 3 / rise
    const col = model.color(x, z, h, slope * 2.2)
    // engil tasodifiy tus — low-poly jonliroq ko'rinadi
    const j = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.05
    for (let k = 0; k < 3; k++) {
      colors[(i + k) * 3] = col.r * j
      colors[(i + k) * 3 + 1] = col.g * j
      colors[(i + k) * 3 + 2] = col.b * j
    }
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  return geo
}

function buildSides(model, segments, rise) {
  const half = SIZE / 2
  const bands = model.strata.map((hex) => new Color(hex))
  const levels = [0.02, -0.06, -0.14, -0.24, -0.33, -DEPTH]
  const positions = []
  const colors = []
  const pushQuad = (p1, p2, p3, p4, col) => {
    positions.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4)
    for (let k = 0; k < 6; k++) colors.push(col.r, col.g, col.b)
  }
  const edges = [
    (t) => [-half + t * SIZE, half, [0, 0, 1]],
    (t) => [half, half - t * SIZE, [1, 0, 0]],
    (t) => [half - t * SIZE, -half, [0, 0, -1]],
    (t) => [-half, -half + t * SIZE, [-1, 0, 0]],
  ]
  for (const edge of edges) {
    for (let s = 0; s < segments; s++) {
      const [x1, z1] = edge(s / segments)
      const [x2, z2] = edge((s + 1) / segments)
      const h1 = model.height(x1, z1) * rise
      const h2 = model.height(x2, z2) * rise
      // eng ustki qatlam — sirtgacha
      pushQuad([x1, levels[0], z1], [x2, levels[0], z2], [x2, Math.max(h2, levels[0]), z2], [x1, Math.max(h1, levels[0]), z1], bands[0])
      for (let b = 0; b < levels.length - 1; b++) {
        const shade = bands[Math.min(b, bands.length - 1)].clone().multiplyScalar(1 - b * 0.04)
        pushQuad([x1, levels[b + 1], z1], [x2, levels[b + 1], z2], [x2, levels[b], z2], [x1, levels[b], z1], shade)
      }
    }
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function radialTexture(inner, outer) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function createLandformScene(options) {
  const { info, quality } = options
  const full = quality === 'full'
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality, rootMargin: '0px', foreground: true })
  const renderer = stage.renderer
  if (full) {
    renderer.shadowMap.enabled = true
  }
  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.05, 50)

  const model = buildModel(info)
  const segments = full ? 96 : 64
  const RISE = 1

  // diorama guruhi: balandlik animatsiya bilan «o'sib» chiqadi
  const world = new Group()
  scene.add(world)
  const block = new Group()
  world.add(block)

  const topMat = new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0 })
  const top = new Mesh(buildTop(model, segments, RISE), topMat)
  top.castShadow = full
  top.receiveShadow = full
  block.add(top)

  const sideMat = new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })
  const sides = new Mesh(buildSides(model, Math.round(segments / 2), RISE), sideMat)
  block.add(sides)

  // soya / yorug'lik dog'i
  const shadow = new Mesh(
    new PlaneGeometry(SIZE * 2.4, SIZE * 2.4),
    new MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.42)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -DEPTH - 0.02
  world.add(shadow)

  // ── butalar / daraxtlar (instanced)
  const dummy = new Object3D()
  let shrubs = null
  if (model.shrubs) {
    const s = model.shrubs
    const geo = s.cone ? new IcosahedronGeometry(0.022, 0) : new DodecahedronGeometry(0.016, 0)
    if (s.cone) geo.scale(0.8, 1.8, 0.8)
    const mat = new MeshStandardMaterial({ color: s.color, flatShading: true, roughness: 1 })
    const count = full ? s.count : Math.round(s.count * 0.6)
    shrubs = new InstancedMesh(geo, mat, count)
    shrubs.castShadow = full
    let placed = 0
    let guard = 0
    while (placed < count && guard++ < count * 40) {
      const x = (Math.random() * 2 - 1) * 0.94
      const z = (Math.random() * 2 - 1) * 0.94
      const h = model.height(x, z)
      if (h > s.maxH || (s.minH && h < s.minH)) continue
      if (model.river && Math.abs(z - model.river(x)) < 0.05) continue
      const scale = 0.7 + Math.random() * 0.8
      dummy.position.set(x, h * RISE + 0.008 * scale, z)
      dummy.rotation.set(0, Math.random() * Math.PI, 0)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      shrubs.setMatrixAt(placed++, dummy.matrix)
    }
    shrubs.count = placed
    block.add(shrubs)
  }

  // ── bulutlar
  const clouds = []
  if (model.clouds) {
    const cloudMat = new MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, transparent: true, opacity: 0.92 })
    for (let i = 0; i < model.clouds; i++) {
      const g = new Group()
      const puffs = 3 + (i % 3)
      for (let p = 0; p < puffs; p++) {
        const puff = new Mesh(new IcosahedronGeometry(0.07 + Math.random() * 0.05, 1), cloudMat)
        puff.position.set(p * 0.08 - puffs * 0.04, Math.random() * 0.03, (Math.random() - 0.5) * 0.06)
        puff.scale.y = 0.6
        g.add(puff)
      }
      g.userData = { angle: (i / model.clouds) * Math.PI * 2, radius: 0.45 + (i % 3) * 0.2, y: 0.75 + (i % 2) * 0.14, speed: 0.06 + (i % 4) * 0.02 }
      clouds.push(g)
      world.add(g)
    }
  }

  // ── qum / chang zarralari
  let dust = null
  if (model.dust) {
    const count = full ? 700 : 300
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = Math.random() * 2 - 1
      arr[i * 3 + 1] = Math.random() * 0.45
      arr[i * 3 + 2] = Math.random() * 2 - 1
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(arr, 3))
    dust = new Points(
      geo,
      new PointsMaterial({ color: model.dust, size: 0.012, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true }),
    )
    world.add(dust)
  }

  // ── Darvoza «do'zax eshigi» — yonib turgan krater
  let craterLight = null
  let craterGlow = null
  if (model.crater) {
    const h = model.height(model.crater.x, model.crater.z)
    craterGlow = new Mesh(
      new RingGeometry(0.02, 0.1, 32),
      new MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false }),
    )
    craterGlow.rotation.x = -Math.PI / 2
    craterGlow.position.set(model.crater.x, h + 0.01, model.crater.z)
    block.add(craterGlow)
    craterLight = new PointLight(0xff6a00, 1.6, 0.9, 2)
    craterLight.position.set(model.crater.x, h + 0.08, model.crater.z)
    block.add(craterLight)
  }

  // ── yorug'lik
  const hemi = new HemisphereLight(0xdfefff, 0x6a5440, 1.25)
  scene.add(hemi)
  const sun = new DirectionalLight(0xfff1dc, 2.4)
  sun.position.set(2.2, 3, 1.4)
  if (full) {
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    const cam = sun.shadow.camera
    cam.left = cam.bottom = -1.6
    cam.right = cam.top = 1.6
    cam.near = 0.5
    cam.far = 8
    sun.shadow.bias = -0.0015
    sun.shadow.normalBias = 0.02
  }
  scene.add(sun)
  scene.add(sun.target)
  const rim = new DirectionalLight(0x9fd8ff, 0.6)
  rim.position.set(-2, 1.2, -2)
  scene.add(rim)

  // ── boshqaruv: sudrab aylantirish
  let yaw = -0.6
  let yawVel = 0
  let pitchOffset = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  const el = options.canvas
  const onDown = (e) => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
    el.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    yawVel = dx * 0.008
    yaw += yawVel
    pitchOffset = Math.max(-0.3, Math.min(0.35, pitchOffset + dy * 0.004))
  }
  const onUp = (e) => {
    dragging = false
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onUp)

  stage.onResize = (w, h) => {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  stage.onResize(stage.width, stage.height)

  let startTime = -1
  let scroll = 0
  let firstFrame = true
  const target = new Vector3()

  stage.onFrame = (dt, time) => {
    if (startTime < 0) startTime = time
    // soat bo'yicha — sekin qurilmada ham 1,6 soniyada «o'sib» chiqadi
    const grow = Math.min(1, (time - startTime) / 1.6)
    const g = 1 - Math.pow(1 - grow, 3)
    scroll = damp(scroll, options.scroll?.value ?? 0, 6, dt)

    if (!dragging) {
      yawVel = damp(yawVel, 0.0025, 2, dt)
      yaw += yawVel * (options.motion === false ? 0 : 1) * (dt * 60)
    }
    world.rotation.y = yaw
    // relyef «o'sadi», pastga aylantirganda ko'proq bo'rtadi
    block.scale.y = Math.max(0.02, g * (1 + scroll * 0.3))

    const pitch = lerp(0.5, 0.95, scroll) + pitchOffset
    const dist = lerp(4.3, 3.8, scroll) * (camera.aspect < 1 ? 1.45 : 1)
    camera.position.set(0, Math.sin(pitch) * dist, Math.cos(pitch) * dist)
    target.set(0, lerp(0.18, 0.05, scroll), 0)
    camera.lookAt(target)

    for (const cloud of clouds) {
      const d = cloud.userData
      d.angle += d.speed * dt
      cloud.position.set(Math.cos(d.angle) * d.radius, d.y * (0.6 + 0.4 * g) * (1 + scroll * 0.4), Math.sin(d.angle) * d.radius)
      cloud.rotation.y = -d.angle
    }
    if (dust) {
      const p = dust.geometry.attributes.position
      for (let i = 0; i < p.count; i++) {
        let x = p.getX(i) + dt * (0.22 + (i % 7) * 0.03)
        let y = p.getY(i) + Math.sin(time * 2 + i) * dt * 0.02
        if (x > 1) {
          x = -1
          y = Math.random() * 0.4 + 0.02
        }
        p.setX(i, x)
        p.setY(i, y)
      }
      p.needsUpdate = true
    }
    if (craterLight) {
      const flicker = 0.75 + Math.sin(time * 13) * 0.12 + Math.sin(time * 7.3) * 0.13
      craterLight.intensity = 1.6 * flicker * g
      craterGlow.material.opacity = 0.65 + flicker * 0.3
    }
    renderer.render(scene, camera)
    if (firstFrame) {
      firstFrame = false
      options.onFirstFrame?.()
    }
  }
  stage.onContextLost = () => options.onContextLost?.()
  stage.start()

  return {
    setTheme(dark) {
      hemi.intensity = dark ? 1.0 : 1.25
      sun.intensity = dark ? 2.1 : 2.4
    },
    dispose() {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      disposeObject(scene)
      stage.dispose()
    },
  }
}
