<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-grid"></div>
      <div class="container hero-inner">
        <div class="hero-left">
          <div class="hero-tag pixel-font"><span class="blink">▶</span> PLAYER ONE</div>
          <h1 class="hero-name pixel-font glow-blue">zimingttkx</h1>
          <div class="hero-title pixel-font glow-cyan">算法 · 机器学习 · 网络安全</div>
          <p class="hero-desc">热爱技术、热爱竞技编程，探索 AI 与安全的交叉地带。</p>
          <div class="hero-level">
            <span class="pixel-font" style="font-size:.5rem;color:var(--mc-gold)">LV.{{ level }}</span>
            <div class="xp-bar-outer" style="flex:1">
              <div class="xp-bar-inner" :style="{width: xpPct+'%'}"></div>
            </div>
            <span class="pixel-font" style="font-size:.42rem;color:var(--text-dim)">{{ xp }}/{{ xpMax }} XP</span>
          </div>
          <div class="hero-btns">
            <router-link to="/practice" class="pixel-btn">⚔ 开始刷题</router-link>
            <router-link to="/projects" class="pixel-btn pixel-btn-purple">◈ 查看项目</router-link>
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
              <div class="hstat-label">仓库</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val pixel-font glow-purple">{{ stats.stars }}</div>
              <div class="hstat-label">Stars</div>
            </div>
            <div class="hstat pixel-card">
              <div class="hstat-val pixel-font glow-pink">{{ stats.followers }}</div>
              <div class="hstat-label">粉丝</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Practice Overview -->
    <section class="section container reveal" ref="sec1">
      <div class="section-title">刷题进度</div>
      <div class="practice-overview">
        <div class="pov-info">
          <div class="pixel-font" style="font-size:1.6rem;color:var(--neon-cyan);text-shadow:0 0 16px var(--neon-cyan)">{{ donePct }}%</div>
          <div style="color:var(--text-dim);font-size:.85rem;margin-top:4px">{{ doneTotal }} / {{ totalProblems }} 题已完成</div>
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
        <router-link to="/practice" class="pixel-btn">⚔ 进入刷题闯关</router-link>
      </div>
    </section>

    <!-- Latest Blog -->
    <section class="section container reveal" ref="sec2">
      <div class="section-title">最新文章</div>
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
      <div v-if="!latestPosts.length" class="empty-state pixel-font">文章即将发布，敬请期待...</div>
      <div style="margin-top:20px;text-align:center">
        <router-link to="/blog" class="pixel-btn pixel-btn-purple">◈ 查看全部文章</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { CHAPTERS, BLOG_POSTS } from '../composables/data.js'
import { getProgress } from '../composables/progress.js'

const avatar = ref('https://github.com/zimingttkx.png')
const stats = ref({ repos: '—', stars: '—', followers: '—' })
const level = ref(1)
const xp = ref(0)
const xpMax = ref(1000)
const xpPct = ref(0)
const chapters = CHAPTERS
const latestPosts = BLOG_POSTS.slice(0, 3)

const { doneTotal, totalProblems, donePct } = getProgress()

function chPct(ch) {
  const prog = getProgress(ch.id)
  return prog.donePct
}

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%2314141f"/><text x="50%" y="55%" font-size="32" text-anchor="middle" fill="%2300f3ff">Z</text></svg>'
}

async function loadGitHub() {
  try {
    const r = await fetch('https://api.github.com/users/zimingttkx')
    if (!r.ok) return
    const d = await r.json()
    stats.value.repos = d.public_repos ?? '—'
    stats.value.followers = d.followers ?? '—'
    avatar.value = d.avatar_url || avatar.value
    // star count
    const rr = await fetch('https://api.github.com/users/zimingttkx/repos?per_page=100')
    if (rr.ok) {
      const repos = await rr.json()
      stats.value.stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0)
    }
  } catch {}
}

onMounted(() => {
  loadGitHub()
  // compute level from xp
  const done = doneTotal.value
  xp.value = done * 50
  xpMax.value = Math.max(1000, Math.ceil(done / 10) * 1000)
  level.value = Math.max(1, Math.floor(done / 20) + 1)
  xpPct.value = Math.min(100, (xp.value % xpMax.value) / xpMax.value * 100)

  // scroll reveal
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.home { padding-top: 56px; }

/* Hero */
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
    linear-gradient(rgba(0,243,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,243,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gradientShift 20s ease infinite;
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
.hero-tag {
  font-size: 0.5rem;
  color: var(--neon-pink);
  text-shadow: 0 0 8px var(--neon-pink);
  margin-bottom: 16px;
  letter-spacing: 0.2em;
}
.blink { animation: blink 1s step-end infinite; }
.hero-name {
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}
.hero-title {
  font-size: clamp(0.5rem, 1.5vw, 0.75rem);
  margin-bottom: 16px;
  letter-spacing: 0.1em;
}
.hero-desc {
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: 24px;
}
.hero-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.hero-btns { display: flex; flex-wrap: wrap; gap: 12px; }

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}
.hero-avatar-wrap { position: relative; width: 140px; height: 140px; }
.hero-avatar {
  width: 140px; height: 140px;
  border-radius: 0;
  border: 3px solid var(--neon-blue);
  box-shadow: 0 0 20px rgba(0,243,255,0.5);
  image-rendering: pixelated;
  animation: float 4s ease-in-out infinite;
  display: block;
}
.avatar-ring {
  position: absolute;
  inset: -12px;
  border: 2px solid var(--neon-purple);
  opacity: 0.5;
  animation: neonPulse 2s ease-in-out infinite;
}
.ring2 {
  inset: -22px;
  border-color: var(--neon-cyan);
  opacity: 0.25;
  animation-delay: 1s;
}
.hero-stats { display: flex; gap: 12px; }
.hstat {
  text-align: center;
  padding: 12px 16px;
  min-width: 64px;
}
.hstat-val { font-size: 1rem; }
.hstat-label { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

/* Practice overview */
.section { padding: 60px 0; }
.practice-overview { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; }
.pov-info { min-width: 220px; flex-shrink: 0; }
.pov-chapters { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 10px; }
.ch-mini { padding: 10px 12px; cursor: default; }
.ch-mini-title { font-size: 0.72rem; margin-bottom: 6px; color: var(--text-dim); }
.ch-mini-bar { margin-bottom: 4px; }
.ch-mini-pct { font-size: 0.42rem; }

/* Blog cards */
.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 16px; }
.blog-card { cursor: pointer; transition: transform 0.2s; }
.blog-card:hover { transform: translate(-3px,-3px); }
.blog-card-date { font-size: 0.42rem; color: var(--text-dim); margin-bottom: 8px; }
.blog-card-title { font-size: 0.95rem; margin-bottom: 8px; color: var(--text-main); font-weight: 600; }
.blog-card-desc { font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px; line-height: 1.6; }
.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.empty-state { color: var(--text-dim); font-size: 0.55rem; text-align: center; padding: 40px; letter-spacing: 0.1em; }

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; padding: 40px 24px; gap: 32px; }
  .hero-right { width: 100%; }
  .hero-stats { justify-content: center; }
  .practice-overview { flex-direction: column; }
}
</style>
