<template>
  <div class="not-found-page" style="padding-top:64px">
    <div class="container not-found-inner">
      <h1 class="not-found-title pixel-font">404</h1>
      <p class="not-found-sub">{{ t('页面不存在，请返回首页', 'Page not found. Return to home.') }}</p>
      <router-link to="/" class="pixel-btn" style="margin-top: 32px">RETURN HOME</router-link>
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
.not-found-title {
  font-size: clamp(3rem, 8vw, 6rem);
  color: var(--neon-blue);
  text-shadow: 0 0 16px var(--neon-blue);
  margin-bottom: 24px;
}
.not-found-sub {
  color: var(--text-dim);
  margin-bottom: 24px;
  font-size: 1rem;
}
</style>
