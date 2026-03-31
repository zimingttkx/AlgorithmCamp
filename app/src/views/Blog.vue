<template>
  <div class="blog-page" style="padding-top:56px">
    <div class="container">
      <div class="page-header">
        <div class="section-title">文章列表</div>
        <p class="page-sub">技术笔记 · 算法分析 · 学习记录</p>
      </div>

      <div v-if="posts.length" class="blog-list">
        <div v-for="post in posts" :key="post.id"
          class="pixel-card blog-item"
          @click="$router.push('/blog/'+post.id)">
          <div class="blog-item-meta">
            <span class="pixel-font blog-item-date">{{ post.date }}</span>
            <span v-for="t in post.tags" :key="t" class="pixel-tag">{{ t }}</span>
          </div>
          <div class="blog-item-title">{{ post.title }}</div>
          <div class="blog-item-desc">{{ post.desc }}</div>
          <div class="blog-item-more pixel-font">READ MORE ▶</div>
        </div>
      </div>

      <div v-else class="empty-blog">
        <div class="pixel-font empty-icon">[ ]</div>
        <div class="pixel-font empty-text">文章施工中...</div>
        <p class="empty-sub">暂无文章，敬请期待。将陆续发布算法、机器学习与安全方向的技术内容。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BLOG_POSTS } from '../composables/data.js'
const posts = BLOG_POSTS
</script>

<style scoped>
.blog-page { min-height: 100vh; }
.page-header { padding: 48px 0 32px; }
.page-sub { color: var(--text-dim); font-size: 0.85rem; margin-top: -16px; }

.blog-list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 60px; }
.blog-item { cursor: pointer; padding: 24px; transition: transform 0.2s; }
.blog-item:hover { transform: translate(-3px,-3px); }
.blog-item-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.blog-item-date { font-size: 0.42rem; color: var(--text-dim); }
.blog-item-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
.blog-item-desc { color: var(--text-dim); font-size: 0.85rem; line-height: 1.7; margin-bottom: 12px; }
.blog-item-more { font-size: 0.42rem; color: var(--neon-cyan); letter-spacing: 0.1em; }

.empty-blog {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px; gap: 16px; text-align: center;
}
.empty-icon {
  font-size: 2rem;
  color: var(--neon-purple);
  text-shadow: 0 0 16px var(--neon-purple);
  animation: blink 2s step-end infinite;
}
.empty-text { font-size: 0.6rem; color: var(--neon-cyan); letter-spacing: 0.15em; }
.empty-sub { color: var(--text-dim); font-size: 0.85rem; line-height: 1.7; max-width: 480px; }
</style>
