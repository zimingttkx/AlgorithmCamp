import { ref, watch } from 'vue'

const isDark = ref(true)

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
  watch(isDark, v => localStorage.setItem('theme', v ? 'dark' : 'light'))
  return { isDark, toggle, init }
}
