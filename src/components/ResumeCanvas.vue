<template>
  <div class="canvas-container" ref="canvasContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  scrollProgress: {
    type: Number,
    default: 0
  },
  highlightedSkill: {
    type: String,
    default: null
  },
  isContactCard: {
    type: Boolean,
    default: false
  },
  activeProjectImage: {
    type: String,
    default: null
  },
  activeProjectCategory: {
    type: String,
    default: null
  },
  activeJobIndex: {
    type: Number,
    default: 0
  },
  activeCertIndex: {
    type: Number,
    default: null
  }
})

const canvasContainer = ref(null)

let scene, camera, renderer, animationFrameId
let wavePoints, waveGeometry, wavePositions
let constellationGroup, wireframeMesh, vertexNodesMesh
let dustPoints, dustPositions
let lightPoint1, lightPoint2, lightPoint3

// Sizing
let width = window.innerWidth
let height = window.innerHeight

// Mouse track with smooth dampening
const mouse = { x: 0, y: 0 }
const targetMouse = { x: 0, y: 0 }

// Camera target transforms for smooth scrolling transitions
const cameraState = {
  x: 0, y: 3, z: 12,
  rotX: -0.15, rotY: 0, rotZ: 0,
  currX: 0, currY: 3, currZ: 12,
  currRotX: -0.15, currRotY: 0, currRotZ: 0
}

// ─────────────────────────────────────────────
// Texture Helper: Soft Radial Glow Texture
// ─────────────────────────────────────────────
const createParticleTexture = () => {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
  g.addColorStop(0.3, 'rgba(6, 182, 212, 0.8)')
  g.addColorStop(0.7, 'rgba(99, 102, 241, 0.3)')
  g.addColorStop(1.0, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// ─────────────────────────────────────────────
// 1. Interactive Fluid Particle Wave Grid
// ─────────────────────────────────────────────
const GRID_X = 90
const GRID_Z = 70
const SPACING = 0.42

const buildParticleWave = () => {
  const count = GRID_X * GRID_Z
  waveGeometry = new THREE.BufferGeometry()
  wavePositions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const colorBase = new THREE.Color('#6366f1')
  const colorCyan = new THREE.Color('#06b6d4')

  let i = 0
  for (let ix = 0; ix < GRID_X; ix++) {
    for (let iz = 0; iz < GRID_Z; iz++) {
      const x = (ix - GRID_X / 2) * SPACING
      const z = (iz - GRID_Z / 2) * SPACING
      const y = 0

      wavePositions[i * 3] = x
      wavePositions[i * 3 + 1] = y
      wavePositions[i * 3 + 2] = z

      // Mixed color gradient
      const mixRatio = (ix / GRID_X + iz / GRID_Z) * 0.5
      const c = colorBase.clone().lerp(colorCyan, mixRatio)

      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      i++
    }
  }

  waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3))
  waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const waveMaterial = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  wavePoints = new THREE.Points(waveGeometry, waveMaterial)
  wavePoints.position.y = -2.5
  scene.add(wavePoints)
}

// ─────────────────────────────────────────────
// 2. Minimalist Geometric Constellation Mesh
// ─────────────────────────────────────────────
const buildConstellationMesh = () => {
  constellationGroup = new THREE.Group()
  scene.add(constellationGroup)

  // Outer wireframe geometric core (Icosahedron)
  const icoGeo = new THREE.IcosahedronGeometry(2.6, 2)
  const wireMat = new THREE.MeshBasicMaterial({
    color: '#06b6d4',
    wireframe: true,
    transparent: true,
    opacity: 0.18
  })
  wireframeMesh = new THREE.Mesh(icoGeo, wireMat)
  constellationGroup.add(wireframeMesh)

  // Glowing vertex nodes at geometry points
  const icoPositions = icoGeo.attributes.position
  const nodeCount = icoPositions.count
  const nodeGeo = new THREE.BufferGeometry()
  const nodePos = new Float32Array(nodeCount * 3)

  for (let j = 0; j < nodeCount; j++) {
    nodePos[j * 3] = icoPositions.getX(j)
    nodePos[j * 3 + 1] = icoPositions.getY(j)
    nodePos[j * 3 + 2] = icoPositions.getZ(j)
  }

  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))

  const nodeMat = new THREE.PointsMaterial({
    size: 0.22,
    color: '#6366f1',
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  vertexNodesMesh = new THREE.Points(nodeGeo, nodeMat)
  constellationGroup.add(vertexNodesMesh)

  constellationGroup.position.set(0, 0.5, -2)
}

// ─────────────────────────────────────────────
// 3. Ambient Starfield & Floating Dust Field
// ─────────────────────────────────────────────
const buildDustField = () => {
  const count = 180
  const dustGeo = new THREE.BufferGeometry()
  dustPositions = new Float32Array(count * 3)

  for (let k = 0; k < count; k++) {
    dustPositions[k * 3] = (Math.random() - 0.5) * 26
    dustPositions[k * 3 + 1] = (Math.random() - 0.5) * 16
    dustPositions[k * 3 + 2] = (Math.random() - 0.5) * 20 - 4
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))

  const dustMat = new THREE.PointsMaterial({
    size: 0.16,
    color: '#38bdf8',
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  dustPoints = new THREE.Points(dustGeo, dustMat)
  scene.add(dustPoints)
}

// ─────────────────────────────────────────────
// Init Scene
// ─────────────────────────────────────────────
const initScene = () => {
  if (!canvasContainer.value) return

  width = window.innerWidth
  height = window.innerHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#04060c', 0.045)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(cameraState.currX, cameraState.currY, cameraState.currZ)
  camera.rotation.set(cameraState.currRotX, cameraState.currRotY, cameraState.currRotZ)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  canvasContainer.value.appendChild(renderer.domElement)

  // Lighting System
  const ambientLight = new THREE.AmbientLight('#080d1e', 1.5)
  scene.add(ambientLight)

  lightPoint1 = new THREE.PointLight('#6366f1', 4, 25)
  lightPoint1.position.set(6, 4, 4)
  scene.add(lightPoint1)

  lightPoint2 = new THREE.PointLight('#06b6d4', 3.5, 25)
  lightPoint2.position.set(-6, -2, 2)
  scene.add(lightPoint2)

  lightPoint3 = new THREE.PointLight('#10b981', 2, 20)
  lightPoint3.position.set(0, 5, -5)
  scene.add(lightPoint3)

  // Build Objects
  buildParticleWave()
  buildConstellationMesh()
  buildDustField()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onWindowResize)
}

// ─────────────────────────────────────────────
// Mouse Event Handlers
// ─────────────────────────────────────────────
const onMouseMove = (e) => {
  targetMouse.x = (e.clientX / width) * 2 - 1
  targetMouse.y = -(e.clientY / height) * 2 + 1
}

const onWindowResize = () => {
  if (!renderer || !camera || !canvasContainer.value) return
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// ─────────────────────────────────────────────
// Scroll-Driven Layout Engine
// ─────────────────────────────────────────────
const updateScrollTransform = () => {
  const p = props.scrollProgress

  if (p < 0.15) {
    // 0. Hero Section: Centered wide view
    cameraState.x = 0
    cameraState.y = 2.5
    cameraState.z = 11.5
    cameraState.rotX = -0.15
    cameraState.rotY = 0
    if (constellationGroup) {
      constellationGroup.scale.set(1.0, 1.0, 1.0)
      constellationGroup.position.set(0, 0.5, -2)
    }
  } else if (p >= 0.15 && p < 0.35) {
    // 1. Certificates Section: Shift slightly right
    cameraState.x = -1.5
    cameraState.y = 2.8
    cameraState.z = 10.5
    cameraState.rotX = -0.18
    cameraState.rotY = -0.12
    if (constellationGroup) {
      constellationGroup.scale.set(0.85, 0.85, 0.85)
      constellationGroup.position.set(3, 1, -3)
    }
  } else if (p >= 0.35 && p < 0.55) {
    // 2. Skills Section: Move closer to constellation core
    cameraState.x = 1.2
    cameraState.y = 1.8
    cameraState.z = 9.0
    cameraState.rotX = -0.1
    cameraState.rotY = 0.15
    if (constellationGroup) {
      constellationGroup.scale.set(1.2, 1.2, 1.2)
      constellationGroup.position.set(-2, 0, -1)
    }
  } else if (p >= 0.55 && p < 0.72) {
    // 3. Experience Section: Low horizon angle
    cameraState.x = 0
    cameraState.y = 3.5
    cameraState.z = 11.0
    cameraState.rotX = -0.22
    cameraState.rotY = 0
    if (constellationGroup) {
      constellationGroup.scale.set(0.7, 0.7, 0.7)
      constellationGroup.position.set(0, 2, -4)
    }
  } else if (p >= 0.72 && p < 0.88) {
    // 4. Projects Section: Cinematic tilt
    cameraState.x = -2.0
    cameraState.y = 2.2
    cameraState.z = 10.0
    cameraState.rotX = -0.12
    cameraState.rotY = -0.18
    if (constellationGroup) {
      constellationGroup.scale.set(0.9, 0.9, 0.9)
      constellationGroup.position.set(3.5, 0.5, -2)
    }
  } else {
    // 5. Connect Section: Centered focus
    cameraState.x = 0
    cameraState.y = 2.0
    cameraState.z = 9.5
    cameraState.rotX = -0.1
    cameraState.rotY = 0
    if (constellationGroup) {
      constellationGroup.scale.set(1.1, 1.1, 1.1)
      constellationGroup.position.set(0, 0, -1.5)
    }
  }
}

// ─────────────────────────────────────────────
// Skill Highlight Pulse
// ─────────────────────────────────────────────
watch(() => props.highlightedSkill, (skillId) => {
  if (!wireframeMesh || !vertexNodesMesh) return

  if (skillId) {
    wireframeMesh.material.opacity = 0.45
    wireframeMesh.material.color.set('#06b6d4')
    vertexNodesMesh.material.size = 0.38
    vertexNodesMesh.material.color.set('#38bdf8')
  } else {
    wireframeMesh.material.opacity = 0.18
    wireframeMesh.material.color.set('#06b6d4')
    vertexNodesMesh.material.size = 0.22
    vertexNodesMesh.material.color.set('#6366f1')
  }
})

// ─────────────────────────────────────────────
// Animation Render Loop
// ─────────────────────────────────────────────
let clock = new THREE.Clock()
const LERP = 0.05

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()

  // Smooth mouse interpolation
  mouse.x += (targetMouse.x - mouse.x) * LERP
  mouse.y += (targetMouse.y - mouse.y) * LERP

  // Update layout scroll targets
  updateScrollTransform()

  // Lerp camera position
  cameraState.currX += (cameraState.x - cameraState.currX) * LERP
  cameraState.currY += (cameraState.y - cameraState.currY) * LERP
  cameraState.currZ += (cameraState.z - cameraState.currZ) * LERP
  cameraState.currRotX += (cameraState.rotX - cameraState.currRotX) * LERP
  cameraState.currRotY += (cameraState.rotY - cameraState.currRotY) * LERP

  // Apply camera transforms + mouse parallax offset
  camera.position.x = cameraState.currX + mouse.x * 0.8
  camera.position.y = cameraState.currY + mouse.y * 0.5
  camera.position.z = cameraState.currZ
  camera.rotation.x = cameraState.currRotX + mouse.y * 0.05
  camera.rotation.y = cameraState.currRotY - mouse.x * 0.08

  // Animate Fluid Wave Grid
  if (waveGeometry && wavePositions) {
    let i = 0
    for (let ix = 0; ix < GRID_X; ix++) {
      for (let iz = 0; iz < GRID_Z; iz++) {
        // Multi-frequency wave formula
        const wave1 = Math.sin(ix * 0.25 + elapsedTime * 1.4) * 0.35
        const wave2 = Math.cos(iz * 0.2 + elapsedTime * 1.1) * 0.3
        const wave3 = Math.sin((ix + iz) * 0.15 + elapsedTime * 0.8) * 0.2
        const mouseDist = Math.sin(ix * 0.1 + mouse.x * 3) * 0.15

        wavePositions[i * 3 + 1] = wave1 + wave2 + wave3 + mouseDist
        i++
      }
    }
    waveGeometry.attributes.position.needsUpdate = true
  }

  // Rotate & Float Constellation Mesh
  if (constellationGroup) {
    constellationGroup.rotation.y = elapsedTime * 0.12
    constellationGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.08
    constellationGroup.position.y += Math.sin(elapsedTime * 0.8) * 0.002
  }

  // Drifting Ambient Dust Particles
  if (dustPoints && dustPositions) {
    const pos = dustPoints.geometry.attributes.position.array
    for (let k = 0; k < pos.length / 3; k++) {
      pos[k * 3 + 1] += Math.sin(elapsedTime + k) * 0.003
      if (pos[k * 3 + 1] > 8) pos[k * 3 + 1] = -8
    }
    dustPoints.geometry.attributes.position.needsUpdate = true
  }

  // Pulse Point Lights
  if (lightPoint1) {
    lightPoint1.position.x = Math.sin(elapsedTime * 0.5) * 8
    lightPoint1.position.z = Math.cos(elapsedTime * 0.5) * 6
  }

  renderer.render(scene, camera)
}

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onMounted(() => {
  initScene()
  animate()
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onWindowResize)

  // Dispose WebGL resources cleanly
  if (waveGeometry) waveGeometry.dispose()
  if (wavePoints?.material) wavePoints.material.dispose()
  if (wireframeMesh?.geometry) wireframeMesh.geometry.dispose()
  if (wireframeMesh?.material) wireframeMesh.material.dispose()
  if (vertexNodesMesh?.geometry) vertexNodesMesh.geometry.dispose()
  if (vertexNodesMesh?.material) vertexNodesMesh.material.dispose()
  if (dustPoints?.geometry) dustPoints.geometry.dispose()
  if (dustPoints?.material) dustPoints.material.dispose()
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
