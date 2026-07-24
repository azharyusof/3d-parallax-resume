<template>
  <div class="cert3d-wrapper" ref="wrapperRef">
    <!-- Three.js Canvas -->
    <canvas ref="canvasRef" class="cert3d-canvas" />



    <!-- Left Arrow -->
    <button
      class="cert3d-arrow cert3d-arrow--left"
      :disabled="activeIndex === 0"
      @click="navigate(-1)"
      @mouseenter="playHoverIfEnabled"
      aria-label="Previous certificate"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <!-- Right Arrow -->
    <button
      class="cert3d-arrow cert3d-arrow--right"
      :disabled="activeIndex === certificates.length - 1"
      @click="navigate(1)"
      @mouseenter="playHoverIfEnabled"
      aria-label="Next certificate"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <!-- Active cert info panel (below canvas) with 3D Liquid Glass Effect -->
    <div :ref="bindInfoPanelCard" class="glass-panel cert3d-info-panel">
      <Transition name="cert-info-fade" mode="out-in">
        <div :key="activeIndex" class="cert3d-info-inner">
          <span class="cert3d-sys-tag">// PROFESSIONAL_CERTIFICATES_0{{ activeIndex + 1 }}</span>
          <h3 class="cert3d-title" :style="{ color: activeCert.color }">{{ activeCert.title }}</h3>
          <div class="cert3d-meta-row">
            <span class="cert3d-meta-label">ISSUING AUTHORITY</span>
            <span class="cert3d-meta-value">{{ activeCert.issuer }}</span>
          </div>
          <div class="cert3d-meta-row">
            <span class="cert3d-meta-label">VALIDATION DATE</span>
            <span class="cert3d-meta-value">{{ activeCert.issueDate }}</span>
          </div>
          <div class="cert3d-status-row">
            <span class="cert3d-status-dot" :style="{ backgroundColor: activeCert.color }" />
            <span class="cert3d-status-text" :style="{ color: activeCert.color }">VALIDATED</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Indicator Dots -->
    <div class="cert3d-dots">
      <span
        v-for="(cert, idx) in certificates"
        :key="idx"
        class="cert3d-dot"
        :class="{ active: idx === activeIndex }"
        :style="idx === activeIndex ? { backgroundColor: activeCert.color, boxShadow: `0 0 8px ${activeCert.color}` } : {}"
        @click="setActive(idx)"
        @mouseenter="playHoverIfEnabled"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { playHover, playClick, playNodeSelect } from '../utils/audio'
import { useLiquidGlass } from '../utils/useLiquidGlass'

// Liquid Glass tilt composable for Cert details panel
const { bindCard: bindInfoPanelCard } = useLiquidGlass({ maxTilt: 5, intensity: 0.28 })

// ─────────────────────────────────────────────
// Props & Emits
// ─────────────────────────────────────────────
const props = defineProps({
  certificates: {
    type: Array,
    required: true
  },
  audioEnabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cert-change'])

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const wrapperRef = ref(null)
const canvasRef = ref(null)
const activeIndex = ref(0)
const activeCert = computed(() => props.certificates[activeIndex.value] || props.certificates[0])

// ─────────────────────────────────────────────
// Three.js internals
// ─────────────────────────────────────────────
let scene, camera, renderer, animationId
let cardGroup            // Group holding all card meshes
let spotLight            // Active-card spotlight
let rimLight             // Secondary rim light for glass edge
let ambientParticles     // Dust
let cardMeshes = []      // Array of { front, back, edge, glass, rim, group, flipped, targetFlip, certIndex, hasImage }
let spotLightTarget = new THREE.Vector3()
const textureLoader = new THREE.TextureLoader()

// Per-card animation state
let cardStates = []      // { targetX, targetY, targetZ, targetRotY, targetScale, targetOpacity, currX, currY, currZ, currRotX, currRotY, currScale, currOpacity, flipAngle, targetFlipAngle }

// Drag state
let dragStartX = 0
let isDragging = false
const DRAG_THRESHOLD = 60

// ─────────────────────────────────────────────
// Sizing
// ─────────────────────────────────────────────
let cw = 800
let ch = 400

const getSize = () => {
  if (!wrapperRef.value) return { w: 800, h: 320 }
  const r = wrapperRef.value.getBoundingClientRect()
  const w = Math.floor(r.width) || 800
  const isSmall = window.innerWidth <= 480
  const isMobile = window.innerWidth <= 768
  const h = isSmall ? 190 : (isMobile ? 240 : 320)
  return { w, h }
}

// ─────────────────────────────────────────────
// Texture helpers
// ─────────────────────────────────────────────
const createGlowTexture = () => {
  const c = document.createElement('canvas')
  c.width = 32; c.height = 32
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(6,182,212,0.8)')
  g.addColorStop(0.5, 'rgba(99,102,241,0.3)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(c)
}

const createFrontTexture = (cert, idx) => {
  const c = document.createElement('canvas')
  c.width = 768; c.height = 480
  const ctx = c.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 768, 480)
  grad.addColorStop(0, '#04060c')
  grad.addColorStop(0.55, '#080d1e')
  grad.addColorStop(1, '#0e0b25')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 768, 480)

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'
  ctx.lineWidth = 1
  for (let x = 0; x < 768; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,480); ctx.stroke() }
  for (let y = 0; y < 480; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(768,y); ctx.stroke() }

  // Outer neon border
  ctx.strokeStyle = cert.color
  ctx.lineWidth = 4
  ctx.strokeRect(12, 12, 744, 456)

  // Inner thin white border
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  ctx.strokeRect(18, 18, 732, 444)

  // Top-left credential tag
  ctx.fillStyle = cert.color
  ctx.font = 'bold 13px "Space Grotesk", monospace'
  ctx.fillText('VERIFIED PROFESSIONAL CREDENTIAL', 36, 52)

  // Index tag top-right
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '13px "Space Grotesk", monospace'
  ctx.fillText(`// SYS_CREDENTIAL_0${idx + 1}`, 732, 52)
  ctx.textAlign = 'left'

  // Circular seal
  ctx.strokeStyle = cert.color
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(690, 110, 32, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.beginPath(); ctx.arc(690, 110, 29, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = cert.color
  ctx.font = 'bold 11px "Space Grotesk", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('VALID', 690, 114)
  ctx.textAlign = 'left'

  // Separator line
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(36, 72); ctx.lineTo(732, 72); ctx.stroke()

  // Title (word-wrapped)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 28px "Space Grotesk", monospace'
  ctx.shadowColor = cert.color
  ctx.shadowBlur = 12
  const words = cert.title.split(' ')
  let line = ''; let yPos = 145; const maxW = 650
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' '
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line, 36, yPos); line = words[n] + ' '; yPos += 38
    } else { line = test }
  }
  ctx.fillText(line, 36, yPos)
  ctx.shadowBlur = 0

  // Divider
  const divY = yPos + 30
  ctx.strokeStyle = cert.color
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.25
  ctx.beginPath(); ctx.moveTo(36, divY); ctx.lineTo(732, divY); ctx.stroke()
  ctx.globalAlpha = 1

  // Issuer row
  ctx.fillStyle = 'rgba(148,163,184,0.7)'
  ctx.font = '14px "Space Grotesk", monospace'
  ctx.fillText('ISSUING AUTHORITY', 36, divY + 30)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 18px "Space Grotesk", monospace'
  ctx.fillText(cert.issuer, 36, divY + 54)

  // Date row
  ctx.fillStyle = 'rgba(148,163,184,0.7)'
  ctx.font = '14px "Space Grotesk", monospace'
  ctx.fillText('VALIDATION DATE', 400, divY + 30)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 18px "Space Grotesk", monospace'
  ctx.fillText(`// ${cert.issueDate}`, 400, divY + 54)

  // Footer bar
  const footY = 430
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  ctx.fillRect(12, footY, 744, 38)
  ctx.fillStyle = cert.color
  ctx.font = '11px "Space Grotesk", monospace'
  ctx.fillText('> DECODE_STATUS: SECURE_CORE_ONLINE', 36, footY + 24)

  // Pulse dot
  ctx.fillStyle = cert.color
  ctx.shadowColor = cert.color
  ctx.shadowBlur = 10
  ctx.beginPath(); ctx.arc(720, footY + 19, 5, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0

  return new THREE.CanvasTexture(c)
}

const createBackTexture = (cert, idx) => {
  const c = document.createElement('canvas')
  c.width = 768; c.height = 480
  const ctx = c.getContext('2d')

  // Background — reversed gradient
  const grad = ctx.createLinearGradient(768, 480, 0, 0)
  grad.addColorStop(0, '#04060c')
  grad.addColorStop(0.55, '#080d1e')
  grad.addColorStop(1, '#0e0b25')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 768, 480)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'
  ctx.lineWidth = 1
  for (let x = 0; x < 768; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,480); ctx.stroke() }
  for (let y = 0; y < 480; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(768,y); ctx.stroke() }

  // Outer border (indigo on back)
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = 4
  ctx.strokeRect(12, 12, 744, 456)

  // Back label
  ctx.fillStyle = '#6366f1'
  ctx.font = 'bold 13px "Space Grotesk", monospace'
  ctx.fillText('CREDENTIAL_DETAIL :: BACK_FACE', 36, 52)

  // Divider
  ctx.strokeStyle = 'rgba(99,102,241,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(36, 66); ctx.lineTo(732, 66); ctx.stroke()

  // Central hexagon watermark
  ctx.strokeStyle = cert.color
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.12
  const hx = 384, hy = 240, hr = 100
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    i === 0 ? ctx.moveTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a))
             : ctx.lineTo(hx + hr * Math.cos(a), hy + hr * Math.sin(a))
  }
  ctx.closePath(); ctx.stroke()
  ctx.globalAlpha = 1

  // Cert name centered
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 22px "Space Grotesk", monospace'
  ctx.shadowColor = cert.color
  ctx.shadowBlur = 14
  ctx.textAlign = 'center'
  const titleWords = cert.title.split(' ')
  let tline = ''; let tyPos = 160; const tMaxW = 680
  for (let n = 0; n < titleWords.length; n++) {
    const ttest = tline + titleWords[n] + ' '
    if (ctx.measureText(ttest).width > tMaxW && n > 0) {
      ctx.fillText(tline.trim(), 384, tyPos); tline = titleWords[n] + ' '; tyPos += 34
    } else { tline = ttest }
  }
  ctx.fillText(tline.trim(), 384, tyPos)
  ctx.shadowBlur = 0

  // Info pills
  const pillY = tyPos + 55
  const pills = [
    { label: 'ISSUER', value: cert.issuer },
    { label: 'DATE',   value: cert.issueDate }
  ]
  pills.forEach((pill, pi) => {
    const px = 136 + pi * 250
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.strokeStyle = cert.color
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    const pw = 220, ph = 70, pr = 10
    ctx.roundRect(px, pillY, pw, ph, pr)
    ctx.fill(); ctx.stroke()
    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(148,163,184,0.7)'
    ctx.font = '12px "Space Grotesk", monospace'
    ctx.fillText(pill.label, px + 14, pillY + 24)
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 16px "Space Grotesk", monospace'
    ctx.fillText(pill.value, px + 14, pillY + 50)
  })
  ctx.textAlign = 'left'

  // Footer
  const footY = 430
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  ctx.fillRect(12, footY, 744, 38)
  ctx.fillStyle = '#6366f1'
  ctx.font = '11px "Space Grotesk", monospace'
  ctx.fillText('> CLICK TO RETURN :: FRONT_FACE', 36, footY + 24)

  return new THREE.CanvasTexture(c)
}

// ─────────────────────────────────────────────
// Three.js Init
// ─────────────────────────────────────────────
const initScene = () => {
  const { w, h } = getSize()
  cw = w; ch = h

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#08090f', 0.065)

  camera = new THREE.PerspectiveCamera(42, cw / ch, 0.1, 60)
  camera.position.set(0, 0, 6.0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(cw, ch)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // Lights
  const ambient = new THREE.AmbientLight('#0a0d1a', 1.4)
  scene.add(ambient)

  const light1 = new THREE.PointLight('#06b6d4', 6, 20)
  light1.position.set(5, 4, 6)
  scene.add(light1)

  const light2 = new THREE.PointLight('#6366f1', 5, 20)
  light2.position.set(-5, -3, 4)
  scene.add(light2)

  // Warm upper-right fill light for realistic glass refraction
  const light3 = new THREE.PointLight('#ffffff', 2.5, 15)
  light3.position.set(2, 6, 4)
  scene.add(light3)

  // Active spotlight (moves to active card)
  spotLight = new THREE.PointLight('#ffffff', 0, 14)
  spotLight.position.set(0, 0.5, 3.5)
  scene.add(spotLight)

  // Rim light for glass edge glow
  rimLight = new THREE.PointLight('#06b6d4', 2.0, 10)
  rimLight.position.set(-2, 1, 5)
  scene.add(rimLight)

  buildCards()
  buildParticles()
}

// ─────────────────────────────────────────────
// Build certificate cards
// ─────────────────────────────────────────────
const buildCards = () => {
  cardGroup = new THREE.Group()
  scene.add(cardGroup)

  const N = props.certificates.length
  cardMeshes = []
  cardStates = []

  // Increased card size from 2.8x1.75 to 3.6x2.25 (1.6:1 aspect ratio) for better readability
  const widthVal = 4.0
  const heightVal = 2.6

  for (let i = 0; i < N; i++) {
    const cert = props.certificates[i]
    const group = new THREE.Group()
    cardGroup.add(group)

    const hasImage = !!cert.image
    let front

    const frameMaterials = []
    const trackMat = (mat, baseOpacity = 1.0) => {
      mat.transparent = true
      mat.userData = mat.userData || {}
      mat.userData.baseOpacity = baseOpacity
      frameMaterials.push(mat)
      return mat
    }

    if (hasImage) {
      // ── 3D REALISTIC PHYSICAL PICTURE FRAME ────────────────────
      const frameWidth = 4.30
      const frameHeight = 2.90
      const frameDepth = 0.14

      // 1. Outer Metallic Frame Body (Obsidian Dark Metal)
      const outerFrameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth)
      const outerFrameMat = trackMat(new THREE.MeshStandardMaterial({
        color: 0x0f1422,
        metalness: 0.85,
        roughness: 0.25,
        side: THREE.DoubleSide
      }), 1.0)
      const outerFrameMesh = new THREE.Mesh(outerFrameGeo, outerFrameMat)
      outerFrameMesh.position.z = -frameDepth / 2
      group.add(outerFrameMesh)

      // 2. Inner Frame Bevel / Theme Color Accent Trim Ring
      const bevelTrimGeo = new THREE.BoxGeometry(frameWidth - 0.16, frameHeight - 0.16, frameDepth + 0.01)
      const bevelTrimMat = trackMat(new THREE.MeshStandardMaterial({
        color: cert.color,
        metalness: 0.9,
        roughness: 0.2,
        emissive: cert.color,
        emissiveIntensity: 0.25
      }), 0.9)
      const bevelTrimMesh = new THREE.Mesh(bevelTrimGeo, bevelTrimMat)
      bevelTrimMesh.position.z = -frameDepth / 2
      group.add(bevelTrimMesh)

      // 3. Museum Matting Board (Passe-partout Backing)
      const matBoardWidth = frameWidth - 0.30
      const matBoardHeight = frameHeight - 0.30
      const matBoardGeo = new THREE.BoxGeometry(matBoardWidth, matBoardHeight, 0.02)
      const matBoardMat = trackMat(new THREE.MeshStandardMaterial({
        color: 0x080a14,
        roughness: 0.8,
        metalness: 0.1
      }), 1.0)
      const matBoardMesh = new THREE.Mesh(matBoardGeo, matBoardMat)
      matBoardMesh.position.z = 0.001
      group.add(matBoardMesh)

      // 4. Certificate Paper Image Print Plane
      const paperWidth = 3.82
      const paperHeight = 2.42
      const paperGeo = new THREE.PlaneGeometry(paperWidth, paperHeight)

      const imgTex = textureLoader.load(cert.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy  = renderer?.capabilities.getMaxAnisotropy() ?? 4
        tex.minFilter   = THREE.LinearMipmapLinearFilter
        tex.magFilter   = THREE.LinearFilter
        tex.generateMipmaps = true
        if (front?.material) {
          front.material.map = tex
          front.material.needsUpdate = true
        }
      })

      const frontMat = trackMat(new THREE.MeshBasicMaterial({
        map: imgTex,
        side: THREE.FrontSide
      }), 1.0)
      front = new THREE.Mesh(paperGeo, frontMat)
      front.position.z = 0.015
      group.add(front)

      // 5. Protective Glass Sheen Overlay (Subtle Reflection)
      const glassGeo = new THREE.PlaneGeometry(matBoardWidth, matBoardHeight)
      const glassMat = trackMat(new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.3,
        side: THREE.FrontSide
      }), 0.04)
      const glassMesh = new THREE.Mesh(glassGeo, glassMat)
      glassMesh.position.z = 0.025
      group.add(glassMesh)

      // 6. Corner Metallic Clips (4 corners) holding the glass frame
      const clipGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04)
      const clipMat = trackMat(new THREE.MeshStandardMaterial({
        color: cert.color,
        metalness: 0.95,
        roughness: 0.15
      }), 0.9)

      const clipPositions = [
        [-matBoardWidth / 2 + 0.08, matBoardHeight / 2 - 0.08, 0.03],
        [matBoardWidth / 2 - 0.08, matBoardHeight / 2 - 0.08, 0.03],
        [-matBoardWidth / 2 + 0.08, -matBoardHeight / 2 + 0.08, 0.03],
        [matBoardWidth / 2 - 0.08, -matBoardHeight / 2 + 0.08, 0.03]
      ]

      clipPositions.forEach(([cx, cy, cz]) => {
        const clipMesh = new THREE.Mesh(clipGeo, clipMat)
        clipMesh.position.set(cx, cy, cz)
        group.add(clipMesh)
      })

      // 7. Outer Edge Outline for High-Tech Accent
      const rimGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(frameWidth + 0.02, frameHeight + 0.02, frameDepth + 0.02))
      const rimMat = trackMat(new THREE.LineBasicMaterial({
        color: cert.color
      }), 0.55)
      const rimMesh = new THREE.LineSegments(rimGeo, rimMat)
      rimMesh.position.z = -frameDepth / 2
      group.add(rimMesh)

      cardMeshes.push({
        group,
        front,
        glass: glassMesh,
        edge: rimMesh,
        frameMaterials,
        certIndex: i,
        isFlipped: false,
        hasImage: true
      })

    } else {
      // ── PROCEDURAL CANVAS TEXTURE (no image) ────────────────
      const frontMat = new THREE.MeshStandardMaterial({
        map:         createFrontTexture(cert, i),
        roughness:   0.25,
        metalness:   0.15,
        transparent: true,
        opacity:     1.0,
        side:        THREE.FrontSide
      })
      front = new THREE.Mesh(geo, frontMat)
      front.position.z = 0.008
      group.add(front)

      // Back face
      const backMat = new THREE.MeshStandardMaterial({
        map:         createBackTexture(cert, i),
        roughness:   0.25,
        metalness:   0.15,
        transparent: true,
        opacity:     1.0,
        side:        THREE.BackSide
      })
      const back = new THREE.Mesh(geo, backMat)
      back.position.z = -0.008
      group.add(back)

      // Thin glass edge
      const edgeGeo = new THREE.BoxGeometry(2.82, 1.77, 0.016)
      const edgeMat = new THREE.MeshPhysicalMaterial({
        color:       cert.color,
        roughness:   0.1,
        metalness:   0.9,
        transparent: true,
        opacity:     0.35
      })
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      group.add(edge)

      cardMeshes.push({ group, front, back, edge, glass: null, glare: null, certIndex: i, isFlipped: false, hasImage: false })
    }

    // Initial per-card state
    const offset = i - activeIndex.value
    const init = computeTargetState(offset)
    cardStates.push({
      ...init,
      currX:      init.targetX,
      currY:      init.targetY,
      currZ:      init.targetZ,
      currRotY:   init.targetRotY,
      currScale:  init.targetScale,
      currOpacity: init.targetOpacity,
      flipAngle:       0,
      targetFlipAngle: 0
    })

    // Set initial transform
    applyCardTransform(i)
  }
}

// ─────────────────────────────────────────────
// Coverflow Arc Layout Math
// ─────────────────────────────────────────────
const computeTargetState = (offset) => {
  const abs = Math.abs(offset)
  const isSmall = window.innerWidth <= 480
  const isMobile = window.innerWidth <= 768

  let targetX, targetZ, targetRotY, targetScale, targetOpacity
  const spacing = isSmall ? 1.5 : (isMobile ? 1.9 : 2.6)

  targetX     = offset * spacing
  targetRotY  = -offset * 0.62      // ≈ 35.5°
  targetZ     = abs === 0 ? 0.80 : (abs === 1 ? -1.2 : -2.8)
  targetScale = abs === 0 ? (isSmall ? 0.95 : 1.45) : (abs === 1 ? (isSmall ? 0.50 : 0.60) : (abs === 2 ? 0.38 : 0.36))
  targetOpacity = abs === 0 ? 1.0 : (abs === 1 ? 0.55 : (abs === 2 ? 0.18 : 0.0))

  return { targetX, targetY: 0, targetZ, targetRotY, targetScale, targetOpacity }
}

const applyCardTransform = (i) => {
  const state = cardStates[i]
  const mesh = cardMeshes[i]
  if (!mesh || !state) return

  mesh.group.position.set(state.currX, state.currY, state.currZ)
  mesh.group.rotation.y = state.currRotY + state.flipAngle
  const s = state.currScale
  mesh.group.scale.set(s, s, s)

  // How far through the flip are we? 0=front, π=back
  const flipProgress = Math.abs(state.flipAngle) / Math.PI  // 0..1
  // Glass / glare fade out as card flips to back
  const glassFade = Math.max(0, 1 - flipProgress * 3.5)

  if (mesh.frameMaterials && mesh.frameMaterials.length > 0) {
    mesh.frameMaterials.forEach(mat => {
      mat.opacity = state.currOpacity * (mat.userData.baseOpacity ?? 1.0)
    })
    mesh.group.visible = state.currOpacity > 0.005
  } else if (mesh.hasImage) {
    // Image-based card fallback
    if (mesh.front?.material) mesh.front.material.opacity = state.currOpacity
    if (mesh.back?.material)  mesh.back.material.opacity  = state.currOpacity
    if (mesh.glass?.material) mesh.glass.material.opacity = state.currOpacity * 0.92 * glassFade
    if (mesh.edge?.material)  mesh.edge.material.opacity  = state.currOpacity * 0.55
    mesh.group.visible = state.currOpacity > 0.005
  } else {
    // Procedural card: opacity on both faces
    if (mesh.front?.material) mesh.front.material.opacity = state.currOpacity
    if (mesh.back?.material)  mesh.back.material.opacity  = state.currOpacity
    if (mesh.edge?.material)  mesh.edge.material.opacity  = state.currOpacity * 0.35
    mesh.group.visible = state.currOpacity > 0.005
  }
}

// ─────────────────────────────────────────────
// Particles
// ─────────────────────────────────────────────
const buildParticles = () => {
  const count = 80
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 12
    pos[i*3+1] = (Math.random() - 0.5) * 8
    pos[i*3+2] = (Math.random() - 0.5) * 10 - 3
    speeds[i]  = Math.random() * 0.018 + 0.006
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    map: createGlowTexture(),
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  ambientParticles = new THREE.Points(geo, mat)
  ambientParticles.userData = { speeds }
  scene.add(ambientParticles)
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
const setActive = (idx) => {
  if (idx < 0 || idx >= props.certificates.length) return
  if (idx === activeIndex.value) {
    // Toggle flip on active card
    toggleFlip(idx)
    return
  }

  // Reset flip on previously active card before switching
  resetFlip(activeIndex.value)
  activeIndex.value = idx
  emit('cert-change', idx)

  // Recompute targets
  updateCardTargets()
  playClickIfEnabled()
}

const navigate = (dir) => {
  resetFlip(activeIndex.value)
  const next = activeIndex.value + dir
  if (next < 0 || next >= props.certificates.length) return
  activeIndex.value = next
  emit('cert-change', next)
  updateCardTargets()
  playClickIfEnabled()
}

const updateCardTargets = () => {
  for (let i = 0; i < cardMeshes.length; i++) {
    const offset = i - activeIndex.value
    const t = computeTargetState(offset)
    Object.assign(cardStates[i], t)
  }
}

// ─────────────────────────────────────────────
// Card Flip
// ─────────────────────────────────────────────
const toggleFlip = (idx) => {
  const state = cardStates[idx]
  const mesh  = cardMeshes[idx]
  if (!state || !mesh || mesh.hasImage) return // Bypass flipping for image-based cards (keep 100% visible and un-flipped)
  mesh.isFlipped = !mesh.isFlipped
  state.targetFlipAngle = mesh.isFlipped ? Math.PI : 0
  if (mesh.isFlipped) playNodeSelectIfEnabled()
  else playClickIfEnabled()
}

const resetFlip = (idx) => {
  if (idx < 0 || idx >= cardMeshes.length) return
  const state = cardStates[idx]
  const mesh  = cardMeshes[idx]
  if (state && mesh) {
    mesh.isFlipped = false
    state.targetFlipAngle = 0
  }
}

// ─────────────────────────────────────────────
// Keyboard & Drag
// ─────────────────────────────────────────────
const onKeyDown = (e) => {
  if (e.key === 'ArrowLeft')  navigate(-1)
  if (e.key === 'ArrowRight') navigate(1)
}

const onPointerDown = (e) => {
  isDragging = true
  dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
}

const onPointerMove = (e) => {
  if (!isDragging) return
  const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  const delta = x - dragStartX
  if (Math.abs(delta) > DRAG_THRESHOLD) {
    isDragging = false
    navigate(delta < 0 ? 1 : -1)
  }
}

const onPointerUp = () => { isDragging = false }

// ─────────────────────────────────────────────
// Handle card click (pointer up on canvas)
// ─────────────────────────────────────────────
const onCanvasClick = (e) => {
  // Use raycasting to detect which card was clicked
  if (!renderer || !camera || !cardGroup) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width)  * 2 - 1,
   -((e.clientY - rect.top)  / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // Raycast recursively against cardGroup children
  const hits = raycaster.intersectObjects(cardGroup.children, true)

  if (hits.length > 0) {
    // Traverse up to find the group holding the card
    let obj = hits[0].object
    let parentGroup = obj.parent
    // In case of nested meshes under the group
    while (parentGroup && parentGroup !== cardGroup && parentGroup !== scene) {
      const cardIdx = cardMeshes.findIndex(c => c.group === parentGroup)
      if (cardIdx !== -1) {
        if (cardIdx === activeIndex.value) {
          toggleFlip(cardIdx)
        } else {
          setActive(cardIdx)
        }
        break
      }
      parentGroup = parentGroup.parent
    }
  }
}

// ─────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────
const LERP = 0.08

let time = 0

const animate = (ts) => {
  animationId = requestAnimationFrame(animate)
  time = ts * 0.001
  const N = cardMeshes.length

  for (let i = 0; i < N; i++) {
    const s = cardStates[i]
    if (!s) continue

    // Position lerp
    s.currX       += (s.targetX - s.currX) * LERP
    s.currY       += (s.targetY - s.currY) * LERP
    s.currZ       += (s.targetZ - s.currZ) * LERP
    s.currScale   += (s.targetScale   - s.currScale)   * LERP
    s.currOpacity += (s.targetOpacity - s.currOpacity) * LERP

    // Rotation lerp
    let rotDiff = s.targetRotY - s.currRotY
    if (rotDiff > Math.PI)  rotDiff -= Math.PI * 2
    if (rotDiff < -Math.PI) rotDiff += Math.PI * 2
    s.currRotY += rotDiff * LERP

    // Flip lerp
    let flipDiff = s.targetFlipAngle - s.flipAngle
    if (flipDiff > Math.PI)  flipDiff -= Math.PI * 2
    if (flipDiff < -Math.PI) flipDiff += Math.PI * 2
    s.flipAngle += flipDiff * 0.085

    // Active card float bob
    if (i === activeIndex.value && !cardMeshes[i]?.isFlipped) {
      s.currY = Math.sin(time * 2.2) * 0.045
    }

    applyCardTransform(i)
  }

  // Move spotlight to active card + animate glass shimmer
  if (cardMeshes[activeIndex.value]) {
    const cert = props.certificates[activeIndex.value]
    spotLightTarget.set(cardStates[activeIndex.value].currX, cardStates[activeIndex.value].currY + 0.5, cardStates[activeIndex.value].currZ + 2.0)
    spotLight.position.lerp(spotLightTarget, 0.06)
    spotLight.color.set(cert.color)
    spotLight.intensity = 6 + Math.sin(time * 3) * 0.8

    // Animate liquid glass shimmer on active image-cert
    const activeMesh = cardMeshes[activeIndex.value]
    if (activeMesh.hasImage && activeMesh.glass) {
      // Subtle opacity pulse — liquid shimmer
      activeMesh.glass.material.opacity = (cardStates[activeIndex.value].currOpacity * 0.16) + Math.sin(time * 1.8) * 0.03
      activeMesh.glass.material.clearcoatRoughness = 0.08 + Math.cos(time * 2.5) * 0.03
      activeMesh.glass.material.needsUpdate  = true
      // Emissive rim pulse
      if (activeMesh.edge) {
        const baseColor = new THREE.Color(cert.color)
        activeMesh.edge.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.25
        activeMesh.edge.material.needsUpdate = true
      }
    }
  }

  // Particles drift
  if (ambientParticles) {
    const pos   = ambientParticles.geometry.attributes.position.array
    const spds  = ambientParticles.userData.speeds
    const count = pos.length / 3
    for (let i = 0; i < count; i++) {
      pos[i*3+2] += spds[i]
      if (pos[i*3+2] > 5) {
        pos[i*3]   = (Math.random() - 0.5) * 12
        pos[i*3+1] = (Math.random() - 0.5) * 8
        pos[i*3+2] = -8
      }
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true
  }

  renderer.render(scene, camera)
}

// ─────────────────────────────────────────────
// Resize
// ─────────────────────────────────────────────
let resizeObserver
const handleResize = () => {
  if (!renderer || !camera) return
  const { w, h } = getSize()
  cw = w; ch = h
  renderer.setSize(cw, ch)
  camera.aspect = cw / ch
  camera.updateProjectionMatrix()
}

// ─────────────────────────────────────────────
// Audio helpers
// ─────────────────────────────────────────────
const playHoverIfEnabled = () => { if (props.audioEnabled) playHover() }
const playClickIfEnabled = () => { if (props.audioEnabled) playClick() }
const playNodeSelectIfEnabled = () => { if (props.audioEnabled) playNodeSelect() }

// ─────────────────────────────────────────────
// Watch active cert from outside (if parent changes)
// ─────────────────────────────────────────────
watch(() => props.certificates, () => {
  // Rebuild if cert list changes
  if (scene && cardGroup) {
    scene.remove(cardGroup)
    cardMeshes.forEach(c => {
      c.front.material.map?.dispose()
      c.back.material.map?.dispose()
      c.front.geometry.dispose()
      c.back.geometry.dispose()
    })
    cardMeshes = []
    cardStates = []
    buildCards()
  }
})

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onMounted(() => {
  initScene()
  animationId = requestAnimationFrame(animate)

  window.addEventListener('keydown', onKeyDown)
  canvasRef.value?.addEventListener('click', onCanvasClick)

  if (wrapperRef.value) {
    wrapperRef.value.addEventListener('pointerdown',  onPointerDown)
    wrapperRef.value.addEventListener('pointermove',  onPointerMove)
    wrapperRef.value.addEventListener('pointerup',    onPointerUp)
    wrapperRef.value.addEventListener('pointercancel', onPointerUp)
    wrapperRef.value.addEventListener('touchstart',   onPointerDown, { passive: true })
    wrapperRef.value.addEventListener('touchmove',    onPointerMove, { passive: true })
    wrapperRef.value.addEventListener('touchend',     onPointerUp)
  }

  resizeObserver = new ResizeObserver(handleResize)
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', onKeyDown)

  if (wrapperRef.value) {
    wrapperRef.value.removeEventListener('pointerdown', onPointerDown)
    wrapperRef.value.removeEventListener('pointermove', onPointerMove)
    wrapperRef.value.removeEventListener('pointerup',   onPointerUp)
    wrapperRef.value.removeEventListener('pointercancel', onPointerUp)
    wrapperRef.value.removeEventListener('touchstart',  onPointerDown)
    wrapperRef.value.removeEventListener('touchmove',   onPointerMove)
    wrapperRef.value.removeEventListener('touchend',    onPointerUp)
  }

  resizeObserver?.disconnect()

  // Dispose Three.js resources
  cardMeshes.forEach(c => {
    c.front?.material?.map?.dispose()
    c.front?.material?.dispose()
    c.front?.geometry?.dispose()
    c.back?.material?.map?.dispose()
    c.back?.material?.dispose()
    c.back?.geometry?.dispose()
    c.edge?.material?.dispose()
    c.edge?.geometry?.dispose()
    c.glass?.material?.dispose()
    c.glass?.geometry?.dispose()
    c.glare?.material?.map?.dispose()
    c.glare?.material?.dispose()
    c.glare?.geometry?.dispose()
  })
  ambientParticles?.geometry.dispose()
  ambientParticles?.material.dispose()

  renderer?.dispose()
})
</script>

<style scoped>
.cert3d-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  touch-action: pan-y;
}

.cert3d-canvas {
  width: 100%;
  height: 320px;
  display: block;
  border-radius: 12px;
  cursor: grab;
}

.cert3d-canvas:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .cert3d-canvas {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .cert3d-canvas {
    height: 190px;
  }
}

/* Arrow Buttons */
.cert3d-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(calc(-50% - 50px));
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 9, 15, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

.cert3d-arrow:hover:not(:disabled) {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.3);
  transform: translateY(calc(-50% - 50px)) scale(1.25);
}

.cert3d-arrow:disabled {
  opacity: 0.2;
  cursor: default;
}

.cert3d-arrow--left  { left:  8px; }
.cert3d-arrow--right { right: 8px; }

/* Info Panel — Liquid Glass */
.cert3d-info-panel {
  width: 100%;
  max-width: 520px;
  margin-top: 8px;
  padding: 14px 22px;
  /* Liquid glass base */
  background: rgba(13, 17, 28, 0.52);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  text-align: center;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
  will-change: transform;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* Specular highlight for info panel */
.cert3d-info-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle at 30% 15%,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.04) 45%,
    transparent 70%
  );
}

/* Top rim light */
.cert3d-info-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 5%;
  right: 5%;
  height: 1px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.24) 30%,
    rgba(255, 255, 255, 0.30) 50%,
    rgba(255, 255, 255, 0.24) 70%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

.cert3d-info-panel:hover {
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.50),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(255, 255, 255, 0.06);
}

.cert3d-info-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cert3d-sys-tag {
  font-family: var(--font-display);
  font-size: 0.65rem;
  color: var(--accent-indigo);
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.cert3d-title {
  font-family: var(--font-display);
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  font-weight: 800;
  line-height: 1.3;
  text-shadow: 0 0 12px currentColor;
}

.cert3d-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
}

.cert3d-meta-label {
  color: var(--text-dark);
  text-transform: uppercase;
  font-family: var(--font-display);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

.cert3d-meta-value {
  color: var(--text-muted);
  font-family: var(--font-display);
}

.cert3d-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.cert3d-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  flex-shrink: 0;
}

.cert3d-status-text {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 0 6px currentColor;
}

.cert3d-hint {
  font-family: var(--font-display);
  font-size: 0.6rem;
  color: var(--text-dark);
  opacity: 0.7;
  margin-left: 4px;
}

/* Indicator Dots */
.cert3d-dots {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 14px;
}

.cert3d-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.35s ease;
}

.cert3d-dot.active {
  transform: scale(1.4);
}

.cert3d-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.15);
}

/* Transition for info panel */
.cert-info-fade-enter-active,
.cert-info-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cert-info-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.cert-info-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
