import { ref, computed } from 'vue'

const lang = ref('zh')

export function useLang() {
  function toggle() { lang.value = lang.value === 'zh' ? 'en' : 'zh' }
  const isZh = computed(() => lang.value === 'zh')
  function t(zh, en) { return lang.value === 'zh' ? zh : en }
  return { lang, isZh, toggle, t }
}
