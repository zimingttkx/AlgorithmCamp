<template>
  <div class="blog-post-page" style="padding-top:64px">
    <div class="container post-container">
      <div class="post-back">
        <button class="pixel-btn pixel-btn-purple" @click="$router.push('/blog')">◀ 返回列表</button>
      </div>
      <div v-if="loading" class="post-loading">LOADING...</div>
      <div v-else-if="error" class="post-error">{{ error }}</div>
      <article v-else class="post-article">
        <div class="post-meta">
          <span class="post-date">{{ post.date }}</span>
          <span v-for="t in post.tags" :key="t" class="pixel-tag">{{ t }}</span>
        </div>
        <h1 class="post-title pixel-font glow-blue">{{ post.title }}</h1>
        <div class="post-content" v-html="html"></div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { BLOG_POSTS } from '../composables/data.js'

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
})

const route = useRoute()
const post = ref({})
const html = ref('')
const loading = ref(true)
const error = ref('')

async function loadPost(id) {
  loading.value = true
  error.value = ''
  const meta = BLOG_POSTS.find(p => p.id === id)
  if (!meta) { error.value = '文章不存在'; loading.value = false; return }
  post.value = meta
  try {
    const r = await fetch(`/${meta.file}`)
    if (!r.ok) throw new Error('404')
    const md = await r.text()
    html.value = marked(md)
  } catch {
    error.value = '文章加载失败'
  }
  loading.value = false
}

onMounted(() => loadPost(route.params.id))
watch(() => route.params.id, id => loadPost(id))
</script>

<style scoped>
.post-container { max-width: 780px; padding: 40px 24px 80px; }
.post-back { margin-bottom: 28px; }
.post-loading, .post-error {
  font-size: 0.9rem;
  color: var(--neon-cyan);
  padding: 60px;
  text-align: center;
  animation: blink 1s step-end infinite;
}
.post-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.post-date { font-size: 0.85rem; color: var(--text-dim); }
.post-title { font-size: clamp(0.8rem, 2vw, 1.2rem); margin-bottom: 32px; line-height: 1.6; }

.post-content { color: var(--text-main); line-height: 1.9; font-size: 0.95rem; }
.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  color: var(--neon-cyan);
  margin: 32px 0 16px;
}
.post-content :deep(h1) { font-family: 'Press Start 2P', monospace; font-size: 1.1rem; text-shadow: 0 0 8px var(--neon-cyan); }
.post-content :deep(h2) { font-family: 'Ubuntu Mono', Consolas, Monaco, monospace; font-size: 1.2rem; font-weight: 600; text-shadow: 0 0 6px var(--neon-cyan); }
.post-content :deep(h3) { font-family: 'Ubuntu Mono', Consolas, Monaco, monospace; font-size: 1.1rem; font-weight: 600; color: var(--neon-purple); }
.post-content :deep(p) { margin-bottom: 16px; }
.post-content :deep(a) { color: var(--neon-blue); text-decoration: none; border-bottom: 1px solid var(--neon-blue); }
.post-content :deep(code) {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  background: #1a1a2e;
  padding: 2px 6px;
  border: 1px solid var(--border-pixel);
  font-size: 0.9em;
  color: var(--neon-cyan);
}
.post-content :deep(pre) {
  background: #0d0d1a;
  border: 2px solid var(--border-pixel);
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 20px;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.5);
}
.post-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}
.post-content :deep(blockquote) {
  border-left: 3px solid var(--neon-purple);
  padding-left: 16px;
  color: var(--text-dim);
  margin: 16px 0;
}
.post-content :deep(ul), .post-content :deep(ol) { padding-left: 24px; margin-bottom: 16px; }
.post-content :deep(li) { margin-bottom: 6px; }
.post-content :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.post-content :deep(th) {
  background: var(--bg-panel);
  border: 1px solid var(--border-pixel);
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neon-cyan);
}
.post-content :deep(td) {
  border: 1px solid var(--border-pixel);
  padding: 8px 12px;
  font-size: 0.85rem;
}
.post-content :deep(img) { max-width: 100%; border: 2px solid var(--border-pixel); }
</style>
