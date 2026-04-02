<template>
  <div class="review-reminder">
    <!-- In-App Notification Toast -->
    <Transition name="slide-fade">
      <div v-if="showNotification" class="notification-toast">
        <span class="notification-icon">&#128227;</span>
        <span class="notification-text">{{ notificationMessage }}</span>
      </div>
    </Transition>

    <!-- Review Stats Bar -->
    <div class="review-stats">
      <div class="stat-item due" @click="activeTab = 'due'">
        <span class="stat-value">{{ dueReviewCount }}</span>
        <span class="stat-label">待复习</span>
      </div>
      <div class="stat-item upcoming" @click="activeTab = 'upcoming'">
        <span class="stat-value">{{ upcomingReviews.length }}</span>
        <span class="stat-label">即将复习</span>
      </div>
      <div class="stat-item total" @click="activeTab = 'all'">
        <span class="stat-value">{{ reviewStats.totalTracked }}</span>
        <span class="stat-label">追踪中</span>
      </div>
      <div class="stat-item ease">
        <span class="stat-value">{{ reviewStats.averageEaseFactor }}</span>
        <span class="stat-label">平均难度</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="review-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'due' }"
        @click="activeTab = 'due'"
      >
        复习 ({{ dueReviews.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        计划 ({{ upcomingReviews.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </button>
    </div>

    <!-- Review List -->
    <div class="review-list">
      <!-- Due Reviews Tab -->
      <div v-if="activeTab === 'due'" class="review-section">
        <div v-if="dueReviews.length === 0" class="empty-state">
          <span class="empty-icon">&#127881;</span>
          <p>太棒了！没有待复习的题目</p>
          <p class="empty-hint">继续保持刷题节奏，新题目会自动加入复习计划</p>
        </div>
        <div
          v-for="review in dueReviews"
          :key="`${review.chapterId}-${review.problemId}`"
          class="review-card due"
          :class="{ overdue: isOverdue(review) }"
        >
          <div class="review-header">
            <span class="problem-id">#{{ review.problemId }}</span>
            <span class="mastery-badge" :class="`mastery-${getMasteryLevel(review.chapterId, review.problemId)}`">
              {{ getMasteryLabel(getMasteryLevel(review.chapterId, review.problemId)) }}
            </span>
          </div>

          <div class="review-meta">
            <span class="chapter-tag">{{ getChapterShort(review.chapterId) }}</span>
            <span class="overdue-days" v-if="isOverdue(review)">
              超期 {{ getOverdueDays(review) }} 天
            </span>
            <span class="due-today" v-else>今日待复习</span>
          </div>

          <div class="review-interval">
            <span class="interval-label">下次复习:</span>
            <span class="interval-value">{{ review.interval }} 天</span>
          </div>

          <!-- Rating Buttons -->
          <div class="rating-buttons">
            <p class="rating-prompt">这次做得怎么样？</p>
            <div class="rating-options">
              <button
                class="rating-btn failed"
                @click="handleReview(review.chapterId, review.problemId, 0)"
                title="完全忘记"
              >
                <span class="rating-emoji">&#128555;</span>
                <span class="rating-text">忘记</span>
              </button>
              <button
                class="rating-btn hard"
                @click="handleReview(review.chapterId, review.problemId, 3)"
                title="有困难但做出来了"
              >
                <span class="rating-emoji">&#128533;</span>
                <span class="rating-text">困难</span>
              </button>
              <button
                class="rating-btn medium"
                @click="handleReview(review.chapterId, review.problemId, 4)"
                title="正常做出"
              >
                <span class="rating-emoji">&#128578;</span>
                <span class="rating-text">正常</span>
              </button>
              <button
                class="rating-btn easy"
                @click="handleReview(review.chapterId, review.problemId, 5)"
                title="很快且轻松做出"
              >
                <span class="rating-emoji">&#128513;</span>
                <span class="rating-text">简单</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Reviews Tab -->
      <div v-if="activeTab === 'upcoming'" class="review-section">
        <div v-if="upcomingReviews.length === 0" class="empty-state">
          <span class="empty-icon">&#128196;</span>
          <p>暂无即将复习的题目</p>
          <p class="empty-hint">完成更多题目来建立复习计划</p>
        </div>
        <div
          v-for="review in upcomingReviews"
          :key="`${review.chapterId}-${review.problemId}`"
          class="review-card upcoming"
        >
          <div class="review-header">
            <span class="problem-id">#{{ review.problemId }}</span>
            <span class="mastery-badge" :class="`mastery-${getMasteryLevel(review.chapterId, review.problemId)}`">
              {{ getMasteryLabel(getMasteryLevel(review.chapterId, review.problemId)) }}
            </span>
          </div>

          <div class="review-meta">
            <span class="chapter-tag">{{ getChapterShort(review.chapterId) }}</span>
            <span class="due-date">{{ formatDueDate(review.nextReviewDate) }}</span>
          </div>

          <div class="review-interval">
            <span class="interval-label">间隔:</span>
            <span class="interval-value">{{ review.interval }} 天</span>
          </div>
        </div>
      </div>

      <!-- All Reviews Tab -->
      <div v-if="activeTab === 'all'" class="review-section">
        <div v-if="allReviews.length === 0" class="empty-state">
          <span class="empty-icon">&#128218;</span>
          <p>还没有追踪的题目</p>
          <p class="empty-hint">在刷题时点击"加入复习"来追踪题目</p>
        </div>
        <div
          v-for="review in allReviews"
          :key="`${review.chapterId}-${review.problemId}`"
          class="review-card"
          :class="{
            due: isDueForReview(review.chapterId, review.problemId),
            upcoming: !isDueForReview(review.chapterId, review.problemId)
          }"
        >
          <div class="review-header">
            <span class="problem-id">#{{ review.problemId }}</span>
            <span class="mastery-badge" :class="`mastery-${getMasteryLevel(review.chapterId, review.problemId)}`">
              {{ getMasteryLabel(getMasteryLevel(review.chapterId, review.problemId)) }}
            </span>
          </div>

          <div class="review-meta">
            <span class="chapter-tag">{{ getChapterShort(review.chapterId) }}</span>
            <span v-if="isDueForReview(review.chapterId, review.problemId)" class="due-status due">
              待复习
            </span>
            <span v-else class="due-status scheduled">
              {{ formatDueDate(review.nextReviewDate) }}
            </span>
          </div>

          <div class="review-stats-row">
            <div class="mini-stat">
              <span class="mini-label">掌握度</span>
              <div class="mastery-bar">
                <div
                  class="mastery-fill"
                  :style="{ width: (getMasteryLevel(review.chapterId, review.problemId) / 5 * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="mini-stat">
              <span class="mini-label">下次</span>
              <span class="mini-value">{{ review.interval }}天</span>
            </div>
          </div>

          <button
            class="remove-btn"
            @click="handleRemove(review.chapterId, review.problemId)"
          >
            移除追踪
          </button>
        </div>
      </div>
    </div>

    <!-- SM-2 Algorithm Info -->
    <div class="algorithm-info">
      <h4>SM-2 间隔重复算法</h4>
      <p>基于 SuperMemo SM-2 算法，智能安排复习时间：</p>
      <ul>
        <li><strong>忘记 (0-2分):</strong> 重置为1天后复习</li>
        <li><strong>困难 (3分):</strong> 缩短间隔，增加难度系数</li>
        <li><strong>正常 (4分):</strong> 正常推进复习间隔</li>
        <li><strong>简单 (5分):</strong> 延长间隔，降低难度系数</li>
      </ul>
      <p class="algorithm-note">间隔 = 上次间隔 × 难度系数</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReviewReminder } from '../composables/useReviewReminder.js'
import { CHAPTERS } from '../composables/data.js'

const {
  showNotification,
  notificationMessage,
  dueReviewCount,
  getDueReviews,
  getUpcomingReviews,
  isDueForReview,
  markReviewed,
  removeFromReview,
  getReviewStats,
  getMasteryLevel,
  getMasteryLabel
} = useReviewReminder()

const activeTab = ref('due')

// Get chapter short title
function getChapterShort(chapterId) {
  const chapter = CHAPTERS.find(ch => ch.id === chapterId)
  return chapter?.short || chapterId
}

// Get all reviews for "all" tab
const allReviews = computed(() => {
  const all = []
  for (const [chapterId, problems] of Object.entries(useReviewReminder().reviews.value)) {
    for (const [problemId, review] of Object.entries(problems)) {
      all.push({
        chapterId,
        problemId,
        ...review
      })
    }
  }
  // Sort by next review date
  all.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
  return all
})

const dueReviews = computed(() => getDueReviews())
const upcomingReviews = computed(() => getUpcomingReviews())
const reviewStats = computed(() => getReviewStats())

// Check if review is overdue
function isOverdue(review) {
  const now = new Date()
  const reviewDate = new Date(review.nextReviewDate)
  return now > reviewDate
}

// Get overdue days
function getOverdueDays(review) {
  const now = new Date()
  const reviewDate = new Date(review.nextReviewDate)
  const diffTime = now - reviewDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Format due date
function formatDueDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays < 7) return `${diffDays}天后`
  if (diffDays < 30) return `${Math.round(diffDays / 7)}周后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// Handle review completion
function handleReview(chapterId, problemId, quality) {
  markReviewed(chapterId, problemId, quality)
}

// Handle remove from tracking
function handleRemove(chapterId, problemId) {
  if (confirm('确定要从复习计划中移除这道题吗？')) {
    removeFromReview(chapterId, problemId)
  }
}
</script>

<style scoped>
.review-reminder {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, var(--neon-primary), var(--neon-secondary));
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 243, 255, 0.3);
  z-index: 1000;
  font-family: 'Ubuntu Mono', monospace;
}
.notification-icon {
  font-size: 1.2em;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

/* Review Stats Bar */
.review-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-item {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.stat-item.due {
  border-color: var(--neon-red);
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.1), transparent);
}
.stat-item.due .stat-value {
  color: var(--neon-red);
}
.stat-item.upcoming {
  border-color: var(--neon-yellow);
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.1), transparent);
}
.stat-item.upcoming .stat-value {
  color: var(--neon-yellow);
}
.stat-item.total {
  border-color: var(--neon-primary);
  background: linear-gradient(135deg, rgba(0, 243, 255, 0.1), transparent);
}
.stat-item.total .stat-value {
  color: var(--neon-primary);
}
.stat-value {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  font-family: 'Ubuntu Mono', monospace;
}
.stat-label {
  font-size: 0.75em;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tabs */
.review-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}
.tab-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.85em;
}
.tab-btn:hover {
  border-color: var(--neon-primary);
  color: var(--neon-primary);
}
.tab-btn.active {
  background: var(--neon-primary);
  border-color: var(--neon-primary);
  color: #000;
  font-weight: bold;
}

/* Review List */
.review-list {
  min-height: 200px;
}
.review-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim);
}
.empty-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 16px;
}
.empty-state p {
  margin: 8px 0;
  font-size: 1.1em;
}
.empty-hint {
  font-size: 0.85em;
  opacity: 0.7;
}

/* Review Card */
.review-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}
.review-card:hover {
  transform: translateX(4px);
  box-shadow: -4px 0 0 var(--neon-primary);
}
.review-card.due {
  border-left: 4px solid var(--neon-red);
}
.review-card.overdue {
  border-left-color: var(--mc-red);
  background: linear-gradient(90deg, rgba(255, 82, 82, 0.05), transparent);
}
.review-card.upcoming {
  border-left: 4px solid var(--neon-yellow);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.problem-id {
  font-family: 'Ubuntu Mono', monospace;
  font-weight: bold;
  color: var(--neon-primary);
  font-size: 1.1em;
}

.mastery-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: bold;
}
.mastery-0 { background: var(--bg-secondary); color: var(--text-dim); }
.mastery-1 { background: rgba(255, 82, 82, 0.2); color: var(--neon-red); }
.mastery-2 { background: rgba(255, 140, 0, 0.2); color: #ff8c00; }
.mastery-3 { background: rgba(255, 230, 0, 0.2); color: var(--neon-yellow); }
.mastery-4 { background: rgba(30, 200, 100, 0.2); color: #1ec864; }
.mastery-5 { background: rgba(0, 243, 255, 0.2); color: var(--neon-primary); }

.review-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85em;
}
.chapter-tag {
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-dim);
}
.overdue-days {
  color: var(--mc-red);
  font-weight: bold;
}
.due-today {
  color: var(--neon-red);
}
.due-date {
  color: var(--neon-yellow);
}

.review-interval {
  display: flex;
  gap: 8px;
  font-size: 0.85em;
  margin-bottom: 12px;
}
.interval-label {
  color: var(--text-dim);
}
.interval-value {
  color: var(--neon-primary);
  font-family: 'Ubuntu Mono', monospace;
  font-weight: bold;
}

/* Rating Buttons */
.rating-buttons {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  margin-top: 8px;
}
.rating-prompt {
  font-size: 0.85em;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.rating-options {
  display: flex;
  gap: 8px;
}
.rating-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu Mono', monospace;
}
.rating-btn:hover {
  transform: translateY(-2px);
}
.rating-emoji {
  font-size: 1.4em;
  display: block;
}
.rating-text {
  font-size: 0.7em;
  margin-top: 4px;
  color: var(--text-dim);
}
.rating-btn.failed {
  border-color: var(--mc-red);
}
.rating-btn.failed:hover {
  background: rgba(255, 82, 82, 0.2);
}
.rating-btn.hard {
  border-color: #ff8c00;
}
.rating-btn.hard:hover {
  background: rgba(255, 140, 0, 0.2);
}
.rating-btn.medium {
  border-color: var(--neon-yellow);
}
.rating-btn.medium:hover {
  background: rgba(255, 230, 0, 0.2);
}
.rating-btn.easy {
  border-color: #1ec864;
}
.rating-btn.easy:hover {
  background: rgba(30, 200, 100, 0.2);
}

/* Review Stats Row (All tab) */
.review-stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}
.mini-stat {
  flex: 1;
}
.mini-label {
  font-size: 0.7em;
  color: var(--text-dim);
  display: block;
  margin-bottom: 4px;
}
.mini-value {
  font-family: 'Ubuntu Mono', monospace;
  color: var(--neon-primary);
}
.mastery-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}
.mastery-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-primary), var(--neon-secondary));
  transition: width 0.3s ease;
}

.remove-btn {
  width: 100%;
  padding: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.8em;
  font-family: 'Ubuntu Mono', monospace;
  transition: all 0.2s ease;
}
.remove-btn:hover {
  border-color: var(--mc-red);
  color: var(--mc-red);
}

/* Algorithm Info */
.algorithm-info {
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.85em;
}
.algorithm-info h4 {
  margin: 0 0 8px 0;
  color: var(--neon-primary);
  font-family: 'Ubuntu Mono', monospace;
}
.algorithm-info ul {
  margin: 8px 0;
  padding-left: 20px;
}
.algorithm-info li {
  margin: 4px 0;
  color: var(--text-dim);
}
.algorithm-note {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  color: var(--text-dim);
  font-style: italic;
}

/* Due Status */
.due-status {
  font-size: 0.85em;
  font-family: 'Ubuntu Mono', monospace;
}
.due-status.due {
  color: var(--neon-red);
}
.due-status.scheduled {
  color: var(--neon-yellow);
}

/* Responsive */
@media (max-width: 600px) {
  .review-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .rating-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>