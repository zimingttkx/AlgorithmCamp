<template>
  <div class="projects-page" style="padding-top:56px">
    <div class="container">
      <div class="page-header">
        <div class="section-title">GitHub 项目</div>
        <p class="page-sub">开源仓库 · 实战项目</p>
      </div>

      <div v-if="loading" class="proj-loading pixel-font">FETCHING REPOS...</div>
      <div v-else class="proj-grid">
        <div v-for="repo in repos" :key="repo.id" class="pixel-card proj-card">
          <div class="proj-card-top">
            <div class="proj-name">{{ repo.name }}</div>
            <a :href="repo.html_url" target="_blank" class="proj-link pixel-font">OPEN ▶</a>
          </div>
          <p class="proj-desc">{{ repo.description || '暂无描述' }}</p>
          <div class="proj-meta">
            <span v-if="repo.language" class="proj-lang">
              <span class="lang-dot" :style="{background: langColor(repo.language)}"></span>
              {{ repo.language }}
            </span>
            <span class="proj-stat">⭐ {{ repo.stargazers_count }}</span>
            <span class="proj-stat">🍴 {{ repo.forks_count }}</span>
          </div>
          <div class="proj-updated pixel-font">更新: {{ formatDate(repo.pushed_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const repos = ref([])
const loading = ref(true)

const LANG_COLORS = {
  'C++': '#f34b7d', 'Python': '#3572A5', 'JavaScript': '#f1e05a',
  'TypeScript': '#2b7489', 'Java': '#b07219', 'C': '#555555',
  'Go': '#00ADD8', 'Rust': '#dea584', 'Vue': '#41b883', 'HTML': '#e34c26',
}
function langColor(lang) { return LANG_COLORS[lang] || '#8b949e' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '—' }

onMounted(async () => {
  try {
    const r = await fetch('https://api.github.com/users/zimingttkx/repos?sort=pushed&per_page=20')
    if (r.ok) repos.value = await r.json()
  } catch {}
  loading.value = false
})
</script>

<style scoped>
.projects-page { min-height: 100vh; }
.page-header { padding: 48px 0 32px; }
.page-sub { color: var(--text-dim); font-size: 0.85rem; margin-top: -16px; }

.proj-loading {
  font-size: 0.55rem; color: var(--neon-cyan);
  text-align: center; padding: 80px;
  animation: blink 1s step-end infinite;
}

.proj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 16px;
  padding-bottom: 60px;
}
.proj-card { padding: 20px; transition: transform 0.2s; }
.proj-card:hover { transform: translate(-3px,-3px); }
.proj-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.proj-name { font-size: 0.95rem; font-weight: 700; color: var(--neon-blue); word-break: break-all; }
.proj-link {
  font-size: 0.38rem;
  color: var(--neon-cyan);
  text-decoration: none;
  border: 1px solid var(--neon-cyan);
  padding: 3px 8px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.proj-link:hover { background: var(--neon-cyan); color: var(--bg-dark); }
.proj-desc { color: var(--text-dim); font-size: 0.82rem; line-height: 1.6; margin-bottom: 14px; }
.proj-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.proj-lang { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--text-main); }
.lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.proj-stat { font-size: 0.78rem; color: var(--text-dim); }
.proj-updated { font-size: 0.38rem; color: var(--text-dim); margin-top: 4px; letter-spacing: 0.05em; }

@media (max-width: 600px) {
  .proj-grid { grid-template-columns: 1fr; }
}
</style>
