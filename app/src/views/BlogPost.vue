<template>
  <div class="blog-post-page" style="padding-top:64px">
    <!-- Reading Progress Bar (Task 10) -->
    <div class="reading-progress-bar">
      <div class="reading-progress-fill" :style="{ width: readingProgress + '%' }"></div>
    </div>
    <div class="pixel-grid-overlay"></div>
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
        <div class="post-content" v-html="html" ref="postContent"></div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
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
const readingProgress = ref(0)
const postContent = ref(null)

// Calculate reading progress based on scroll position
function updateReadingProgress() {
  if (!postContent.value) {
    readingProgress.value = 0
    return
  }

  const element = postContent.value
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const elementHeight = element.offsetHeight

  // Calculate how much of the article has been scrolled past
  const scrolledPast = windowHeight - rect.top
  const totalScrollDistance = elementHeight + windowHeight

  if (scrolledPast <= 0) {
    readingProgress.value = 0
  } else if (scrolledPast >= totalScrollDistance) {
    readingProgress.value = 100
  } else {
    readingProgress.value = Math.round((scrolledPast / totalScrollDistance) * 100)
  }
}

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
  // Reset progress after content loads
  setTimeout(() => {
    updateReadingProgress()
  }, 100)
}

onMounted(() => {
  loadPost(route.params.id)
  window.addEventListener('scroll', updateReadingProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
})

watch(() => route.params.id, id => loadPost(id))
</script>

<style scoped>
/* ── Reading Progress Bar (Task 10) ── */
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--bg-elevated);
  z-index: 9999;
  overflow: hidden;
}

.reading-progress-fill {
  height: 100%;
  background: var(--rainbow-gradient);
  background-size: 400% 100%;
  animation: rainbowFlow 3s linear infinite;
  transition: width 0.1s ease-out;
  box-shadow:
    0 0 10px var(--glow-primary),
    0 0 20px var(--glow-secondary-soft);
}

.reading-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateX(100%); }
}

/* Pixel grid overlay for blog post */
.pixel-grid-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image:
    linear-gradient(rgba(var(--neon-primary-rgb), 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--neon-primary-rgb), 0.02) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.5;
}

.post-container { max-width: 780px; padding: 40px 24px 80px; position: relative; z-index: 2; }
.post-back { margin-bottom: 28px; }

/* ── Post loading with pixel animation ── */
.post-loading, .post-error {
  font-size: 0.9rem;
  color: var(--neon-cyan);
  padding: 60px;
  text-align: center;
  animation: blink 1s step-end infinite;
}

/* Pixel loading animation */
.post-loading {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
}

.post-loading::before {
  content: '[ ';
  animation: pixelPulse 1s ease-in-out infinite;
}

.post-loading::after {
  content: ' ]';
  animation: pixelPulse 1s ease-in-out infinite reverse;
}

@keyframes pixelPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.post-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.post-date { font-size: 0.85rem; color: var(--text-dim); }

/* Enhanced post title with glow */
.post-title {
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  margin-bottom: 32px;
  line-height: 1.6;
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.post-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--rainbow-gradient);
  background-size: 400% 100%;
  animation: rainbowFlow 3s linear infinite;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-article:hover .post-title::after {
  width: 100%;
}

.post-content { color: var(--text-main); line-height: 1.9; font-size: 0.95rem; }
.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  color: var(--neon-cyan);
  margin: 32px 0 16px;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.post-content :deep(h1):hover,
.post-content :deep(h2):hover,
.post-content :deep(h3):hover {
  text-shadow: 0 0 20px var(--glow-primary);
}

.post-content :deep(h1) { font-family: 'Press Start 2P', monospace; font-size: 1.1rem; text-shadow: 0 0 8px var(--neon-cyan); }
.post-content :deep(h2) { font-family: 'Ubuntu Mono', Consolas, Monaco, monospace; font-size: 1.2rem; font-weight: 600; text-shadow: 0 0 6px var(--neon-cyan); }
.post-content :deep(h3) { font-family: 'Ubuntu Mono', Consolas, Monaco, monospace; font-size: 1.1rem; font-weight: 600; color: var(--neon-purple); }
.post-content :deep(p) { margin-bottom: 16px; transition: color 0.3s ease; }
.post-content :deep(p:hover) { color: var(--text-secondary); }
.post-content :deep(a) {
  color: var(--neon-blue);
  text-decoration: none;
  border-bottom: 1px solid var(--neon-blue);
  transition: all 0.3s ease;
  position: relative;
}

.post-content :deep(a:hover) {
  color: var(--neon-primary);
  border-bottom-color: var(--neon-primary);
  text-shadow: 0 0 10px var(--glow-primary);
}

.post-content :deep(code) {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  background: #1a1a2e;
  padding: 2px 6px;
  border: 1px solid var(--border-pixel);
  font-size: 0.9em;
  color: var(--neon-cyan);
  transition: all 0.3s ease;
}

.post-content :deep(code:hover) {
  border-color: var(--neon-primary);
  box-shadow: 0 0 10px var(--glow-primary-soft);
}

.post-content :deep(pre) {
  background: #0d0d1a;
  border: 2px solid var(--border-pixel);
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 20px;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.5);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.post-content :deep(pre:hover) {
  border-color: var(--neon-primary);
  box-shadow:
    inset 0 0 12px rgba(0,0,0,0.5),
    0 0 20px var(--glow-primary-soft);
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
  position: relative;
  transition: all 0.3s ease;
}

.post-content :deep(blockquote)::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--neon-primary), var(--neon-secondary), var(--neon-accent));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-content :deep(blockquote:hover)::before {
  opacity: 1;
}

.post-content :deep(ul), .post-content :deep(ol) { padding-left: 24px; margin-bottom: 16px; }
.post-content :deep(li) { margin-bottom: 6px; transition: color 0.3s ease; }
.post-content :deep(li:hover) { color: var(--neon-primary); }
.post-content :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.post-content :deep(th) {
  background: var(--bg-panel);
  border: 1px solid var(--border-pixel);
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neon-cyan);
  transition: all 0.3s ease;
}
.post-content :deep(th:hover) {
  background: var(--bg-elevated);
  text-shadow: 0 0 10px var(--glow-primary);
}
.post-content :deep(td) {
  border: 1px solid var(--border-pixel);
  padding: 8px 12px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}
.post-content :deep(td:hover) {
  background: rgba(var(--neon-primary-rgb), 0.05);
}
.post-content :deep(img) {
  max-width: 100%;
  border: 2px solid var(--border-pixel);
  transition: all 0.3s ease;
}
.post-content :deep(img:hover) {
  border-color: var(--neon-primary);
  box-shadow: 0 0 20px var(--glow-primary-soft);
  transform: scale(1.02);
}

/* ── Reduced Motion Support ── */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-fill {
    animation: none;
    background: var(--neon-primary);
  }

  .reading-progress-fill::after {
    display: none;
  }

  .post-title::after {
    display: none;
  }

  .post-content :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
