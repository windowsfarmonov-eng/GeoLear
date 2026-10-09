import {
  AdditiveBlending,
  BackSide,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  Vector4,
} from 'three'
import { latLonToVector3, loadTexture } from './core'
import { simplexNoise } from './glsl'
import { TASHKENT } from '../../../content/geo'

/** central-asia-overlay.png qamrab olgan hudud: [lon0, lat0, lon1, lat1] (scripts bilan bir xil) */
const OVERLAY_BOUNDS = [44, 30, 92, 58]

export async function loadEarthTextures(quality) {
  const [day, night, water, overlay] = await Promise.all([
    loadTexture(quality === 'full' ? '/textures/earth-day-2k.webp' : '/textures/earth-day-1k.webp', { anisotropy: 8 }),
    quality === 'full' ? loadTexture('/textures/earth-night-2k.webp', { srgb: false }) : Promise.resolve(null),
    loadTexture('/textures/earth-water-1k.png', { srgb: false }),
    loadTexture('/textures/central-asia-overlay.png', { srgb: false }),
  ])
  return { day, night, water, overlay }
}

const overlayRect = () =>
  new Vector4(
    (OVERLAY_BOUNDS[0] + 180) / 360,
    (OVERLAY_BOUNDS[1] + 90) / 180,
    (OVERLAY_BOUNDS[2] + 180) / 360,
    (OVERLAY_BOUNDS[3] + 90) / 180,
  )

const earthVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosW = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const earthFragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uWater;
uniform sampler2D uOverlay;
uniform vec4 uOvRect;
uniform vec3 uSun;
uniform vec3 uTeal;
uniform vec3 uRim;
uniform float uTime;
uniform float uHighlight;
uniform float uDim;
uniform vec3 uDark;
uniform float uNightAmt;
uniform float uRimAmt;
uniform float uGrid;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSun);
  float ndl = dot(N, L);
  float dayAmt = smoothstep(-0.2, 0.38, ndl);

  vec3 albedo = texture2D(uDay, vUv).rgb;
  vec3 col = albedo * (0.07 + 1.08 * dayAmt);

  #ifdef USE_NIGHT
  float lights = texture2D(uNight, vUv).r;
  col += vec3(1.0, 0.68, 0.36) * lights * (1.0 - dayAmt) * uNightAmt;
  #endif

  float water = texture2D(uWater, vUv).r;
  vec3 H = normalize(L + V);
  col += vec3(0.7, 0.88, 1.0) * pow(max(dot(N, H), 0.0), 64.0) * water * 0.55 * dayAmt;

  // O'rta Osiyo (R), O'zbekiston (G) va chegaralar (B)
  vec2 ouv = (vUv - uOvRect.xy) / (uOvRect.zw - uOvRect.xy);
  vec3 ov = vec3(0.0);
  if (ouv.x > 0.0 && ouv.x < 1.0 && ouv.y > 0.0 && ouv.y < 1.0) ov = texture2D(uOverlay, ouv).rgb;
  float region = smoothstep(0.35, 0.65, ov.r);
  float uz = smoothstep(0.35, 0.65, ov.g);
  float pulse = 0.5 + 0.5 * sin(uTime * 2.2);
  vec3 tealLit = uTeal * (0.3 + 0.7 * max(dayAmt, 0.3));
  col = mix(col, col * 0.55 + tealLit * 0.5, region * 0.55 * uHighlight);
  col += tealLit * (uz * (0.22 + 0.26 * pulse) + ov.b * 0.9 + ov.r * 0.1) * uHighlight;

  // sho'ng'ish paytida globus qorong'ilashadi — relyef xarita «orol» kabi ajralib turadi
  col = mix(col, uDark, uDim * 0.97);

  // meridian va parallellar (logotipdagi kabi)
  vec2 g = vec2(vUv.x * 24.0, vUv.y * 12.0);
  vec2 gd = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-4));
  float line = 1.0 - min(min(gd.x, gd.y), 1.0);
  col = mix(col, col * 0.5 + uTeal * 0.55, line * uGrid * 0.32);

  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  col += uRim * fres * uRimAmt * (0.25 + 0.75 * smoothstep(-0.4, 0.4, ndl)) * (1.0 - 0.8 * uDim);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

const cloudsVertex = /* glsl */ `
varying vec3 vPosO;
varying vec3 vNormalW;
varying vec2 vUv;
void main() {
  vPosO = position;
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const cloudsFragment = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uSun;
uniform sampler2D uOverlay;
uniform vec4 uOvRect;
varying vec3 vPosO;
varying vec3 vNormalW;
varying vec2 vUv;
${simplexNoise}
void main() {
  vec3 p = normalize(vPosO) * 2.3 + vec3(uTime * 0.016, uTime * 0.004, uTime * 0.007);
  float n = fbm(p);
  float density = smoothstep(0.1, 0.6, n);
  // qutblarga yaqin bulutlar biroz ko'proq, ekvator yaqinida kamroq
  density *= 0.65 + 0.35 * smoothstep(0.1, 0.6, abs(vUv.y - 0.5) * 2.0);
  vec2 ouv = (vUv - uOvRect.xy) / (uOvRect.zw - uOvRect.xy);
  if (ouv.x > 0.0 && ouv.x < 1.0 && ouv.y > 0.0 && ouv.y < 1.0) {
    density *= 1.0 - 0.85 * texture2D(uOverlay, ouv).r;
  }
  float light = smoothstep(-0.25, 0.45, dot(normalize(vNormalW), normalize(uSun)));
  gl_FragColor = vec4(vec3(0.94, 0.97, 1.0) * (0.12 + 0.92 * light), density * 0.6 * uOpacity * (0.25 + 0.75 * light));
  #include <colorspace_fragment>
}
`

const atmosphereVertex = /* glsl */ `
varying vec3 vNView;
varying vec3 vViewDir;
varying vec3 vNormalW;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNView = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * mv;
}
`

const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSun;
uniform float uStrength;
uniform float uEdge;
varying vec3 vNView;
varying vec3 vViewDir;
varying vec3 vNormalW;
void main() {
  float d = dot(normalize(vNView), normalize(vViewDir));
  float glow = pow(smoothstep(0.0, uEdge, -d), 1.7);
  float sunSide = 0.4 + 0.6 * smoothstep(-0.5, 0.6, dot(normalize(vNormalW), normalize(uSun)));
  gl_FragColor = vec4(uColor, clamp(glow * sunSide * uStrength, 0.0, 1.0));
  #include <colorspace_fragment>
}
`

const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(uColor, (1.0 - vUv.y) * uOpacity);
  #include <colorspace_fragment>
}
`

const TEAL = '#33c6b5'
/** Sho'ng'ish oxirida globus shu rangga qorayadi (relyef chetlari ham) */
export const DARK = '#0e131b'

function createEarthUniforms(textures, sun) {
  return {
    uDay: { value: textures.day },
    uNight: { value: textures.night },
    uWater: { value: textures.water },
    uOverlay: { value: textures.overlay },
    uOvRect: { value: overlayRect() },
    uSun: { value: sun },
    uTeal: { value: new Color(TEAL) },
    uRim: { value: new Color('#7fd8ff') },
    uTime: { value: 0 },
    uHighlight: { value: 1 },
    uDim: { value: 0 },
    uDark: { value: new Color(DARK) },
    uNightAmt: { value: 1.6 },
    uRimAmt: { value: 0.4 },
    uGrid: { value: 0.4 },
  }
}

function createCloudUniforms(textures, sun) {
  return {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uSun: { value: sun },
    uOverlay: { value: textures.overlay },
    uOvRect: { value: overlayRect() },
  }
}

function createAtmosphereUniforms(scale, sun) {
  return {
    uColor: { value: new Color('#5cc8f0') },
    uSun: { value: sun },
    uStrength: { value: 0.95 },
    uEdge: { value: Math.sqrt(1 - 1 / (scale * scale)) },
  }
}

export class Earth {
  /** Og'ish (tilt) guruhi */
  root = new Group()
  /** Aylanish (spin) guruhi — yer, bulutlar va marker shu yerda */
  spin = new Group()
  uniforms
  cloudUniforms
  atmosphereUniforms
  markerPosition = new Vector3()

  clouds
  atmosphere
  rings = []
  sun = new Vector3(-0.62, 0.42, 0.72).normalize()

  constructor(textures, options) {
    const full = options.quality === 'full'
    const segments = full ? 128 : 72
    this.root.add(this.spin)

    this.uniforms = createEarthUniforms(textures, this.sun)
    const earth = new Mesh(
      new SphereGeometry(1, segments, segments / 2),
      new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: earthVertex,
        fragmentShader: earthFragment,
        defines: textures.night ? { USE_NIGHT: '' } : {},
      }),
    )
    earth.renderOrder = 0
    this.spin.add(earth)

    this.cloudUniforms = createCloudUniforms(textures, this.sun)
    if (options.clouds !== false) {
      const clouds = new Mesh(
        new SphereGeometry(1.012, full ? 96 : 56, full ? 48 : 28),
        new ShaderMaterial({
          uniforms: this.cloudUniforms,
          vertexShader: cloudsVertex,
          fragmentShader: cloudsFragment,
          defines: { OCTAVES: full ? 5 : 3 },
          transparent: true,
          depthWrite: false,
        }),
      )
      clouds.renderOrder = 2
      this.spin.add(clouds)
      this.clouds = clouds
    } else {
      this.clouds = null
    }

    const atmosphereScale = options.atmosphereScale ?? 1.085
    this.atmosphereUniforms = createAtmosphereUniforms(atmosphereScale, this.sun)
    this.atmosphere = new Mesh(
      new SphereGeometry(atmosphereScale, 64, 32),
      new ShaderMaterial({
        uniforms: this.atmosphereUniforms,
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: BackSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    this.atmosphere.renderOrder = 3
    this.root.add(this.atmosphere)

    if (options.marker !== false) this.buildMarker()
  }

  buildMarker() {
    const normal = latLonToVector3(TASHKENT.lat, TASHKENT.lon, 1)
    this.markerPosition.copy(normal).multiplyScalar(1.004)
    const marker = new Group()
    const teal = new Color(TEAL)

    const dot = new Mesh(new SphereGeometry(0.0095, 16, 12), new MeshBasicMaterial({ color: '#e6fffb' }))
    dot.position.copy(normal).multiplyScalar(1.003)
    marker.add(dot)

    for (let i = 0; i < 2; i++) {
      const ring = new Mesh(
        new RingGeometry(0.015, 0.0205, 48),
        new MeshBasicMaterial({ color: teal, transparent: true, opacity: 0.9, depthWrite: false, side: DoubleSide }),
      )
      ring.position.copy(normal).multiplyScalar(1.0035)
      ring.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
      ring.renderOrder = 1
      marker.add(ring)
      this.rings.push(ring)
    }

    const beam = new Mesh(
      new CylinderGeometry(0.0026, 0.0026, 0.17, 8, 1, true),
      new ShaderMaterial({
        uniforms: { uColor: { value: teal }, uOpacity: { value: 0.85 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    beam.position.copy(normal).multiplyScalar(1.085)
    beam.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), normal)
    beam.renderOrder = 1
    marker.add(beam)

    this.spin.add(marker)
  }

  setTheme(dark) {
    const material = this.atmosphere.material
    material.blending = dark ? AdditiveBlending : NormalBlending
    material.needsUpdate = true
    this.atmosphereUniforms.uStrength.value = dark ? 0.95 : 0.7
    this.atmosphereUniforms.uColor.value.set(dark ? '#5cc8f0' : '#3fb3c6')
    this.uniforms.uRimAmt.value = dark ? 0.4 : 0.3
  }

  setCloudOpacity(value) {
    this.cloudUniforms.uOpacity.value = value
    if (this.clouds) this.clouds.visible = value > 0.01
  }

  update(time) {
    this.uniforms.uTime.value = time
    this.cloudUniforms.uTime.value = time
    for (let i = 0; i < this.rings.length; i++) {
      const phase = (time * 0.55 + i * 0.5) % 1
      const ring = this.rings[i]
      ring.scale.setScalar(1 + phase * 2.6)
      ring.material.opacity = 0.9 * (1 - phase) * (1 - phase)
    }
  }
}
