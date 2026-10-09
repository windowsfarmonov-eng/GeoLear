import {
  BoxGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Stage, damp, disposeObject } from './core'

const srgb = (hex) => new Color().setStyle(hex, SRGBColorSpace)

function createMaterials() {
  const std = (hex, roughness = 0.45, metalness = 0.05, extra = {}) =>
    Object.assign(new MeshStandardMaterial({ color: srgb(hex), roughness, metalness }), extra)
  return {
    teal: std('#2fb1a4', 0.38, 0.1),
    tealDeep: std('#1b7e74', 0.45, 0.1),
    tealGlow: std('#3fe0cf', 0.3, 0, { emissive: srgb('#2fd8c6'), emissiveIntensity: 1.4 }),
    paper: std('#eef3f6', 0.6),
    slate: std('#2b3646', 0.5, 0.15),
    slateLight: std('#4b5c74', 0.5, 0.1),
    gold: std('#e9b85a', 0.24, 0.85),
    sand: std('#e7c07a', 0.5, 0.1),
    sandGlow: std('#ffd27a', 0.3, 0, { emissive: srgb('#ffc861'), emissiveIntensity: 1.2 }),
    red: std('#ef5b5b', 0.35),
    blue: std('#4c8dff', 0.35),
    yellow: std('#f5c542', 0.35),
    green: std('#3fbf7f', 0.35),
  }
}
function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new Mesh(geometry, material)
  m.position.set(x, y, z)
  return m
}

// ───────────────────────── ikonkalar ─────────────────────────

function book(m) {
  const g = new Group()
  for (const side of [-1, 1]) {
    const pivot = new Group()
    pivot.add(mesh(new RoundedBoxGeometry(1.0, 1.34, 0.07, 3, 0.03), m.teal, side * 0.5, 0, 0))
    pivot.add(mesh(new BoxGeometry(0.93, 1.25, 0.09), m.paper, side * 0.49, 0, 0.075))
    for (let i = 0; i < 5; i++) {
      const w = i === 0 ? 0.42 : 0.62 - (i % 2) * 0.16
      pivot.add(
        mesh(
          new BoxGeometry(w, i === 0 ? 0.06 : 0.035, 0.012),
          i === 0 ? m.tealDeep : m.slateLight,
          side * (0.49 - (0.62 - w) / 2),
          0.4 - i * 0.18,
          0.124,
        ),
      )
    }
    pivot.rotation.y = -side * 0.42
    g.add(pivot)
  }
  g.add(mesh(new CylinderGeometry(0.05, 0.05, 1.34, 12), m.tealDeep, 0, 0, -0.01))
  g.add(mesh(new BoxGeometry(0.07, 0.42, 0.012), m.sand, 0.12, -0.78, 0.15))
  g.rotation.x = -0.22
  return g
}

function gamepad(m) {
  const g = new Group()
  const body = mesh(new CapsuleGeometry(0.42, 0.92, 8, 24), m.slateLight)
  body.rotation.z = Math.PI / 2
  body.scale.set(1, 1, 0.55)
  g.add(body)
  for (const side of [-1, 1]) {
    const grip = mesh(new CapsuleGeometry(0.25, 0.42, 6, 16), m.slateLight, side * 0.66, -0.34, 0)
    grip.rotation.z = side * 0.55
    grip.scale.set(1, 1, 0.6)
    g.add(grip)
  }
  g.add(mesh(new RoundedBoxGeometry(0.38, 0.12, 0.08, 2, 0.03), m.slate, -0.5, 0.03, 0.24))
  g.add(mesh(new RoundedBoxGeometry(0.12, 0.38, 0.08, 2, 0.03), m.slate, -0.5, 0.03, 0.24))
  const buttons = [
    [m.yellow, 0, 0.14],
    [m.blue, -0.14, 0],
    [m.green, 0.14, 0],
    [m.red, 0, -0.14],
  ]
  for (const [mat, dx, dy] of buttons) g.add(mesh(new SphereGeometry(0.075, 16, 12), mat, 0.5 + dx, 0.03 + dy, 0.22))
  g.add(mesh(new CapsuleGeometry(0.03, 0.08, 4, 8), m.tealGlow, -0.1, 0.16, 0.22))
  g.add(mesh(new CapsuleGeometry(0.03, 0.08, 4, 8), m.tealGlow, 0.1, 0.16, 0.22))
  g.children.slice(-2).forEach((c) => (c.rotation.z = Math.PI / 2))
  g.rotation.x = 0.35
  g.scale.setScalar(0.95)
  return g
}

function trophy(m) {
  const g = new Group()
  const profile = [
    [0.0, 0.16],
    [0.16, 0.17],
    [0.34, 0.3],
    [0.45, 0.55],
    [0.5, 0.86],
    [0.52, 1.02],
    [0.47, 1.02],
    [0.45, 0.86],
    [0.4, 0.58],
    [0.0, 0.34],
  ].map(([x, y]) => new Vector2(x, y))
  const cupMaterial = m.gold.clone()
  cupMaterial.side = DoubleSide
  g.add(new Mesh(new LatheGeometry(profile, 48), cupMaterial))
  const band = mesh(new TorusGeometry(0.47, 0.022, 10, 48), m.teal, 0, 0.62, 0)
  band.rotation.x = Math.PI / 2
  g.add(band)
  for (const side of [-1, 1]) {
    const handle = mesh(new TorusGeometry(0.19, 0.045, 12, 28, Math.PI), m.gold, side * 0.47, 0.68, 0)
    handle.rotation.z = -side * (Math.PI / 2)
    g.add(handle)
  }
  g.add(mesh(new CylinderGeometry(0.07, 0.11, 0.34, 20), m.gold, 0, 0.0, 0))
  g.add(mesh(new CylinderGeometry(0.3, 0.34, 0.1, 32), m.gold, 0, -0.2, 0))
  g.add(mesh(new RoundedBoxGeometry(0.82, 0.22, 0.52, 3, 0.06), m.slate, 0, -0.36, 0))
  g.add(mesh(new BoxGeometry(0.36, 0.06, 0.02), m.sand, 0, -0.36, 0.265))
  g.position.y = -0.3
  const wrap = new Group()
  wrap.add(g)
  wrap.scale.setScalar(1.05)
  return wrap
}

function film(m) {
  const g = new Group()
  const reel = new Group()
  const disc = mesh(new CylinderGeometry(0.72, 0.72, 0.16, 56), m.teal)
  disc.rotation.x = Math.PI / 2
  reel.add(disc)
  for (const z of [-0.085, 0.085]) {
    reel.add(mesh(new TorusGeometry(0.72, 0.03, 10, 64), m.tealDeep, 0, 0, z))
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3
    const hole = mesh(new CylinderGeometry(0.15, 0.15, 0.18, 28), m.slate, Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0)
    hole.rotation.x = Math.PI / 2
    reel.add(hole)
  }
  const hub = mesh(new CylinderGeometry(0.11, 0.11, 0.22, 20), m.paper)
  hub.rotation.x = Math.PI / 2
  reel.add(hub)
  g.add(reel)

  const strip = new Group()
  strip.add(mesh(new BoxGeometry(1.05, 0.32, 0.025), m.slate))
  for (let i = 0; i < 8; i++) {
    for (const y of [-0.115, 0.115]) strip.add(mesh(new BoxGeometry(0.06, 0.045, 0.03), m.paper, -0.44 + i * 0.125, y, 0.004))
  }
  for (let i = 0; i < 3; i++) strip.add(mesh(new BoxGeometry(0.22, 0.13, 0.03), m.sand, -0.3 + i * 0.3, 0, 0.004))
  strip.position.set(0.55, -0.62, 0.12)
  strip.rotation.z = -0.32
  g.add(strip)
  g.position.set(-0.12, 0.12, 0)
  return g
}

function robot(m) {
  const g = new Group()
  g.add(mesh(new RoundedBoxGeometry(1.22, 0.94, 0.82, 5, 0.24), m.paper))
  g.add(mesh(new RoundedBoxGeometry(0.94, 0.58, 0.1, 4, 0.14), m.slate, 0, 0, 0.38))
  for (const side of [-1, 1]) {
    g.add(mesh(new CapsuleGeometry(0.065, 0.1, 6, 12), m.tealGlow, side * 0.2, 0.04, 0.44))
    const ear = mesh(new CylinderGeometry(0.13, 0.13, 0.12, 20), m.teal, side * 0.66, 0, 0)
    ear.rotation.z = Math.PI / 2
    g.add(ear)
  }
  const smile = mesh(new TorusGeometry(0.1, 0.02, 8, 20, Math.PI), m.tealGlow, 0, -0.08, 0.44)
  smile.rotation.z = Math.PI
  g.add(smile)
  g.add(mesh(new CylinderGeometry(0.025, 0.025, 0.28, 10), m.slateLight, 0, 0.6, 0))
  g.add(mesh(new SphereGeometry(0.08, 16, 12), m.sandGlow, 0, 0.78, 0))
  g.position.y = -0.08
  return g
}

function clipboard(m) {
  const g = new Group()
  g.add(mesh(new RoundedBoxGeometry(1.12, 1.44, 0.08, 3, 0.08), m.tealDeep))
  g.add(mesh(new BoxGeometry(0.94, 1.2, 0.02), m.paper, 0, -0.06, 0.05))
  g.add(mesh(new RoundedBoxGeometry(0.52, 0.2, 0.13, 3, 0.05), m.slate, 0, 0.68, 0.07))
  const rows = [0.32, 0.0, -0.32]
  rows.forEach((y, i) => {
    g.add(mesh(new RoundedBoxGeometry(0.17, 0.17, 0.03, 2, 0.03), i < 2 ? m.teal : m.slateLight, -0.3, y, 0.07))
    g.add(mesh(new BoxGeometry(0.42, 0.045, 0.015), m.slateLight, 0.12, y + 0.03, 0.068))
    g.add(mesh(new BoxGeometry(0.28, 0.035, 0.015), m.slateLight, 0.05, y - 0.05, 0.068))
    if (i < 2) {
      const curve = new CatmullRomCurve3(
        [new Vector3(-0.37, y, 0.1), new Vector3(-0.31, y - 0.06, 0.1), new Vector3(-0.2, y + 0.09, 0.1)],
        false,
        'catmullrom',
        0,
      )
      g.add(new Mesh(new TubeGeometry(curve, 12, 0.022, 6, false), m.paper))
    }
  })
  g.add(mesh(new SphereGeometry(0.06, 16, 12), m.sandGlow, 0.4, -0.56, 0.08))
  return g
}

function chart(m) {
  const g = new Group()
  g.add(mesh(new RoundedBoxGeometry(1.6, 0.08, 0.72, 2, 0.03), m.slateLight, 0, -0.66, 0))
  const shades = ['#1b7e74', '#24998d', '#2fb1a4', '#4fd1c2']
  const heights = [0.55, 0.92, 0.7, 1.18]
  const bars = []
  heights.forEach((h, i) => {
    const geometry = new RoundedBoxGeometry(0.26, 1, 0.26, 2, 0.05)
    geometry.translate(0, 0.5, 0)
    const bar = new Mesh(geometry, new MeshStandardMaterial({ color: srgb(shades[i]), roughness: 0.4, metalness: 0.1 }))
    bar.position.set(-0.54 + i * 0.36, -0.62, 0)
    bar.scale.y = h
    bar.userData.height = h
    bars.push(bar)
    g.add(bar)
  })
  const dot = mesh(new SphereGeometry(0.075, 16, 12), m.sandGlow, 0.54, 0.62, 0)
  g.add(dot)
  g.userData.animate = (time) => {
    bars.forEach((bar, i) => {
      bar.scale.y = bar.userData.height * (0.88 + 0.12 * Math.sin(time * 1.4 + i * 1.1))
    })
    dot.position.y = -0.62 + bars[3].scale.y + 0.1
  }
  return g
}

const builders = { book, gamepad, trophy, film, robot, clipboard, chart }

// ───────────────────────── sahna ─────────────────────────

export async function createFeatureIcons(options) {
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality: options.quality })
  const renderer = stage.renderer
  renderer.autoClear = false

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envTarget.texture
  scene.environmentIntensity = 0.75
  pmrem.dispose()

  scene.add(new HemisphereLight(srgb('#d7f4ff'), srgb('#1d2a33'), 1.1))
  const key = new DirectionalLight(srgb('#ffffff'), 2.4)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new DirectionalLight(srgb('#3fd0c0'), 1.6)
  rim.position.set(-4, 1.5, -3)
  scene.add(rim)

  const materials = createMaterials()
  const camera = new PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0.2, 5.2)
  camera.lookAt(0, 0, 0)

  const icons = options.slots.map((slot, index) => {
    const object = builders[slot.kind](materials)
    const holder = new Group()
    holder.add(object)
    holder.visible = false
    scene.add(holder)
    const state = { slot, holder, object, phase: index * 1.3 }
    return { state }
  })

  let firstFrame = true
  stage.onFrame = (dt, time) => {
    const canvasRect = options.canvas.getBoundingClientRect()
    renderer.setScissorTest(false)
    renderer.clear()
    renderer.setScissorTest(true)
    for (const icon of icons) {
      const s = icon.state
      const rect = s.slot.el.getBoundingClientRect()
      if (rect.width < 2 || rect.bottom < 0 || rect.top > window.innerHeight) continue
      s.holder.rotation.y = Math.sin(time * 0.55 + s.phase) * 0.5
      s.holder.position.y = Math.sin(time * 1.1 + s.phase) * 0.05
      const animate = s.object.userData.animate
      animate?.(time)

      const left = rect.left - canvasRect.left
      const bottom = canvasRect.bottom - rect.bottom
      renderer.setViewport(left, bottom, rect.width, rect.height)
      renderer.setScissor(left, bottom, rect.width, rect.height)
      camera.aspect = rect.width / rect.height
      // tor joylarda ikonka to'liq sig'ishi uchun masofani moslaymiz
      camera.position.z = 5.2 * Math.max(1, 1 / camera.aspect)
      camera.updateProjectionMatrix()
      for (const other of icons) other.state.holder.visible = other === icon
      renderer.render(scene, camera)
    }
    if (firstFrame) {
      firstFrame = false
      options.onFirstFrame?.()
    }
  }
  stage.start()

  return {
    dispose() {
      envTarget.dispose()
      for (const material of Object.values(materials)) material.dispose()
      disposeObject(scene)
      stage.dispose()
    },
  }
}
