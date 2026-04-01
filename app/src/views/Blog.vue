<template>
  <div class="blog-page" style="padding-top:64px">
    <div class="container">
      <div class="page-header">
        <div class="section-title">{{ t('分享', 'SHARE') }}</div>
        <p class="page-sub">{{ t('资源分享 · 优质推荐 · 音乐收藏', 'Resources · Recommendations · Music') }}</p>
      </div>

      <!-- Website Navigation Module -->
      <section class="site-nav">
        <div class="site-nav-header">
          <h2 class="site-nav-title">{{ t('网站导航', 'Site Navigation') }}</h2>
          <p class="site-nav-sub">{{ t('收藏与推荐优质网站', 'Curated quality websites') }}</p>
        </div>

        <div v-for="cat in sitesData" :key="cat.category" class="nav-category">
          <div class="nav-cat-label">{{ isZh ? cat.category : cat.categoryEn }}</div>
          <div class="nav-grid">
            <a v-for="site in cat.sites" :key="site.name"
              class="nav-card"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer">
              <div class="nav-card-icon" :style="{ '--c': site.color }">
                {{ (isZh ? site.name : site.nameEn).charAt(0) }}
              </div>
              <span class="nav-card-name">{{ isZh ? site.name : site.nameEn }}</span>
              <span class="nav-card-desc">{{ isZh ? site.desc : site.descEn }}</span>
            </a>
          </div>
        </div>
      </section>

      <div class="section-divider"></div>

      <!-- Blog posts -->
      <div v-if="posts.length" class="blog-list">
        <div v-for="post in posts" :key="post.id"
          class="pixel-card blog-item"
          @click="$router.push('/blog/'+post.id)">
          <div class="blog-item-meta">
            <span class="blog-item-date">{{ post.date }}</span>
            <span v-for="t in post.tags" :key="t" class="pixel-tag">{{ t }}</span>
          </div>
          <div class="blog-item-title">{{ post.title }}</div>
          <div class="blog-item-desc">{{ post.desc }}</div>
          <div class="blog-item-more">READ MORE ▶</div>
        </div>
      </div>

      <div v-else class="empty-blog">
        <div class="empty-icon pixel-font">[ ]</div>
        <div class="empty-text pixel-font">COMING SOON...</div>
        <p class="empty-sub">分享页正在建设中，将陆续收录转载文章、优质网站和音乐推荐。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BLOG_POSTS, SITES_DATA } from '../composables/data.js'
import { useLang } from '../composables/i18n.js'
const { t, isZh } = useLang()
const posts = BLOG_POSTS
const sitesData = SITES_DATA
</script>

<style scoped>
.blog-page { min-height: 100vh; }
.page-header { padding: 48px 0 32px; }
.page-sub { color: var(--text-dim); font-size: 0.9rem; margin-top: -16px; }

.section-divider {
  height: 1px;
  background: var(--border-pixel);
  margin: 8px 0 0;
  opacity: 0.4;
}

.blog-list { display: flex; flex-direction: column; gap: 16px; padding: 32px 0 60px; }
.blog-item { cursor: pointer; padding: 24px; transition: transform 0.2s; }
.blog-item:hover { transform: translate(-3px,-3px); }
.blog-item-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.blog-item-date { font-size: 0.85rem; color: var(--text-dim); }
.blog-item-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
.blog-item-desc { color: var(--text-dim); font-size: 0.9rem; line-height: 1.7; margin-bottom: 12px; }
.blog-item-more { font-size: 0.85rem; color: var(--neon-cyan); letter-spacing: 0.05em; }

.empty-blog {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 20px; gap: 16px; text-align: center;
}
.empty-icon {
  font-size: 2rem;
  color: var(--neon-purple);
  text-shadow: 0 0 16px var(--neon-purple);
  animation: blink 2s step-end infinite;
}
.empty-text { font-size: .85rem; color: var(--neon-cyan); letter-spacing: 0.15em; }
.empty-sub { color: var(--text-dim); font-size: 0.9rem; line-height: 1.7; max-width: 480px; }

/* Website Navigation */
.site-nav { padding-bottom: 8px; }
.site-nav-header { margin-bottom: 28px; }
.site-nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}
.site-nav-sub { font-size: 0.82rem; color: var(--text-dim); }

.nav-category { margin-bottom: 24px; }
.nav-category:last-child { margin-bottom: 0; }
.nav-cat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 500;
  opacity: 0.75;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.nav-card:hover {
  transform: translateY(-5px) scale(1.03);
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), 0 12px 36px rgba(0, 0, 0, 0.08);
}

.nav-card:active {
  transform: translateY(-1px) scale(0.97);
  transition-duration: 0.1s;
}

.nav-card-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--c, #888);
  opacity: 0.25;
  transition: opacity 0.35s ease;
}

.nav-card-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 40%, transparent 60%, rgba(0, 0, 0, 0.06) 100%);
  pointer-events: none;
}

.nav-card:hover .nav-card-icon {
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.14), 0 4px 14px rgba(0, 0, 0, 0.22);
}

.nav-card:hover .nav-card-icon::before {
  opacity: 0.4;
}

.nav-card-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: color 0.3s ease;
}

.nav-card-desc {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-align: center;
  margin-top: 6px;
  line-height: 1.4;
  max-height: 0;
  opacity: 0;
  transform: translateY(5px);
  overflow: hidden;
  display: block;
  transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s, max-height 0.35s ease;
}

.nav-card:hover .nav-card-desc {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}
</style>
