/**
 * useLiquidGlass - Composable that adds a 3D liquid glass tilt + specular highlight
 * effect to one or more card elements. Content inside the card is never preserve-3d,
 * so text/images stay pixel-perfectly fixed during and after the tilt.
 *
 * Usage:
 *   const { bindCard } = useLiquidGlass({ maxTilt: 8, intensity: 0.4 })
 *   <div :ref="bindCard">...</div>
 */
export function useLiquidGlass(options = {}) {
  const {
    maxTilt = 8,          // Max rotation degrees (X / Y)
    intensity = 0.35,     // Specular highlight intensity (0–1)
    perspective = 1000,   // CSS perspective px
    lerp = 0.08           // Smoothing factor (0=instant, 1=none)
  } = options

  const cards = new Set()

  // Per-card state
  const states = new WeakMap()

  const createState = () => ({
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    hovering: false,
    rafId: null,
    glowEl: null
  })

  const tick = (card, state) => {
    state.currX += (state.targetX - state.currX) * lerp
    state.currY += (state.targetY - state.currY) * lerp

    card.style.transform = `perspective(${perspective}px) rotateX(${state.currX.toFixed(3)}deg) rotateY(${state.currY.toFixed(3)}deg) scale3d(1,1,1)`

    const still = !state.hovering && Math.abs(state.currX) < 0.015 && Math.abs(state.currY) < 0.015
    if (still) {
      state.currX = 0; state.currY = 0
      card.style.transform = ''
      state.rafId = null
      return
    }
    state.rafId = requestAnimationFrame(() => tick(card, state))
  }

  const onMove = (e) => {
    const card = e.currentTarget
    const state = states.get(card)
    if (!state) return

    const rect = card.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) - 0.5   // -0.5 to +0.5
    const ny = ((e.clientY - rect.top) / rect.height) - 0.5

    state.targetX = -ny * maxTilt
    state.targetY =  nx * maxTilt

    // Specular highlight position
    if (state.glowEl) {
      const px = (nx + 0.5) * 100
      const py = (ny + 0.5) * 100
      state.glowEl.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,${intensity}) 0%, rgba(255,255,255,0) 65%)`
    }

    if (!state.hovering) {
      state.hovering = true
    }
    if (!state.rafId) {
      state.rafId = requestAnimationFrame(() => tick(card, state))
    }
  }

  const onEnter = (e) => {
    const card = e.currentTarget
    const state = states.get(card)
    if (!state) return
    state.hovering = true
    if (state.glowEl) state.glowEl.style.opacity = '1'
  }

  const onLeave = (e) => {
    const card = e.currentTarget
    const state = states.get(card)
    if (!state) return
    state.hovering = false
    state.targetX = 0
    state.targetY = 0
    if (state.glowEl) {
      state.glowEl.style.opacity = '0'
      state.glowEl.style.background = ''
    }
    if (!state.rafId) {
      state.rafId = requestAnimationFrame(() => tick(card, state))
    }
  }

  /**
   * Use as a Vue ref callback: <div :ref="bindCard">
   * Called with the element when mounted, null when unmounted.
   */
  const bindCard = (el) => {
    if (el) {
      // Mount
      const state = createState()

      // Inject a glass specular overlay element
      const glow = document.createElement('div')
      glow.className = 'lg-specular'
      glow.style.cssText = [
        'position:absolute',
        'inset:0',
        'border-radius:inherit',
        'pointer-events:none',
        'z-index:9999',
        'opacity:0',
        'transition:opacity 0.35s ease',
        'background:none'
      ].join(';')
      el.appendChild(glow)
      state.glowEl = glow

      // Ensure card is positioned for the overlay to work
      const pos = getComputedStyle(el).position
      if (pos === 'static') el.style.position = 'relative'

      states.set(el, state)
      cards.add(el)

      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseenter', onEnter, { passive: true })
      el.addEventListener('mouseleave', onLeave, { passive: true })
    } else {
      // Unmount — cleanup all tracked cards
      for (const card of cards) {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
        const state = states.get(card)
        if (state?.rafId) cancelAnimationFrame(state.rafId)
        if (state?.glowEl) state.glowEl.remove()
        states.delete(card)
      }
      cards.clear()
    }
  }

  /**
   * For use with v-for: call addCard(el) inside a :ref callback
   */
  const addCard = (el) => {
    if (el && !cards.has(el)) {
      bindCard(el) // reuse same logic
    }
  }

  return { bindCard, addCard }
}
