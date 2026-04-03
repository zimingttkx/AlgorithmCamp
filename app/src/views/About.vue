<template>
  <div class="about-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-title">
          <span class="title-icon">👨‍💻</span>
          {{ isZh ? '关于我' : 'About Me' }}
        </h1>
      </header>

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-avatar">
          <img :src="avatar" alt="Avatar" @error="avatarFallback" class="avatar-img" />
        </div>
        <div class="profile-info">
          <h2 class="profile-name">zimingttkx</h2>
          <p class="profile-title">{{ t('数学相关专业本科在读', 'Undergraduate in Mathematics') }}</p>
          <p class="profile-bio">
            {{ t(
              '核心能力集中在 Python 工程开发、C++ 底层实现与算法竞赛。长期深耕数据结构与算法刷题，同时在机器学习与深度学习安全领域有实际项目落地经验。',
              'Core strengths in Python engineering, C++ low-level implementation, and competitive programming. Hands-on experience in ML/DL security applications.'
            ) }}
          </p>
          <div class="profile-links">
            <a href="https://github.com/zimingttkx" target="_blank" class="link-btn github">
              <span>◉</span> GitHub
            </a>
            <a href="https://leetcode.cn/u/zimingttkx/" target="_blank" class="link-btn leetcode">
              <span>⚔</span> LeetCode
            </a>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-box">
            <span class="stat-num">606</span>
            <span class="stat-label">{{ isZh ? 'GitHub Stars' : 'GitHub ★' }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">12</span>
            <span class="stat-label">{{ isZh ? '算法专题' : 'Topics' }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">3</span>
            <span class="stat-label">{{ isZh ? '开源项目' : 'Projects' }}</span>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">🎯</span>
          {{ isZh ? '技术栈' : 'Tech Stack' }}
        </h2>
        <div class="skills-grid">
          <div class="skill-item" v-for="skill in skills" :key="skill.name">
            <div class="skill-icon">{{ skill.icon }}</div>
            <div class="skill-info">
              <span class="skill-name">{{ isZh ? skill.name : skill.nameEn }}</span>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: skill.level + '%', background: skill.color }"></div>
              </div>
              <div class="skill-tags">
                <span v-for="tag in skill.tags" :key="tag" class="skill-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">🚀</span>
          {{ isZh ? '开源项目' : 'Open Source Projects' }}
        </h2>
        
        <!-- Project 1 -->
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">Network-Security-Based-On-ML</h3>
            <span class="project-stars">⭐ 153</span>
          </div>
          <p class="project-desc">
            {{ t('基于机器学习与深度学习的网络安全检测系统，实现自动化威胁识别与分类。', 'ML/DL-based network security detection system with automated threat identification.') }}
          </p>
          <div class="project-tags">
            <span>Python</span>
            <span>PyTorch</span>
            <span>Scikit-learn</span>
            <span>Pandas</span>
          </div>
          <div class="project-highlights">
            <div class="highlight-item">✓ {{ t('深度学习入侵检测模型', 'DL intrusion detection model') }}</div>
            <div class="highlight-item">✓ {{ t('完整教程仓库 405⭐', 'Tutorial repo with 405⭐') }}</div>
            <div class="highlight-item">✓ {{ t('监督与无监督学习方案', 'Supervised & unsupervised learning') }}</div>
          </div>
        </div>

        <!-- Project 2 -->
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">cpp-from-scratch</h3>
            <span class="project-stars">⭐ 48</span>
          </div>
          <p class="project-desc">
            {{ t('从零实现 C++ 标准库核心数据结构与算法，深入理解底层内存管理和模板元编程。', 'C++ STL from scratch. Deep dive into memory management and template metaprogramming.') }}
          </p>
          <div class="project-tags">
            <span>C++</span>
            <span>Templates</span>
            <span>STL</span>
            <span>CMake</span>
          </div>
          <div class="project-highlights">
            <div class="highlight-item">✓ {{ t('vector/list/map/set 完整实现', 'vector/list/map/set implementation') }}</div>
            <div class="highlight-item">✓ {{ t('智能指针底层实现', 'Smart pointers from scratch') }}</div>
            <div class="highlight-item">✓ {{ t('RAII、移动语义、模板特化', 'RAII, move semantics, template specialization') }}</div>
          </div>
        </div>

        <!-- Project 3 -->
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">{{ isZh ? '高并发缓存系统' : 'High-Concurrency Cache' }}</h3>
            <span class="project-tag">C++20</span>
          </div>
          <p class="project-desc">
            {{ t('线程安全高并发缓存系统，支持 LRU、LFU、ARC 多种替换策略，注重并发性能优化。', 'Thread-safe cache with LRU/LFU/ARC eviction strategies, optimized for high concurrency.') }}
          </p>
          <div class="project-tags">
            <span>C++20</span>
            <span>Thread Safety</span>
            <span>LRU/LFU/ARC</span>
            <span>Atomic</span>
          </div>
          <div class="project-highlights">
            <div class="highlight-item">✓ {{ t('多策略缓存替换算法', 'Multi-strategy cache eviction') }}</div>
            <div class="highlight-item">✓ {{ t('缓存分片降低锁争用', 'Cache sharding to reduce lock contention') }}</div>
            <div class="highlight-item">✓ {{ t('互斥锁+原子操作线程安全', 'Mutex + atomic thread safety') }}</div>
          </div>
        </div>
      </div>

      <!-- Timeline Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📅</span>
          {{ isZh ? '成长时间线' : 'Journey Timeline' }}
        </h2>
        <div class="timeline">
          <div class="timeline-item" v-for="(event, i) in timeline" :key="i">
            <div class="timeline-dot" :style="{ background: event.color }"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ event.date }}</span>
              <span class="timeline-title">{{ isZh ? event.title : event.titleEn }}</span>
              <span class="timeline-desc">{{ isZh ? event.desc : event.descEn }}</span>
              <div class="timeline-tags">
                <span v-for="tag in event.tags" :key="tag" class="timeline-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Future Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">🔮</span>
          {{ isZh ? '未来方向' : 'Future Directions' }}
        </h2>
        <div class="future-grid">
          <div class="future-item">
            <span class="future-num" style="color: #ec4899">01</span>
            <div class="future-content">
              <span class="future-title">{{ isZh ? '高性能计算与并行编程' : 'HPC & Parallel Programming' }}</span>
              <span class="future-desc">{{ isZh ? 'CUDA 并行编程、GPU 加速优化' : 'CUDA, GPU acceleration' }}</span>
            </div>
          </div>
          <div class="future-item">
            <span class="future-num" style="color: #a855f7">02</span>
            <div class="future-content">
              <span class="future-title">{{ isZh ? '数值计算与优化理论' : 'Numerical Computing & Optimization' }}</span>
              <span class="future-desc">{{ isZh ? '凸优化、数值线性代数' : 'Convex optimization, numerical linear algebra' }}</span>
            </div>
          </div>
          <div class="future-item">
            <span class="future-num" style="color: #06b6d4">03</span>
            <div class="future-content">
              <span class="future-title">{{ isZh ? '微分方程与数理建模' : 'Differential Equations & Modeling' }}</span>
              <span class="future-desc">{{ isZh ? 'PDE/ODE 数值求解、工程应用' : 'PDE/ODE solving, engineering applications' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="section-card contact-section">
        <h2 class="section-title">
          <span class="section-icon">📬</span>
          {{ isZh ? '联系我' : 'Contact' }}
        </h2>
        <div class="contact-grid">
          <div class="contact-item">
            <span class="contact-icon">◈</span>
            <span>zimingttkx@github</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">⚔</span>
            <span>leetcode.cn/u/zimingttkx</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">◆</span>
            <span>{{ isZh ? '通常24小时内回复' : 'Usually replies within 24h' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLang } from '../composables/i18n.js'

const { isZh, t } = useLang()

const avatar = ref(import.meta.env.BASE_URL + 'avatar.png')

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="%231a1a30"/><text x="50%" y="55%" font-size="36" text-anchor="middle" fill="%230EA5E9">Z</text></svg>'
}

const skills = [
  { name: 'C++ / 系统编程', nameEn: 'C++ / Systems', icon: '◈', color: '#0EA5E9', level: 92,
    tags: ['STL', 'Templates', 'Memory', 'Concurrency'] },
  { name: '算法与数据结构', nameEn: 'Algorithms', icon: '⚔', color: '#00ffcc', level: 95,
    tags: ['DP', 'Graph', 'LeetCode', 'Codeforces'] },
  { name: '机器学习/深度学习', nameEn: 'ML / DL', icon: '◉', color: '#d946ef', level: 85,
    tags: ['PyTorch', 'CNN', 'RNN', 'Security'] },
  { name: 'Python / 工程化', nameEn: 'Python', icon: '◆', color: '#facc15', level: 88,
    tags: ['Data Processing', 'Automation', 'Git'] },
  { name: 'AI Agent 开发', nameEn: 'AI Agent', icon: '⬡', color: '#f43f5e', level: 80,
    tags: ['LangChain', 'RAG', 'MCP'] },
]

const timeline = [
  { date: '2024', title: '网络安全项目启动', titleEn: 'Network Security Project', 
    desc: '启动 ML/DL 网络安全检测系统', descEn: 'Launched ML/DL security detection',
    color: '#d946ef', tags: ['Python', 'PyTorch'] },
  { date: '2024', title: 'C++ 从零实现', titleEn: 'C++ From Scratch',
    desc: '开始从零实现 STL 标准库', descEn: 'Started STL implementation',
    color: '#0EA5E9', tags: ['C++', 'Templates'] },
  { date: '2023', title: '算法竞赛之路', titleEn: 'Algorithm Competition',
    desc: '开始 LeetCode/Codeforces 刷题', descEn: 'Began competitive programming',
    color: '#00ffcc', tags: ['LeetCode', 'Algorithms'] },
  { date: '2022', title: '大学入学', titleEn: 'University',
    desc: '数学相关专业本科学习', descEn: 'Started undergraduate studies',
    color: '#facc15', tags: ['Math', 'CS'] },
]
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  padding: 80px 0 60px;
  background: var(--bg-dark);
  background-image: 
    radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  text-align: center;
  padding: 40px 0;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  -webkit-text-fill-color: initial;
}

/* Profile Card */
.profile-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 32px;
  align-items: start;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(14, 165, 233, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-title {
  font-size: 1rem;
  color: var(--neon-cyan);
  margin: 0;
}

.profile-bio {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 8px 0;
  max-width: 500px;
}

.profile-links {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-btn.github {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.link-btn.github:hover {
  background: #fff;
  color: #333;
}

.link-btn.leetcode {
  background: rgba(255, 165, 22, 0.1);
  border: 1px solid rgba(255, 165, 22, 0.3);
  color: #ffa116;
}

.link-btn.leetcode:hover {
  background: #ffa116;
  color: #fff;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-box {
  text-align: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.stat-num {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mc-gold, #fbbf24);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
}

/* Section Card */
.section-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 1.4rem;
}

/* Skills Grid */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.skill-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.skill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.skill-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  font-size: 0.7rem;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: var(--text-dim);
}

/* Project Card */
.project-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
}

.project-card:last-child {
  margin-bottom: 0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.project-stars {
  font-family: monospace;
  color: var(--mc-gold, #fbbf24);
}

.project-tag {
  padding: 4px 8px;
  background: rgba(14, 165, 233, 0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #0EA5E9;
}

.project-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.project-tags span {
  padding: 4px 10px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--neon-cyan);
}

.project-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item {
  font-size: 0.85rem;
  color: #4ade80;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 20px;
  border-left: 2px solid rgba(0, 240, 255, 0.2);
}

.timeline-item {
  position: relative;
  padding-left: 24px;
}

.timeline-dot {
  position: absolute;
  left: -27px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-date {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--neon-cyan);
}

.timeline-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.timeline-desc {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.timeline-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.timeline-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: var(--text-dim);
}

/* Future */
.future-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.future-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.future-num {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.future-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.future-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.future-desc {
  font-size: 0.85rem;
  color: var(--text-dim);
}

/* Contact */
.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.contact-icon {
  font-size: 1rem;
  color: var(--neon-cyan);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .profile-avatar {
    margin: 0 auto;
  }
  
  .profile-links {
    justify-content: center;
  }
  
  .profile-stats {
    flex-direction: row;
    justify-content: center;
  }
  
  .stat-box {
    flex: 1;
  }
}
</style>
