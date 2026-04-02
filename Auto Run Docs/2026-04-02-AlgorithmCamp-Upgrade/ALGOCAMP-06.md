# AlgorithmCamp 性能优化

## 目标
提升首屏加载速度、动画流畅度、Lighthouse 评分，实现 60fps 流畅体验。

## 任务

- [x] 1. 首屏加载优化
  - 关键 CSS 内联 - 已完成：内联了约 2KB 的 critical CSS 到 HTML head
  - 字体预加载 - 已完成：添加了 preconnect 和 preload 链接
  - 首屏图片优化 - 已完成：profile-avatar 添加 fetchpriority="high"，leetcode-avatar 添加 loading="lazy"
  - 骨架屏/Skeleton Screen - 已完成：实现了 Minecraft 风格的 skeleton screen，带动画进度条

- [x] 2. 资源优化
  - 图片压缩与格式转换
  - CSS/JS 代码分割 - 已完成：Vite 配置中启用 cssCodeSplit，配置 manualChunks 分包策略
  - Tree Shaking - 已完成：Vite/Rollup 默认启用 Tree Shaking，动态导入使各路由模块独立打包
  - 动态导入 (路由懒加载) - 已完成：所有 16 个路由组件改为 `() => import(...)` 懒加载模式

> **注意**：生产构建存在预存问题（StatsPanel.vue 模板解析错误），需先修复后方可验证构建输出。

- [x] 3. 缓存策略
  - 强缓存与协商缓存配置 - 已完成：HTTP headers 配置 `Cache-Control: public, max-age=31536000, immutable` 用于生产构建资源
  - Service Worker 缓存 - 已完成：增强 runtime caching，添加 Google Fonts StaleWhileRevalidate、GitHub API NetworkFirst、LeetCode API NetworkFirst、stats.json StaleWhileRevalidate
  - CDN 配置（如使用）- 已完成：添加 CORS headers 配置 (Cross-Origin-Resource-Policy, Cross-Origin-Embedder-Policy)
  - 缓存清理机制 - 已完成：启用 cleanupOutdatedCaches，添加 useCacheManager.js composable 提供 programmatic cache 管理

- [x] 4. 动画性能优化
  - GPU 加速 (transform, opacity) - 已完成：创建 `useAnimationPerformance.js` composable，添加 `.gpu-accelerated`, `.gpu-animated` 等 CSS 类，使用 `transform: translate3d(0,0,0)` 和 `translateZ(0)` 启用 GPU 加速
  - will-change 优化 - 已完成：所有持续动画元素添加 `will-change: transform, opacity`，关键元素使用 `.will-transform`, `.will-opacity`, `.will-transform-opacity` 类
  - 动画帧率监控 - 已完成：实现 FPS 实时监控（`currentFPS`），低帧率时自动降级（<45fps 触发 `isLowPerformance`），提供 `animationQuality` 状态（high/medium/low）
  - 动画降级策略 - 已完成：检测 `prefers-reduced-motion`，自动禁用粒子动画和复杂效果；低性能设备自动简化动画；Intersection Observer 暂停离屏动画

- [ ] 5. 渲染优化
  - 虚拟滚动（长列表）
  - 防抖/节流优化
  - 重排/重绘最小化
  - Intersection Observer

- [ ] 6. 网络优化
  - API 请求合并
  - 请求取消 (AbortController)
  - 错误重试机制
  - 加载状态优化

- [ ] 7. Lighthouse 优化
  - Performance > 90
  - Accessibility > 95
  - Best Practices > 90
  - SEO > 85

- [ ] 8. Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - INP < 200ms

## 验收标准

- [ ] Lighthouse Performance Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] 所有动画 60fps
- [ ] 总包体积 < 500KB (gzip)

## 备注

- 持续监控性能变化
- 使用 Web Vitals 进行真实用户监控
- 考虑使用性能预算
