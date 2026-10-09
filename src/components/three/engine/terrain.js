import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  Mesh,
  SRGBColorSpace,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from 'three'
import { latLonToVector3, readPixels, smoothstep } from './core'
import { DARK } from './earth'

export async function loadTerrainSource() {
  const [geo, height, color, region] = await Promise.all([
    fetch('/geo/central-asia.json').then((r) => {
      if (!r.ok) throw new Error('central-asia.json yuklanmadi')
      return r.json()
    }),
    readPixels('/geo/central-asia-terrain.png'),
    readPixels('/geo/central-asia-color.webp'),
    readPixels('/textures/central-asia-overlay.png'),
  ])
  return { geo, height, color, region }
}

/** Ajratiladigan (separable) box blur — niqob chetlarini yumshatish uchun */
function blurGrid(grid, cols, rows, radius, passes) {
  const tmp = new Float32Array(grid.length)
  for (let pass = 0; pass < passes; pass++) {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let sum = 0
        let n = 0
        for (let d = -radius; d <= radius; d++) {
          const x = i + d
          if (x < 0 || x >= cols) continue
          sum += grid[j * cols + x]
          n++
        }
        tmp[j * cols + i] = sum / n
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let sum = 0
        let n = 0
        for (let d = -radius; d <= radius; d++) {
          const y = j + d
          if (y < 0 || y >= rows) continue
          sum += tmp[y * cols + i]
          n++
        }
        grid[j * cols + i] = sum / n
      }
    }
  }
}

/** Rasm kanalini kenglik/uzunlik bo'yicha bilinear o'qish */
function sampler(image, bounds) {
  const [lon0, lat0, lon1, lat1] = bounds
  const { width, height, data } = image
  return (lat, lon, channel) => {
    const x = Math.min(width - 1, Math.max(0, ((lon - lon0) / (lon1 - lon0)) * (width - 1)))
    const y = Math.min(height - 1, Math.max(0, ((lat1 - lat) / (lat1 - lat0)) * (height - 1)))
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = Math.min(width - 1, x0 + 1)
    const y1 = Math.min(height - 1, y0 + 1)
    const fx = x - x0
    const fy = y - y0
    const at = (xx, yy) => data[(yy * width + xx) * 4 + channel]
    const top = at(x0, y0) * (1 - fx) + at(x1, y0) * fx
    const bottom = at(x0, y1) * (1 - fx) + at(x1, y1) * fx
    return (top * (1 - fy) + bottom * fy) / 255
  }
}

// Stilizatsiyalangan gipsometrik palitra (balandlik → rang), sRGB
const PALETTE = [
  [0.0, '#d9c497'],
  [0.08, '#cdb985'],
  [0.18, '#b4ad78'],
  [0.3, '#93926a'],
  [0.44, '#7f735e'],
  [0.6, '#8f8781'],
  [0.76, '#cfd5dc'],
  [1.0, '#ffffff'],
]
const paletteColors = PALETTE.map(([stop, hex]) => [stop, new Color().setStyle(hex, SRGBColorSpace)])
const WATER = new Color().setStyle('#2a8fbf', SRGBColorSpace)
/** Xaritada chiziladigan daryolar (7-sinf mavzulari: Amudaryo, Sirdaryo, Zarafshon) */
const SHOWN_RIVERS = new Set(['amu', 'syr', 'zarafshon'])
const UZ_TINT = new Color().setStyle('#35c7b6', SRGBColorSpace)

/** Deterministik psevdo-tasodifiy son 0..1 (panjara tugunlari uchun) */
function hash(i, j) {
  const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function hypsometric(h, target) {
  for (let i = 1; i < paletteColors.length; i++) {
    const [stop, color] = paletteColors[i]
    if (h <= stop) {
      const [prevStop, prev] = paletteColors[i - 1]
      return target.copy(prev).lerp(color, (h - prevStop) / (stop - prevStop))
    }
  }
  return target.copy(paletteColors[paletteColors.length - 1][1])
}

const terrainVertex = /* glsl */ `
attribute float aHeight;
attribute float aEdge;
attribute vec3 aSat;
attribute vec3 aStyl;
attribute float aWater;
uniform float uHScale;
uniform float uExag;
uniform float uMix;
flat varying vec3 vColor;
flat varying float vWater;
varying vec3 vPosW;
varying float vEdge;
varying float vStyl;
void main() {
  vec3 n = normalize(position);
  vec3 p = position + n * (aHeight * uExag * uHScale);
  vec4 worldPos = modelMatrix * vec4(p, 1.0);
  vPosW = worldPos.xyz;
  // chetlarga yaqin joyda sun'iy yo'ldosh ranglari qoladi — globus bilan silliq tutashadi
  vStyl = uMix * aEdge;
  vColor = mix(aSat, aStyl, vStyl);
  vWater = aWater;
  vEdge = aEdge;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const terrainFragment = /* glsl */ `
uniform vec3 uSun;
uniform vec3 uWaterColor;
uniform float uOpacity;
uniform float uTime;
uniform float uDim;
uniform vec3 uDark;
flat varying vec3 vColor;
flat varying float vWater;
varying vec3 vPosW;
varying float vEdge;
varying float vStyl;
void main() {
  vec3 N = normalize(cross(dFdx(vPosW), dFdy(vPosW)));
  if (dot(N, vPosW) < 0.0) N = -N;
  float diff = max(dot(N, normalize(uSun)), 0.0);
  vec3 col = vColor * mix(1.1, 0.4 + 0.85 * diff, vStyl);
  if (vWater > 0.5) {
    float shimmer = 0.5 + 0.5 * sin(vPosW.x * 260.0 + vPosW.y * 190.0 + uTime * 1.6);
    col = mix(col, uWaterColor * (0.9 + 0.2 * shimmer), vStyl * 0.9);
  }
  // chetlar globus bilan bir xil qorong'i rangga o'tadi
  col = mix(uDark, col, mix(1.0, smoothstep(0.02, 0.75, vEdge), uDim));
  float alpha = uOpacity * smoothstep(0.0, 0.35, vEdge);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`

const lineVertex = /* glsl */ `
attribute float aHeight;
attribute float aEdge;
uniform float uHScale;
uniform float uExag;
uniform float uLift;
varying float vT;
varying float vEdge;
void main() {
  vec3 n = normalize(position);
  vec3 p = position + n * (aHeight * uExag * uHScale + uLift * uHScale);
  vT = uv.x;
  vEdge = aEdge;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const lineFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uDraw;
uniform float uOpacity;
uniform float uTime;
uniform float uDashes;
varying float vT;
varying float vEdge;
void main() {
  if (vT > uDraw) discard;
  float flow = 0.72 + 0.28 * sin(vT * 90.0 - uTime * 3.0);
  float alpha = uOpacity * smoothstep(0.08, 0.55, vEdge);
  if (uDashes > 0.0) alpha *= step(0.42, fract(vT * uDashes - uTime * 0.15));
  gl_FragColor = vec4(uColor * flow, alpha);
  #include <colorspace_fragment>
}
`

export function buildTerrain(source, options) {
  const { geo } = source
  const [lon0, lat0, lon1, lat1] = geo.bounds
  const exaggeration = options.exaggeration ?? 0.042
  const heightSample = sampler(source.height, geo.bounds)
  const colorSample = sampler(source.color, geo.bounds)

  const regionSample = sampler(source.region, geo.overlayBounds)

  // ── Hudud niqobi: O'rta Osiyo davlatlari + ko'l/dengizlar, chetlari yumshatilgan.
  // Relyef aynan shu shaklda «ko'tariladi», atrofi esa globus bilan birga qorayadi.
  const maskCols = 150
  const maskRows = 66
  const mask = new Float32Array(maskCols * maskRows)
  for (let j = 0; j < maskRows; j++) {
    const lat = lat1 - (j / (maskRows - 1)) * (lat1 - lat0)
    for (let i = 0; i < maskCols; i++) {
      const lon = lon0 + (i / (maskCols - 1)) * (lon1 - lon0)
      mask[j * maskCols + i] = Math.max(regionSample(lat, lon, 0), heightSample(lat, lon, 1))
    }
  }
  blurGrid(mask, maskCols, maskRows, 3, 3)
  const maskAt = (lat, lon) => {
    const x = Math.min(maskCols - 1, Math.max(0, ((lon - lon0) / (lon1 - lon0)) * (maskCols - 1)))
    const y = Math.min(maskRows - 1, Math.max(0, ((lat1 - lat) / (lat1 - lat0)) * (maskRows - 1)))
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = Math.min(maskCols - 1, x0 + 1)
    const y1 = Math.min(maskRows - 1, y0 + 1)
    const fx = x - x0
    const fy = y - y0
    const top = mask[y0 * maskCols + x0] * (1 - fx) + mask[y0 * maskCols + x1] * fx
    const bottom = mask[y1 * maskCols + x0] * (1 - fx) + mask[y1 * maskCols + x1] * fx
    return top * (1 - fy) + bottom * fy
  }

  const edgeAt = (lat, lon) => {
    const fx = (lon - lon0) / (lon1 - lon0)
    const fy = (lat - lat0) / (lat1 - lat0)
    const rect = smoothstep(0, 0.1, Math.min(fx, 1 - fx)) * smoothstep(0, 0.16, Math.min(fy, 1 - fy))
    return rect * smoothstep(0.12, 0.75, maskAt(lat, lon))
  }
  const heightAt = (lat, lon) => {
    const h = heightSample(lat, lon, 0)
    const water = heightSample(lat, lon, 1) > 0.5
    return water ? 0 : Math.pow(h, 1.15) * edgeAt(lat, lon)
  }

  // ── Relyef to'ri
  const cols = options.quality === 'full' ? 168 : 96
  const rows = Math.round(cols / 1.72)
  const vertexCount = (cols + 1) * (rows + 1)
  const positions = new Float32Array(vertexCount * 3)
  const heights = new Float32Array(vertexCount)
  const edges = new Float32Array(vertexCount)
  const sat = new Float32Array(vertexCount * 3)
  const styl = new Float32Array(vertexCount * 3)
  const water = new Float32Array(vertexCount)
  const tmp = new Vector3()
  const c = new Color()
  const cs = new Color()

  for (let j = 0, k = 0; j <= rows; j++) {
    const lat = lat1 - (j / rows) * (lat1 - lat0)
    for (let i = 0; i <= cols; i++, k++) {
      const lon = lon0 + (i / cols) * (lon1 - lon0)
      latLonToVector3(lat, lon, 1.0008, tmp)
      positions.set([tmp.x, tmp.y, tmp.z], k * 3)
      const isWater = heightSample(lat, lon, 1) > 0.5
      const edge = edgeAt(lat, lon)
      const h = isWater ? 0 : Math.pow(heightSample(lat, lon, 0), 1.15) * edge
      heights[k] = h
      edges[k] = edge
      water[k] = isWater ? 1 : 0

      cs.setRGB(colorSample(lat, lon, 0), colorSample(lat, lon, 1), colorSample(lat, lon, 2), SRGBColorSpace)
      sat.set([cs.r, cs.g, cs.b], k * 3)

      if (isWater) c.copy(WATER)
      else {
        hypsometric(h, c)
        // tabiiy rang tafovutlari saqlansin (cho'l, vodiy, tog')
        c.lerp(cs, 0.28)
        const uz = heightSample(lat, lon, 2)
        if (uz > 0.02) c.lerp(UZ_TINT, uz * 0.2)
        // low-poly uslubi: har bir yuzaga ozgina tasodifiy yorug'lik farqi
        const jitter = 1 + (hash(i, j) - 0.5) * 0.09
        c.multiplyScalar(jitter)
      }
      styl.set([c.r, c.g, c.b], k * 3)
    }
  }

  const indices = new Uint32Array(cols * rows * 6)
  for (let j = 0, n = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i
      const b = a + 1
      const d = a + cols + 1
      const e = d + 1
      // diagonalni almashtirib turamiz — "low-poly" uchburchaklar naqshi
      if ((i + j) % 2 === 0) indices.set([a, d, b, b, d, e], n)
      else indices.set([a, d, e, a, e, b], n)
      n += 6
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aHeight', new BufferAttribute(heights, 1))
  geometry.setAttribute('aEdge', new BufferAttribute(edges, 1))
  geometry.setAttribute('aSat', new BufferAttribute(sat, 3))
  geometry.setAttribute('aStyl', new BufferAttribute(styl, 3))
  geometry.setAttribute('aWater', new BufferAttribute(water, 1))
  geometry.setIndex(new BufferAttribute(indices, 1))
  geometry.computeBoundingSphere()

  const sun = new Vector3(-0.55, 0.62, 0.56).normalize()
  const shared = {
    uHScale: { value: 0 },
    uExag: { value: exaggeration },
    uTime: { value: 0 },
  }
  const terrainUniforms = {
    ...shared,
    uMix: { value: 0 },
    uOpacity: { value: 0 },
    uDim: { value: 0 },
    uDark: { value: new Color(DARK) },
    uSun: { value: sun },
    uWaterColor: { value: WATER.clone() },
  }
  const mesh = new Mesh(
    geometry,
    new ShaderMaterial({
      uniforms: terrainUniforms,
      vertexShader: terrainVertex,
      fragmentShader: terrainFragment,
      transparent: true,
      depthWrite: true,
    }),
  )
  mesh.renderOrder = 4
  mesh.frustumCulled = false

  const group = new Group()
  group.add(mesh)

  // ── Daryolar va O'zbekiston chegarasi
  const lineMaterials = []
  const makeLine = (coords, radius, color, lift, dashes) => {
    if (coords.length < 2) return
    const points = coords.map(([lon, lat]) => latLonToVector3(lat, lon, 1.0008))
    const curve = new CatmullRomCurve3(points, false, 'centripetal')
    const segments = Math.min(900, Math.max(24, coords.length * 6))
    const tube = new TubeGeometry(curve, segments, radius, 5, false)
    const pos = tube.getAttribute('position')
    const aHeight = new Float32Array(pos.count)
    const aEdge = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i)
      const r = tmp.length()
      const lat = 90 - (Math.acos(tmp.y / r) * 180) / Math.PI
      const theta = Math.atan2(tmp.z, -tmp.x)
      const lon = (((((theta * 180) / Math.PI - 180) % 360) + 540) % 360) - 180
      aHeight[i] = heightAt(lat, lon)
      aEdge[i] = edgeAt(lat, lon)
    }
    tube.setAttribute('aHeight', new BufferAttribute(aHeight, 1))
    tube.setAttribute('aEdge', new BufferAttribute(aEdge, 1))
    const material = new ShaderMaterial({
      uniforms: {
        ...shared,
        uLift: { value: lift },
        uColor: { value: new Color(color) },
        uDraw: { value: 0 },
        uOpacity: { value: 0 },
        uDashes: { value: dashes },
      },
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      transparent: true,
      depthWrite: false,
    })
    lineMaterials.push(material)
    const line = new Mesh(tube, material)
    line.renderOrder = 5
    line.frustumCulled = false
    group.add(line)
  }

  const big = options.quality === 'full'
  for (const [name, paths] of Object.entries(geo.rivers)) {
    if (!SHOWN_RIVERS.has(name)) continue
    const main = name === 'amu' || name === 'syr'
    for (const path of paths) makeLine(path, main ? (big ? 0.0011 : 0.0014) : big ? 0.0007 : 0.0009, '#7fe6ff', 0.0016, 0)
  }
  for (const ring of geo.uzBorder) makeLine(ring, big ? 0.0006 : 0.0008, '#5ff5df', 0.0024, 170)

  return {
    group,
    bounds: geo.bounds,
    rivers: geo.rivers,
    exaggeration,
    /** Relyef balandligi 0..1 (ko'tarilish koeffitsiyentisiz) */
    heightAt,
    /** Hozirgi ko'tarilish (0..1) */
    rise: () => shared.uHScale.value,
    setRise(value) {
      shared.uHScale.value = value
    },
    setStyle(value) {
      terrainUniforms.uMix.value = value
    },
    setOpacity(value) {
      terrainUniforms.uOpacity.value = value
      mesh.visible = value > 0.001
      for (const m of lineMaterials) m.uniforms.uOpacity.value = Math.min(value, 1) * 0.95
    },
    setDraw(value) {
      for (const m of lineMaterials) m.uniforms.uDraw.value = value
    },
    setDim(value) {
      terrainUniforms.uDim.value = value
    },
    update(time) {
      shared.uTime.value = time
    },
    surfacePoint(lat, lon, lift, target) {
      const h = heightAt(lat, lon) * exaggeration * shared.uHScale.value
      return latLonToVector3(lat, lon, 1.0008 + h + lift, target)
    },
  }
}
