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
      <button class="lang-btn pixel-font" @click="toggleLang" :title="isZh ? 'Switch to English' : '切换中文'">
        {{ isZh ? 'EN' : '中' }}
      </button>
      <button class="theme-btn pixel-font" @click="toggleTheme" :title="isDark ? 'Light Mode' : 'Dark Mode'">
        {{ isDark ? '☀' : '◐' }}
      </button>
      <button class="nav-mobile-btn" @click="menuOpen = !menuOpen" aria-label="menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile-menu" :class="{ open: menuOpen }">
      <router-link v-for="item in navItems" :key="item.path"
        :to="item.path" class="nav-link pixel-font"
        @click="menuOpen = false"
      >{{ item.label }}</router-link>
      <button class="lang-btn pixel-font" @click="toggle; menuOpen=false" style="margin:8px 16px;width:fit-content">
        {{ isZh ? 'EN' : '中' }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLang } from '../composables/i18n.js'
import { useTheme } from '../composables/theme.js'

const { isZh, toggle: toggleLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()
const menuOpen = ref(false)

const navItems = computed(() => isZh.value ? [
  { path: '/',         label: '首页' },
  { path: '/about',    label: '关于我' },
  { path: '/blog',     label: '文章' },
  { path: '/projects', label: '项目' },
  { path: '/practice', label: '刷题' },
] : [
  { path: '/',         label: 'HOME' },
  { path: '/about',    label: 'ABOUT' },
  { path: '/blog',     label: 'BLOG' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/practice', label: 'PRACTICE' },
])
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9000;
  background: rgba(12,12,20,0.95);
  border-bottom: 2px solid var(--neon-blue);
  box-shadow: 0 0 20px rgba(0,243,255,0.3);
  backdrop-filter: blur(10px);
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 24px;
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
  color: #9090b0;
  border: 1px solid transparent;
  transition: all 0.15s;
  letter-spacing: 0.08em;
}
.nav-link:hover, .nav-link.active, .nav-link.router-link-active {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(0,255,204,0.4);
  text-shadow: 0 0 8px var(--neon-cyan);
}
.theme-btn {
  font-size: 0.72rem;
  padding: 5px 9px;
  background: transparent;
  color: var(--neon-yellow);
  border: 1px solid var(--neon-yellow);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.theme-btn:hover {
  background: var(--neon-yellow);
  color: #000;
  box-shadow: 0 0 10px rgba(255,230,0,0.6);
}
.lang-btn {
  font-size: 0.48rem;
  padding: 5px 10px;
  background: transparent;
  color: var(--neon-purple);
  border: 1px solid var(--neon-purple);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.lang-btn:hover {
  background: var(--neon-purple);
  color: #fff;
  box-shadow: 0 0 10px rgba(191,0,255,0.5);
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
  background: rgba(12,12,20,0.98);
}
.nav-mobile-menu.open { display: flex; }
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-mobile-btn { display: flex; margin-left: auto; }
  .lang-btn { display: none; }
}
</style>
