<template>
  <div class="projects-page" style="padding-top:56px">
    <div class="container">
      <div class="page-header">
        <div class="section-title">{{ t('GitHub 项目', 'GitHub Projects') }}</div>
        <p class="page-sub">{{ t('开源仓库 · 实战项目', 'Open Source · Real Projects') }}</p>
      </div>

      <div v-if="loading" class="proj-loading pixel-font">FETCHING REPOS...</div>
      <div v-else class="proj-grid">
        <div v-for="repo in repos" :key="repo.id" class="pixel-card proj-card" @click="openModal(repo)">
          <div class="proj-card-top">
            <div class="proj-name">{{ repo.name }}</div>
            <span class="proj-expand pixel-font">▶</span>
          </div>
          <p class="proj-desc">{{ repo.description || t('暂无描述', 'No description') }}</p>
          <div class="proj-meta">
            <span v-if="repo.language" class="proj-lang">
              <span class="lang-dot" :style="{background: langColor(repo.language)}"></span>
              {{ repo.language }}
            </span>
            <span class="proj-stat">⭐ {{ repo.stargazers_count }}</span>
            <span class="proj-stat">🍴 {{ repo.forks_count }}</span>
          </div>
          <div class="proj-updated pixel-font">{{ t('更新', 'Updated') }}: {{ formatDate(repo.pushed_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Project Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedRepo" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content pixel-card">
          <button class="modal-close" @click="closeModal">×</button>
          <div class="modal-header">
            <span v-if="selectedRepo.language" class="modal-lang-dot" :style="{background: langColor(selectedRepo.language)}"></span>
            <span class="modal-lang">{{ selectedRepo.language || t('未知', 'Unknown') }}</span>
            <span class="modal-stars">⭐ {{ selectedRepo.stargazers_count }}</span>
          </div>
          <h2 class="modal-title pixel-font glow-blue">{{ selectedRepo.name }}</h2>
          <p class="modal-desc">{{ selectedRepo.description || t('暂无项目描述', 'No description available') }}</p>

          <div class="modal-section">
            <h3 class="modal-section-title">{{ t('项目信息', 'Project Info') }}</h3>
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="info-label">{{ t('主要语言', 'Language') }}</span>
                <span class="info-value">{{ selectedRepo.language || '—' }}</span>
              </div>
              <div class="modal-info-item">
                <span class="info-label">{{ t('Stars', 'Stars') }}</span>
                <span class="info-value">{{ selectedRepo.stargazers_count }}</span>
              </div>
              <div class="modal-info-item">
                <span class="info-label">{{ t('Forks', 'Forks') }}</span>
                <span class="info-value">{{ selectedRepo.forks_count }}</span>
              </div>
              <div class="modal-info-item">
                <span class="info-label">{{ t('创建时间', 'Created') }}</span>
                <span class="info-value">{{ formatDate(selectedRepo.created_at) }}</span>
              </div>
              <div class="modal-info-item">
                <span class="info-label">{{ t('最后更新', 'Updated') }}</span>
                <span class="info-value">{{ formatDate(selectedRepo.pushed_at) }}</span>
              </div>
              <div class="modal-info-item">
                <span class="info-label">{{ t('开源协议', 'License') }}</span>
                <span class="info-value">{{ selectedRepo.license?.spdx_id || '—' }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRepo.topics?.length" class="modal-section">
            <h3 class="modal-section-title">{{ t('标签', 'Topics') }}</h3>
            <div class="modal-tags">
              <span v-for="topic in selectedRepo.topics" :key="topic" class="pixel-tag">{{ topic }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <a :href="selectedRepo.html_url" target="_blank" class="pixel-btn">◉ {{ t('查看源码', 'View Source') }}</a>
            <a v-if="selectedRepo.homepage" :href="selectedRepo.homepage" target="_blank" class="pixel-btn pixel-btn-purple" style="margin-left:10px">◈ {{ t('在线演示', 'Live Demo') }}</a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLang } from '../composables/i18n.js'

const { t } = useLang()

const repos = ref([])
const loading = ref(true)
const selectedRepo = ref(null)

const LANG_COLORS = {
  'C++': '#f34b7d', 'Python': '#3572A5', 'JavaScript': '#f1e05a',
  'TypeScript': '#2b7489', 'Java': '#b07219', 'C': '#555555',
  'Go': '#00ADD8', 'Rust': '#dea584', 'Vue': '#41b883', 'HTML': '#e34c26',
  'Jupyter Notebook': '#DA5B0B', 'Shell': '#89e051', 'CSS': '#563d7c',
}
function langColor(lang) { return LANG_COLORS[lang] || '#8b949e' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '—' }

function openModal(repo) {
  selectedRepo.value = repo
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selectedRepo.value = null
  document.body.style.overflow = ''
}

// Close modal on Escape key
watch(selectedRepo, (val) => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && selectedRepo.value) {
      closeModal()
    }
  }
  if (val) {
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
  }
})

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
.proj-card { padding: 20px; transition: transform 0.2s; cursor: pointer; }
.proj-card:hover { transform: translate(-3px,-3px); }
.proj-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.proj-name { font-size: 0.95rem; font-weight: 700; color: var(--neon-blue); word-break: break-all; }
.proj-expand {
  font-size: 0.38rem;
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  padding: 3px 8px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.proj-card:hover .proj-expand { background: var(--neon-cyan); color: var(--bg-dark); }
.proj-desc { color: var(--text-dim); font-size: 0.82rem; line-height: 1.6; margin-bottom: 14px; }
.proj-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.proj-lang { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--text-main); }
.lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.proj-stat { font-size: 0.78rem; color: var(--text-dim); }
.proj-updated { font-size: 0.38rem; color: var(--text-dim); margin-top: 4px; letter-spacing: 0.05em; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal-content {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 28px;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
.modal-close {
  position: absolute;
  top: 12px; right: 12px;
  background: transparent;
  border: 1px solid var(--border-pixel);
  color: var(--text-dim);
  width: 28px; height: 28px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--neon-pink); color: #fff; border-color: var(--neon-pink); }
.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.modal-lang-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.modal-lang { font-size: .78rem; color: var(--text-dim); }
.modal-stars { font-size: .78rem; color: var(--mc-gold); margin-left: auto; }
.modal-title { font-size: 1.2rem; margin-bottom: 10px; word-break: break-all; }
.modal-desc {
  color: var(--text-dim);
  font-size: .85rem;
  line-height: 1.7;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-pixel);
}
.modal-section { margin-bottom: 18px; }
.modal-section-title {
  font-size: .65rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
  font-weight: 600;
}
.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.modal-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-dark);
  border: 1px solid var(--border-pixel);
  padding: 8px 12px;
  border-radius: 4px;
}
.info-label { font-size: .65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.info-value { font-size: .82rem; color: var(--text-main); font-weight: 600; }
.modal-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pixel-tag {
  font-size: .65rem;
  padding: 3px 10px;
  border: 1px solid var(--neon-purple);
  color: var(--neon-purple);
  border-radius: 2px;
  letter-spacing: 0.05em;
}
.modal-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-pixel);
  text-align: center;
}

@media (max-width: 600px) {
  .proj-grid { grid-template-columns: 1fr; }
  .modal-info-grid { grid-template-columns: 1fr; }
  .modal-content { padding: 20px; }
}
</style>
