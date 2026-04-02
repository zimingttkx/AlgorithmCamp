<template>
  <div class="recommendation-page">
    <div class="recommendation-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title font-display">
            <span class="hero-icon">🧠</span>
            智能推荐系统
          </h1>
          <p class="hero-subtitle">基于章节、难度和遗忘曲线的三位一体推荐算法</p>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Algorithm Cards -->
      <div class="algorithms-grid">
        <div
          v-for="(algo, key) in algorithms"
          :key="key"
          class="algo-card glass-card"
          :class="{ expanded: expandedAlgo === key }"
        >
          <div class="algo-header" @click="toggleAlgo(key)">
            <div class="algo-icon">{{ algo.icon }}</div>
            <div class="algo-title-group">
              <h2 class="algo-title">{{ algo.title }}</h2>
              <span class="algo-tag">{{ algo.tag }}</span>
            </div>
            <svg class="algo-arrow" :class="{ open: expandedAlgo === key }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div class="algo-content" :class="{ show: expandedAlgo === key }">
            <p class="algo-description">{{ algo.description }}</p>

            <div class="algo-factors">
              <h3 class="factors-title">推荐因素</h3>
              <ul class="factors-list">
                <li v-for="factor in algo.factors" :key="factor" class="factor-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ factor }}
                </li>
              </ul>
            </div>

            <div v-if="algo.formula" class="algo-formula">
              <h3 class="formula-title">计算公式</h3>
              <code class="formula-code">{{ algo.formula }}</code>
            </div>

            <div v-if="algo.example" class="algo-example">
              <h3 class="example-title">示例</h3>
              <div class="example-content">
                <div v-for="ex in algo.example" :key="ex.label" class="example-item">
                  <span class="ex-label">{{ ex.label }}:</span>
                  <span class="ex-value" :style="ex.style">{{ ex.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="how-it-works glass-card">
        <h2 class="section-title font-display">
          <span class="section-icon">⚙️</span>
          推荐流程
        </h2>
        <div class="flow-steps">
          <div class="flow-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>数据收集</h3>
              <p>记录你的解题历史、难度评分和练习时间</p>
            </div>
          </div>
          <div class="flow-connector"></div>
          <div class="flow-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>水平评估</h3>
              <p>根据已解题目的 Rating 计算你的当前技能水平</p>
            </div>
          </div>
          <div class="flow-connector"></div>
          <div class="flow-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>三重推荐</h3>
              <p>结合章节进度、难度匹配和遗忘曲线进行综合排序</p>
            </div>
          </div>
          <div class="flow-connector"></div>
          <div class="flow-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>个性推荐</h3>
              <p>为你生成每日刷题建议列表</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SM-2 Detail -->
      <div class="sm2-detail glass-card">
        <h2 class="section-title font-display">
          <span class="section-icon">📊</span>
          SM-2 间隔重复算法详解
        </h2>
        <div class="sm2-content">
          <p class="sm2-intro">
            SM-2 是由 Piotr Wozniak 于 1987 年开发的间隔重复算法，是目前最有效的记忆巩固方法之一。
            算法的核心思想是：每次正确回忆后，复习间隔会乘以一个「难度系数」；如果忘记，间隔会重置为 1 天。
          </p>

          <div class="sm2-table">
            <h3 class="table-title">难度等级 (Quality)</h3>
            <table class="quality-table">
              <thead>
                <tr>
                  <th>等级</th>
                  <th>描述</th>
                  <th>效果</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="quality-badge fail">0-2</span></td>
                  <td>完全忘记 / 答错</td>
                  <td>间隔重置为 1 天</td>
                </tr>
                <tr>
                  <td><span class="quality-badge pass">3</span></td>
                  <td>有困难但答对</td>
                  <td>间隔 × easeFactor</td>
                </tr>
                <tr>
                  <td><span class="quality-badge pass">4</span></td>
                  <td>顺利答对</td>
                  <td>间隔 × easeFactor × 1.2</td>
                </tr>
                <tr>
                  <td><span class="quality-badge pass">5</span></td>
                  <td>轻松答对</td>
                  <td>间隔 × easeFactor × 1.4</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sm2-formula-detail">
            <h3 class="table-title">核心公式</h3>
            <div class="formula-block">
              <div class="formula-line">
                <span class="formula-label">新间隔 =</span>
                <code class="formula-math">上次间隔 × easeFactor</code>
              </div>
              <div class="formula-line">
                <span class="formula-label">新难度 =</span>
                <code class="formula-math">原难度 + 0.1 - (5 - 质量) × (0.08 + (5 - 质量) × 0.02)</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="tips-section glass-card">
        <h2 class="section-title font-display">
          <span class="section-icon">💡</span>
          使用建议
        </h2>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-icon">📈</div>
            <h3>循序渐进</h3>
            <p>不要急于挑战高难度题目，按照推荐顺序刷题效果最佳</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🔄</div>
            <h3>及时复习</h3>
            <p>看到复习提醒时及时复习，间隔重复是记忆的关键</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">⚖️</div>
            <h3>平衡发展</h3>
            <p>不要只刷擅长的类型，推荐会帮助你补齐短板</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🎯</div>
            <h3>质量优先</h3>
            <p>与其快速刷题，不如每道题都理解透彻</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRecommendations } from '../composables/useRecommendations.js'

const { getRecommendationExplanation } = useRecommendations()

const expandedAlgo = ref(null)

const algorithms = computed(() => ({
  chapter: {
    ...getRecommendationExplanation().chapter,
    tag: '连续性学习',
    example: [
      { label: '章节完成度 30%', value: '推荐优先级 +65', style: { color: 'var(--neon-cyan)' } },
      { label: '章节完成度 70%', value: '推荐优先级 +85', style: { color: 'var(--neon-cyan)' } }
    ]
  },
  difficulty: {
    ...getRecommendationExplanation().difficulty,
    tag: '针对性挑战',
    example: [
      { label: '你的水平 ~1500', value: '推荐 Rating 1600-1800', style: { color: 'var(--neon-gold)' } },
      { label: '太简单 (<1400)', value: '优先级降低', style: { color: 'var(--text-dim)' } }
    ]
  },
  forgetting: {
    ...getRecommendationExplanation().forgetting,
    tag: '长期记忆',
    example: [
      { label: '刚做完的题', value: '优先级 +80', style: { color: 'var(--neon-pink)' } },
      { label: '逾期 3 天', value: '优先级 +95', style: { color: 'var(--neon-pink)' } }
    ]
  }
}))

function toggleAlgo(key) {
  expandedAlgo.value = expandedAlgo.value === key ? null : key
}
</script>

<style scoped>
.recommendation-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background: var(--bg-base);
}

.recommendation-hero {
  padding: 60px 0 40px;
  background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%);
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.hero-icon {
  font-size: 0.8em;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-dim);
}

/* Algorithm Cards */
.algorithms-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: -20px;
}

.algo-card {
  padding: 0;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.algo-card:hover {
  transform: translateY(-2px);
}

.algo-card.expanded {
  box-shadow: var(--glass-shadow), 0 0 30px rgba(0, 211, 238, 0.1);
}

.algo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
}

.algo-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border-radius: 12px;
}

.algo-title-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.algo-title {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
}

.algo-tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: var(--neon-primary);
  color: #000;
  border-radius: 20px;
  font-weight: 600;
}

.algo-arrow {
  color: var(--text-dim);
  transition: transform 0.3s;
}

.algo-arrow.open {
  transform: rotate(180deg);
}

.algo-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out;
}

.algo-content.show {
  max-height: 600px;
}

.algo-description {
  padding: 0 24px 20px;
  color: var(--text-secondary);
  line-height: 1.7;
  border-bottom: 1px solid var(--glass-border);
  margin: 0;
}

.algo-factors {
  padding: 20px 24px;
}

.factors-title {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.factors-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.factor-item svg {
  color: var(--neon-cyan);
  flex-shrink: 0;
}

.algo-formula {
  padding: 0 24px 20px;
  border-top: 1px solid var(--glass-border);
  margin-top: 0;
}

.formula-title,
.example-title,
.table-title {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.formula-code {
  display: block;
  background: var(--bg-base);
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--neon-gold);
  font-size: 0.95rem;
}

.algo-example {
  padding: 20px 24px;
  border-top: 1px solid var(--glass-border);
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.ex-label {
  color: var(--text-dim);
  min-width: 140px;
}

.ex-value {
  font-family: 'JetBrains Mono', monospace;
}

/* How It Works */
.how-it-works {
  margin-top: 32px;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 1.25rem;
}

.flow-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  flex-wrap: wrap;
}

.flow-step {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--neon-primary), var(--neon-cyan));
  color: #000;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.step-content p {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.5;
}

.flow-connector {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-cyan));
  margin-top: 20px;
  flex-shrink: 0;
}

/* SM-2 Detail */
.sm2-detail {
  margin-top: 24px;
}

.sm2-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sm2-intro {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.95rem;
}

.quality-table {
  width: 100%;
  border-collapse: collapse;
}

.quality-table th,
.quality-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
}

.quality-table th {
  color: var(--text-dim);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quality-table td {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.quality-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.quality-badge.fail {
  background: rgba(255, 100, 130, 0.2);
  color: var(--neon-pink);
}

.quality-badge.pass {
  background: rgba(52, 211, 153, 0.2);
  color: var(--neon-green);
}

.formula-block {
  background: var(--bg-base);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.formula-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.formula-label {
  color: var(--text-dim);
  min-width: 100px;
}

.formula-math {
  font-family: 'JetBrains Mono', monospace;
  color: var(--neon-gold);
}

/* Tips */
.tips-section {
  margin-top: 24px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.tip-card {
  background: var(--bg-base);
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.2s;
}

.tip-card:hover {
  transform: translateY(-2px);
}

.tip-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.tip-card h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.tip-card p {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .flow-connector {
    display: none;
  }

  .flow-step {
    min-width: 100%;
    flex-direction: row;
    text-align: left;
    gap: 16px;
  }

  .step-content {
    flex: 1;
  }
}
</style>