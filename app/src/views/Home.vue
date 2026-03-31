<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-grid"></div>
      <div class="container hero-inner">
        <div class="hero-left">
          <div class="hero-tag pixel-font"><span class="blink">▶</span> {{ t('PLAYER ONE', 'PLAYER ONE') }}</div>
          <h1 class="hero-name pixel-font glow-blue">zimingttkx</h1>
          <div class="hero-title glow-cyan">{{ t('ComputerScience · Math', 'ComputerScience · Math') }}</div>
          <p class="hero-desc">{{ t(
            '热爱技术、热爱竞技编程，探索 AI 与安全的交叉地带。405⭐ ML教程、153⭐ 网络安全检测系统、48⭐ C++20 从零实现。',
            'Passionate about competitive programming and AI security. 405⭐ ML Tutorial, 153⭐ Network Security System, 48⭐ C++20 from-scratch.'
          ) }}</p>
          <div class="hero-level">
            <span style="font-size:.85rem;color:var(--mc-gold)">LV.{{ heroLevel.level }}</span>
            <div class="xp-bar-outer" style="flex:1">
              <div class="xp-bar-inner" :style="{width: heroLevel.progress+'%'}"></div>
            </div>
            <span style="font-size:.85rem;color:var(--text-dim)">{{ heroLevel.totalXP }} XP</span>
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
              <div class="hstat-val glow-cyan">{{ stats.repos }}</div>
              <div class="hstat-label">{{ t('仓库', 'Repos') }}</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val glow-purple">{{ stats.stars }}</div>
              <div class="hstat-label">Stars</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val glow-pink">{{ stats.followers }}</div>
              <div class="hstat-label">{{ t('粉丝', 'Followers') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GitHub Stats Dashboard -->
    <section class="section container reveal" ref="sec0a">
      <div class="section-title">{{ t('开发者数据', 'DEV STATS') }}</div>
      <div class="stats-dashboard">
        <LevelCard :totalCommits="ghStats.totalCommits" :calendar="ghStats.calendar" />
        <div class="stats-calendar pixel-card">
          <ContribCalendar :calendar="ghStats.calendar" />
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section class="section container reveal" ref="sec0">
      <div class="section-title">{{ t('主要项目', 'MAIN PROJECTS') }}</div>
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
          <div style="font-size:1.8rem;font-weight:700;color:var(--neon-cyan);text-shadow:0 0 16px var(--neon-cyan)">{{ donePct }}%</div>
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
            <div class="ch-mini-pct" :style="{color: ch.light}">{{ chPct(ch) }}%</div>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;text-align:center">
        <router-link to="/practice" class="pixel-btn">⚔ {{ t('进入刷题闯关', 'ENTER PRACTICE') }}</router-link>
      </div>
    </section>

    <!-- Personal Profile -->
    <section class="section container reveal" ref="sec1b">
      <div class="section-title">{{ t('个人简介', 'PROFILE') }}</div>

      <div class="profile-intro pixel-card">
        <div class="plabel" style="color:var(--neon-cyan)">IDENTITY</div>
        <p class="ptext">{{ t(
          '数学相关专业本科在读，深耕数学理论与计算机算法交叉领域。核心能力集中在 Python 工程开发、C++ 底层实现与算法竞赛，同时掌握机器学习与深度学习的理论基础及工程实践。',
          'Undergraduate in mathematics-related field, focused on the intersection of mathematical theory and computer algorithms. Core competencies in Python engineering, C++ low-level implementation, competitive programming, and ML/DL engineering.'
        ) }}</p>
      </div>

      <div class="profile-grid">
        <div class="profile-block pixel-card">
          <div class="plabel glow-cyan">VERIFIED CAPABILITIES</div>
          <ul class="plist">
            <li>{{ t('熟练掌握 LeetCode 主流算法体系：数论、图论、动态规划、贪心、组合数学、位运算等高频模块，长期系统化刷题沉淀', 'Proficient in mainstream LeetCode algorithms: number theory, graph theory, DP, greedy, combinatorics, bit operations') }}</li>
            <li>{{ t('扎实的 C++ 工程能力：从零实现 LRU/LFU/ARC 缓存、红黑树、内存池、垃圾回收器等底层数据结构与系统组件（Header-only，零依赖）', 'Solid C++ engineering: from-scratch LRU/LFU/ARC cache, red-black tree, memory pool, garbage collector (header-only, zero dependencies)') }}</li>
            <li>{{ t('机器学习与深度学习工程落地：基于 PyTorch 的完整 ML/DL 教程（405⭐），以及 ML 驱动的网络安全入侵检测系统（99.58% 准确率，19913 QPS）', 'ML/DL engineering: comprehensive PyTorch tutorial (405⭐), ML-powered network intrusion detection (99.58% accuracy, 19913 QPS)') }}</li>
            <li>{{ t('Git 版本控制规范，具备项目管理、代码迭代与仓库维护能力', 'Git version control, project management, code iteration and repository maintenance') }}</li>
          </ul>
        </div>

        <div class="profile-block pixel-card">
          <div class="plabel glow-cyan">CORE PROJECTS</div>
          <div class="pproj-name">Network-Security-Based-On-ML <span class="pproj-stars">153⭐</span></div>
          <div class="pproj-sec">
            <div class="pproj-stitle">{{ t('落地成果', 'Deliverables') }}</div>
            <div class="pproj-desc">{{ t(
              '基于机器学习的网络入侵检测系统，集成 Kitsune/LUCID 算法，99.58% 攻击检测准确率，19913 QPS 高吞吐量，支持 Docker/K8s 生产部署。',
              'ML-powered IDS integrating Kitsune/LUCID, 99.58% accuracy, 19913 QPS, Docker/K8s production deployment.'
            ) }}</div>
          </div>
          <div class="pproj-tags">
            <span class="pixel-tag">Python</span>
            <span class="pixel-tag">ML</span>
            <span class="pixel-tag">Kitsune</span>
            <span class="pixel-tag">Docker</span>
          </div>
          <div style="margin-top:16px">
            <div class="pproj-name">cpp-from-scratch <span class="pproj-stars">48⭐</span></div>
            <div class="pproj-sec">
              <div class="pproj-stitle">{{ t('落地成果', 'Deliverables') }}</div>
              <div class="pproj-desc">{{ t(
                'C++20 从零实现底层数据结构与系统组件：LRU/LFU/ARC 缓存策略、红黑树、AVL 树、B 树、内存池、垃圾回收器。仅头文件，零外部依赖。',
                'C++20 from-scratch implementations: LRU/LFU/ARC cache, red-black tree, AVL tree, B-tree, memory pool, GC. Header-only, zero deps.'
              ) }}</div>
            </div>
            <div class="pproj-tags">
              <span class="pixel-tag">C++20</span>
              <span class="pixel-tag">Data Structures</span>
              <span class="pixel-tag">Header-only</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-future pixel-card">
        <div class="pfuture-label">{{ t('长期研究方向（规划中，尚未系统学习）', 'LONG-TERM RESEARCH INTERESTS (NOT YET STUDIED)') }}</div>
        <p class="pfuture-note">{{ t('现阶段重点夯实算法与深度学习工程能力，以下方向为后续核心深耕规划', 'Currently focused on strengthening algorithm and DL engineering skills. Below are long-term research plans.') }}</p>
        <div class="pfuture-items">
          <div class="pfuture-item"><span class="pf-num">01</span><span>{{ t('高性能计算（HPC）、CUDA 并行编程、GPU 加速优化', 'HPC, CUDA parallel programming, GPU acceleration') }}</span></div>
          <div class="pfuture-item"><span class="pf-num">02</span><span>{{ t('并行计算架构、数值计算方法、优化理论', 'Parallel computing architecture, numerical methods, optimization theory') }}</span></div>
          <div class="pfuture-item"><span class="pf-num">03</span><span>{{ t('PDE/ODE 微分方程数值求解、数理建模与工程落地', 'PDE/ODE numerical solving, mathematical modeling and engineering') }}</span></div>
        </div>
      </div>

      <div class="profile-contact">
        <span class="pc-label">LeetCode</span><span class="pc-val">zimingttkx</span>
        <span class="pc-sep">|</span>
        <span class="pc-label">GitHub</span><a href="https://github.com/zimingttkx" target="_blank" class="pc-val" style="text-decoration:none">zimingttkx</a>
        <span class="pc-sep">|</span>
        <span class="pc-note">{{ t('专注数学 + 算法 + AI 高性能优化交叉领域技术交流', 'Math + Algorithms + AI interdisciplinary technical exchange') }}</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { CHAPTERS, BLOG_POSTS } from '../composables/data.js'
import { getProgress } from '../composables/progress.js'
import { useLang } from '../composables/i18n.js'
import LevelCard from '../components/LevelCard.vue'
import ContribCalendar from '../components/ContribCalendar.vue'
import { calcLevel, CONFIG as STATS_CONFIG } from '../composables/stats.js'

const { isZh, t } = useLang()

const avatar = ref('avatar.png')
const stats = ref({ repos: '—', stars: 606, followers: '—' })
const chapters = CHAPTERS
const latestPosts = BLOG_POSTS.slice(0, 3)
const modalProject = ref(null)
const ghStats = ref({ totalCommits: 0, calendar: {} })
const heroLevel = computed(() => {
  const xp = (ghStats.value.totalCommits || 0) * STATS_CONFIG.xpPerCommit
  return calcLevel(xp)
})

const { doneTotal, totalProblems, donePct } = getProgress()

function chPct(ch) {
  const prog = getProgress(ch.id)
  return prog.donePct
}

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%231a1a30"/><text x="50%" y="55%" font-size="80" text-anchor="middle" fill="%230EA5E9">Z</text></svg>'
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
  } catch {}
}

async function loadStats() {
  try {
    const base = import.meta.env.BASE_URL || '/'
    const r = await fetch(base + 'stats.json')
    if (!r.ok) return
    const data = await r.json()
    ghStats.value = data
  } catch {}
}

onMounted(() => {
  loadGitHub()
  loadStats()
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.home { padding-top: 64px; }

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
    linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px);
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
.hero-tag { font-size: 0.75rem; color: var(--neon-pink); text-shadow: 0 0 8px var(--neon-pink); margin-bottom: 16px; letter-spacing: 0.2em; }
.blink { animation: blink 1s step-end infinite; }
.hero-name { font-size: clamp(1.4rem, 4vw, 2.4rem); margin-bottom: 12px; letter-spacing: 0.05em; }
.hero-title { font-size: clamp(0.85rem, 1.5vw, 1.1rem); margin-bottom: 16px; letter-spacing: 0.1em; }
.hero-desc { color: var(--text-dim); font-size: 0.95rem; line-height: 1.8; margin-bottom: 24px; max-width: 520px; }
.hero-level { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.hero-btns { display: flex; flex-wrap: wrap; gap: 12px; }

.hero-right { display: flex; flex-direction: column; align-items: center; gap: 24px; flex-shrink: 0; }
.hero-avatar-wrap { position: relative; width: 300px; height: 300px; }
.hero-avatar {
  width: 300px; height: 300px;
  border: 3px solid var(--neon-blue);
  box-shadow: 0 0 32px rgba(14,165,233,0.4);
  image-rendering: auto;
  animation: float 4s ease-in-out infinite;
  display: block;
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  object-fit: cover;
}
.avatar-ring { position: -14px; border: 2px solid var(--neon-purple); opacity: 0.6; animation: neonPulse 2s ease-in-out infinite; clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%); }
.ring2 { inset: -26px; border-color: var(--neon-cyan); opacity: 0.3; animation-delay: 1s; }
.hero-stats { display: flex; gap: 12px; }
.hstat { text-align: center; padding: 12px 16px; min-width: 64px; }
.hstat-val { font-size: 1.2rem; font-weight: 700; }
.hstat { text-align: center; padding: 12px 16px; min-width: 64px; }
.hstat-val { font-size: 1.2rem; font-weight: 700; }
.hstat-label { font-size: 0.85rem; color: var(--text-dim); margin-top: 4px; }

.section { padding: 64px 0; }
.section:nth-child(2) { padding: 64px 0; }
.section:nth-child(3) { padding: 48px 0; }

.feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 20px; }
.feat-card { cursor: pointer; padding: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.feat-card:hover { transform: translateY(-4px); }
.feat-card:nth-child(1) { animation-delay: 0.1s; }
.feat-card:nth-child(2) { animation-delay: 0.2s; }
.feat-card:nth-child(3) { animation-delay: 0.3s; }
.feat-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.feat-lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.feat-lang { font-size: .85rem; color: var(--text-dim); flex: 1; }
.feat-stars { font-size: .85rem; color: var(--mc-gold); }
.feat-name { font-size: 1rem; font-weight: 700; color: var(--neon-blue); margin-bottom: 8px; }
.feat-desc { font-size: .9rem; color: var(--text-dim); line-height: 1.7; margin-bottom: 12px; }
.feat-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.practice-overview { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; }
.pov-info { min-width: 220px; flex-shrink: 0; }
.pov-chapters { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 10px; }
.ch-mini { padding: 10px 12px; cursor: default; }
.ch-mini-title { font-size: .85rem; margin-bottom: 6px; color: var(--text-dim); }
.ch-mini-bar { margin-bottom: 4px; }
.ch-mini-pct { font-size: .85rem; font-weight: 600; }

.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 16px; }
.blog-card { cursor: pointer; }
.blog-card:hover { transform: translateY(-4px); }
.blog-card-date { font-size: .85rem; color: var(--text-dim); margin-bottom: 8px; }
.blog-card-title { font-size: 1rem; margin-bottom: 8px; color: var(--text-main); font-weight: 600; }
.blog-card-desc { font-size: .9rem; color: var(--text-dim); margin-bottom: 12px; line-height: 1.6; }
.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.empty-state { color: var(--text-dim); font-size: .9rem; text-align: center; padding: 40px; letter-spacing: .05em; }

/* Stats Dashboard */
.stats-dashboard {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  align-items: start;
}
.stats-calendar {
  padding: 20px 24px;
  overflow-x: auto;
}
/* Profile Section */
.profile-intro { padding: 24px; margin-bottom: 20px; }
.plabel { font-size: .75rem; letter-spacing: .15em; margin-bottom: 12px; text-transform: uppercase; font-weight: 600; }
.ptext { color: var(--text-dim); line-height: 1.9; font-size: .92rem; }

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.profile-block { padding: 24px; }
.plist { list-style: none; padding: 0; margin: 0; }
.plist li { color: var(--text-dim); font-size: .88rem; line-height: 1.8; padding-left: 16px; position: relative; margin-bottom: 10px; }
.plist li::before { content: ''; position: absolute; left: 0; top: 10px; width: 6px; height: 6px; background: var(--neon-cyan); border-radius: 50%; }

.pproj-name { font-size: 1rem; font-weight: 700; color: var(--neon-blue); margin-bottom: 14px; }
.pproj-sec { margin-bottom: 12px; }
.pproj-stitle { font-size: .78rem; color: var(--neon-purple); letter-spacing: .08em; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }
.pproj-desc { color: var(--text-dim); font-size: .88rem; line-height: 1.75; }
.pproj-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }

.profile-future { padding: 24px; margin-bottom: 20px; border-color: rgba(255,46,176,0.2) !important; }
.pfuture-label { font-size: .75rem; letter-spacing: .1em; margin-bottom: 6px; text-transform: uppercase; font-weight: 600; color: var(--neon-pink); text-shadow: 0 0 6px var(--neon-pink); }
.pfuture-note { font-size: .8rem; color: var(--text-dim); margin-bottom: 16px; }
.pfuture-items { display: flex; flex-direction: column; gap: 10px; }
.pfuture-item { display: flex; align-items: baseline; gap: 12px; font-size: .88rem; color: var(--text-dim); line-height: 1.7; }
.pf-num { font-size: .8rem; color: var(--neon-pink); font-weight: 600; flex-shrink: 0; min-width: 22px; }

.profile-contact { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; padding: 20px 0; }
.pc-label { font-size: .8rem; color: var(--text-dim); margin-right: 6px; }
.pc-val { font-size: .88rem; font-weight: 600; color: var(--neon-cyan); }
.pc-sep { color: var(--border-pixel); margin: 0 14px; }
.pc-note { font-size: .8rem; color: var(--text-dim); }

@media (max-width: 900px) {
  .stats-dashboard {
    grid-template-columns: 1fr;
  }
}

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
  .hero-avatar-wrap { width: 220px; height: 220px; }
  .hero-avatar { width: 220px; height: 220px; }
  .hero-right { width: 100%; }
  .hero-stats { justify-content: center; }
  .practice-overview { flex-direction: column; }
  .modal-content { padding: 20px; }
  .stats-dashboard { grid-template-columns: 1fr; }
  .profile-grid { grid-template-columns: 1fr; }
}
</style>