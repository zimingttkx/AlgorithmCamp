<template>
  <div class="not-found-page" style="padding-top:56px">
    <div class="container not-found-inner">
      <div class="glitch-text pixel-font">GLITCH</div>
      <h1 class="not-found-title pixel-font">404</h1>
      <p class="not-found-sub">{{ t('页面不存在', 'PAGE NOT FOUND') }}</p>
      <div class="not-found-code pixel-font">404</div>
      <div class="not-found-art">
        <span v-for="i in 10" :key="i" class="not-found-pixel" :style="{ animationDelay: i * 0.2 + 's' }"></span>
      </div>
      <div class="not-found-ship">
        <router-link to="/" class="pixel-btn" style="margin-top: 32px">RETURN HOME</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLang } from '../composables/i18n.js'
const { t } = useLang()
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.not-found-inner {
  text-align: center;
  padding: 80px 20px 0;
}
.glitch-text {
  font-size: 2rem;
  color: var(--neon-pink);
  text-shadow: 0 0 16px var(--neon-pink);
  animation: blink 2s step-end infinite;
}
.not-found-title {
  font-size: clamp(2rem, 5vw, 4rem);
  color: var(--neon-blue);
  text-shadow: 0 0 12px var(--neon-blue);
  margin-bottom: 24px;
}
.not-found-sub {
  color: var(--text-dim);
  margin-bottom: 24px;
  font-size: 0.85rem;
}
.not-found-code {
  font-size: 4rem;
  color: var(--text-dim);
  letter-spacing: 0.15em;
  margin-bottom: 40px;
  line-height: 2;
}
.not-found-art {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 40px;
  justify-content: center;
}
.not-found-pixel {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--neon-cyan);
  box-shadow: 0 0 6px var(--neon-cyan);
}
.not-found-ship {
  margin-top: 24px;
}
</style>
