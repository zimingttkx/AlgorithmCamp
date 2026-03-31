<template>
  <div id="app" :class="isDark ? 'theme-dark' : 'theme-light'">
    <div class="scanlines"></div>
    <canvas ref="particleCanvas" id="particle-canvas"></canvas>
    <!-- Ambient background particles -->
    <canvas ref="ambientCanvas" id="ambient-canvas"></canvas>
    <NavBar />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useTheme } from './composables/theme.js'

const { isDark, init: initTheme } = useTheme()

const particleCanvas = ref(null)
const ambientCanvas = ref(null)
let animId = null
let ambientAnimId = null
let particles = []
let ambientParticles = []

function getThemeColors() {
  return isDark.value
    ? ['#00f3ff','#d040ff','#00ffcc','#ff2eb0']
    : ['#0080cc','#8800cc','#00aa88','#cc0077']
}

// Mouse trail particles
function initMouseCanvas() {
  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  window.addEventListener('mousemove', (e) => {
    const colors = getThemeColors()
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: e.clientX, y: e.clientY,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5 - 0.5,
        life: 1,
        decay: 0.025 + Math.random() * 0.03,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    if (particles.length > 250) particles.splice(0, particles.length - 250)
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
      ctx.shadowBlur = 8
      ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size))
      ctx.restore()
    }
    animId = requestAnimationFrame(loop)
  }
  loop()
}

// Ambient floating particles
function initAmbientCanvas() {
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
    const count = Math.floor(window.innerWidth / 20)
    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
  }
  spawnAmbient()

  function loop() {
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
      ctx.shadowBlur = 4
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      ctx.restore()
    }
    ambientAnimId = requestAnimationFrame(loop)
  }
  loop()
}

onMounted(() => {
  initTheme()
  initMouseCanvas()
  initAmbientCanvas()
})
onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (ambientAnimId) cancelAnimationFrame(ambientAnimId)
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

/* Theme transitions */
*, *::before, *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease, box-shadow 0.3s ease;
}
</style>
