<template>
  <div id="app">
    <div class="scanlines"></div>
    <canvas ref="particleCanvas" id="particle-canvas"></canvas>
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

const particleCanvas = ref(null)
let animId = null
let particles = []
let mouse = { x: -999, y: -999 }

function initCanvas() {
  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    for (let i = 0; i < 2; i++) {
      particles.push(createParticle(mouse.x, mouse.y))
    }
    if (particles.length > 200) particles.splice(0, particles.length - 200)
  })

  function createParticle(x, y) {
    const colors = ['#00f3ff','#bf00ff','#00ffcc','#ff00aa']
    return {
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2 - 1,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles = particles.filter(p => p.life > 0)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.life -= p.decay
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

onMounted(() => { initCanvas() })
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })
</script>

<style>
#app { min-height: 100vh; }
#particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
}
</style>
