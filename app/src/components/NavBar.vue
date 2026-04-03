<template>
  <nav class="navbar" :class="{ hidden: navHidden, scrolled: isScrolled }">
    <!-- Scroll Progress Indicator -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <div class="nav-inner">
      <router-link to="/" class="nav-logo pixel-font">
        <span class="logo-wrapper">
          <span class="logo-bracket glow-cyan animate-pixel-flicker">[</span>
          <span class="logo-text glow-blue animate-pixel-in">ZMT</span>
          <span class="logo-bracket glow-cyan animate-pixel-flicker">]</span>
        </span>
        <span class="logo-pixels" aria-hidden="true">
          <span class="pixel-dot"></span>
          <span class="pixel-dot"></span>
          <span class="pixel-dot"></span>
        </span>
      </router-link>
      <div class="nav-links">
        <router-link v-for="item in navItems" :key="item.path"
          :to="item.path" class="nav-link"
          :class="{ active: $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/') }"
        >
          <span class="nav-link-text">{{ item.label }}</span>
          <span v-if="item.badge && item.badge > 0" class="nav-badge">{{ item.badge }}</span>
          <span class="nav-link-underline"></span>
          <span class="nav-link-glow"></span>
        </router-link>
      </div>
      <div class="nav-actions">
        <button v-if="isLoggedIn()" class="logout-btn" @click="handleLogout" title="退出登录">
          <span class="btn-text">登出</span>
        </button>
        <button class="lang-btn" @click="toggleLang" :title="isZh ? 'Switch to English' : '切换中文'">
          <span class="btn-text">{{ isZh ? 'EN' : '中' }}</span>
        </button>
        <button class="theme-btn" @click="toggleTheme" :title="isDark ? 'Light Mode' : 'Dark Mode'">
          <span class="btn-icon">{{ isDark ? '☀' : '◐' }}</span>
        </button>
      </div>
      <button class="nav-mobile-btn" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile Sidebar Backdrop -->
    <div class="nav-sidebar-backdrop" :class="{ open: menuOpen }" @click="menuOpen = false"></div>

    <!-- Mobile Slide-out Sidebar -->
    <div class="nav-sidebar" :class="{ open: menuOpen }" ref="sidebarRef">
      <div class="sidebar-header">
        <span class="sidebar-title pixel-font">{{ isZh ? '菜单' : 'MENU' }}</span>
        <button class="sidebar-close" @click="menuOpen = false" aria-label="close">
          <span></span><span></span>
        </button>
      </div>
      <div class="sidebar-links">
        <router-link v-for="item in navItems" :key="item.path"
          :to="item.path" class="sidebar-link"
          :class="{ active: $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/') }"
          @click="menuOpen = false"
        >
          <span class="sidebar-link-text">{{ item.label }}</span>
          <span v-if="item.badge && item.badge > 0" class="sidebar-badge">{{ item.badge }}</span>
        </router-link>
      </div>
      <div class="sidebar-actions">
        <button v-if="isLoggedIn()" class="sidebar-btn sidebar-logout" @click="handleLogout">
          <span class="btn-icon">🚪 {{ isZh ? '退出登录' : 'Logout' }}</span>
        </button>
        <button class="sidebar-btn" @click="toggleLang(); menuOpen=false">
          <span class="btn-icon">{{ isZh ? '🌐 EN' : '🌐 中' }}</span>
        </button>
        <button class="sidebar-btn" @click="toggleTheme(); menuOpen=false">
          <span class="btn-icon">{{ isDark ? '☀ ' + (isZh ? '亮色模式' : 'Light Mode') : '◐ ' + (isZh ? '暗色模式' : 'Dark Mode') }}</span>
        </button>
      </div>
    </div>

    <!-- Bottom Navigation Bar (Mobile Only) -->
    <nav class="bottom-nav" aria-label="Mobile navigation">
      <router-link v-for="item in bottomNavItems" :key="item.path"
        :to="item.path" class="bottom-nav-item"
        :class="{ active: $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/') }"
      >
        <span class="bottom-nav-icon">{{ item.icon }}</span>
        <span class="bottom-nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLang } from '../composables/i18n.js'
import { useTheme } from '../composables/theme.js'
import { useReviewReminder } from '../composables/useReviewReminder.js'
import { useAuth } from '../composables/auth.js'

const { isZh, toggle: toggleLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()
const { dueReviewCount } = useReviewReminder()
const { user, logout, isLoggedIn } = useAuth()
const menuOpen = ref(false)
const navHidden = ref(false)
const isScrolled = ref(false)
const scrollProgress = ref(0)
const sidebarRef = ref(null)

// Touch gesture state
let touchStartX = 0
let touchEndX = 0
const SWIPE_THRESHOLD = 50

const navItems = computed(() => isZh.value ? [
  { path: '/',         label: '首页' },
  { path: '/practice', label: '刷题' },
  { path: '/search',   label: '搜索' },
  { path: '/progress', label: '进度' },
  { path: '/stats',    label: '统计' },
  { path: '/recommend', label: '推荐' },
  { path: '/review',   label: '复习', badge: dueReviewCount.value },
  { path: '/goal',     label: '目标' },
  { path: '/export',   label: '导出' },
  { path: '/blog',     label: '分享' },
  { path: '/about',    label: '关于' },
] : [
  { path: '/',         label: 'HOME' },
  { path: '/practice', label: 'PRACTICE' },
  { path: '/search',   label: 'SEARCH' },
  { path: '/progress', label: 'PROGRESS' },
  { path: '/stats',    label: 'STATS' },
  { path: '/recommend', label: 'RECOMMEND' },
  { path: '/review',   label: 'REVIEW', badge: dueReviewCount.value },
  { path: '/goal',     label: 'GOAL' },
  { path: '/export',   label: 'EXPORT' },
  { path: '/blog',     label: 'SHARE' },
  { path: '/about',    label: 'ABOUT' },
])

// Bottom navigation items (primary destinations)
const bottomNavItems = computed(() => isZh.value ? [
  { path: '/',         label: '首页',   icon: '🏠' },
  { path: '/practice', label: '刷题',   icon: '📝' },
  { path: '/search',   label: '搜索',   icon: '🔍' },
  { path: '/progress', label: '进度',   icon: '📊' },
  { path: '/review',   label: '复习',   icon: '📚' },
] : [
  { path: '/',         label: 'HOME',     icon: '🏠' },
  { path: '/practice', label: 'PRACTICE', icon: '📝' },
  { path: '/search',   label: 'SEARCH',   icon: '🔍' },
  { path: '/progress', label: 'PROGRESS', icon: '📊' },
  { path: '/review',   label: 'REVIEW',   icon: '📚' },
])

// Touch gesture handlers for sidebar swipe
function onTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX
}

function onTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX
  handleSwipeGesture()
}

function handleSwipeGesture() {
  const swipeDistance = touchEndX - touchStartX

  // Swipe left to close sidebar (if open)
  if (swipeDistance < -SWIPE_THRESHOLD && menuOpen.value) {
    menuOpen.value = false
  }
  // Swipe right from left edge to open sidebar (if closed)
  if (swipeDistance > SWIPE_THRESHOLD && touchStartX < 30 && !menuOpen.value) {
    menuOpen.value = true
  }
}

// Prevent body scroll when sidebar is open
function onBodyTouchStart(e) {
  if (menuOpen.value && !sidebarRef.value?.contains(e.target)) {
    e.preventDefault()
  }
}

// Scroll hide/show and progress tracking
let lastScrollY = 0
function onScroll() {
  const currentY = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  // Update scroll progress
  scrollProgress.value = docHeight > 0 ? (currentY / docHeight) * 100 : 0

  // Update scrolled state for navbar styling
  isScrolled.value = currentY > 20

  // Hide/show navbar on scroll down/up
  navHidden.value = currentY > 80 && currentY > lastScrollY
  lastScrollY = currentY
}

// Close sidebar on route change
function onRouteChange() {
  menuOpen.value = false
}

// Handle logout
async function handleLogout() {
  await logout()
  menuOpen.value = false
  window.location.reload()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
  document.addEventListener('touchstart', onBodyTouchStart, { passive: false })

  // Watch route changes
  const unsubscribe = window.__VUE_ROUTER__?.subscribe((to) => {
    if (to.path !== window.location.pathname) {
      menuOpen.value = false
    }
  })

  // Use router.afterEach if available
  if (window.__VUE_ROUTER__) {
    window.__VUE_ROUTER__.afterEach(() => {
      menuOpen.value = false
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('touchstart', onBodyTouchStart)
})
</script>

<style scoped>
/* ── Scroll Progress Indicator ── */
.scroll-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--rainbow-gradient);
  background-size: 400% 100%;
  animation: rainbowFlow 3s linear infinite;
  transition: width 0.1s linear;
  z-index: 10;
  box-shadow: 0 0 10px var(--glow-primary), 0 0 20px var(--glow-secondary);
}

/* ── Enhanced Navbar Glass Effect ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9999;
  background: var(--navbar-bg);
  border-bottom: 1px solid var(--navbar-border);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s,
              border-color 0.3s,
              box-shadow 0.3s;
}
.navbar.scrolled {
  background: var(--navbar-bg-scrolled);
  border-bottom-color: var(--navbar-border-scrolled);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08),
              0 0 30px rgba(0, 243, 255, 0.05);
}
.navbar.hidden {
  transform: translateY(-100%);
}

/* ── Inner Layout ── */
.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}

/* ── Pixel Logo Animation ── */
.nav-logo {
  font-size: 0.7rem;
  text-decoration: none;
  letter-spacing: 0.1em;
  flex-shrink: 0;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.logo-wrapper {
  display: inline-flex;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.logo-bracket { font-size: 0.9rem; }
.logo-text {
  font-weight: 700;
  transition: all 0.2s ease;
}

/* Pixel dots decoration */
.logo-pixels {
  display: flex;
  gap: 3px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}
.pixel-dot {
  width: 4px;
  height: 4px;
  background: var(--neon-primary);
  box-shadow: 0 0 4px var(--glow-primary);
  animation: pixelBlink 1.5s ease-in-out infinite;
}
.pixel-dot:nth-child(2) { animation-delay: 0.2s; }
.pixel-dot:nth-child(3) { animation-delay: 0.4s; }

/* Logo hover animation - pixel glitch effect */
.nav-logo:hover .logo-wrapper {
  transform: translateX(2px);
}
.nav-logo:hover .logo-text {
  text-shadow:
    0 0 10px var(--glow-primary),
    0 0 20px var(--glow-primary),
    0 0 30px var(--glow-secondary);
  animation: pixelGlitchText 0.3s ease-in-out;
}
.nav-logo:hover .logo-pixels {
  opacity: 1;
}
.nav-logo:hover .pixel-dot {
  animation: pixelPulse 0.5s ease-in-out infinite;
}

/* Pixel flicker animation for brackets */
.animate-pixel-flicker {
  animation: pixelFlicker 3s ease-in-out infinite;
}
.animate-pixel-in {
  animation: pixelIn 0.5s ease-out forwards;
}

@keyframes pixelBlink {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes pixelPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 4px var(--glow-primary); }
  50% { transform: scale(1.5); box-shadow: 0 0 12px var(--glow-primary); }
}
@keyframes pixelFlicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.3; }
  94% { opacity: 1; }
  96% { opacity: 0.5; }
  97% { opacity: 1; }
}
@keyframes pixelIn {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes pixelGlitchText {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-2px) skewX(-5deg); }
  40% { transform: translateX(2px) skewX(5deg); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

/* ── Navigation Links with Advanced Hover ── */
.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
}
.nav-link {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-dim);
  border: 1px solid transparent;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
}
.nav-link-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}
/* Animated underline */
.nav-link-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-secondary));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  box-shadow: 0 0 10px var(--glow-primary);
}
/* Glow effect background */
.nav-link-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, var(--glow-primary-soft) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* Hover state - 3D lift and glow */
.nav-link:hover {
  transform: translateY(-3px);
  color: var(--neon-primary);
  border-color: rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.05);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 243, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.nav-link:hover .nav-link-text {
  text-shadow: 0 0 10px var(--glow-primary);
  transform: scale(1.05);
}
.nav-link:hover .nav-link-underline {
  width: 80%;
}
.nav-link:hover .nav-link-glow {
  opacity: 1;
}

/* Active state */
.nav-link.active,
.nav-link.router-link-exact-active {
  color: var(--neon-primary);
  font-weight: 600;
  border-color: rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.08);
}
.nav-link.active .nav-link-underline,
.nav-link.router-link-exact-active .nav-link-underline {
  width: 80%;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-accent));
}
.nav-link.active .nav-link-text,
.nav-link.router-link-exact-active .nav-link-text {
  text-shadow: 0 0 10px var(--glow-primary);
}

/* Nav Badge */
.nav-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--neon-red);
  color: #fff;
  font-size: 0.65em;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  font-family: 'Ubuntu Mono', monospace;
  box-shadow: 0 0 8px var(--neon-red);
}

/* ── Nav Actions (Theme & Lang buttons) ── */
.nav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.theme-btn {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.85rem;
  padding: 6px 10px;
  background: transparent;
  color: var(--neon-yellow);
  border: 1px solid var(--neon-yellow);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.theme-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--neon-yellow);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}
.theme-btn:hover {
  color: #000;
  box-shadow: 0 0 15px rgba(255, 230, 0, 0.5), 0 0 30px rgba(255, 230, 0, 0.2);
  transform: translateY(-2px) scale(1.05);
}
.theme-btn:hover::before { opacity: 1; }
.theme-btn .btn-icon {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}
.theme-btn:hover .btn-icon {
  transform: rotate(15deg);
}
.theme-btn:active {
  transform: translateY(0) scale(0.98);
}

.logout-btn {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.8rem;
  padding: 6px 12px;
  background: rgba(255, 71, 87, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 0.25);
  border-color: rgba(255, 71, 87, 0.5);
}

.lang-btn {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.85rem;
  padding: 6px 12px;
  background: transparent;
  color: var(--neon-purple);
  border: 1px solid var(--neon-purple);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  letter-spacing: 0.05em;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.lang-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--neon-purple);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}
.lang-btn:hover {
  color: #fff;
  box-shadow: 0 0 15px rgba(255, 0, 170, 0.5), 0 0 30px rgba(255, 0, 170, 0.2);
  transform: translateY(-2px) scale(1.05);
}
.lang-btn:hover::before { opacity: 1; }
.lang-btn .btn-text {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}
.lang-btn:active {
  transform: translateY(0) scale(0.98);
}

/* ── Mobile Menu Button ── */
.nav-mobile-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.nav-mobile-btn:hover {
  background: rgba(0, 243, 255, 0.1);
}
.nav-mobile-btn span {
  display: block;
  width: 22px; height: 2px;
  background: var(--neon-cyan);
  box-shadow: 0 0 4px var(--neon-cyan);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-mobile-btn.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
  box-shadow: 0 0 8px var(--neon-cyan);
}
.nav-mobile-btn.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.nav-mobile-btn.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
  box-shadow: 0 0 8px var(--neon-cyan);
}

/* ── Mobile Slide-out Sidebar ── */
.nav-sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 10000;
}
.nav-sidebar-backdrop.open {
  opacity: 1;
  visibility: visible;
}

.nav-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: var(--navbar-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid var(--navbar-border);
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.4);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.nav-sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--navbar-border);
}
.sidebar-title {
  font-size: 0.9rem;
  color: var(--neon-primary);
  letter-spacing: 0.1em;
}
.sidebar-close {
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
.sidebar-close:hover {
  background: rgba(0, 243, 255, 0.1);
}
.sidebar-close span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--neon-cyan);
  box-shadow: 0 0 4px var(--neon-cyan);
}
.sidebar-close span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.sidebar-close span:nth-child(2) {
  transform: translateY(-6px) rotate(-45deg);
}

.sidebar-links {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-link {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-dim);
  border: 1px solid transparent;
  letter-spacing: 0.05em;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sidebar-link:hover {
  transform: translateX(4px);
  color: var(--neon-primary);
  border-color: rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.05);
}
.sidebar-link.active {
  color: var(--neon-primary);
  font-weight: 600;
  border-color: rgba(0, 243, 255, 0.3);
  background: rgba(0, 243, 255, 0.08);
}
.sidebar-link-text {
  position: relative;
  z-index: 2;
}
.sidebar-badge {
  background: var(--neon-red);
  color: #fff;
  font-size: 0.7em;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 0 8px var(--neon-red);
}

.sidebar-actions {
  padding: 16px;
  border-top: 1px solid var(--navbar-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-logout {
  background: rgba(255, 71, 87, 0.15) !important;
  color: #ff6b6b !important;
  border: 1px solid rgba(255, 71, 87, 0.3) !important;
}
.sidebar-btn {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.85rem;
  padding: 10px 16px;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--navbar-border);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  text-align: left;
}
.sidebar-btn:hover {
  color: var(--neon-primary);
  border-color: var(--neon-primary);
  background: rgba(0, 243, 255, 0.05);
}
.sidebar-btn .btn-icon {
  margin-right: 8px;
}

/* ── Bottom Navigation Bar (Mobile Only) ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--navbar-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid var(--navbar-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  z-index: 9998;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-dim);
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 6px 4px;
}
.bottom-nav-item:hover {
  color: var(--neon-primary);
  background: rgba(0, 243, 255, 0.05);
}
.bottom-nav-item.active {
  color: var(--neon-primary);
}
.bottom-nav-icon {
  font-size: 1.2rem;
  line-height: 1;
}
.bottom-nav-label {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.02em;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-actions { display: none; }
  .nav-mobile-btn { display: flex; margin-left: auto; }
  .bottom-nav { display: flex; }
  .navbar { padding-bottom: 60px; }
}

/* ── Extra Small Screens ── */
@media (max-width: 360px) {
  .nav-sidebar {
    width: 260px;
  }
  .bottom-nav-label {
    font-size: 0.55rem;
  }
}

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  .scroll-progress {
    animation: none !important;
    background: var(--neon-primary) !important;
  }
  .animate-pixel-flicker,
  .animate-pixel-in,
  .nav-link,
  .nav-link-underline,
  .nav-link-glow,
  .theme-btn,
  .lang-btn,
  .nav-logo:hover .logo-text,
  .nav-logo:hover .logo-pixels,
  .nav-logo:hover .pixel-dot {
    animation: none !important;
    transition: none !important;
  }
  .nav-link:hover,
  .theme-btn:hover,
  .lang-btn:hover {
    transform: none !important;
  }
}
</style>
