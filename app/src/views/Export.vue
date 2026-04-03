<template>
  <div class="export-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-title">
          <span class="title-icon">📦</span>
          {{ isZh ? '数据管理' : 'Data Management' }}
        </h1>
        <p class="page-subtitle">{{ isZh ? '导出、备份和恢复您的刷题数据' : 'Export, backup and restore your practice data' }}</p>
      </header>

      <!-- Data Summary -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          {{ isZh ? '数据概览' : 'Data Overview' }}
        </h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ dataSummary.solvedProblems || 0 }}</span>
            <span class="stat-label">{{ isZh ? '已解题数' : 'Solved' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ dataSummary.problemNotesCount || 0 }}</span>
            <span class="stat-label">{{ isZh ? '笔记数' : 'Notes' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ dataSummary.problemFavoritesCount || 0 }}</span>
            <span class="stat-label">{{ isZh ? '收藏数' : 'Favorites' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ dataSummary.totalKeys || 0 }}</span>
            <span class="stat-label">{{ isZh ? '数据条目' : 'Total Keys' }}</span>
          </div>
        </div>
      </div>

      <!-- Export Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">⬆️</span>
          {{ isZh ? '导出数据' : 'Export Data' }}
        </h2>
        <div class="export-options">
          <!-- JSON Export -->
          <div class="export-option" @click="exportProgressJSON">
            <div class="option-icon">📄</div>
            <div class="option-content">
              <span class="option-title">{{ isZh ? 'JSON 格式' : 'JSON Format' }}</span>
              <span class="option-desc">{{ isZh ? '导出刷题记录为 JSON 文件' : 'Export progress as JSON file' }}</span>
            </div>
            <button class="option-btn" :disabled="isExporting">
              <span v-if="isExporting">...</span>
              <span v-else>{{ isZh ? '导出' : 'Export' }}</span>
            </button>
          </div>

          <!-- CSV Export -->
          <div class="export-option" @click="exportProgressCSV">
            <div class="option-icon">📊</div>
            <div class="option-content">
              <span class="option-title">{{ isZh ? 'CSV 格式' : 'CSV Format' }}</span>
              <span class="option-desc">{{ isZh ? '导出为 CSV，可用 Excel 打开' : 'Export as CSV, open with Excel' }}</span>
            </div>
            <button class="option-btn" :disabled="isExporting">
              <span v-if="isExporting">...</span>
              <span v-else>{{ isZh ? '导出' : 'Export' }}</span>
            </button>
          </div>

          <!-- Full Backup -->
          <div class="export-option highlight" @click="exportBackupJSON">
            <div class="option-icon">💾</div>
            <div class="option-content">
              <span class="option-title">{{ isZh ? '完整备份' : 'Full Backup' }}</span>
              <span class="option-desc">{{ isZh ? '导出所有数据（进度、目标、笔记、设置）' : 'Export all data (progress, goals, notes, settings)' }}</span>
            </div>
            <button class="option-btn primary" :disabled="isExporting">
              <span v-if="isExporting">...</span>
              <span v-else>{{ isZh ? '创建备份' : 'Backup' }}</span>
            </button>
          </div>
        </div>
        <p v-if="exportMessage" class="message success">{{ exportMessage }}</p>
        <p v-if="lastExportDate" class="last-date">{{ isZh ? '上次导出' : 'Last export' }}: {{ formatDate(lastExportDate) }}</p>
      </div>

      <!-- Import Section -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">⬇️</span>
          {{ isZh ? '导入数据' : 'Import Data' }}
        </h2>
        <div class="export-options">
          <!-- Import Backup -->
          <div class="export-option">
            <div class="option-icon">📁</div>
            <div class="option-content">
              <span class="option-title">{{ isZh ? '从备份恢复' : 'Restore from Backup' }}</span>
              <span class="option-desc">{{ isZh ? '导入完整备份，会覆盖现有数据' : 'Import full backup, will overwrite existing data' }}</span>
            </div>
            <label class="option-btn">
              <input type="file" accept=".json" @change="handleBackupImport" hidden />
              <span v-if="isImporting">...</span>
              <span v-else>{{ isZh ? '选择文件' : 'Choose File' }}</span>
            </label>
          </div>

          <!-- Import Progress -->
          <div class="export-option">
            <div class="option-icon">📝</div>
            <div class="option-content">
              <span class="option-title">{{ isZh ? '导入解题记录' : 'Import Progress' }}</span>
              <span class="option-desc">{{ isZh ? '导入 JSON 格式的解题记录' : 'Import progress from JSON file' }}</span>
            </div>
            <label class="option-btn">
              <input type="file" accept=".json" @change="handleProgressImport" hidden />
              <span v-if="isImporting">...</span>
              <span v-else>{{ isZh ? '选择文件' : 'Choose File' }}</span>
            </label>
          </div>
        </div>
        <p v-if="importMessage" class="message" :class="{ success: !importError, error: importError }">{{ importMessage }}</p>
      </div>

      <!-- Danger Zone -->
      <div class="section-card danger">
        <h2 class="section-title danger">
          <span class="section-icon">⚠️</span>
          {{ isZh ? '危险操作' : 'Danger Zone' }}
        </h2>
        <div class="danger-content">
          <div class="danger-info">
            <span class="danger-title">{{ isZh ? '清除所有数据' : 'Clear All Data' }}</span>
            <span class="danger-desc">{{ isZh ? '永久删除所有刷题记录、笔记、目标和设置。此操作不可撤销！' : 'Permanently delete all practice records, notes, goals and settings. This cannot be undone!' }}</span>
          </div>
          <button class="danger-btn" @click="handleClearData">
            {{ isZh ? '清除数据' : 'Clear Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLang } from '../composables/i18n.js'
import { useDataExport } from '../composables/useDataExport.js'

const { isZh } = useLang()
const {
  isExporting,
  isImporting,
  lastExportDate,
  exportMessage,
  importMessage,
  dataSummary,
  exportProgressJSON,
  exportProgressCSV,
  exportBackupJSON,
  importBackupJSON,
  importProgressJSON,
  clearAllData
} = useDataExport()

const importError = ref(false)

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString()
}

async function handleBackupImport(event) {
  importError.value = false
  const file = event.target.files[0]
  if (!file) return
  try {
    await importBackupJSON(file)
  } catch (e) {
    importError.value = true
  }
  event.target.value = ''
}

async function handleProgressImport(event) {
  importError.value = false
  const file = event.target.files[0]
  if (!file) return
  try {
    await importProgressJSON(file)
  } catch (e) {
    importError.value = true
  }
  event.target.value = ''
}

function handleClearData() {
  const cleared = clearAllData()
  if (cleared) {
    setTimeout(() => window.location.reload(), 500)
  }
}
</script>

<style scoped>
.export-page {
  min-height: 100vh;
  padding: 80px 0 60px;
  background: var(--bg-dark);
  background-image: 
    radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
}

.container {
  max-width: 800px;
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
  margin: 0 0 12px;
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

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.section-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-card.danger {
  border-color: rgba(239, 68, 68, 0.3);
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

.section-title.danger {
  color: #ef4444;
}

.section-icon {
  font-size: 1.4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.stat-value {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--neon-cyan);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-option:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.2);
}

.export-option.highlight {
  border-color: rgba(251, 191, 36, 0.3);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.05), transparent);
}

.option-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.option-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.option-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  background: transparent;
  color: var(--neon-cyan);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.option-btn:hover:not(:disabled) {
  background: var(--neon-cyan);
  color: #0a0e1a;
}

.option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-btn.primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #fbbf24;
  color: #0a0e1a;
}

.option-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.last-date {
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.danger-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
}

.danger-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.danger-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ef4444;
}

.danger-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.danger-btn {
  padding: 10px 20px;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: transparent;
  color: #ef4444;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.danger-btn:hover {
  background: #ef4444;
  color: #fff;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .export-option {
    flex-direction: column;
    text-align: center;
  }
  
  .option-btn {
    width: 100%;
  }
  
  .danger-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
