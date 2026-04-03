import { ref, watch, getCurrentInstance } from 'vue'

const isDark = ref(true)

// Watch cleanup flag
let watchCleanup = null

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
  function init() {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') { isDark.value = false }
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
  
  // Only create watch once, in component context
  if (!watchCleanup && getCurrentInstance()) {
    const stop = watch(isDark, v => localStorage.setItem('theme', v ? 'dark' : 'light'))
    watchCleanup = stop
  }
  
  return { isDark, toggle, init }
}
