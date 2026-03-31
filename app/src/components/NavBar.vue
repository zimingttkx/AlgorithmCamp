<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo pixel-font">
        <span class="logo-bracket glow-cyan">[</span>
        <span class="logo-text glow-blue">ZMT</span>
        <span class="logo-bracket glow-cyan">]</span>
      </router-link>
      <div class="nav-links">
        <router-link v-for="item in navItems" :key="item.path"
          :to="item.path" class="nav-link pixel-font"
          :class="{ active: $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/') }"
        >{{ item.label }}</router-link>
      </div>
      <button class="nav-mobile-btn" @click="menuOpen = !menuOpen" aria-label="menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile-menu" :class="{ open: menuOpen }">
      <router-link v-for="item in navItems" :key="item.path"
        :to="item.path" class="nav-link pixel-font"
        @click="menuOpen = false"
      >{{ item.label }}</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const menuOpen = ref(false)
const navItems = [
  { path: '/',         label: '首页' },
  { path: '/about',    label: '关于我' },
  { path: '/blog',     label: '文章' },
  { path: '/projects', label: '项目' },
  { path: '/practice', label: '刷题' },
]
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9000;
  background: rgba(10,10,15,0.92);
  border-bottom: 2px solid var(--neon-blue);
  box-shadow: 0 0 16px rgba(0,243,255,0.25);
  backdrop-filter: blur(8px);
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav-logo {
  font-size: 0.7rem;
  text-decoration: none;
  letter-spacing: 0.1em;
  flex-shrink: 0;
}
.logo-bracket { font-size: 0.9rem; }
.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
}
.nav-link {
  font-size: 0.5rem;
  padding: 6px 14px;
  text-decoration: none;
  color: var(--text-dim);
  border: 1px solid transparent;
  transition: all 0.15s;
  letter-spacing: 0.08em;
  position: relative;
}
.nav-link:hover, .nav-link.active {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 8px rgba(0,255,204,0.4);
  text-shadow: 0 0 8px var(--neon-cyan);
}
.nav-link.router-link-active,
.nav-link.active {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 8px rgba(0,255,204,0.4);
}
.nav-mobile-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.nav-mobile-btn span {
  display: block;
  width: 22px; height: 2px;
  background: var(--neon-cyan);
  box-shadow: 0 0 4px var(--neon-cyan);
}
.nav-mobile-menu {
  display: none;
  flex-direction: column;
  gap: 2px;
  padding: 8px 24px 12px;
  background: rgba(10,10,15,0.98);
}
.nav-mobile-menu.open { display: flex; }
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-mobile-btn { display: flex; margin-left: auto; }
}
</style>
