<template>
  <div class="about-page" style="padding-top:56px">
    <section class="about-hero container">
      <div class="about-hero-inner">
        <div class="about-avatar-wrap">
          <img :src="avatar" alt="avatar" class="about-avatar" />
          <div class="about-avatar-label pixel-font">PLAYER PROFILE</div>
        </div>
        <div class="about-info">
          <div class="pixel-font about-name glow-blue">zimingttkx</div>
          <div class="pixel-font about-sub glow-cyan">{{ t('全栈学习者 · CTF 选手 · ML 探索者', 'Full-Stack Learner · CTF Player · ML Explorer') }}</div>
          <p class="about-bio">{{ t(
            '热爱算法竞技与网络安全，专注 ML 与 C++20 高性能编程。GitHub 累计 606+ Stars。',
            'Passionate about competitive programming & cybersecurity. Focused on ML and high-performance C++20. 606+ GitHub Stars.'
          ) }}</p>
          <div class="about-stats">
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--mc-gold)">405⭐</div><div class="astat-label">AI-Practices</div></div>
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--neon-cyan)">153⭐</div><div class="astat-label">{{ t('安全系统','Security') }}</div></div>
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--neon-pink)">48⭐</div><div class="astat-label">cpp-scratch</div></div>
          </div>
          <a href="https://github.com/zimingttkx" target="_blank" class="pixel-btn" style="margin-top:16px">◉ GitHub</a>
        </div>
      </div>
    </section>

    <section class="section container reveal">
      <div class="section-title">{{ t('技能树', 'SKILL TREE') }}</div>
      <div class="skill-tree">
        <div v-for="group in skillGroups" :key="group.name" class="skill-group pixel-card">
          <div class="skill-group-title pixel-font" :style="{color:group.color,textShadow:'0 0 8px '+group.color}">
            {{ group.icon }} {{ isZh ? group.name : group.nameEn }}
          </div>
          <div class="skill-list">
            <div v-for="skill in group.skills" :key="skill.name" class="skill-item">
              <div class="skill-header">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-level pixel-font" :style="{color:group.color}">{{ skill.stars }}</span>
              </div>
              <div class="pixel-progress-outer">
                <div class="pixel-progress-inner" :style="{width:skill.pct+'%',background:'linear-gradient(90deg,'+group.color+','+group.colorLight+')'}"></div>
              </div>
              <div class="skill-note">{{ isZh ? skill.noteZh : skill.noteEn }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section container reveal">
      <div class="section-title">{{ t('项目深度解析', 'PROJECT DEEP DIVE') }}</div>
      <div class="proj-deep">
        <div v-for="p in deepProjects" :key="p.name" class="proj-deep-card pixel-card">
          <div class="proj-deep-header">
            <span class="proj-deep-name" :style="{color:p.color}">{{ p.name }}</span>
            <span class="proj-deep-stars pixel-font">⭐ {{ p.stars }}</span>
          </div>
          <p class="proj-deep-desc">{{ isZh ? p.descZh : p.descEn }}</p>
          <div class="proj-deep-points">
            <div v-for="pt in (isZh ? p.pointsZh : p.pointsEn)" :key="pt" class="proj-deep-point">
              <span :style="{color:p.color}">▸</span> {{ pt }}
            </div>
          </div>
          <div class="proj-deep-tags">
            <span v-for="tag in p.tags" :key="tag" class="pixel-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section container reveal">
      <div class="section-title">{{ t('成就历程', 'TIMELINE') }}</div>
      <div class="timeline">
        <div v-for="(item,i) in timeline" :key="i" class="timeline-item">
          <div class="timeline-dot" :style="{background:item.color,boxShadow:'0 0 8px '+item.color}"></div>
          <div class="timeline-content pixel-card">
            <div class="timeline-date pixel-font">{{ item.date }}</div>
            <div class="timeline-title">{{ isZh ? item.titleZh : item.titleEn }}</div>
            <div class="timeline-desc">{{ isZh ? item.descZh : item.descEn }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLang } from '../composables/i18n.js'
const { isZh, t } = useLang()
const avatar = ref('https://github.com/zimingttkx.png')

const skillGroups = [
  { name:'算法与数据结构', nameEn:'Algorithms & DSA', icon:'⚔', color:'#00f3ff', colorLight:'#00ffcc',
    skills:[
      { name:'LeetCode / 竞赛', stars:'★★★★☆', pct:80, noteZh:'12专题：动规/图论/滑窗/位运算等', noteEn:'12 topics: DP, Graph, Sliding Window, Bit Ops' },
      { name:'动态规划', stars:'★★★★☆', pct:78, noteZh:'线性/树形/区间 DP', noteEn:'Linear, Tree, Interval DP' },
      { name:'图论 & BFS/DFS', stars:'★★★☆☆', pct:62, noteZh:'Dijkstra / 拓扑排序 / 网络流', noteEn:'Dijkstra, Topological Sort, Network Flow' },
    ]},
  { name:'C++20 高性能', nameEn:'C++20 High-Perf', icon:'◈', color:'#f34b7d', colorLight:'#ff8ab0',
    skills:[
      { name:'C++20 特性', stars:'★★★★☆', pct:82, noteZh:'概念约束、模板元编程、ranges', noteEn:'Concepts, template metaprogramming, ranges' },
      { name:'底层数据结构', stars:'★★★★★', pct:90, noteZh:'LRU/LFU/ARC 缓存 + 红黑树 + 内存池 + GC', noteEn:'LRU/LFU/ARC cache, red-black tree, memory pool, GC' },
      { name:'Header-only 库', stars:'★★★★☆', pct:80, noteZh:'零依赖纯头文件库设计', noteEn:'Zero-dep header-only library design' },
    ]},
  { name:'机器学习 & 深度学习', nameEn:'ML & Deep Learning', icon:'◉', color:'#00ffcc', colorLight:'#00f3ff',
    skills:[
      { name:'PyTorch / sklearn', stars:'★★★★☆', pct:78, noteZh:'CNN / RNN / Transformer 实战', noteEn:'CNN, RNN, Transformer hands-on' },
      { name:'数据分析', stars:'★★★☆☆', pct:68, noteZh:'Pandas / NumPy / Matplotlib', noteEn:'Pandas, NumPy, Matplotlib' },
      { name:'强化学习', stars:'★★★☆☆', pct:55, noteZh:'RL 集成于网络安全检测', noteEn:'RL integrated in network security detection' },
    ]},
  { name:'网络安全 & IDS', nameEn:'Cybersecurity & IDS', icon:'◎', color:'#ff2eb0', colorLight:'#ffe600',
    skills:[
      { name:'ML-based IDS', stars:'★★★★☆', pct:82, noteZh:'99.58%准确率，19913 QPS', noteEn:'99.58% accuracy, 19913 QPS' },
      { name:'Kitsune / LUCID', stars:'★★★★☆', pct:78, noteZh:'双算法框架集成', noteEn:'Dual algorithm framework integration' },
      { name:'Docker / K8s', stars:'★★★☆☆', pct:62, noteZh:'容器化安全系统部署', noteEn:'Containerized security system deployment' },
    ]},
  { name:'Python & 工程化', nameEn:'Python & Engineering', icon:'◆', color:'#3572A5', colorLight:'#6ab0f5',
    skills:[
      { name:'Python 3', stars:'★★★★☆', pct:82, noteZh:'科学计算 / 系统编程 / 数据处理', noteEn:'Scientific computing, system programming, data' },
      { name:'Jupyter / 文档', stars:'★★★★☆', pct:80, noteZh:'405⭐ ML教程，结构清晰', noteEn:'405⭐ ML tutorial with clean structure' },
    ]},
]

const deepProjects = [
  { name:'AI-Practices', stars:405, color:'#f0c030',
    descZh:'机器学习与深度学习综合实战教程，从线性回归到 Transformer 的完整 PyTorch 学习路径。',
    descEn:'Comprehensive ML & DL tutorial, full PyTorch path from linear regression to Transformer.',
    pointsZh:['线性回归 → 神经网络 → CNN → RNN 完整路径','PyTorch 实战，Jupyter Notebook 交互教学','覆盖监督/非监督/强化学习三大范式','405 Stars，持续维护更新'],
    pointsEn:['Full path: Linear Regression → NN → CNN → RNN','PyTorch hands-on with interactive Jupyter Notebooks','Covers supervised, unsupervised & reinforcement learning','405 Stars, actively maintained'],
    tags:['PyTorch','Jupyter','CNN','RNN','RL','Python'] },
  { name:'Network-Security-Based-On-ML', stars:153, color:'#ff2eb0',
    descZh:'基于机器学习的网络入侵检测系统，工业级性能，支持容器化生产部署。',
    descEn:'ML-powered network intrusion detection with industrial-grade performance and containerized deployment.',
    pointsZh:['集成 Kitsune / LUCID 双算法框架','99.58% 攻击检测准确率','19913 QPS 高吞吐量','支持 ML / DL / RL 多种模型','Docker + Kubernetes 生产部署'],
    pointsEn:['Kitsune/LUCID dual algorithm framework','99.58% attack detection accuracy','19913 QPS high-throughput','ML / DL / RL model support','Docker + Kubernetes production deployment'],
    tags:['Python','Kitsune','LUCID','Docker','K8s','IDS'] },
  { name:'cpp-from-scratch', stars:48, color:'#f34b7d',
    descZh:'C++20 高质量从零实现，纯头文件，零依赖，兼顾学习与生产使用。',
    descEn:'High-quality C++20 from-scratch implementations. Header-only, zero deps, for learning and production.',
    pointsZh:['LRU / LFU / ARC 缓存策略完整实现','红黑树（插入/删除/旋转全覆盖）','内存池 & 垃圾回收器','C++20 概念约束 + 模板元编程','仅头文件，零外部依赖'],
    pointsEn:['LRU / LFU / ARC cache policy implementations','Red-black tree (insert/delete/rotation)','Memory pool & garbage collector','C++20 concepts + template metaprogramming','Header-only, zero external dependencies'],
    tags:['C++20','LRU','LFU','Red-Black Tree','Memory Pool','GC'] },
]

const timeline = [
  { date:'2023', color:'#00f3ff', titleZh:'开始系统学习算法', titleEn:'Started Systematic Algorithm Study', descZh:'刷 LeetCode，参加竞赛，建立 12 专题刷题体系与进度追踪系统。', descEn:'LeetCode grind, competitive programming, built 12-topic practice tracking system.' },
  { date:'2024', color:'#00ffcc', titleZh:'发布 AI-Practices (405⭐)', titleEn:'Released AI-Practices (405⭐)', descZh:'完整 PyTorch ML/DL 教程，从线性回归到 RNN，Jupyter Notebook 交互式。', descEn:'Complete PyTorch ML/DL tutorial from linear regression to RNN, interactive notebooks.' },
  { date:'2024', color:'#f34b7d', titleZh:'开源 cpp-from-scratch (48⭐)', titleEn:'Open-sourced cpp-from-scratch (48⭐)', descZh:'C++20 从零实现底层数据结构，仅头文件，零依赖。', descEn:'C++20 from-scratch low-level data structures, header-only, zero deps.' },
  { date:'2025', color:'#ff2eb0', titleZh:'发布安全检测系统 (153⭐)', titleEn:'Released Security System (153⭐)', descZh:'ML驱动网络入侵检测，99.58%准确率，19913 QPS，Docker/K8s部署。', descEn:'ML-driven IDS with 99.58% accuracy, 19913 QPS, Docker/K8s deployment.' },
  { date:'2026', color:'#d040ff', titleZh:'构建像素风个人技术站', titleEn:'Built Pixel-Art Personal Site', descZh:'Vue3+Vite 全栈重构，像素风 + 霓虹动效，中英双语，暗/亮主题切换。', descEn:'Vue3+Vite rebuild with pixel-art neon theme, bilingual support, dark/light mode.' },
]

onMounted(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.about-page { min-height: 100vh; }
.about-hero { padding: 60px 0 20px; }
.about-hero-inner { display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap; }
.about-avatar-wrap { flex-shrink: 0; text-align: center; }
.about-avatar { width: 140px; height: 140px; border: 3px solid var(--neon-purple); box-shadow: 0 0 20px rgba(191,0,255,0.5); image-rendering: pixelated; display: block; }
.about-avatar-label { font-size: .38rem; color: var(--text-dim); margin-top: 8px; letter-spacing: .1em; }
.about-info { flex: 1; }
.about-name { font-size: clamp(1rem,3vw,1.6rem); margin-bottom: 10px; }
.about-sub { font-size: clamp(.45rem,1vw,.6rem); margin-bottom: 16px; letter-spacing: .08em; }
.about-bio { color: var(--text-dim); line-height: 1.9; margin-bottom: 16px; font-size: .9rem; }
.about-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.astat { text-align: center; padding: 10px 14px; }
.astat-val { font-size: .9rem; }
.astat-label { font-size: .72rem; color: var(--text-dim); margin-top: 4px; }
.section { padding: 60px 0; }
.skill-tree { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
.skill-group { padding: 20px; }
.skill-group-title { font-size: .52rem; margin-bottom: 16px; letter-spacing: .08em; }
.skill-list { display: flex; flex-direction: column; gap: 14px; }
.skill-header { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center; }
.skill-name { font-size: .82rem; }
.skill-level { font-size: .42rem; }
.skill-note { font-size: .72rem; color: var(--text-dim); margin-top: 4px; line-height: 1.5; }
.proj-deep { display: flex; flex-direction: column; gap: 16px; }
.proj-deep-card { padding: 20px; }
.proj-deep-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.proj-deep-name { font-size: 1rem; font-weight: 700; }
.proj-deep-stars { font-size: .45rem; color: var(--mc-gold); }
.proj-deep-desc { color: var(--text-dim); font-size: .85rem; line-height: 1.7; margin-bottom: 12px; }
.proj-deep-points { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.proj-deep-point { font-size: .82rem; color: var(--text-main); line-height: 1.6; }
.point-bullet { margin-right: 6px; }
.proj-deep-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.timeline { display: flex; flex-direction: column; padding-left: 28px; position: relative; }
.timeline::before { content:''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--neon-blue), var(--neon-purple)); box-shadow: 0 0 6px var(--neon-blue); }
.timeline-item { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
.timeline-dot { width: 14px; height: 14px; flex-shrink: 0; margin-top: 6px; margin-left: -35px; }
.timeline-content { flex: 1; padding: 14px 16px; }
.timeline-date { font-size: .42rem; color: var(--text-dim); margin-bottom: 6px; }
.timeline-title { font-size: .95rem; margin-bottom: 6px; font-weight: 600; }
.timeline-desc { font-size: .82rem; color: var(--text-dim); line-height: 1.7; }
@media (max-width: 600px) {
  .about-hero-inner { flex-direction: column; align-items: center; }
  .about-info { text-align: center; }
  .about-stats { justify-content: center; }
}
</style>
