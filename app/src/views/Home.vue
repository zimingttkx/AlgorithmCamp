<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-grid"></div>
      <div class="container hero-inner">
        <div class="hero-left">
          <div class="hero-tag pixel-font"><span class="blink">▶</span> {{ t('PLAYER ONE', 'PLAYER ONE') }}</div>
          <h1 class="hero-name pixel-font glow-blue">zimingttkx</h1>
          <div class="hero-title pixel-font glow-cyan">{{ t('算法 · 机器学习 · 网络安全', 'Algorithm · ML · Cybersecurity') }}</div>
          <p class="hero-desc">{{ t(
            '热爱技术、热爱竞技编程，探索 AI 与安全的交叉地带。405⭐ ML教程、153⭐ 网络安全检测系统、48⭐ C++20 从零实现。',
            'Passionate about competitive programming and AI security. 405⭐ ML Tutorial, 153⭐ Network Security System, 48⭐ C++20 from-scratch.'
          ) }}</p>
          <div class="hero-level">
            <span class="pixel-font" style="font-size:.5rem;color:var(--mc-gold)">LV.{{ level }}</span>
            <div class="xp-bar-outer" style="flex:1">
              <div class="xp-bar-inner" :style="{width: xpPct+'%'}"></div>
            </div>
            <span class="pixel-font" style="font-size:.42rem;color:var(--text-dim)">{{ xp }} XP</span>
          </div>
          <div class="hero-btns">
            <router-link to="/practice" class="pixel-btn">⚔ {{ t('开始刷题', 'PRACTICE') }}</router-link>
            <router-link to="/projects" class="pixel-btn pixel-btn-purple">◈ {{ t('查看项目', 'PROJECTS') }}</router-link>
            <a href="https://github.com/zimingttkx" target="_blank" class="pixel-btn pixel-btn-pink">◉ GitHub</a>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-avatar-wrap">
            <img :src="avatar" alt="avatar" class="hero-avatar" @error="avatarFallback" />
            <div class="avatar-ring"></div>
            <div class="avatar-ring ring2"></div>
          </div>
          <div class="hero-stats">
            <div class="hstat pixel-card">
              <div class="hstat-val pixel-font glow-cyan">{{ stats.repos }}</div>
              <div class="hstat-label">{{ t('仓库', 'Repos') }}</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val pixel-font glow-purple">{{ stats.stars }}</div>
              <div class="hstat-label">Stars</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val pixel-font glow-pink">{{ stats.followers }}</div>
              <div class="hstat-label">{{ t('粉丝', 'Followers') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section class="section container reveal" ref="sec0">
      <div class="section-title">{{ t('明星项目', 'FEATURED PROJECTS') }}</div>
      <div class="feat-grid">
        <div v-for="(p, i) in featuredProjects" :key="p.name" class="feat-card pixel-card stagger-card"
          :style="{ animationDelay: (i * 0.15) + 's' }"
          @click="openProjectModal(p)">
          <div class="feat-card-top">
            <span class="feat-lang-dot" :style="{background: p.langColor}"></span>
            <span class="feat-lang">{{ p.lang }}</span>
            <span class="feat-stars">⭐ {{ p.stars }}</span>
          </div>
          <div class="feat-name">{{ p.name }}</div>
          <div class="feat-desc">{{ isZh ? p.descZh : p.descEn }}</div>
          <div class="feat-tags">
            <span v-for="tag in p.tags" :key="tag" class="pixel-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Practice Overview -->
    <section class="section container reveal" ref="sec1">
      <div class="section-title">{{ t('刷题进度', 'PRACTICE PROGRESS') }}</div>
      <div class="practice-overview">
        <div class="pov-info">
          <div class="pixel-font" style="font-size:1.8rem;color:var(--neon-cyan);text-shadow:0 0 16px var(--neon-cyan)">{{ donePct }}%</div>
          <div style="color:var(--text-dim);font-size:.85rem;margin-top:4px">{{ doneTotal }} / {{ totalProblems }} {{ t('题已完成', 'solved') }}</div>
          <div class="pixel-progress-outer" style="margin-top:12px">
            <div class="pixel-progress-inner" :style="{width: donePct+'%'}"></div>
          </div>
        </div>
        <div class="pov-chapters">
          <div v-for="ch in chapters" :key="ch.id" class="ch-mini pixel-card">
            <div class="ch-mini-title">{{ ch.short }}</div>
            <div class="ch-mini-bar">
              <div class="xp-bar-outer">
                <div class="xp-bar-inner" :style="{width: chPct(ch)+'%', background: ch.light}"></div>
              </div>
            </div>
            <div class="ch-mini-pct pixel-font" :style="{color: ch.light}">{{ chPct(ch) }}%</div>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;text-align:center">
        <router-link to="/practice" class="pixel-btn">⚔ {{ t('进入刷题闯关', 'ENTER PRACTICE') }}</router-link>
      </div>
    </section>

    <!-- Latest Blog -->
    <section class="section container reveal" ref="sec2">
      <div class="section-title">{{ t('最新文章', 'LATEST POSTS') }}</div>
      <div class="blog-grid">
        <div v-for="post in latestPosts" :key="post.id" class="pixel-card blog-card" @click="$router.push('/blog/'+post.id)">
          <div class="blog-card-date pixel-font">{{ post.date }}</div>
          <div class="blog-card-title">{{ post.title }}</div>
          <div class="blog-card-desc">{{ post.desc }}</div>
          <div class="blog-card-tags">
            <span v-for="t in post.tags" :key="t" class="pixel-tag">{{ t }}</span>
          </div>
        </div>
      </div>
      <div v-if="!latestPosts.length" class="empty-state pixel-font">{{ t('文章即将发布，敬请期待...', 'Posts coming soon...') }}</div>
      <div style="margin-top:20px;text-align:center">
        <router-link to="/blog" class="pixel-btn pixel-btn-purple">◈ {{ t('查看全部文章', 'ALL POSTS') }}</router-link>
      </div>
    </section>

    <!-- Project Modal -->
    <Teleport to="body">
      <div v-if="modalProject" class="modal-overlay" @click.self="closeProjectModal">
        <div class="modal-content pixel-card">
          <button class="modal-close" @click="closeProjectModal">×</button>
          <div class="modal-header">
            <span class="modal-lang-dot" :style="{background: modalProject.langColor}"></span>
            <span class="modal-lang">{{ modalProject.lang }}</span>
            <span class="modal-stars">⭐ {{ modalProject.stars }}</span>
          </div>
          <h2 class="modal-title pixel-font glow-blue">{{ modalProject.name }}</h2>
          <p class="modal-desc">{{ isZh ? modalProject.descZh : modalProject.descEn }}</p>

          <div class="modal-section">
            <h3 class="modal-section-title">{{ t('核心功能', 'Key Features') }}</h3>
            <ul class="modal-points">
              <li v-for="(point, idx) in (isZh ? modalProject.pointsZh : modalProject.pointsEn)" :key="idx">
                {{ point }}
              </li>
            </ul>
          </div>

          <div class="modal-section">
            <h3 class="modal-section-title">{{ t('技术栈', 'Tech Stack') }}</h3>
            <div class="modal-tags">
              <span v-for="tag in modalProject.tags" :key="tag" class="pixel-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <a :href="modalProject.url" target="_blank" class="pixel-btn">◉ {{ t('查看源码', 'View Source') }}</a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { CHAPTERS, BLOG_POSTS } from '../composables/data.js'
import { getProgress } from '../composables/progress.js'
import { useLang } from '../composables/i18n.js'

const { isZh, t } = useLang()

const avatar = ref('https://github.com/zimingttkx.png')
const stats = ref({ repos: '—', stars: 606, followers: '—' })
const level = ref(1)
const xp = ref(0)
const xpPct = ref(0)
const chapters = CHAPTERS
const latestPosts = BLOG_POSTS.slice(0, 3)
const modalProject = ref(null)

const { doneTotal, totalProblems, donePct } = getProgress()

function chPct(ch) {
  const prog = getProgress(ch.id)
  return prog.donePct
}

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%231a1a30"/><text x="50%" y="55%" font-size="32" text-anchor="middle" fill="%2300f3ff">Z</text></svg>'
}

function openProjectModal(project) {
  modalProject.value = project
  document.body.style.overflow = 'hidden'
}

function closeProjectModal() {
  modalProject.value = null
  document.body.style.overflow = ''
}

// Close modal on Escape key
watch(modalProject, (val) => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && modalProject.value) {
      closeProjectModal()
    }
  }
  if (val) {
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
  }
})

const featuredProjects = [
  {
    name: 'AI-Practices',
    lang: 'Jupyter Notebook', langColor: '#DA5B0B',
    stars: 405,
    url: 'https://github.com/zimingttkx/AI-Practices',
    descZh: '机器学习与深度学习实战教程。涵盖线性回归、神经网络、CNN、RNN等完整实现，适合入门到进阶。',
    descEn: 'Comprehensive ML & DL tutorial with Jupyter Notebooks. Covers linear regression, neural networks, CNN, RNN and more.',
    tags: ['PyTorch', 'ML', 'Deep Learning', 'Tutorial'],
    pointsZh: [
      '从零开始的机器学习教程，包含完整理论讲解与代码实现',
      '涵盖监督学习、无监督学习、深度学习等核心算法',
      'CNN图像分类、RNN序列建模、Transformer架构详解',
      '提供可交互的Jupyter Notebook，边学边练',
    ],
    pointsEn: [
      'Comprehensive ML tutorial from scratch with theory and code',
      'Covers supervised/unsupervised learning, deep learning algorithms',
      'CNN image classification, RNN sequence modeling, Transformer architecture',
      'Interactive Jupyter Notebooks for hands-on learning',
    ],
  },
  {
    name: 'Network-Security-Based-On-ML',
    lang: 'Python', langColor: '#3572A5',
    stars: 153,
    url: 'https://github.com/zimingttkx/Network-Security-Based-On-ML',
    descZh: '基于机器学习的网络安全检测系统，集成 Kitsune/LUCID 算法，99.58% 攻击检测准确率，19913 QPS，支持 Docker/K8s 部署。',
    descEn: 'ML-powered network intrusion detection system. 99.58% accuracy, 19913 QPS, Kitsune/LUCID algorithms, Docker/K8s support.',
    tags: ['Python', 'Cybersecurity', 'ML', 'Docker'],
    pointsZh: [
      '集成 Kitsune、LUCID 等先进入侵检测算法',
      '99.58% 检测准确率，19913 QPS 高吞吐量',
      '支持实时网络流量分析与异常检测',
      'Docker/Kubernetes 一键部署，生产环境可用',
    ],
    pointsEn: [
      'Integrated Kitsune, LUCID advanced intrusion detection algorithms',
      '99.58% detection accuracy, 19913 QPS high throughput',
      'Real-time network traffic analysis and anomaly detection',
      'Docker/Kubernetes one-click deployment, production-ready',
    ],
  },
  {
    name: 'cpp-from-scratch',
    lang: 'C++', langColor: '#f34b7d',
    stars: 48,
    url: 'https://github.com/zimingttkx/cpp-from-scratch',
    descZh: 'C++20 从零实现：LRU/LFU/ARC 缓存、红黑树、内存池、GC 等。仅头文件，零依赖。',
    descEn: 'C++20 from-scratch implementations: LRU/LFU/ARC cache, red-black tree, memory pool, GC. Header-only, zero deps.',
    tags: ['C++20', 'Data Structures', 'Header-only'],
    pointsZh: [
      '从零手写 LRU、LFU、ARC 等经典缓存淘汰算法',
      '红黑树、AVL树、B树等平衡树结构完整实现',
      '内存池、垃圾回收器等底层系统组件',
      'Header-only 设计，零依赖，开箱即用',
    ],
    pointsEn: [
      'From-scratch LRU, LFU, ARC classic cache eviction algorithms',
      'Red-black tree, AVL tree, B-tree balanced structures fully implemented',
      'Memory pool, garbage collector low-level system components',
      'Header-only design, zero dependencies, ready to use',
    ],
  },
]

async function loadGitHub() {
  try {
    const r = await fetch('https://api.github.com/users/zimingttkx')
    if (!r.ok) return
    const d = await r.json()
    stats.value.repos = d.public_repos ?? '—'
    stats.value.followers = d.followers ?? '—'
    avatar.value = d.avatar_url || avatar.value
  } catch {}
}

onMounted(() => {
  loadGitHub()
  const done = doneTotal.value
  xp.value = done * 50
  level.value = Math.max(1, Math.floor(done / 20) + 1)
  xpPct.value = Math.min(100, (xp.value % 1000) / 1000 * 100)

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.home { padding-top: 56px; }

.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,243,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,243,255,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
.hero-inner {
  display: flex;
  align-items: center;
  gap: 60px;
  padding: 80px 24px;
  position: relative;
  z-index: 1;
}
.hero-left { flex: 1; min-width: 0; }
.hero-tag { font-size: 0.5rem; color: var(--neon-pink); text-shadow: 0 0 8px var(--neon-pink); margin-bottom: 16px; letter-spacing: 0.2em; }
.blink { animation: blink 1s step-end infinite; }
.hero-name { font-size: clamp(1.4rem, 4vw, 2.4rem); margin-bottom: 12px; letter-spacing: 0.05em; }
.hero-title { font-size: clamp(0.5rem, 1.5vw, 0.72rem); margin-bottom: 16px; letter-spacing: 0.1em; }
.hero-desc { color: var(--text-dim); font-size: 0.9rem; line-height: 1.85; margin-bottom: 24px; max-width: 520px; }
.hero-level { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.hero-btns { display: flex; flex-wrap: wrap; gap: 12px; }

.hero-right { display: flex; flex-direction: column; align-items: center; gap: 24px; flex-shrink: 0; }
.hero-avatar-wrap { position: relative; width: 180px; height: 180px; }
.hero-avatar {
  width: 180px; height: 180px;
  border: 3px solid var(--neon-blue);
  box-shadow: 0 0 32px rgba(0,243,255,0.5);
  image-rendering: pixelated;
  animation: float 4s ease-in-out infinite;
  display: block;
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}
.avatar-ring { position: absolute; inset: -14px; border: 2px solid var(--neon-purple); opacity: 0.6; animation: neonPulse 2s ease-in-out infinite; clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%); }
.ring2 { inset: -26px; border-color: var(--neon-cyan); opacity: 0.3; animation-delay: 1s; }
.hero-stats { display: flex; gap: 12px; }
.hstat { text-align: center; padding: 12px 16px; min-width: 64px; }
.hstat-val { font-size: 1rem; }
.hstat-label { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

.section { padding: 80px 0; }
.section:nth-child(2) { padding: 64px 0; }
.section:nth-child(3) { padding: 48px 0; }

.feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 16px; }
.feat-card { cursor: pointer; padding: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.feat-card:hover { transform: translateY(-4px); }
.feat-card:nth-child(1) { animation-delay: 0.1s; }
.feat-card:nth-child(2) { animation-delay: 0.2s; }
.feat-card:nth-child(3) { animation-delay: 0.3s; }
.feat-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.feat-lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.feat-lang { font-size: .75rem; color: var(--text-dim); flex: 1; }
.feat-stars { font-size: .75rem; color: var(--mc-gold); }
.feat-name { font-size: 1rem; font-weight: 700; color: var(--neon-blue); margin-bottom: 8px; }
.feat-desc { font-size: .82rem; color: var(--text-dim); line-height: 1.7; margin-bottom: 12px; }
.feat-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.practice-overview { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; }
.pov-info { min-width: 220px; flex-shrink: 0; }
.pov-chapters { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 10px; }
.ch-mini { padding: 10px 12px; cursor: default; }
.ch-mini-title { font-size: .72rem; margin-bottom: 6px; color: var(--text-dim); }
.ch-mini-bar { margin-bottom: 4px; }
.ch-mini-pct { font-size: .42rem; }

.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 16px; }
.blog-card { cursor: pointer; }
.blog-card:hover { transform: translateY(-4px); }
.blog-card-date { font-size: .42rem; color: var(--text-dim); margin-bottom: 8px; }
.blog-card-title { font-size: .95rem; margin-bottom: 8px; color: var(--text-main); font-weight: 600; }
.blog-card-desc { font-size: .8rem; color: var(--text-dim); margin-bottom: 12px; line-height: 1.6; }
.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.empty-state { color: var(--text-dim); font-size: .55rem; text-align: center; padding: 40px; letter-spacing: .1em; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  position: relative;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: var(--text-dim);
  font-size: 1.4rem;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover {
  background: var(--neon-pink);
  color: #fff;
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.modal-lang-dot { width: 12px; height: 12px; border-radius: 50%; }
.modal-lang { font-size: .8rem; color: var(--text-dim); }
.modal-stars { font-size: .8rem; color: var(--mc-gold); margin-left: auto; }
.modal-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}
.modal-desc {
  color: var(--text-dim);
  font-size: .9rem;
  line-height: 1.7;
  margin-bottom: 20px;
}
.modal-section {
  margin-bottom: 20px;
}
.modal-section-title {
  font-size: .75rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
  font-weight: 600;
}
.modal-points {
  margin: 0;
  padding-left: 20px;
  color: var(--text-dim);
  font-size: .85rem;
  line-height: 1.8;
}
.modal-points li {
  margin-bottom: 6px;
}
.modal-points li::marker {
  color: var(--neon-purple);
}
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.modal-actions {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; padding: 40px 24px; gap: 32px; }
  .hero-right { width: 100%; }
  .hero-stats { justify-content: center; }
  .practice-overview { flex-direction: column; }
  .modal-content { padding: 20px; }
}
</style>