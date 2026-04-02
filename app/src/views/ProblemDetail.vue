<template>
  <div class="problem-detail-page" style="padding-top: 64px">
    <div class="container">
      <!-- Back Button -->
      <div class="problem-back">
        <button class="pixel-btn" @click="goBack">
          <span class="btn-icon">&#11013;</span>
          {{ isZh ? '返回刷题' : 'Back to Practice' }}
        </button>
      </div>

      <!-- Problem Header -->
      <div v-if="problem" class="problem-header pixel-card">
        <div class="problem-title-row">
          <span class="problem-number">#{{ problem.num }}</span>
          <h1 class="problem-title">{{ problem.title }}</h1>
          <button
            class="favorite-btn"
            :class="{ active: isFavorited }"
            @click="toggleFavorite"
            :title="isZh ? '收藏题目' : 'Favorite'"
          >
            {{ isFavorited ? '&#9733;' : '&#9734;' }}
          </button>
        </div>

        <div class="problem-meta">
          <span class="difficulty-badge" :class="difficultyClass">
            {{ problem.rating }}
          </span>
          <span v-if="problem.isMember" class="member-badge">
            {{ isZh ? '会员' : 'Member' }}
          </span>
          <span v-if="isSolved" class="solved-badge">
            {{ isZh ? '已解决' : 'Solved' }}
          </span>
        </div>

        <div class="problem-actions">
          <a
            :href="leetcodeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="pixel-btn primary"
          >
            <span class="btn-icon">&#128279;</span>
            {{ isZh ? '在 LeetCode 打开' : 'Open on LeetCode' }}
          </a>
        </div>
      </div>

      <!-- Problem Not Found -->
      <div v-else class="problem-not-found pixel-card">
        <p>{{ isZh ? '题目不存在' : 'Problem not found' }}</p>
        <button class="pixel-btn" @click="goBack">
          {{ isZh ? '返回刷题' : 'Back to Practice' }}
        </button>
      </div>

      <!-- Quick Notes Section -->
      <div v-if="problem" class="problem-section pixel-card">
        <h2 class="section-title">
          <span class="section-icon">&#128221;</span>
          {{ isZh ? '快速笔记' : 'Quick Notes' }}
        </h2>
        <textarea
          v-model="noteContent"
          class="note-textarea"
          :placeholder="isZh ? '记录你的解题思路、注意事项...' : 'Record your solving thoughts, notes...'"
          @blur="saveNote"
          rows="5"
        ></textarea>
        <div v-if="noteInfo" class="note-meta">
          {{ isZh ? '最后保存:' : 'Last saved:' }} {{ formatDate(noteInfo.updatedAt) }}
        </div>
      </div>

      <!-- Solution Sharing Section -->
      <div v-if="problem" class="problem-section pixel-card">
        <h2 class="section-title">
          <span class="section-icon">&#128172;</span>
          {{ isZh ? '解题心得' : 'Solution Sharing' }}
        </h2>
        <div v-if="!showSolutionForm">
          <div v-if="solutionInfo" class="solution-display">
            <div class="solution-meta">
              <span class="solution-author">
                {{ isZh ? '作者:' : 'Author:' }} {{ solutionInfo.author }}
              </span>
              <span class="solution-date">
                {{ formatDate(solutionInfo.updatedAt) }}
              </span>
            </div>
            <div class="solution-content" v-html="renderedSolution"></div>
            <div class="solution-actions">
              <button class="pixel-btn" @click="editSolution">
                {{ isZh ? '编辑' : 'Edit' }}
              </button>
              <button class="pixel-btn danger" @click="deleteSolutionConfirm">
                {{ isZh ? '删除' : 'Delete' }}
              </button>
            </div>
          </div>
          <button v-else class="pixel-btn" @click="showSolutionForm = true">
            <span class="btn-icon">&#10010;</span>
            {{ isZh ? '分享解题心得' : 'Share Your Solution' }}
          </button>
        </div>

        <div v-else class="solution-form">
          <div class="form-group">
            <label>{{ isZh ? '作者名称' : 'Author Name' }}</label>
            <input
              v-model="solutionAuthor"
              type="text"
              class="pixel-input"
              :placeholder="isZh ? '输入你的名称' : 'Enter your name'"
            />
          </div>
          <div class="form-group">
            <label>{{ isZh ? '解题思路 (支持 Markdown)' : 'Solution (Markdown supported)' }}</label>
            <textarea
              v-model="solutionContent"
              class="note-textarea"
              :placeholder="isZh ? '描述你的解题思路...' : 'Describe your solution...'"
              rows="8"
            ></textarea>
          </div>
          <div class="form-actions">
            <button class="pixel-btn" @click="cancelSolution">
              {{ isZh ? '取消' : 'Cancel' }}
            </button>
            <button class="pixel-btn primary" @click="submitSolution">
              {{ isZh ? '发布' : 'Publish' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Related Problems (placeholder for future enhancement) -->
      <div v-if="problem" class="problem-section pixel-card">
        <h2 class="section-title">
          <span class="section-icon">&#128193;</span>
          {{ isZh ? '章节信息' : 'Chapter Info' }}
        </h2>
        <div class="chapter-info">
          <p><strong>{{ isZh ? '章节:' : 'Chapter:' }}</strong> {{ chapterTitle }}</p>
          <p><strong>{{ isZh ? '难度分布:' : 'Difficulty:' }}</strong> {{ problem.rating }}</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content pixel-card">
          <h3>{{ isZh ? '确认删除' : 'Confirm Delete' }}</h3>
          <p>{{ isZh ? '确定要删除这条解题心得吗？' : 'Are you sure you want to delete this solution?' }}</p>
          <div class="modal-actions">
            <button class="pixel-btn" @click="showDeleteModal = false">
              {{ isZh ? '取消' : 'Cancel' }}
            </button>
            <button class="pixel-btn danger" @click="confirmDeleteSolution">
              {{ isZh ? '确认删除' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProblemDetail } from '../composables/useProblemDetail.js'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'
import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked for code highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return code
  }
})

const route = useRoute()
const router = useRouter()
const { isZh, t } = useLang()
const { isFavorite, toggleFavorite: toggleFav, getNote, saveNote: saveNoteToStorage, getNoteInfo,
        getSolution, getSolutionInfo, saveSolution: saveSolutionToStorage, deleteSolution: deleteSolutionFromStorage } = useProblemDetail()

// Route params
const chapterId = computed(() => route.params.chapterId)
const probId = computed(() => route.params.probId)

// Problem data
const problem = ref(null)
const chapterTitle = ref('')

// Favorite state
const isFavorited = computed(() => isFavorite(chapterId.value, probId.value))

function toggleFavorite() {
  toggleFav(chapterId.value, probId.value)
}

// Note state
const noteContent = ref('')
const noteInfo = computed(() => getNoteInfo(chapterId.value, probId.value))

function saveNote() {
  if (noteContent.value.trim()) {
    saveNoteToStorage(chapterId.value, probId.value, noteContent.value.trim())
  }
}

// Solution state
const showSolutionForm = ref(false)
const solutionContent = ref('')
const solutionAuthor = ref('')
const solutionInfo = computed(() => getSolutionInfo(chapterId.value, probId.value))
const renderedSolution = computed(() => {
  if (solutionInfo.value?.content) {
    return marked(solutionInfo.value.content)
  }
  return ''
})

function editSolution() {
  solutionContent.value = solutionInfo.value?.content || ''
  solutionAuthor.value = solutionInfo.value?.author || ''
  showSolutionForm.value = true
}

function cancelSolution() {
  showSolutionForm.value = false
  solutionContent.value = ''
  solutionAuthor.value = ''
}

function submitSolution() {
  if (solutionContent.value.trim()) {
    const author = solutionAuthor.value.trim() || (isZh.value ? '匿名用户' : 'Anonymous')
    saveSolutionToStorage(chapterId.value, probId.value, solutionContent.value.trim(), author)
    showSolutionForm.value = false
  }
}

// Delete solution
const showDeleteModal = ref(false)

function deleteSolutionConfirm() {
  showDeleteModal.value = true
}

function confirmDeleteSolution() {
  deleteSolutionFromStorage(chapterId.value, probId.value)
  showDeleteModal.value = false
}

// Load problem data
async function loadProblem() {
  // Find chapter
  const chapter = CHAPTERS.find(c => c.id === chapterId.value)
  if (chapter) {
    chapterTitle.value = chapter.title

    try {
      // Use fetch to load chapter markdown
      const response = await fetch(chapter.file)
      if (!response.ok) throw new Error('Failed to load')
      const content = await response.text()
      const lines = content.split('\n')

      // Parse problems from markdown
      for (const line of lines) {
        // Match table row pattern: | 1 | 两数之和 | ...
        const match = line.match(/^\|\s*(\d+)\s*\|\s*([^\|]+?)\s*\|/)
        if (match) {
          const num = match[1]
          const title = match[2].trim()

          // Check if this is our problem by matching the probId
          // The probId in URL is typically the problem number or slug
          if (num === probId.value || title.toLowerCase().replace(/\s+/g, '-') === probId.value) {
            // Parse full row for URL and difficulty
            const cells = line.split('|').map(c => c.trim())
            problem.value = {
              num: num,
              title: title,
              url: cells[2] || '',
              rating: cells[3] || '',
              isMember: cells[4]?.includes('会员') || false
            }
            break
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load chapter:', err)
    }
  }
}

// Check if problem is solved (from progress)
const isSolved = computed(() => {
  try {
    const progress = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
    const chapterProgress = progress[chapterId.value]
    return chapterProgress?.[probId.value]?.checked === true
  } catch {
    return false
  }
})

// LeetCode URL
const leetcodeUrl = computed(() => {
  if (problem.value?.url) {
    return problem.value.url
  }
  // Fallback URL
  return `https://leetcode.cn/problems/${probId.value}/`
})

// Difficulty CSS class
const difficultyClass = computed(() => {
  const rating = problem.value?.rating?.toLowerCase() || ''
  if (rating.includes('简单') || rating.includes('easy')) return 'easy'
  if (rating.includes('中等') || rating.includes('medium')) return 'medium'
  if (rating.includes('困难') || rating.includes('hard')) return 'hard'
  return ''
})

// Go back
function goBack() {
  router.push('/practice')
}

// Format date
function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString(isZh.value ? 'zh-CN' : 'en-US')
}

// Watch for route changes
watch([chapterId, probId], () => {
  loadProblem()
  noteContent.value = getNote(chapterId.value, probId.value)
  showSolutionForm.value = false
}, { immediate: false })

// Initial load
onMounted(() => {
  loadProblem()
  noteContent.value = getNote(chapterId.value, probId.value)
})
</script>

<style scoped>
.problem-detail-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.problem-back {
  padding: 20px 0;
}

.problem-header,
.problem-section,
.problem-not-found {
  margin-bottom: 20px;
}

.problem-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.problem-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.problem-title {
  flex: 1;
  font-size: 1.5rem;
  margin: 0;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
  padding: 8px;
}

.favorite-btn:hover,
.favorite-btn.active {
  color: #ffd700;
}

.problem-meta {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.difficulty-badge.easy {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.difficulty-badge.medium {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
  border: 1px solid #f1c40f;
}

.difficulty-badge.hard {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.member-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
  border: 1px solid #9b59b6;
}

.solved-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.problem-actions {
  margin-top: 16px;
}

.btn-icon {
  margin-right: 6px;
}

.pixel-btn.primary {
  background: var(--primary);
  color: var(--bg-primary);
}

.pixel-btn.danger {
  background: #e74c3c;
  color: white;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.section-icon {
  font-size: 1.2rem;
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.note-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.note-meta {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: right;
}

.solution-display {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
}

.solution-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.solution-content {
  line-height: 1.7;
}

.solution-content :deep(pre) {
  background: var(--bg-primary);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 12px 0;
}

.solution-content :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
}

.solution-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.pixel-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.pixel-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.chapter-info {
  line-height: 1.8;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  max-width: 400px;
  width: 90%;
  padding: 24px;
  position: relative;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.modal-content p {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.problem-not-found {
  text-align: center;
  padding: 40px;
}

.problem-not-found p {
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: var(--text-muted);
}
</style>
