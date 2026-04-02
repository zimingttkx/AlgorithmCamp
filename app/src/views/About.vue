<template>
  <div class="about-page" style="padding-top:64px">
    <!-- Header -->
    <section class="about-hero container">
      <div class="about-hero-inner">
        <div class="about-avatar-wrap" @click="openAvatarZoom">
          <img :src="avatar" alt="Profile avatar of zimingttkx" class="about-avatar pinch-zoom-image" loading="lazy" @error="avatarFallback"
            @touchstart="handleAvatarTouchStart"
            @touchmove="handleAvatarTouchMove"
            @touchend="handleAvatarTouchEnd" />
          <div class="about-avatar-label pixel-font">DEVELOPER PROFILE</div>
        </div>
        <div class="about-info">
          <div class="pixel-font about-name glow-blue">zimingttkx</div>
          <div class="about-sub glow-cyan">{{ t('ComputerScience · Math', 'ComputerScience · Math') }}</div>
          <p class="about-bio">{{ t(
            '数学相关专业本科在读，核心能力集中在 Python 工程开发、C++ 底层实现与算法竞赛。长期深耕数据结构与算法刷题，同时在机器学习与深度学习安全领域有实际项目落地经验。',
            'Undergraduate in mathematics-related field. Core strengths in Python engineering, C++ low-level implementation, and competitive programming. Hands-on experience in ML/DL security applications.'
          ) }}</p>
          <div class="about-stats">
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--mc-gold)">606⭐</div><div class="astat-label">GitHub Stars</div></div>
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--neon-cyan)">12</div><div class="astat-label">{{ t('算法专题', 'Topics') }}</div></div>
            <div class="astat pixel-card"><div class="astat-val pixel-font" style="color:var(--neon-purple)">3</div><div class="astat-label">{{ t('开源项目', 'Projects') }}</div></div>
          </div>
          <div class="about-links">
            <a href="https://github.com/zimingttkx" target="_blank" class="pixel-btn">◉ GitHub</a>
            <a href="https://leetcode.cn/u/zimingttkx/" target="_blank" class="pixel-btn pixel-btn-purple">⚔ LeetCode</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Skill Tree -->
    <section class="section container reveal">
      <div class="section-title">{{ t('技能树', 'SKILL TREE') }}</div>
      <div class="skill-tree-container">
        <div class="skill-tree" ref="skillTreeRef">
          <div v-for="(group, gIndex) in skillTreeData" :key="group.name" class="skill-branch" :style="{ '--branch-delay': gIndex * 0.15 + 's' }">
            <div class="skill-branch-line"></div>
            <div class="skill-branch-node" :style="{ '--node-color': group.color }">
              <div class="skill-node-icon">{{ group.icon }}</div>
              <div class="skill-node-label">{{ isZh ? group.name : group.nameEn }}</div>
            </div>
            <div class="skill-subnodes">
              <div v-for="(skill, sIndex) in group.skills" :key="skill.name" class="skill-subnode" :style="{ '--sub-delay': (gIndex * 0.15 + sIndex * 0.08) + 's', '--sub-color': group.color }">
                <div class="skill-subnode-dot"></div>
                <div class="skill-subnode-content">
                  <div class="skill-subnode-name">{{ skill.name }}</div>
                  <div class="skill-subnode-bar">
                    <div class="skill-subnode-fill" :style="{ '--fill-width': skill.level + '%', '--fill-color': group.color }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Legacy Skills Grid -->
    <section class="section container reveal">
      <div class="section-title">{{ t('技术详情', 'TECH DETAILS') }}</div>
      <div class="skills-grid">
        <div v-for="group in masteredSkills" :key="group.name" class="skill-group pixel-card">
          <div class="skill-group-title" :style="{color:group.color,textShadow:'0 0 6px '+group.color}">
            {{ group.icon }} {{ isZh ? group.name : group.nameEn }}
          </div>
          <ul class="skill-list">
            <li v-for="skill in group.skills" :key="skill">
              <span class="skill-dot" :style="{background:group.color}"></span>
              {{ isZh ? skill : skill }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Project Experience -->
    <section class="section container reveal">
      <div class="section-title">{{ t('项目经验', 'PROJECT EXPERIENCE') }}</div>

      <div class="proj-experience pixel-card" style="margin-bottom:20px">
        <div class="proj-exp-header">
          <div class="proj-exp-name glow-purple">{{ t('Network-Security-Based-On-ML', 'Network-Security-Based-On-ML') }}</div>
          <div class="proj-exp-role">{{ t('独立开发者 · ML/DL 安全检测系统', 'Solo Developer · ML/DL Security Detection System') }}</div>
          <div class="proj-exp-stars">⭐ 153 Stars</div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('解决核心问题', 'Core Problem Solved') }}</div>
          <p class="proj-exp-desc">{{ t(
            '将机器学习与深度学习技术落地到网络安全领域，构建自动化威胁检测系统；涵盖入侵检测、恶意流量分类、异常行为识别等场景。',
            'Applying ML/DL techniques to network security, building automated threat detection systems; covering intrusion detection, malicious traffic classification, and anomaly identification.'
          ) }}</p>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('落地技术栈', 'Tech Stack') }}</div>
          <div class="proj-exp-tags">
            <span class="pixel-tag">Python</span>
            <span class="pixel-tag">PyTorch</span>
            <span class="pixel-tag">Scikit-learn</span>
            <span class="pixel-tag">Pandas</span>
            <span class="pixel-tag">NumPy</span>
            <span class="pixel-tag">Git</span>
          </div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('核心交付成果', 'Key Deliverables') }}</div>
          <ul class="proj-exp-points">
            <li>{{ t('基于深度学习的网络入侵检测模型，实现自动化威胁识别与分类', 'DL-based network intrusion detection model with automated threat identification and classification') }}</li>
            <li>{{ t('完整的 ML/DL 安全检测教程，GitHub 405⭐ 配套教学仓库', 'Comprehensive ML/DL security detection tutorial with 405⭐ companion teaching repository') }}</li>
            <li>{{ t('多维度特征工程与模型调优，覆盖监督学习与无监督学习方案', 'Multi-dimensional feature engineering and model tuning, covering both supervised and unsupervised approaches') }}</li>
          </ul>
        </div>
      </div>

      <div class="proj-experience pixel-card">
        <div class="proj-exp-header">
          <div class="proj-exp-name glow-blue">{{ t('cpp-from-scratch', 'cpp-from-scratch') }}</div>
          <div class="proj-exp-role">{{ t('独立开发者 · C++ 标准库底层实现', 'Solo Developer · C++ Standard Library Low-Level Implementation') }}</div>
          <div class="proj-exp-stars">⭐ 48 Stars</div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('解决核心问题', 'Core Problem Solved') }}</div>
          <p class="proj-exp-desc">{{ t(
            '从零实现 C++ 标准库核心数据结构与算法组件，深入理解底层内存管理、容器实现原理与模板元编程机制。',
            'Implementing core C++ STL data structures and algorithms from scratch, deeply understanding memory management, container internals, and template metaprogramming.'
          ) }}</p>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('落地技术栈', 'Tech Stack') }}</div>
          <div class="proj-exp-tags">
            <span class="pixel-tag">C++</span>
            <span class="pixel-tag">Templates</span>
            <span class="pixel-tag">STL</span>
            <span class="pixel-tag">Memory Management</span>
            <span class="pixel-tag">CMake</span>
            <span class="pixel-tag">Git</span>
          </div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('核心交付成果', 'Key Deliverables') }}</div>
          <ul class="proj-exp-points">
            <li>{{ t('从零实现 vector、list、map、set 等核心容器，完整复现 STL 接口', 'From-scratch implementation of vector, list, map, set with full STL-compatible interfaces') }}</li>
            <li>{{ t('智能指针（unique_ptr / shared_ptr）、迭代器、类型萃取底层实现', 'Smart pointers (unique_ptr/shared_ptr), iterators, and type traits low-level implementation') }}</li>
            <li>{{ t('深入 RAII、移动语义、模板特化等 C++ 核心机制', 'Deep dive into RAII, move semantics, template specialization, and other C++ core mechanisms') }}</li>
          </ul>
        </div>
      </div>

      <div class="proj-experience pixel-card">
        <div class="proj-exp-header">
          <div class="proj-exp-name glow-blue">{{ t('高并发缓存系统', 'High-Concurrency Cache System') }}</div>
          <div class="proj-exp-role">{{ t('独立开发者 · 线程安全多策略缓存引擎', 'Solo Developer · Thread-Safe Multi-Strategy Cache Engine') }}</div>
          <div class="proj-exp-stars">C++20</div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('项目描述', 'Description') }}</div>
          <p class="proj-exp-desc">{{ t(
            '基于 C++ 实现的线程安全高并发缓存系统，支持 LRU、LFU、ARC 多种缓存替换策略。注重并发性能优化与策略改进，提升高并发场景下的响应速度与命中率。',
            'A thread-safe high-concurrency cache system in C++, supporting LRU, LFU, and ARC eviction strategies. Focused on concurrency optimization and strategy improvement for higher throughput and hit rates.'
          ) }}</p>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('落地技术栈', 'Tech Stack') }}</div>
          <div class="proj-exp-tags">
            <span class="pixel-tag">C++20</span>
            <span class="pixel-tag">Thread Safety</span>
            <span class="pixel-tag">Mutex</span>
            <span class="pixel-tag">Atomic</span>
            <span class="pixel-tag">LRU/LFU/ARC</span>
          </div>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('核心工作', 'Key Contributions') }}</div>
          <ul class="proj-exp-points">
            <li>{{ t('实现 LRU、LFU、ARC 多种缓存替换策略，适配不同访问模式与业务场景', 'Implemented LRU, LFU, ARC eviction strategies for different access patterns') }}</li>
            <li>{{ t('LRU/LFU 缓存分片设计，降低锁争用，提升高并发访问性能', 'LRU/LFU cache sharding to reduce lock contention under high concurrency') }}</li>
            <li>{{ t('LRU-k 优化防止热点数据被冷数据替换，减少缓存污染问题', 'LRU-k optimization to prevent hot data eviction and reduce cache pollution') }}</li>
            <li>{{ t('LFU 引入最大平均访问频次机制，淘汰旧热点数据，提升缓存整体利用率', 'LFU with max average frequency mechanism to evict stale hot data') }}</li>
            <li>{{ t('ARC 策略动态调整 LRU 与 LFU 权重比例，提升复杂场景缓存命中率', 'ARC dynamic weight adjustment between LRU/LFU for complex workloads') }}</li>
            <li>{{ t('互斥锁 + 原子操作实现多线程安全，保障高并发下数据一致性', 'Thread safety via mutex + atomic operations for data consistency') }}</li>
          </ul>
        </div>

        <div class="proj-exp-section">
          <div class="proj-exp-stitle">{{ t('技术难点', 'Technical Challenges') }}</div>
          <ul class="proj-exp-points">
            <li>{{ t('高并发环境下线程安全与数据一致性的保障', 'Thread safety and data consistency under high concurrency') }}</li>
            <li>{{ t('缓存分片策略设计，平衡分片粒度与锁争用', 'Cache sharding strategy design balancing granularity and lock contention') }}</li>
            <li>{{ t('LRU-k 历史队列维护与冷数据过滤机制', 'LRU-k history queue maintenance and cold data filtering') }}</li>
            <li>{{ t('LFU 最大平均访问频次的动态计算与老化淘汰', 'Dynamic computation and aging eviction of LFU max average frequency') }}</li>
            <li>{{ t('ARC 动态权重调整算法，自适应不同业务负载', 'ARC adaptive weight adjustment algorithm for varying workloads') }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Future Learning Plans -->
    <section class="section container reveal">
      <div class="section-title">{{ t('未来方向', 'FUTURE DIRECTION') }}</div>
      <div class="future-section pixel-card">
        <div class="future-grid">
          <div class="future-item">
            <div class="fi-num" style="color:var(--neon-pink)">01</div>
            <div class="fi-content">
              <div class="fi-title">{{ t('高性能计算与并行编程', 'High-Performance Computing & Parallel Programming') }}</div>
              <div class="fi-desc">{{ t('CUDA 并行编程模型、GPU 加速优化、并行计算架构设计', 'CUDA parallel programming model, GPU acceleration optimization, parallel computing architecture design') }}</div>
            </div>
          </div>
          <div class="future-item">
            <div class="fi-num" style="color:var(--neon-purple)">02</div>
            <div class="fi-content">
              <div class="fi-title">{{ t('数值计算与优化理论', 'Numerical Computing & Optimization Theory') }}</div>
              <div class="fi-desc">{{ t('数值计算方法、最优化理论、凸优化、数值线性代数', 'Numerical methods, optimization theory, convex optimization, numerical linear algebra') }}</div>
            </div>
          </div>
          <div class="future-item">
            <div class="fi-num" style="color:var(--neon-cyan)">03</div>
            <div class="fi-content">
              <div class="fi-title">{{ t('微分方程与数理建模', 'Differential Equations & Mathematical Modeling') }}</div>
              <div class="fi-desc">{{ t('PDE/ODE 数值求解方法、数理建模与工程落地应用', 'PDE/ODE numerical solving methods, mathematical modeling and engineering applications') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="section container reveal">
      <div class="section-title">{{ t('成长时间线', 'JOURNEY TIMELINE') }}</div>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div v-for="(event, index) in timelineEvents" :key="index" class="timeline-item" :class="{ 'timeline-item-right': index % 2 === 1 }" :style="{ '--item-delay': index * 0.2 + 's' }">
          <div class="timeline-dot" :style="{ '--dot-color': event.color }"></div>
          <div class="timeline-card pixel-card">
            <div class="timeline-date" :style="{ color: event.color }">{{ event.date }}</div>
            <div class="timeline-title">{{ isZh ? event.titleZh : event.title }}</div>
            <div class="timeline-desc">{{ isZh ? event.descZh : event.desc }}</div>
            <div class="timeline-tags">
              <span v-for="tag in event.tags" :key="tag" class="pixel-tag-sm">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form -->
    <section class="section container reveal">
      <div class="section-title">{{ t('联系我', 'CONTACT') }}</div>
      <div class="contact-form-container pixel-card">
        <form class="contact-form" @submit.prevent="handleContactSubmit">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="contact-name">{{ t('姓名', 'Name') }}</label>
              <input type="text" id="contact-name" v-model="contactForm.name" class="form-input" :placeholder="t('你的名字', 'Your name')" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">{{ t('邮箱', 'Email') }}</label>
              <input type="email" id="contact-email" v-model="contactForm.email" class="form-input" :placeholder="t('your@email.com', 'your@email.com')" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-subject">{{ t('主题', 'Subject') }}</label>
            <input type="text" id="contact-subject" v-model="contactForm.subject" class="form-input" :placeholder="t('邮件主题', 'Message subject')" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">{{ t('消息', 'Message') }}</label>
            <textarea id="contact-message" v-model="contactForm.message" class="form-textarea" :placeholder="t('输入你的消息...', 'Enter your message...')" rows="5" required></textarea>
          </div>
          <div class="form-footer">
            <button type="submit" class="pixel-btn-submit" :class="{ 'btn-submitting': isSubmitting }">
              <span v-if="!isSubmitting">{{ t('发送消息', 'SEND MESSAGE') }}</span>
              <span v-else class="submitting-text">{{ t('发送中...', 'SENDING...') }}</span>
            </button>
            <div v-if="submitStatus" class="form-status" :class="{ 'status-success': submitStatus === 'success', 'status-error': submitStatus === 'error' }">
              {{ submitStatus === 'success' ? (isZh ? '消息已发送！' : 'Message sent!') : (isZh ? '发送失败，请重试' : 'Failed to send. Please try again.') }}
            </div>
          </div>
        </form>
        <div class="contact-info">
          <div class="contact-info-item">
            <span class="contact-info-icon">◈</span>
            <span class="contact-info-text">zimingttkx@github</span>
          </div>
          <div class="contact-info-item">
            <span class="contact-info-icon">⚔</span>
            <span class="contact-info-text">leetcode.cn/u/zimingttkx</span>
          </div>
          <div class="contact-info-item">
            <span class="contact-info-icon">◆</span>
            <span class="contact-info-text">{{ t('通常在24小时内回复', 'Usually replies within 24 hours') }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Avatar Zoom Overlay (Pinch-to-zoom) -->
  <Teleport to="body">
    <div v-if="avatarZoom" class="pinch-zoom-overlay visible" @click="closeAvatarZoom">
      <button class="pinch-zoom-close" @click="closeAvatarZoom" aria-label="Close">×</button>
      <img :src="avatar" alt="Profile avatar of zimingttkx" class="pinch-zoom-image"
        :style="{ transform: `scale(${avatarZoomScale})` }"
        @touchstart="handleAvatarTouchStart"
        @touchmove="handleAvatarTouchMove"
        @touchend="handleAvatarTouchEnd"
        @error="avatarFallback" />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLang } from '../composables/i18n.js'
const { isZh, t } = useLang()

const avatar = ref('avatar.png')

// Avatar pinch-to-zoom state
const avatarZoom = ref(false)
const avatarZoomScale = ref(1)
const avatarTouchStartDistance = ref(0)
const avatarTouchStartScale = ref(1)

function avatarFallback(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><rect width="140" height="140" fill="%231a1a30"/><text x="50%" y="55%" font-size="40" text-anchor="middle" fill="%230EA5E9">Z</text></svg>'
}

// Avatar pinch-to-zoom handlers
function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function handleAvatarTouchStart(e) {
  if (e.touches.length === 2) {
    avatarZoom.value = true
    avatarTouchStartDistance.value = getTouchDistance(e.touches[0], e.touches[1])
    avatarTouchStartScale.value = avatarZoomScale.value
    e.preventDefault()
  }
}

function handleAvatarTouchMove(e) {
  if (!avatarZoom.value || e.touches.length !== 2) return
  const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
  const newScale = Math.min(3, Math.max(1, avatarTouchStartScale.value * (currentDistance / avatarTouchStartDistance.value)))
  avatarZoomScale.value = newScale
  e.preventDefault()
}

function handleAvatarTouchEnd(e) {
  if (e.touches.length < 2) {
    avatarZoom.value = false
    avatarZoomScale.value = 1
  }
}

function openAvatarZoom() {
  avatarZoom.value = true
  document.body.style.overflow = 'hidden'
}

function closeAvatarZoom() {
  avatarZoom.value = false
  avatarZoomScale.value = 1
  document.body.style.overflow = ''
}

const masteredSkills = [
  { name: 'C++ / 系统编程', nameEn: 'C++ / Systems', icon: '◈', color: '#0EA5E9',
    skills: [
      '现代 C++ (C++17/20)，熟练掌握 STL 容器与算法库',
      '手写实现标准库数据结构（vector / list / map / skip-list 等）',
      '内存管理、RAII 机制、智能指针、模板元编程',
    ]},
  { name: '算法与数据结构', nameEn: 'Algorithms & Data Structures', icon: '⚔', color: '#00ffcc',
    skills: [
      '主流算法范式：动态规划、图论、贪心、数论、组合数学、位运算',
      '高频技巧：滑动窗口、二分查找、单调栈/队列、前缀和、差分',
      'Codeforces / LeetCode 竞赛级解题能力',
    ]},
  { name: '机器学习 / 深度学习', nameEn: 'Machine Learning / Deep Learning', icon: '◉', color: '#d040ff',
    skills: [
      'PyTorch 框架，CNN / RNN / Transformer 架构实现与调优',
      '基于 ML/DL 的网络安全检测系统（完整落地经验）',
      '模型训练、评估、部署全流程',
    ]},
  { name: 'Python / 工程化', nameEn: 'Python / Engineering', icon: '◆', color: '#f0c030',
    skills: [
      '数据处理与分析、自动化脚本、工具链开发',
      'Git 版本控制、CI/CD 流程、项目工程化管理',
    ]},
  { name: 'AI Agent 开发', nameEn: 'AI Agent Development', icon: '⬡', color: '#ff2eb0',
    skills: [
      'LangChain / LlamaIndex 应用框架，MCP 协议实践',
      'RAG 检索增强生成、Skill 工具调用、Agent 编排',
      '多 Agent 协作系统与工具链集成',
    ]},
]

// Skill Tree Data with levels
const skillTreeData = [
  { name: 'C++ / 系统编程', nameEn: 'C++ / Systems', icon: '◈', color: '#0EA5E9',
    skills: [
      { name: 'STL / Templates', level: 95 },
      { name: 'Memory Management', level: 90 },
      { name: 'Concurrency', level: 85 },
    ]},
  { name: '算法与数据结构', nameEn: 'Algorithms', icon: '⚔', color: '#00ffcc',
    skills: [
      { name: 'DP / Graph', level: 95 },
      { name: 'Data Structures', level: 92 },
      { name: 'Problem Solving', level: 88 },
    ]},
  { name: '机器学习', nameEn: 'ML / DL', icon: '◉', color: '#d040ff',
    skills: [
      { name: 'PyTorch', level: 85 },
      { name: 'Neural Networks', level: 80 },
      { name: 'ML Security', level: 88 },
    ]},
  { name: 'Python / 工程化', nameEn: 'Python', icon: '◆', color: '#f0c030',
    skills: [
      { name: 'Data Processing', level: 85 },
      { name: 'Automation', level: 80 },
      { name: 'DevOps', level: 75 },
    ]},
  { name: 'AI Agent', nameEn: 'AI Agent', icon: '⬡', color: '#ff2eb0',
    skills: [
      { name: 'LangChain', level: 82 },
      { name: 'RAG / Tools', level: 80 },
      { name: 'Multi-Agent', level: 75 },
    ]},
]

// Timeline Events
const timelineEvents = [
  {
    date: '2024',
    title: 'Network Security Project',
    titleZh: '网络安全项目启动',
    desc: 'Launched ML/DL-based network security detection system',
    descZh: '启动基于机器学习/深度学习的网络安全检测系统',
    color: '#d040ff',
    tags: ['Python', 'PyTorch', 'Security'],
  },
  {
    date: '2024',
    title: 'C++ From Scratch',
    titleZh: 'C++ 从零实现',
    desc: 'Started implementing STL components from scratch',
    descZh: '开始从零实现 STL 标准库组件',
    color: '#0EA5E9',
    tags: ['C++', 'STL', 'Templates'],
  },
  {
    date: '2023',
    title: 'Algorithm Competition',
    titleZh: '算法竞赛入门',
    desc: 'Began competitive programming journey',
    descZh: '开始算法竞赛之路',
    color: '#00ffcc',
    tags: ['LeetCode', 'Codeforces', 'Algorithms'],
  },
  {
    date: '2022',
    title: 'University Studies',
    titleZh: '大学入学',
    desc: 'Started undergraduate studies in mathematics',
    descZh: '开始数学相关专业本科学习',
    color: '#f0c030',
    tags: ['Math', 'CS Foundation'],
  },
]

// Contact Form
const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})
const isSubmitting = ref(false)
const submitStatus = ref(null)

function handleContactSubmit() {
  isSubmitting.value = true
  submitStatus.value = null
  // Simulate form submission
  setTimeout(() => {
    isSubmitting.value = false
    submitStatus.value = 'success'
    contactForm.value = { name: '', email: '', subject: '', message: '' }
    setTimeout(() => { submitStatus.value = null }, 3000)
  }, 1500)
}

onMounted(() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.about-page { min-height: 100vh; }
.about-hero { padding: 60px 0 40px; }
.about-hero-inner {
  display: flex;
  gap: 60px;
  align-items: flex-start;
  flex-wrap: wrap;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 40px;
}
.about-avatar-wrap { flex-shrink: 0; text-align: center; }
.about-avatar {
  width: 160px;
  height: 160px;
  border-radius: 24px;
  box-shadow: 0 0 40px var(--glow-blue);
  object-fit: cover;
  display: block;
}
.about-avatar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 14px;
  letter-spacing: 0.1em;
}
.about-info { flex: 1; min-width: 280px; }
.about-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.about-sub {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}
.about-bio {
  color: var(--text-secondary);
  line-height: 1.9;
  margin-bottom: 24px;
  font-size: 1rem;
  max-width: 600px;
}
.about-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.astat {
  text-align: center;
  padding: 20px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  min-width: 100px;
}
.astat-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
}
.astat-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 6px;
}
.about-links { display: flex; gap: 12px; flex-wrap: wrap; }

.section { padding: 80px 0; }

/* Skills */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.skill-group {
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
.skill-group-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  margin-bottom: 16px;
  letter-spacing: 0.03em;
  font-weight: 600;
}
.skill-list { list-style: none; padding: 0; margin: 0; }
.skill-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 10px;
}
.skill-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

/* Project Experience */
.proj-experience {
  padding: 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  margin-bottom: 24px;
}
.proj-exp-header { margin-bottom: 24px; }
.proj-exp-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.proj-exp-role {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.proj-exp-stars {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--mc-gold);
  margin-top: 6px;
}
.proj-exp-section { margin-bottom: 20px; }
.proj-exp-stitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--neon-purple);
  letter-spacing: 0.1em;
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
}
.proj-exp-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
}
.proj-exp-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.proj-exp-points { margin: 0; padding-left: 20px; }
.proj-exp-points li {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: 8px;
}
.proj-exp-points li::marker { color: var(--neon-cyan); }

/* Future Plans */
.future-section {
  padding: 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(244, 114, 182, 0.2);
  border-radius: 16px;
}
.future-disclaimer {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 24px;
  padding: 14px 18px;
  background: rgba(244, 114, 182, 0.04);
  border-left: 3px solid var(--neon-pink);
  border-radius: 0 8px 8px 0;
}
.future-grid { display: flex; flex-direction: column; gap: 20px; }
.future-item { display: flex; gap: 16px; }
.fi-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
  min-width: 32px;
  color: var(--neon-pink);
}
.fi-content { flex: 1; }
.fi-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.fi-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Skill Tree */
.skill-tree-container {
  padding: 20px 0;
  overflow-x: auto;
}
.skill-tree {
  display: flex;
  gap: 40px;
  padding: 20px;
  min-width: max-content;
}
.skill-branch {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: skillBranchIn 0.6s ease-out var(--branch-delay, 0s) both;
}
@keyframes skillBranchIn {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.skill-branch-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, var(--node-color, var(--neon-cyan)), transparent);
  margin-bottom: 8px;
}
.skill-branch-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.skill-branch-node::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: var(--node-color, var(--neon-cyan));
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}
.skill-branch-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(var(--node-color, 0, 240, 255), 0.3);
}
.skill-branch-node:hover::before {
  opacity: 0.1;
}
.skill-node-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px var(--node-color, var(--neon-cyan)));
}
.skill-node-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
}
.skill-subnodes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-left: 24px;
}
.skill-subnode {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: skillSubnodeIn 0.5s ease-out var(--sub-delay, 0s) both;
}
@keyframes skillSubnodeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
.skill-subnode-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--sub-color, var(--neon-cyan));
  box-shadow: 0 0 8px var(--sub-color, var(--neon-cyan));
  flex-shrink: 0;
  animation: skillDotPulse 2s ease-in-out infinite;
}
@keyframes skillDotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}
.skill-subnode-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}
.skill-subnode-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.skill-subnode-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.skill-subnode-fill {
  height: 100%;
  width: var(--fill-width, 0%);
  background: linear-gradient(90deg, var(--fill-color, var(--neon-cyan)), color-mix(in srgb, var(--fill-color, var(--neon-cyan)) 70%, white));
  border-radius: 3px;
  box-shadow: 0 0 8px var(--fill-color, var(--neon-cyan));
  animation: skillFillIn 1s ease-out var(--sub-delay, 0s) both;
}
@keyframes skillFillIn {
  from { width: 0; }
  to { width: var(--fill-width, 0%); }
}

/* Timeline */
.timeline-container {
  position: relative;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, var(--neon-cyan) 10%, var(--neon-purple) 50%, var(--neon-pink) 90%, transparent);
  transform: translateX(-50%);
}
.timeline-item {
  position: relative;
  display: flex;
  justify-content: flex-start;
  padding-left: calc(50% + 30px);
  animation: timelineItemIn 0.6s ease-out var(--item-delay, 0s) both;
}
@keyframes timelineItemIn {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
.timeline-item.timeline-item-right {
  justify-content: flex-end;
  padding-left: 0;
  padding-right: calc(50% + 30px);
  animation-name: timelineItemInRight;
}
@keyframes timelineItemInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
.timeline-dot {
  position: absolute;
  left: 50%;
  top: 20px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--dot-color, var(--neon-cyan));
  box-shadow: 0 0 16px var(--dot-color, var(--neon-cyan)), 0 0 32px var(--dot-color, var(--neon-cyan));
  transform: translateX(-50%);
  z-index: 2;
  animation: timelineDotGlow 2s ease-in-out infinite;
}
@keyframes timelineDotGlow {
  0%, 100% { box-shadow: 0 0 16px var(--dot-color), 0 0 32px var(--dot-color); }
  50% { box-shadow: 0 0 24px var(--dot-color), 0 0 48px var(--dot-color); }
}
.timeline-card {
  padding: 20px 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  max-width: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.timeline-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}
.timeline-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.timeline-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}
.timeline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pixel-tag-sm {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  padding: 4px 8px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  color: var(--neon-cyan);
}

/* Contact Form */
.contact-form-container {
  padding: 32px;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--neon-cyan);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.form-input,
.form-textarea {
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
}
.form-input:focus,
.form-textarea:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.2);
}
.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-dim);
}
.form-textarea {
  resize: vertical;
  min-height: 120px;
}
.form-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.pixel-btn-submit {
  padding: 14px 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--bg-primary);
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
}
.pixel-btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(0, 240, 255, 0.4);
}
.pixel-btn-submit:active:not(:disabled) {
  transform: translateY(0);
}
.pixel-btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-submitting {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
}
.submitting-text {
  animation: submitPulse 1s ease-in-out infinite;
}
@keyframes submitPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.form-status {
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 8px;
}
.status-success {
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
}
.status-error {
  color: var(--neon-pink);
  background: rgba(244, 114, 182, 0.1);
  border: 1px solid rgba(244, 114, 182, 0.3);
}
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.contact-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.contact-info-icon {
  font-size: 1rem;
  color: var(--neon-cyan);
}
.contact-info-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .about-hero-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px;
  }
  .about-info { text-align: center; }
  .about-stats { justify-content: center; }
  .about-links { justify-content: center; }
  .skills-grid { grid-template-columns: 1fr; }
  .skill-tree {
    flex-direction: column;
    gap: 30px;
    align-items: flex-start;
  }
  .skill-branch {
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
  }
  .skill-branch-line {
    width: 40px;
    height: 2px;
    margin-bottom: 0;
    margin-right: 8px;
    background: linear-gradient(to right, transparent, var(--node-color, var(--neon-cyan)));
  }
  .skill-subnodes {
    flex-direction: column;
    margin-top: 0;
    padding-left: 16px;
  }
  .timeline-container {
    padding: 20px 10px;
  }
  .timeline-line {
    left: 20px;
  }
  .timeline-item,
  .timeline-item.timeline-item-right {
    padding-left: 50px;
    padding-right: 0;
    justify-content: flex-start;
  }
  .timeline-dot {
    left: 20px;
  }
  .timeline-card {
    max-width: 100%;
  }
  .contact-form-container {
    grid-template-columns: 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
