<template>
  <div id="app" :class="isDark ? 'theme-dark' : 'theme-light'">
    <!-- Skip Link for Keyboard Navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div class="scanlines"></div>
    <canvas ref="particleCanvas" id="particle-canvas"></canvas>
    <canvas ref="ambientCanvas" id="ambient-canvas"></canvas>
    <NavBar />
    <main id="main-content">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    </main>
    <Footer />
    <button class="back-to-top" :class="{ visible: showBackTop }" @click="scrollToTop" aria-label="Back to top">&#9650;</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useTheme } from './composables/theme.js'

const { isDark, init: initTheme } = useTheme()

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

function getThemeColors() {
  return isDark.value
    ? ['#0EA5E9','#d040ff','#00ffcc','#ff2eb0']
    : ['#0077b6','#7b2cbf','#009688','#c2185b']
}

// Mouse trail particles
function initMouseCanvas() {
  if (prefersReduced) return
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
  if (prefersReduced) return
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

// Global scroll-driven animation observer
let scrollObserver = null
function initScrollAnimations() {
  if (prefersReduced) return

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        // Once animation plays, no need to observe anymore
        scrollObserver.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  // Observe all scroll-animate elements
  document.querySelectorAll('.scroll-fade-up, .scroll-fade-in, .scroll-scale-up, .scroll-slide-left, .scroll-slide-right, .scroll-rotate-in, .scroll-glow-trigger, .scroll-stagger-container').forEach(el => {
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

onMounted(() => {
  initTheme()
  initMouseCanvas()
  initAmbientCanvas()
  initScrollAnimations()
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (ambientAnimId) cancelAnimationFrame(ambientAnimId)
  if (scrollObserver) scrollObserver.disconnect()
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

/* Theme transitions - only applied to interactive elements */
.pixel-btn, .pixel-card, .nav-link, .theme-btn, .lang-btn, .modal-close,
.back-to-top {
  transition: background-color 0.3s ease, border-color 0.3s ease,
              color 0.2s ease, box-shadow 0.3s ease;
}
</style>
