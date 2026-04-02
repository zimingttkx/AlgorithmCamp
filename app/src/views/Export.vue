<template>
  <div class="export-page">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">&#128190;</span>
        数据导出
      </h1>
      <p class="page-desc">导出刷题记录、备份和恢复数据</p>
    </div>

    <!-- Data Summary -->
    <div class="summary-section">
      <h3 class="section-title">数据概览</h3>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-value">{{ dataSummary.solvedProblems || 0 }}</span>
          <span class="summary-label">已解题数</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ dataSummary.problemNotesCount || 0 }}</span>
          <span class="summary-label">笔记数</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ dataSummary.problemFavoritesCount || 0 }}</span>
          <span class="summary-label">收藏数</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ dataSummary.totalKeys || 0 }}</span>
          <span class="summary-label">数据条目</span>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="export-section">
      <h3 class="section-title">导出数据</h3>

      <div class="export-cards">
        <!-- Progress JSON -->
        <div class="export-card">
          <div class="export-icon">&#128196;</div>
          <div class="export-info">
            <h4>JSON 格式</h4>
            <p>导出刷题记录为 JSON 文件，方便导入到其他工具</p>
          </div>
          <button class="export-btn" @click="exportProgressJSON" :disabled="isExporting">
            <span v-if="isExporting">导出中...</span>
            <span v-else>导出 JSON</span>
          </button>
        </div>

        <!-- Progress CSV -->
        <div class="export-card">
          <div class="export-icon">&#128202;</div>
          <div class="export-info">
            <h4>CSV 格式</h4>
            <p>导出刷题记录为 CSV 文件，可用 Excel 打开</p>
          </div>
          <button class="export-btn" @click="exportProgressCSV" :disabled="isExporting">
            <span v-if="isExporting">导出中...</span>
            <span v-else>导出 CSV</span>
          </button>
        </div>

        <!-- Full Backup -->
        <div class="export-card highlight">
          <div class="export-icon">&#128247;</div>
          <div class="export-info">
            <h4>完整备份</h4>
            <p>导出所有数据（进度、目标、笔记、设置）为一个 JSON 文件</p>
          </div>
          <button class="export-btn primary" @click="exportBackupJSON" :disabled="isExporting">
            <span v-if="isExporting">导出中...</span>
            <span v-else>创建备份</span>
          </button>
        </div>
      </div>

      <p v-if="exportMessage" class="message success">{{ exportMessage }}</p>
      <p v-if="lastExportDate" class="last-date">上次导出: {{ formatDate(lastExportDate) }}</p>
    </div>

    <!-- Import Options -->
    <div class="import-section">
      <h3 class="section-title">导入数据</h3>

      <div class="import-cards">
        <!-- Import Backup -->
        <div class="import-card">
          <div class="import-icon">&#128194;</div>
          <div class="import-info">
            <h4>从备份恢复</h4>
            <p>导入之前创建的完整备份文件，会覆盖现有数据</p>
          </div>
          <label class="import-btn">
            <input type="file" accept=".json" @change="handleBackupImport" hidden />
            <span v-if="isImporting">导入中...</span>
            <span v-else>选择备份文件</span>
          </label>
        </div>

        <!-- Import Progress -->
        <div class="import-card">
          <div class="import-icon">&#128221;</div>
          <div class="import-info">
            <h4>导入解题记录</h4>
            <p>导入 JSON 格式的解题记录，会与现有数据合并</p>
          </div>
          <label class="import-btn">
            <input type="file" accept=".json" @change="handleProgressImport" hidden />
            <span v-if="isImporting">导入中...</span>
            <span v-else>选择记录文件</span>
          </label>
        </div>
      </div>

      <p v-if="importMessage" class="message" :class="{ success: !importError, error: importError }">
        {{ importMessage }}
      </p>
    </div>

    <!-- Danger Zone -->
    <div class="danger-section">
      <h3 class="section-title danger">危险区域</h3>
      <div class="danger-card">
        <div class="danger-icon">&#9888;</div>
        <div class="danger-info">
          <h4>清除所有数据</h4>
          <p>永久删除所有刷题记录、笔记、目标和设置。此操作不可撤销！</p>
        </div>
        <button class="danger-btn" @click="handleClearData">
          清除数据
        </button>
      </div>
    </div>

    <!-- Import File Input (hidden) -->
    <input type="file" ref="fileInput" accept=".json" style="display: none" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDataExport } from '../composables/useDataExport.js'

const {
  isExporting,
  isImporting,
  lastExportDate,
  lastImportDate,
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
  event.target.value = '' // Reset input
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
  event.target.value = '' // Reset input
}

function handleClearData() {
  const cleared = clearAllData()
  if (cleared) {
    // Force reload to reflect cleared state
    setTimeout(() => window.location.reload(), 500)
  }
}
</script>

<style scoped>
.export-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 40px 20px;
}

.page-title {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 2.5em;
  margin: 0 0 16px 0;
  color: var(--neon-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  font-size: 1em;
}

.page-desc {
  color: var(--text-dim);
  font-size: 1.1em;
  margin: 0;
}

/* Summary Section */
.summary-section,
.export-section,
.import-section,
.danger-section {
  margin: 24px 20px;
}

.section-title {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 1.2em;
  color: var(--neon-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.section-title.danger {
  color: var(--neon-red);
  border-bottom-color: var(--neon-red);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.summary-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.summary-value {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  font-family: 'Ubuntu Mono', monospace;
  color: var(--neon-primary);
}

.summary-label {
  font-size: 0.75em;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Export Cards */
.export-cards,
.import-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-card,
.import-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.export-card.highlight {
  border-color: var(--neon-yellow);
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.05), transparent);
}

.export-icon,
.import-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.export-info,
.import-info {
  flex: 1;
}

.export-info h4,
.import-info h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
}

.export-info p,
.import-info p {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-dim);
}

.export-btn,
.import-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.export-btn:hover:not(:disabled),
.import-btn:hover:not(:disabled) {
  border-color: var(--neon-primary);
  color: var(--neon-primary);
}

.export-btn:disabled,
.import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn.primary {
  background: var(--neon-primary);
  border-color: var(--neon-primary);
  color: #000;
}

.export-btn.primary:hover:not(:disabled) {
  background: var(--neon-secondary);
  border-color: var(--neon-secondary);
}

/* Messages */
.message {
  margin: 12px 0;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
}

.message.success {
  background: rgba(0, 255, 135, 0.1);
  border: 1px solid var(--neon-primary);
  color: var(--neon-primary);
}

.message.error {
  background: rgba(255, 0, 80, 0.1);
  border: 1px solid var(--neon-red);
  color: var(--neon-red);
}

.last-date {
  font-size: 0.8em;
  color: var(--text-dim);
  margin: 8px 0;
}

/* Danger Zone */
.danger-card {
  background: rgba(255, 0, 80, 0.05);
  border: 1px solid var(--neon-red);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.danger-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.danger-info {
  flex: 1;
}

.danger-info h4 {
  margin: 0 0 4px 0;
  color: var(--neon-red);
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
}

.danger-info p {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-dim);
}

.danger-btn {
  padding: 10px 20px;
  border: 1px solid var(--neon-red);
  border-radius: 6px;
  background: transparent;
  color: var(--neon-red);
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.danger-btn:hover {
  background: var(--neon-red);
  color: #fff;
}

/* Responsive */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.8em;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .export-card,
  .import-card,
  .danger-card {
    flex-direction: column;
    text-align: center;
  }
  .export-btn,
  .import-btn,
  .danger-btn {
    width: 100%;
  }
}
</style>