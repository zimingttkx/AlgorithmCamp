<template>
  <div id="app" :class="[isDark ? 'theme-dark' : 'theme-light', responsiveClass]">
    <!-- Skip Link for Keyboard Navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="scanlines"></div>
    <canvas ref="particleCanvas" id="particle-canvas"></canvas>
    <canvas ref="ambientCanvas" id="ambient-canvas"></canvas>
    <NavBar />
    <main id="main-content">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
    </main>
    <!-- ARIA Live Region for Screen Reader Announcements -->
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
      role="status"
    ></div>
    <Footer />
    <button class="back-to-top" :class="{ visible: showBackTop }" @click="scrollToTop" aria-label="Back to top">&#9650;</button>

    <!-- Keyboard Shortcuts Help Modal -->
    <div v-if="showShortcutsHelp" class="keyboard-help-overlay" @click.self="showShortcutsHelp = false">
      <div class="keyboard-help-modal">
        <div class="keyboard-help-header">
          <h3>Keyboard Shortcuts</h3>
          <button class="keyboard-help-close" @click="showShortcutsHelp = false" aria-label="Close">
            <span></span><span></span>
          </button>
        </div>
        <div class="keyboard-help-content">
          <div class="shortcut-section">
            <h4>Navigation</h4>
            <ul class="shortcut-list">
              <li><kbd>G</kbd><kbd>H</kbd> <span>Home</span></li>
              <li><kbd>G</kbd><kbd>P</kbd> <span>Practice</span></li>
              <li><kbd>G</kbd><kbd>R</kbd> <span>Progress</span></li>
              <li><kbd>G</kbd><kbd>S</kbd> <span>Stats</span></li>
              <li><kbd>/</kbd> <span>Search</span></li>
            </ul>
          </div>
          <div class="shortcut-section">
            <h4>Actions</h4>
            <ul class="shortcut-list">
              <li><kbd>T</kbd> <span>Toggle theme</span></li>
              <li><kbd>L</kbd> <span>Toggle language</span></li>
              <li><kbd>K</kbd> <span>Open search</span></li>
              <li><kbd>?</kbd> <span>Show this help</span></li>
              <li><kbd>Esc</kbd> <span>Close modal</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useTheme } from './composables/theme.js'
import { useLang } from './composables/i18n.js'
import { useResponsive } from './composables/useResponsive.js'
import { initA11y, useA11y } from './composables/useA11y.js'
import { initKeyboardShortcuts, useKeyboardShortcuts, getAllShortcuts } from './composables/useKeyboardShortcuts.js'
import { useAnimationPerformance } from './composables/useAnimationPerformance.js'
import { useCoreWebVitals } from './composables/useCoreWebVitals.js'
import { useSync } from './composables/sync.js'

const router = useRouter()
const { isDark, toggle: toggleTheme, init: initTheme } = useTheme()
const { toggle: toggleLang } = useLang()
const { isMobile, isTablet, isSplitScreen, splitScreenType, viewportWidth } = useResponsive()

// 初始化同步系统
const { syncing, lastSync } = useSync()

// Core Web Vitals monitoring
const { getMetrics, getScore, THRESHOLDS } = useCoreWebVitals({ debug: true })

// Animation performance monitoring
const { currentFPS, isLowPerformance, shouldAnimate, prefersReducedMotion } = useAnimationPerformance({ name: 'App' })

const showShortcutsHelp = ref(false)

// Responsive class for the app container
const responsiveClass = computed(() => {
  const classes = []
  if (isMobile.value) classes.push('is-mobile')
  if (isTablet.value) classes.push('is-tablet')
  if (isSplitScreen.value) classes.push('is-split-screen')
  if (splitScreenType.value !== 'none') classes.push(`split-${splitScreenType.value}`)
  // Add width-based class for split-screen narrow modes
  if (viewportWidth.value < 500) classes.push('is-narrow-viewport')
  return classes.join(' ')
})

const particleCanvas = ref(null)
const ambientCanvas = ref(null)
const showBackTop = ref(false)
let animId = null
let ambientAnimId = null
let particles = []
let ambientParticles = []
let pageVisible = true

// Respect prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Check if we should run animations (combines reduced motion and performance)
const shouldRunAnimations = computed(() => {
  return shouldAnimate.value && !isLowPerformance.value
})

function getThemeColors() {
  return isDark.value
    ? ['#0EA5E9','#d040ff','#00ffcc','#ff2eb0']
    : ['#0077b6','#7b2cbf','#009688','#c2185b']
}

// Mouse trail particles
function initMouseCanvas() {
  if (!shouldRunAnimations.value) return
  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  window.addEventListener('resize', onResize)

  window.addEventListener('mousemove', (e) => {
    if (!pageVisible) return
    const colors = getThemeColors()
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5 - 0.5,
        life: 1,
        decay: 0.03 + Math.random() * 0.03,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    if (particles.length > 200) particles.splice(0, particles.length - 200)
  })

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles = particles.filter(p => p.life > 0)
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 6
      ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size))
      ctx.restore()
    }
    animId = requestAnimationFrame(loop)
  }
  loop()
}

// Ambient floating particles
function initAmbientCanvas() {
  if (!shouldRunAnimations.value) return
  const canvas = ambientCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    spawnAmbient()
  })

  function spawnAmbient() {
    ambientParticles = []
    const colors = getThemeColors()
    const count = Math.min(Math.floor(window.innerWidth / 30), 60)
    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.3,
        size: 1 + Math.random() * 2,
        alpha: 0.08 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
  }
  spawnAmbient()

  function loop() {
    if (!pageVisible) { ambientAnimId = requestAnimationFrame(loop); return }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of ambientParticles) {
      p.x += p.vx; p.y += p.vy
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
      if (p.x < -10) p.x = canvas.width + 10
      if (p.x > canvas.width + 10) p.x = -10
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 3
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      ctx.restore()
    }
    ambientAnimId = requestAnimationFrame(loop)
  }
  loop()
}

// Pause animations when page is hidden
function handleVisibility() {
  pageVisible = !document.hidden
}

// Global scroll-driven animation observer with off-screen pause
let scrollObserver = null
let animatedElements = []
function initScrollAnimations() {
  if (!shouldRunAnimations.value) return

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target
      const shouldBeVisible = entry.isIntersecting

      // Toggle visibility class
      if (shouldBeVisible) {
        el.classList.add('is-visible')
      } else {
        el.classList.remove('is-visible')
      }

      // Pause/resume animations based on visibility
      if (el.classList.contains('pause-when-offscreen')) {
        el.style.animationPlayState = shouldBeVisible ? 'running' : 'paused'
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  // Observe all scroll-animate elements
  animatedElements = document.querySelectorAll('.scroll-fade-up, .scroll-fade-in, .scroll-scale-up, .scroll-slide-left, .scroll-slide-right, .scroll-rotate-in, .scroll-glow-trigger, .scroll-stagger-container, .pause-when-offscreen')
  animatedElements.forEach(el => {
    scrollObserver.observe(el)
  })
}

// Back to top
function onScroll() {
  showBackTop.value = window.scrollY > 400
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initialize keyboard shortcuts
let cleanupShortcuts = null

function initKeyboardHandlers() {
  cleanupShortcuts = initKeyboardShortcuts()

  // Navigation shortcuts
  useKeyboardShortcuts({
    key: ['g', 'h'],
    handler: () => router.push('/'),
    description: 'Go to Home',
    scope: 'navigation'
  })

  useKeyboardShortcuts({
    key: ['g', 'p'],
    handler: () => router.push('/practice'),
    description: 'Go to Practice',
    scope: 'navigation'
  })

  useKeyboardShortcuts({
    key: ['g', 'r'],
    handler: () => router.push('/progress'),
    description: 'Go to Progress',
    scope: 'navigation'
  })

  useKeyboardShortcuts({
    key: ['g', 's'],
    handler: () => router.push('/stats'),
    description: 'Go to Stats',
    scope: 'navigation'
  })

  useKeyboardShortcuts({
    key: ['/'],
    handler: () => router.push('/search'),
    description: 'Open Search',
    scope: 'navigation',
    global: true
  })

  // Action shortcuts
  useKeyboardShortcuts({
    key: 't',
    handler: () => toggleTheme(),
    description: 'Toggle theme',
    scope: 'actions'
  })

  useKeyboardShortcuts({
    key: 'l',
    handler: () => toggleLang(),
    description: 'Toggle language',
    scope: 'actions'
  })

  useKeyboardShortcuts({
    key: 'k',
    handler: () => router.push('/search'),
    description: 'Open search',
    scope: 'actions',
    global: true
  })

  useKeyboardShortcuts({
    key: '?',
    handler: () => { showShortcutsHelp.value = !showShortcutsHelp.value },
    description: 'Show keyboard shortcuts',
    scope: 'help'
  })

  // Escape to close help modal
  useKeyboardShortcuts({
    key: 'Escape',
    handler: () => { showShortcutsHelp.value = false },
    description: 'Close modal',
    scope: 'actions'
  })
}

onMounted(() => {
  initTheme()
  initMouseCanvas()
  initAmbientCanvas()
  initScrollAnimations()
  initKeyboardHandlers()
  initA11y() // Initialize accessibility features
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('scroll', onScroll, { passive: true })

  // Log Core Web Vitals metrics after page load
  setTimeout(() => {
    const metrics = getMetrics()
    const score = getScore()
    console.log(`[Core Web Vitals] Score: ${score}/100`, {
      LCP: metrics.LCP ? `${(metrics.LCP / 1000).toFixed(2)}s` : 'N/A',
      CLS: metrics.CLS ? metrics.CLS.toFixed(3) : 'N/A',
      FID: metrics.FID ? `${metrics.FID.toFixed(0)}ms` : 'N/A',
      INP: metrics.INP ? `${metrics.INP.toFixed(0)}ms` : 'N/A',
      Thresholds: THRESHOLDS,
    })
  }, 3000) // Wait for metrics to accumulate
})
onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (ambientAnimId) cancelAnimationFrame(ambientAnimId)
  if (scrollObserver) scrollObserver.disconnect()
  if (cleanupShortcuts) cleanupShortcuts()
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style>
#app { min-height: 100vh; background: var(--bg-dark); transition: background 0.4s; }

#particle-canvas {
  position: fixed; inset: 0;
  z-index: 9997; pointer-events: none;
}
#ambient-canvas {
  position: fixed; inset: 0;
  z-index: 1; pointer-events: none;
}

.scanlines {
  pointer-events: none;
  position: fixed; inset: 0;
  z-index: 9998;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,var(--scanline-opacity, 0.04)) 2px,
    rgba(0,0,0,var(--scanline-opacity, 0.04)) 4px
  );
}

/* Main content must be above canvases and scanlines */
main {
  position: relative;
  z-index: 10;
}

/* Theme transitions - only applied to interactive elements */
.pixel-btn, .pixel-card, .nav-link, .theme-btn, .lang-btn, .modal-close,
.back-to-top {
  transition: background-color 0.3s ease, border-color 0.3s ease,
              color 0.2s ease, box-shadow 0.3s ease;
}

/* ── Keyboard Shortcuts Help Modal ── */
.keyboard-help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.keyboard-help-modal {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s var(--ease-out-expo);
}

.keyboard-help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-default);
}

.keyboard-help-header h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neon-primary);
  margin: 0;
}

.keyboard-help-close {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.keyboard-help-close:hover {
  background: rgba(0, 243, 255, 0.1);
}

.keyboard-help-close span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--neon-cyan);
  box-shadow: 0 0 4px var(--neon-cyan);
}

.keyboard-help-close span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.keyboard-help-close span:nth-child(2) {
  transform: translateY(-6px) rotate(-45deg);
}

.keyboard-help-content {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 480px) {
  .keyboard-help-content {
    grid-template-columns: 1fr;
  }
}

.shortcut-section h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.shortcut-list li span {
  flex: 1;
  margin-left: 8px;
}

/* Keyboard key styling */
.shortcut-list kbd,
.keyboard-help-modal kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments for keyboard help */
@media (max-width: 600px) {
  .keyboard-help-modal {
    max-height: 90vh;
    border-radius: 12px;
  }

  .keyboard-help-header {
    padding: 16px 20px;
  }

  .keyboard-help-content {
    padding: 16px 20px;
  }
}
</style>
