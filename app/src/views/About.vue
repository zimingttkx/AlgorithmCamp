<template>
  <div class="about-page" style="padding-top:56px">
    <!-- Header -->
    <section class="about-hero container">
      <div class="about-hero-inner">
        <div class="about-avatar-wrap">
          <img :src="avatar" alt="avatar" class="about-avatar" />
          <div class="about-avatar-label pixel-font">PLAYER PROFILE</div>
        </div>
        <div class="about-info">
          <div class="pixel-font about-name glow-blue">zimingttkx</div>
          <div class="pixel-font about-sub glow-cyan">Full-Stack Learner · CTF Player · ML Explorer</div>
          <p class="about-bio">
            热爱算法竞技与网络安全研究，专注于机器学习与 C++ 高性能编程。<br />
            喜欢在 CTF 比赛中磨砺技能，同时探索 AI 在安全领域的应用。
          </p>
          <div class="about-links">
            <a href="https://github.com/zimingttkx" target="_blank" class="pixel-btn">◉ GitHub</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Skill Tree -->
    <section class="section container reveal" ref="sec1">
      <div class="section-title">技能树</div>
      <div class="skill-tree">
        <div v-for="group in skillGroups" :key="group.name" class="skill-group pixel-card">
          <div class="skill-group-title pixel-font" :style="{color: group.color, textShadow: '0 0 8px '+group.color}">
            {{ group.icon }} {{ group.name }}
          </div>
          <div class="skill-list">
            <div v-for="skill in group.skills" :key="skill.name" class="skill-item">
              <div class="skill-header">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-level pixel-font" :style="{color: group.color}">{{ skill.stars }}</span>
              </div>
              <div class="pixel-progress-outer">
                <div class="pixel-progress-inner" :style="{width: skill.pct+'%', background: 'linear-gradient(90deg,'+group.color+','+group.colorLight+')'}"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="section container reveal" ref="sec2">
      <div class="section-title">成就历程</div>
      <div class="timeline">
        <div v-for="(item, i) in timeline" :key="i" class="timeline-item">
          <div class="timeline-dot" :style="{background: item.color, boxShadow: '0 0 8px '+item.color}"></div>
          <div class="timeline-content pixel-card">
            <div class="timeline-date pixel-font">{{ item.date }}</div>
            <div class="timeline-title">{{ item.title }}</div>
            <div class="timeline-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const avatar = ref('https://github.com/zimingttkx.png')

const skillGroups = [
  {
    name: '算法与数据结构', icon: '⚔', color: '#00f3ff', colorLight: '#00ffcc',
    skills: [
      { name: 'LeetCode / 竞赛', stars: '★★★★☆', pct: 80 },
      { name: '动态规划', stars: '★★★★☆', pct: 78 },
      { name: '图论算法', stars: '★★★☆☆', pct: 65 },
    ]
  },
  {
    name: '编程语言', icon: '◈', color: '#bf00ff', colorLight: '#ff00aa',
    skills: [
      { name: 'C++', stars: '★★★★☆', pct: 82 },
      { name: 'Python', stars: '★★★★☆', pct: 80 },
      { name: 'JavaScript', stars: '★★★☆☆', pct: 60 },
    ]
  },
  {
    name: '机器学习', icon: '◉', color: '#00ffcc', colorLight: '#00f3ff',
    skills: [
      { name: 'PyTorch / sklearn', stars: '★★★☆☆', pct: 65 },
      { name: '数据分析', stars: '★★★☆☆', pct: 62 },
      { name: '模型调优', stars: '★★☆☆☆', pct: 45 },
    ]
  },
  {
    name: '网络安全', icon: '◎', color: '#ff00aa', colorLight: '#ffff00',
    skills: [
      { name: 'CTF (PWN/Web)', stars: '★★★☆☆', pct: 60 },
      { name: '渗透测试基础', stars: '★★☆☆☆', pct: 45 },
      { name: '逆向工程', stars: '★★☆☆☆', pct: 40 },
    ]
  },
]

const timeline = [
  { date: '2024', title: '开始系统学习算法', desc: '刷 LeetCode，参加算法竞赛，系统梳理数据结构与算法体系。', color: '#00f3ff' },
  { date: '2024', title: '深入机器学习', desc: '学习 PyTorch，完成多个 ML 项目，探索 AI 在实际场景的应用。', color: '#00ffcc' },
  { date: '2025', title: '涉足网络安全', desc: '参与 CTF 比赛，学习 PWN、Web 安全，探索攻防技术。', color: '#bf00ff' },
  { date: '2026', title: '全栈探索', desc: '构建个人技术站点，融合前端工程化与后端能力。', color: '#ff00aa' },
]

onMounted(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.about-hero { padding: 60px 0 20px; }
.about-hero-inner { display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap; }
.about-avatar-wrap { flex-shrink: 0; text-align: center; }
.about-avatar {
  width: 140px; height: 140px;
  border: 3px solid var(--neon-purple);
  box-shadow: 0 0 20px rgba(191,0,255,0.5);
  image-rendering: pixelated;
  display: block;
}
.about-avatar-label { font-size: 0.38rem; color: var(--text-dim); margin-top: 8px; letter-spacing: 0.1em; }
.about-info { flex: 1; }
.about-name { font-size: clamp(1rem, 3vw, 1.6rem); margin-bottom: 10px; }
.about-sub { font-size: clamp(0.45rem, 1vw, 0.6rem); margin-bottom: 16px; letter-spacing: 0.08em; }
.about-bio { color: var(--text-dim); line-height: 1.9; margin-bottom: 20px; font-size: 0.9rem; }
.about-links { display: flex; gap: 12px; flex-wrap: wrap; }

.section { padding: 60px 0; }

.skill-tree { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
.skill-group { padding: 20px; }
.skill-group-title { font-size: 0.52rem; margin-bottom: 16px; letter-spacing: 0.08em; }
.skill-list { display: flex; flex-direction: column; gap: 12px; }
.skill-header { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center; }
.skill-name { font-size: 0.82rem; }
.skill-level { font-size: 0.42rem; letter-spacing: 0.05em; }

.timeline { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 28px; }
.timeline::before {
  content: '';
  position: absolute;
  left: 7px; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--neon-blue), var(--neon-purple));
  box-shadow: 0 0 6px var(--neon-blue);
}
.timeline-item { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; position: relative; }
.timeline-dot {
  width: 14px; height: 14px;
  border-radius: 0;
  flex-shrink: 0;
  margin-top: 6px;
  margin-left: -35px;
}
.timeline-content { flex: 1; padding: 14px 16px; }
.timeline-date { font-size: 0.42rem; color: var(--text-dim); margin-bottom: 6px; }
.timeline-title { font-size: 0.95rem; margin-bottom: 6px; color: var(--text-main); font-weight: 600; }
.timeline-desc { font-size: 0.82rem; color: var(--text-dim); line-height: 1.7; }

@media (max-width: 600px) {
  .about-hero-inner { flex-direction: column; align-items: center; }
  .about-info { text-align: center; }
  .about-links { justify-content: center; }
}
</style>
