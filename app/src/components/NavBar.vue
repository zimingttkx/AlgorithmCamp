<template>
  <nav class="navbar" :class="{ hidden: navHidden }">
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
      <button class="nav-mobile-btn" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile-menu" :class="{ open: menuOpen }">
      <router-link v-for="item in navItems" :key="item.path"
        :to="item.path" class="nav-link pixel-font"
        @click="menuOpen = false"
      >{{ item.label }}</router-link>
      <button class="lang-btn pixel-font" @click="toggleLang(); menuOpen=false" style="margin:8px 16px;width:fit-content">
        {{ isZh ? 'EN' : '中' }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLang } from '../composables/i18n.js'
import { useTheme } from '../composables/theme.js'

const { isZh, toggle: toggleLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()
const menuOpen = ref(false)
const navHidden = ref(false)

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

// Scroll hide/show
let lastScrollY = 0
function onScroll() {
  const currentY = window.scrollY
  navHidden.value = currentY > 80 && currentY > lastScrollY
  lastScrollY = currentY
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9000;
  background: var(--nav-bg);
  border-bottom: 1px solid rgba(0,243,255,0.2);
  box-shadow: 0 2px 20px rgba(0,0,0,0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, border-color 0.3s;
}
.navbar.hidden {
  transform: translateY(-100%);
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
  color: var(--text-dim);
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.08em;
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--neon-cyan);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}
.nav-link:hover::after,
.nav-link.active::after,
.nav-link.router-link-active::after {
  width: 80%;
}
.nav-link:hover, .nav-link.active, .nav-link.router-link-active {
  color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--neon-cyan);
}
.theme-btn {
  font-size: 0.72rem;
  padding: 5px 9px;
  background: transparent;
  color: var(--neon-yellow);
  border: 1px solid var(--neon-yellow);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-mobile-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-mobile-btn.open span:nth-child(2) { opacity: 0; }
.nav-mobile-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.nav-mobile-menu {
  max-height: 0;
  overflow: hidden;
  flex-direction: column;
  gap: 2px;
  padding: 0 24px;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s;
}
.nav-mobile-menu.open {
  max-height: 320px;
  padding: 8px 24px 12px;
}
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-mobile-btn { display: flex; margin-left: auto; }
  .lang-btn { display: none; }
}
</style>
