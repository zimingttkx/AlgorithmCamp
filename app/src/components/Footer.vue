<template>
  <footer class="footer">
    <div class="footer-inner container">
      <div class="footer-brand">
        <router-link to="/" class="footer-logo pixel-font">
          <span class="glow-cyan">[</span><span class="glow-blue">ZMT</span><span class="glow-cyan">]</span>
        </router-link>
        <div class="footer-desc">{{ t('算法 · 机器学习 · 网络安全', 'Algorithm · ML · Cybersecurity') }}</div>
      </div>
      <div class="footer-links">
        <router-link to="/about">{{ t('关于', 'About') }}</router-link>
        <router-link to="/projects">{{ t('项目', 'Projects') }}</router-link>
        <router-link to="/practice">{{ t('刷题', 'Practice') }}</router-link>
        <a href="https://github.com/zimingttkx" target="_blank" rel="noopener">GitHub</a>
      </div>
      <div class="footer-copy pixel-font">
        &copy; {{ year }} zimingttkx · {{ t('保留所有权利', 'All rights reserved') }}
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useLang } from '../composables/i18n.js'
const { t } = useLang()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 2;
  margin-top: 60px;
  padding: 32px 0 24px;
  border-top: 1px solid var(--border-pixel);
  background: var(--bg-panel);
}
.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.footer-logo {
  font-size: 0.7rem;
  text-decoration: none;
  letter-spacing: 0.1em;
}
.footer-desc {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-top: 4px;
}
.footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-links a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: var(--neon-cyan);
}
.footer-copy {
  font-size: 0.35rem;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}
</style>
