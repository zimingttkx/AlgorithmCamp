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
        <div v-for="p in featuredProjects" :key="p.name" class="feat-card pixel-card"
          @click="window.open(p.url, '_blank')">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const { doneTotal, totalProblems, donePct } = getProgress()

function chPct(ch) {
  const prog = getProgress(ch.id)
  return prog.donePct
}

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%231a1a30"/><text x="50%" y="55%" font-size="32" text-anchor="middle" fill="%2300f3ff">Z</text></svg>'
}

const featuredProjects = [
  {
    name: 'AI-Practices',
    lang: 'Jupyter Notebook', langColor: '#DA5B0B',
    stars: 405,
    url: 'https://github.com/zimingttkx/AI-Practices',
    descZh: '机器学习与深度学习实战教程。涵盖线性回归、神经网络、CNN、RNN等完整实现，适合入门到进阶。',
    descEn: 'Comprehensive ML & DL tutorial with Jupyter Notebooks. Covers linear regression, neural networks, CNN, RNN and more.',
    tags: ['PyTorch', 'ML', 'Deep Learning', 'Tutorial'],
  },
  {
    name: 'Network-Security-Based-On-ML',
    lang: 'Python', langColor: '#3572A5',
    stars: 153,
    url: 'https://github.com/zimingttkx/Network-Security-Based-On-ML',
    descZh: '基于机器学习的网络安全检测系统，集成 Kitsune/LUCID 算法，99.58% 攻击检测准确率，19913 QPS，支持 Docker/K8s 部署。',
    descEn: 'ML-powered network intrusion detection system. 99.58% accuracy, 19913 QPS, Kitsune/LUCID algorithms, Docker/K8s support.',
    tags: ['Python', 'Cybersecurity', 'ML', 'Docker'],
  },
  {
    name: 'cpp-from-scratch',
    lang: 'C++', langColor: '#f34b7d',
    stars: 48,
    url: 'https://github.com/zimingttkx/cpp-from-scratch',
    descZh: 'C++20 从零实现：LRU/LFU/ARC 缓存、红黑树、内存池、GC 等。仅头文件，零依赖。',
    descEn: 'C++20 from-scratch implementations: LRU/LFU/ARC cache, red-black tree, memory pool, GC. Header-only, zero deps.',
    tags: ['C++20', 'Data Structures', 'Header-only'],
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
.hero-avatar-wrap { position: relative; width: 140px; height: 140px; }
.hero-avatar {
  width: 140px; height: 140px;
  border: 3px solid var(--neon-blue);
  box-shadow: 0 0 24px rgba(0,243,255,0.6);
  image-rendering: pixelated;
  animation: float 4s ease-in-out infinite;
  display: block;
}
.avatar-ring { position: absolute; inset: -12px; border: 2px solid var(--neon-purple); opacity: 0.6; animation: neonPulse 2s ease-in-out infinite; }
.ring2 { inset: -22px; border-color: var(--neon-cyan); opacity: 0.3; animation-delay: 1s; }
.hero-stats { display: flex; gap: 12px; }
.hstat { text-align: center; padding: 12px 16px; min-width: 64px; }
.hstat-val { font-size: 1rem; }
.hstat-label { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

.section { padding: 60px 0; }

.feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 16px; }
.feat-card { cursor: pointer; padding: 20px; transition: transform 0.2s; }
.feat-card:hover { transform: translate(-3px,-3px); }
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
.blog-card { cursor: pointer; transition: transform 0.2s; }
.blog-card:hover { transform: translate(-3px,-3px); }
.blog-card-date { font-size: .42rem; color: var(--text-dim); margin-bottom: 8px; }
.blog-card-title { font-size: .95rem; margin-bottom: 8px; color: var(--text-main); font-weight: 600; }
.blog-card-desc { font-size: .8rem; color: var(--text-dim); margin-bottom: 12px; line-height: 1.6; }
.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.empty-state { color: var(--text-dim); font-size: .55rem; text-align: center; padding: 40px; letter-spacing: .1em; }

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; padding: 40px 24px; gap: 32px; }
  .hero-right { width: 100%; }
  .hero-stats { justify-content: center; }
  .practice-overview { flex-direction: column; }
}
</style>