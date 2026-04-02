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
          class="pixel-card blog-item blog-card-advanced tunnel-container"
          @click="$router.push('/blog/'+post.id)">
          <div class="blog-item-meta">
            <span class="blog-item-date">{{ post.date }}</span>
            <span v-for="t in post.tags" :key="t" class="pixel-tag">{{ t }}</span>
          </div>
          <div class="blog-item-title">{{ post.title }}</div>
          <div class="blog-item-desc">{{ post.desc }}</div>
          <div class="blog-item-more">READ MORE ▶</div>
          <div class="blog-card-glow"></div>
          <div class="blog-card-corner blog-card-corner-tl"></div>
          <div class="blog-card-corner blog-card-corner-br"></div>
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

/* ── Advanced Blog Card Hover Effects (Task 10) ── */
.blog-card-advanced {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s ease;
}

.blog-card-advanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--neon-primary-rgb), 0.1) 0%,
    rgba(var(--neon-secondary-rgb), 0.05) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

.blog-card-advanced:hover::before {
  opacity: 1;
}

.blog-card-advanced:hover {
  transform: translateY(-8px) translateZ(20px) scale(1.02);
  border-color: var(--neon-primary);
  box-shadow:
    var(--shadow-lg),
    0 0 40px rgba(var(--neon-primary-rgb), 0.3),
    0 0 80px rgba(var(--neon-primary-rgb), 0.15),
    inset 0 0 30px rgba(var(--neon-primary-rgb), 0.05);
}

/* Glow effect overlay */
.blog-card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    ellipse at center,
    rgba(var(--neon-primary-rgb), 0.15) 0%,
    transparent 50%
  );
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.4s ease;
  pointer-events: none;
  z-index: 0;
}

.blog-card-advanced:hover .blog-card-glow {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

/* Pixel corner decorations */
.blog-card-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 2;
}

.blog-card-corner::before,
.blog-card-corner::after {
  content: '';
  position: absolute;
  background: var(--neon-primary);
  box-shadow: 0 0 8px var(--glow-primary);
}

.blog-card-corner-tl {
  top: 8px;
  left: 8px;
}

.blog-card-corner-tl::before {
  top: 0;
  left: 0;
  width: 12px;
  height: 2px;
}

.blog-card-corner-tl::after {
  top: 0;
  left: 0;
  width: 2px;
  height: 12px;
}

.blog-card-corner-br {
  bottom: 8px;
  right: 8px;
}

.blog-card-corner-br::before {
  bottom: 0;
  right: 0;
  width: 12px;
  height: 2px;
}

.blog-card-corner-br::after {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 12px;
}

.blog-card-advanced:hover .blog-card-corner {
  opacity: 1;
}

.blog-card-advanced:hover .blog-card-corner-tl {
  top: 12px;
  left: 12px;
}

.blog-card-advanced:hover .blog-card-corner-br {
  bottom: 12px;
  right: 12px;
}

/* Enhanced title hover effect */
.blog-card-advanced .blog-item-title {
  position: relative;
  transition: all 0.3s ease;
}

.blog-card-advanced:hover .blog-item-title {
  color: var(--neon-primary);
  text-shadow: 0 0 20px var(--glow-primary-soft);
  transform: translateX(4px);
}

/* Enhanced description reveal */
.blog-card-advanced .blog-item-desc {
  position: relative;
  max-height: 3.6em;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s ease;
}

.blog-card-advanced:hover .blog-item-desc {
  max-height: 7.2em;
  color: var(--text-secondary);
}

/* Enhanced READ MORE hover */
.blog-card-advanced .blog-item-more {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.blog-card-advanced .blog-item-more::before {
  content: '';
  position: absolute;
  left: -20px;
  width: 0;
  height: 100%;
  background: rgba(var(--neon-primary-rgb), 0.2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.blog-card-advanced:hover .blog-item-more {
  color: var(--neon-primary);
  text-shadow: 0 0 10px var(--glow-primary);
  gap: 12px;
}

.blog-card-advanced:hover .blog-item-more::before {
  width: 16px;
}

/* 3D tilt effect on card */
.blog-card-advanced .tunnel-effect {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.blog-card-advanced:hover .tunnel-effect {
  transform: scale(1.02) translateZ(10px);
}

/* Pixel scanline effect on hover */
.blog-card-advanced::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(var(--neon-primary-rgb), 0.03) 2px,
    rgba(var(--neon-primary-rgb), 0.03) 4px
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 3;
}

.blog-card-advanced:hover::after {
  opacity: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .blog-card-advanced {
    transition: none;
  }

  .blog-card-advanced:hover {
    transform: scale(1.02);
    border-color: var(--neon-primary);
    box-shadow: var(--shadow-lg), 0 0 20px rgba(var(--neon-primary-rgb), 0.2);
  }

  .blog-card-advanced:hover .blog-card-glow,
  .blog-card-advanced:hover .blog-card-corner,
  .blog-card-advanced::after {
    display: none;
  }

  .blog-card-advanced:hover .blog-item-title {
    transform: none;
  }

  .blog-card-advanced:hover .blog-item-desc {
    max-height: 3.6em;
  }
}
</style>
