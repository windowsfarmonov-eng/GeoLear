import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { Stage, damp, disposeObject } from './core'
import { simplexNoise } from './glsl'

const viewVaryings = /* glsl */ `
varying vec3 vPos;
varying vec3 vN;
varying vec3 vV;
void main() {
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uActivity;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vV;
${simplexNoise}
void main() {
  vec3 p = normalize(vPos) * 1.7;
  float speed = 0.22 + uActivity * 0.35;
  float n = fbm(p + vec3(0.0, uTime * speed, uTime * speed * 0.7));
  float n2 = fbm(p * 2.2 - vec3(uTime * speed * 0.8));
  vec3 deep = vec3(0.01, 0.07, 0.13);
  vec3 teal = vec3(0.07, 0.78, 0.66);
  vec3 cyan = vec3(0.6, 0.98, 1.0);
  vec3 col = mix(deep, teal, smoothstep(-0.35, 0.55, n));
  col = mix(col, cyan, smoothstep(0.3, 0.75, n2) * (0.45 + 0.4 * uActivity));
  float facing = max(dot(normalize(vN), normalize(vV)), 0.0);
  col *= (0.45 + 0.85 * pow(facing, 0.8)) * (1.0 + uActivity * 0.5);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

const glassFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uTint;
uniform float uRim;
varying vec3 vPos;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(vV);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  vec3 H1 = normalize(normalize(vec3(-0.55, 0.7, 0.55)) + V);
  vec3 H2 = normalize(normalize(vec3(0.6, -0.45, 0.65)) + V);
  float spec = pow(max(dot(N, H1), 0.0), 90.0) * 0.85 + pow(max(dot(N, H2), 0.0), 36.0) * 0.16;
  float shift = 0.5 + 0.5 * sin(dot(normalize(vPos), vec3(2.2, 1.3, 0.4)) * 3.0 + uTime * 0.7);
  vec3 rimColor = mix(uTint, vec3(0.62, 0.84, 1.0), shift * 0.6);
  vec3 col = rimColor * fres * 1.25 * uRim + vec3(1.0) * spec;
  float alpha = clamp(fres * 0.85 * uRim + spec + 0.05, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`

const haloFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - d), 2.4) * uStrength;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`

export async function createAiOrb(options) {
  const full = options.quality === 'full'
  const stage = new Stage({ canvas: options.canvas, container: options.container, quality: options.quality })
  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.1, 50)
  camera.position.set(0, 0, 5.9)

  const orb = new Group()
  scene.add(orb)

  const coreUniforms = { uTime: { value: 0 }, uActivity: { value: 0 } }
  const core = new Mesh(
    new SphereGeometry(0.64, full ? 96 : 56, full ? 48 : 28),
    new ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: viewVaryings,
      fragmentShader: coreFragment,
      defines: { OCTAVES: full ? 5 : 3 },
    }),
  )
  orb.add(core)

  const glassUniforms = { uTime: { value: 0 }, uTint: { value: new Color().setStyle('#5ee6d6', SRGBColorSpace) }, uRim: { value: 1 } }
  const glass = new Mesh(
    new SphereGeometry(1, full ? 96 : 56, full ? 48 : 28),
    new ShaderMaterial({
      uniforms: glassUniforms,
      vertexShader: viewVaryings,
      fragmentShader: glassFragment,
      transparent: true,
      depthWrite: false,
    }),
  )
  glass.renderOrder = 2
  orb.add(glass)

  const haloUniforms = { uColor: { value: new Color().setStyle('#2fd8c6', SRGBColorSpace) }, uStrength: { value: 0.55 } }
  const haloMaterial = new ShaderMaterial({
    uniforms: haloUniforms,
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: haloFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const halo = new Mesh(new PlaneGeometry(4.2, 4.2), haloMaterial)
  halo.position.z = -1.2
  halo.renderOrder = -1
  scene.add(halo)

  const rings = []
  const satellites = []
  const ringSpecs = [
    { radius: 1.34, rotation: [1.15, 0.25, 0], color: '#3fd0c0' },
    { radius: 1.5, rotation: [1.9, -0.45, 0.4], color: '#7cc8ff' },
  ]
  for (const spec of ringSpecs) {
    const ring = new Mesh(
      new TorusGeometry(spec.radius, 0.0065, 8, 180),
      new MeshBasicMaterial({ color: new Color().setStyle(spec.color, SRGBColorSpace), transparent: true, opacity: 0.55 }),
    )
    ring.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2])
    orb.add(ring)
    rings.push(ring)
    if (full) {
      const sat = new Mesh(
        new SphereGeometry(0.04, 12, 8),
        new MeshBasicMaterial({ color: new Color().setStyle('#ffd27a', SRGBColorSpace) }),
      )
      ring.add(sat)
      sat.userData.radius = spec.radius
      satellites.push(sat)
    }
  }

  const setTheme = (dark) => {
    haloMaterial.blending = dark ? AdditiveBlending : NormalBlending
    haloMaterial.needsUpdate = true
    haloUniforms.uStrength.value = dark ? 0.55 : 0.35
    glassUniforms.uRim.value = dark ? 1 : 1.35
  }
  setTheme(options.dark)

  stage.onResize = (width, height) => {
    camera.aspect = width / height
    camera.position.z = 5.9 * Math.max(1, 1 / camera.aspect)
    camera.updateProjectionMatrix()
  }
  stage.onResize(stage.width, stage.height)

  let activity = 0
  let activityTarget = 0
  let firstFrame = true
  stage.onFrame = (dt, time) => {
    activity = damp(activity, activityTarget, 4, dt)
    coreUniforms.uTime.value = time
    coreUniforms.uActivity.value = activity
    glassUniforms.uTime.value = time
    orb.position.y = Math.sin(time * 0.9) * 0.07
    orb.rotation.y = time * 0.05
    core.scale.setScalar(1 + activity * 0.05 + Math.sin(time * (2 + activity * 4)) * 0.01 * (0.4 + activity))
    rings.forEach((ring, i) => {
      ring.rotation.z += dt * (0.18 + i * 0.07) * (1 + activity)
    })
    satellites.forEach((sat, i) => {
      const a = time * (0.6 + i * 0.25) * (1 + activity * 0.6) + i * 2
      const r = sat.userData.radius
      sat.position.set(Math.cos(a) * r, Math.sin(a) * r, 0)
    })
    stage.renderer.render(scene, camera)
    if (firstFrame) {
      firstFrame = false
      options.onFirstFrame?.()
    }
  }
  stage.start()

  return {
    /** 0..1 — AI "o'ylayotganda" orb yorqinroq va tezroq */
    setActivity(value) {
      activityTarget = value
    },
    setTheme,
    dispose() {
      disposeObject(scene)
      stage.dispose()
    },
  }
}
