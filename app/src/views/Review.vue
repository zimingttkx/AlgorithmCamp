<template>
  <div class="review-page">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">&#128218;</span>
        复习中心
      </h1>
      <p class="page-desc">基于 SM-2 间隔重复算法，智能安排题目复习</p>
    </div>

    <ReviewReminder />
  </div>
</template>

<script setup>
import ReviewReminder from '../components/ReviewReminder.vue'
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 40px;
}

.page-header {
  text-align: center;
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
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

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8em;
  }
  .page-header {
    padding: 24px 16px;
  }
}
</style>