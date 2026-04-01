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
        <span class="pc-label">Email</span><a href="mailto:2147514473@qq.com" class="pc-val" style="text-decoration:none">2147514473@qq.com</a>
        <span class="pc-sep">|</span>
        <span class="pc-label">WeChat</span><span class="pc-val">zimingttkx</span>
        <span class="pc-sep">|</span>
        <span class="pc-label">LeetCode</span><span class="pc-val">zimingttkx</span>
        <span class="pc-sep">|</span>
        <span class="pc-label">GitHub</span><a href="https://github.com/zimingttkx" target="_blank" class="pc-val" style="text-decoration:none">zimingttkx</a>
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
  {
    name: 'High-Concurrency-Cache',
    lang: 'C++', langColor: '#f34b7d',
    stars: null,
    url: 'https://github.com/zimingttkx/cpp-from-scratch',
    descZh: '线程安全的高并发缓存系统，支持 LRU/LFU/ARC 多策略替换，缓存分片降低锁争用，LRU-k 优化防缓存污染。',
    descEn: 'Thread-safe high-concurrency cache system with LRU/LFU/ARC strategies, cache sharding for reduced lock contention, LRU-k optimization.',
    tags: ['C++20', 'Thread Safety', 'Cache', 'High Concurrency'],
    pointsZh: [
      '实现 LRU、LFU、ARC 多种缓存替换策略，适配不同访问模式',
      'LRU/LFU 缓存分片设计，降低锁争用，提升高并发性能',
      'LRU-k 优化防止热点数据被冷数据替换，减少缓存污染',
      'LFU 引入最大平均访问频次，淘汰旧热点数据，提升利用率',
      'ARC 动态调整 LRU/LFU 权重比例，适应复杂业务场景',
      '互斥锁 + 原子操作实现多线程安全',
    ],
    pointsEn: [
      'Multiple cache eviction strategies: LRU, LFU, ARC for different access patterns',
      'LRU/LFU cache sharding to reduce lock contention under high concurrency',
      'LRU-k optimization to prevent hot data eviction and cache pollution',
      'LFU with max average frequency to evict stale hot data',
      'ARC dynamic weight adjustment between LRU/LFU for complex scenarios',
      'Thread safety via mutex and atomic operations',
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

/* ── Hero Section ── */
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
    linear-gradient(rgba(79, 142, 247, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 142, 247, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
.hero-inner {
  display: flex;
  align-items: center;
  gap: 80px;
  padding: 80px 24px;
  position: relative;
  z-index: 1;
}
.hero-left { flex: 1; min-width: 0; }
.hero-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--neon-pink);
  text-shadow: 0 0 12px var(--glow-pink);
  margin-bottom: 16px;
  letter-spacing: 0.2em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.blink { animation: blink 1s step-end infinite; }
.hero-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 12px;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1rem, 2vw, 1.4rem);
  margin-bottom: 16px;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}
.hero-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 24px;
  max-width: 520px;
}
.hero-level {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding: 16px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  max-width: 400px;
}
.hero-btns { display: flex; flex-wrap: wrap; gap: 12px; }

/* ── Avatar ── */
.hero-right { display: flex; flex-direction: column; align-items: center; gap: 24px; flex-shrink: 0; }
.hero-avatar-wrap { position: relative; width: 280px; height: 280px; }
.hero-avatar {
  width: 280px;
  height: 280px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 0 60px var(--glow-blue);
  animation: float 4s ease-in-out infinite;
  display: block;
}
.avatar-ring {
  position: absolute;
  inset: -16px;
  border: 2px solid var(--neon-purple);
  border-radius: 32px;
  opacity: 0.5;
  animation: neonPulse 3s ease-in-out infinite;
  pointer-events: none;
}
.ring2 {
  inset: -32px;
  border-color: var(--neon-cyan);
  opacity: 0.3;
  animation-delay: 1.5s;
}
.hero-stats { display: flex; gap: 16px; }
.hstat {
  text-align: center;
  padding: 20px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  min-width: 80px;
}
.hstat-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hstat-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Sections ── */
.section { padding: 80px 0; }
.section:nth-child(2) { padding: 80px 0; }
.section:nth-child(3) { padding: 60px 0; }

/* Override section-title with premium styling */
.section :deep(.section-title) {
  font-family: 'Clash Display', 'Space Grotesk', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 32px;
}
.section :deep(.section-title .accent) {
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Featured Projects ── */
.feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}
.feat-card {
  cursor: pointer;
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.4s var(--ease-out-expo);
}
.feat-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg), 0 0 60px var(--glow-blue);
}
.feat-card:nth-child(1) { animation-delay: 0.1s; }
.feat-card:nth-child(2) { animation-delay: 0.2s; }
.feat-card:nth-child(3) { animation-delay: 0.3s; }
.feat-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.feat-lang-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.feat-lang { font-size: 0.85rem; color: var(--text-dim); flex: 1; font-family: 'JetBrains Mono', monospace; }
.feat-stars { font-size: 0.85rem; color: var(--mc-gold); font-family: 'JetBrains Mono', monospace; }
.feat-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}
.feat-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px; }
.feat-tags { display: flex; flex-wrap: wrap; gap: 8px; }

/* ── Practice Overview ── */
.practice-overview { display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap; }
.pov-info {
  min-width: 240px;
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  text-align: center;
}
.pov-chapters { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.ch-mini {
  padding: 14px 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: default;
  transition: all 0.3s var(--ease-out-expo);
}
.ch-mini:hover { border-color: var(--border-accent); transform: translateY(-2px); }
.ch-mini-title { font-size: 0.85rem; margin-bottom: 8px; color: var(--text-dim); }
.ch-mini-bar { margin-bottom: 6px; }
.ch-mini-pct { font-size: 0.85rem; font-weight: 600; }

/* ── Blog Cards ── */
.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.blog-card {
  cursor: pointer;
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.4s var(--ease-out-expo);
}
.blog-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg);
}
.blog-card-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 10px;
}
.blog-card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 600;
}
.blog-card-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6; }
.blog-card-tags { display: flex; flex-wrap: wrap; gap: 8px; }

.empty-state {
  color: var(--text-dim);
  font-size: 0.9rem;
  text-align: center;
  padding: 60px;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Stats Dashboard ── */
.stats-dashboard {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;
}
.stats-calendar {
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow-x: auto;
}

/* ── Profile Section ── */
.profile-intro {
  padding: 28px;
  margin-bottom: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
.plabel {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  margin-bottom: 14px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--neon-cyan);
}
.ptext {
  color: var(--text-secondary);
  line-height: 1.9;
  font-size: 0.95rem;
}

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.profile-block {
  padding: 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
.plist { list-style: none; padding: 0; margin: 0; }
.plist li {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
  padding-left: 20px;
  position: relative;
  margin-bottom: 12px;
}
.plist li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border-radius: 50%;
}

.pproj-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 14px;
}
.pproj-sec { margin-bottom: 14px; }
.pproj-stitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--neon-purple);
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
}
.pproj-desc { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.75; }
.pproj-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }

.profile-future {
  padding: 28px;
  margin-bottom: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(244, 114, 182, 0.2);
  border-radius: 16px;
}
.pfuture-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--neon-pink);
}
.pfuture-note { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 18px; }
.pfuture-items { display: flex; flex-direction: column; gap: 12px; }
.pfuture-item {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
}
.pf-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--neon-pink);
  font-weight: 600;
  flex-shrink: 0;
  min-width: 24px;
}

.profile-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 24px 0;
  gap: 8px;
}
.pc-label { font-size: 0.8rem; color: var(--text-dim); margin-right: 6px; }
.pc-val { font-size: 0.9rem; font-weight: 600; color: var(--neon-cyan); font-family: 'JetBrains Mono', monospace; }
.pc-sep { color: var(--border-subtle); margin: 0 16px; }
.pc-note { font-size: 0.8rem; color: var(--text-dim); }

@media (max-width: 900px) {
  .hero-inner { flex-direction: column-reverse; gap: 40px; text-align: center; }
  .hero-left { display: flex; flex-direction: column; align-items: center; }
  .hero-desc { text-align: center; }
  .hero-level { justify-content: center; }
  .hero-btns { justify-content: center; }
  .hero-avatar-wrap { width: 220px; height: 220px; }
  .hero-avatar { width: 220px; height: 220px; }
  .hero-stats { gap: 12px; }
  .hstat { padding: 16px 20px; min-width: 70px; }
  .hstat-val { font-size: 1.2rem; }
  .stats-dashboard { grid-template-columns: 1fr; }
  .profile-grid { grid-template-columns: 1fr; }
  .practice-overview { flex-direction: column; }
  .pov-info { width: 100%; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s var(--ease-out-expo);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  position: relative;
  max-width: 580px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  animation: slideUp 0.4s var(--ease-out-expo);
}
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--neon-pink); color: white; border-color: var(--neon-pink); }
.modal-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.modal-lang-dot { width: 14px; height: 14px; border-radius: 50%; }
.modal-lang { font-size: 0.85rem; color: var(--text-dim); flex: 1; font-family: 'JetBrains Mono', monospace; }
.modal-stars { font-size: 0.85rem; color: var(--mc-gold); font-family: 'JetBrains Mono', monospace; }
.modal-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.3rem;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.modal-desc { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.8; margin-bottom: 24px; }
.modal-section { margin-bottom: 24px; }
.modal-section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.modal-points { list-style: none; padding: 0; margin: 0; }
.modal-points li {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
  padding-left: 18px;
  position: relative;
  margin-bottom: 8px;
}
.modal-points li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--neon-cyan);
}
.modal-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.modal-actions { display: flex; gap: 12px; margin-top: 24px; }
</style>