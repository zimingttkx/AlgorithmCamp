<template>
  <div class="projects-page" style="padding-top:64px">
    <div class="container">
      <div class="page-header">
        <div class="section-title">{{ t('GitHub 项目', 'GitHub Projects') }}</div>
        <p class="page-sub">{{ t('开源仓库 · 实战项目', 'Open Source · Real Projects') }}</p>
      </div>

      <div v-if="loading" class="proj-loading">FETCHING REPOS...</div>
      <div v-else class="proj-grid">
        <div
          v-for="repo in repos"
          :key="repo.id"
          class="pixel-card proj-card proj-card-pixelated tunnel-container"
          @click="openModal(repo)"
        >
          <div class="tunnel-effect tunnel-vignette">
            <div class="tunnel-layers">
              <div class="tunnel-layer tunnel-layer-back"></div>
              <div class="tunnel-layer tunnel-layer-mid"></div>
            </div>
            <div class="proj-card-top tunnel-border">
              <div class="proj-name">{{ repo.name }}</div>
              <span class="proj-expand">▶</span>
            </div>
            <p class="proj-desc">{{ repo.description || t('暂无描述', 'No description') }}</p>
            <div class="proj-meta">
              <span v-if="repo.language" class="proj-lang">
                <span class="lang-dot" :style="{background: langColor(repo.language)}"></span>
                {{ repo.language }}
              </span>
              <span class="proj-stat-pixel">⭐ {{ repo.stargazers_count }}</span>
              <span class="proj-stat-pixel">🍴 {{ repo.forks_count }}</span>
            </div>
            <div class="proj-updated">{{ t('更新', 'Updated') }}: {{ formatDate(repo.pushed_at) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedRepo"
        class="modal-overlay modal-overlay-pixelate"
        :class="{ 'modal-overlay-exit': isClosing }"
        @click.self="closeModal"
      >
        <div
          class="modal-content pixel-card modal-content-bounce modal-neon-border modal-shine"
          :class="{ 'modal-content-exit-zoom': isClosing }"
        >
          <button class="modal-close" @click="closeModal">×</button>
          <div class="modal-header">
            <span v-if="selectedRepo.language" class="modal-lang-dot" :style="{background: langColor(selectedRepo.language)}"></span>
            <span class="modal-lang">{{ selectedRepo.language || t('未知', 'Unknown') }}</span>
            <span class="modal-stars">⭐ {{ selectedRepo.stargazers_count }}</span>
          </div>
          <h2 class="modal-title pixel-font glow-blue">{{ selectedRepo.name }}</h2>
          <p class="modal-desc">{{ selectedRepo.description || t('暂无项目描述', 'No description available') }}</p>

          <!-- Pixelated Project Preview Section -->
          <div class="project-preview-modal">
            <div class="pixel-screenshot-frame">
              <div class="pixel-preview-container pixel-scanline-overlay">
                <div class="pixel-grid-overlay">
                  <div class="pixel-grid-preview">
                    <div
                      v-for="i in 9"
                      :key="i"
                      class="pixel-grid-cell"
                      :style="{ background: getGridCellColor(i) }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
            <a :href="selectedRepo.html_url" target="_blank" class="pixel-btn pixel-btn-primary">◉ {{ t('查看源码', 'View Source') }}</a>
            <a v-if="selectedRepo.homepage" :href="selectedRepo.homepage" target="_blank" class="pixel-btn pixel-btn-secondary" style="margin-left:10px">◈ {{ t('在线演示', 'Live Demo') }}</a>
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
const isClosing = ref(false)

const LANG_COLORS = {
  'C++': '#f34b7d', 'Python': '#3572A5', 'JavaScript': '#f1e05a',
  'TypeScript': '#2b7489', 'Java': '#b07219', 'C': '#555555',
  'Go': '#00ADD8', 'Rust': '#dea584', 'Vue': '#41b883', 'HTML': '#e34c26',
  'Jupyter Notebook': '#DA5B0B', 'Shell': '#89e051', 'CSS': '#563d7c',
}

const GRID_COLORS = [
  'linear-gradient(135deg, var(--neon-primary), var(--neon-secondary))',
  'linear-gradient(135deg, var(--neon-secondary), var(--neon-accent))',
  'linear-gradient(135deg, var(--neon-accent), var(--neon-primary))',
  'linear-gradient(135deg, var(--neon-primary), var(--neon-accent))',
  'linear-gradient(135deg, var(--glow-primary), var(--glow-secondary))',
  'linear-gradient(135deg, var(--neon-secondary), var(--glow-primary))',
  'linear-gradient(135deg, var(--neon-accent), var(--glow-secondary))',
  'linear-gradient(135deg, var(--glow-primary), var(--neon-accent))',
  'linear-gradient(135deg, var(--neon-primary), var(--glow-accent))',
]

function langColor(lang) { return LANG_COLORS[lang] || '#8b949e' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '—' }
function getGridCellColor(index) { return GRID_COLORS[index % GRID_COLORS.length] }

function openModal(repo) {
  selectedRepo.value = repo
  isClosing.value = false
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  isClosing.value = true
  setTimeout(() => {
    selectedRepo.value = null
    isClosing.value = false
    document.body.style.overflow = ''
  }, 300)
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
.page-sub { color: var(--text-secondary); font-size: 1rem; margin-top: -12px; font-family: 'Space Grotesk', sans-serif; }

.proj-loading {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--neon-cyan);
  text-align: center;
  padding: 80px;
}

.proj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding-bottom: 60px;
}
.proj-card {
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s var(--ease-out-expo);
}
.proj-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg), 0 0 60px var(--glow-blue);
}
.proj-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.proj-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  word-break: break-all;
}
.proj-expand {
  font-size: 0.85rem;
  color: var(--neon-cyan);
  border: 1.5px solid var(--neon-cyan);
  padding: 4px 10px;
  flex-shrink: 0;
  transition: all 0.2s var(--ease-out-expo);
  border-radius: 6px;
}
.proj-card:hover .proj-expand {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  color: var(--bg-base);
  border-color: transparent;
}
.proj-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 16px;
}
.proj-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.proj-lang {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}
.lang-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.proj-stat {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: var(--text-dim);
}
.proj-updated {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 6px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-content {
  position: relative;
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 32px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-dim);
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--ease-out-expo);
}
.modal-close:hover {
  background: var(--neon-pink);
  color: white;
  border-color: var(--neon-pink);
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.modal-lang-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.modal-lang {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-dim);
}
.modal-stars {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--mc-gold);
  margin-left: auto;
}
.modal-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem;
  margin-bottom: 12px;
  word-break: break-all;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.modal-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.modal-section { margin-bottom: 24px; }
.modal-section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  font-weight: 600;
}
.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.modal-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  padding: 12px 16px;
  border-radius: 10px;
}
.info-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.info-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}
.modal-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.modal-actions { display: flex; gap: 12px; margin-top: 24px; }

@media (max-width: 600px) {
  .modal-info-grid { grid-template-columns: 1fr; }
  .proj-grid { grid-template-columns: 1fr; }
}

/* Enhanced project card with tunnel effect */
.proj-card.tunnel-container {
  cursor: pointer;
}

.proj-card.tunnel-container .tunnel-effect {
  position: relative;
}

/* Enhanced modal neon border animation */
.modal-neon-border {
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Modal shine sweep effect */
.modal-shine {
  overflow: hidden;
}

.modal-shine::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.6s ease;
  pointer-events: none;
  z-index: 10;
}

.modal-shine:hover::before {
  left: 150%;
}

/* Pixel preview styles */
.project-preview-modal {
  margin-bottom: 20px;
}

.pixel-screenshot-frame {
  background: var(--bg-elevated);
  border: 2px solid var(--border-default);
  border-radius: 12px;
  padding: 12px;
  position: relative;
}

.pixel-screenshot-frame::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 20px;
  background: linear-gradient(90deg,
    var(--neon-secondary) 0%,
    var(--neon-accent) 33%,
    var(--neon-primary) 66%,
    var(--neon-secondary) 100%
  );
  background-size: 300% 100%;
  border-radius: 8px 8px 0 0;
  animation: rainbowFlow 4s linear infinite;
}

.pixel-preview-container {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.pixel-grid-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.pixel-grid-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  transition: all 0.3s var(--ease-out-expo);
  min-height: 40px;
}

.pixel-grid-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px var(--glow-primary);
  z-index: 1;
}

@keyframes rainbowFlow {
  0% { background-position: 0% center; }
  100% { background-position: 400% center; }
}
</style>
