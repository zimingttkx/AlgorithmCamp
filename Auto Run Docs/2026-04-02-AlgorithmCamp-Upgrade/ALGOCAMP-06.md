# AlgorithmCamp 性能优化

## 目标
提升首屏加载速度、动画流畅度、Lighthouse 评分，实现 60fps 流畅体验。

## 任务

- [x] 1. 首屏加载优化
  - 关键 CSS 内联 - 已完成：内联了约 2KB 的 critical CSS 到 HTML head
  - 字体预加载 - 已完成：添加了 preconnect 和 preload 链接
  - 首屏图片优化 - 已完成：profile-avatar 添加 fetchpriority="high"，leetcode-avatar 添加 loading="lazy"
  - 骨架屏/Skeleton Screen - 已完成：实现了 Minecraft 风格的 skeleton screen，带动画进度条

- [ ] 2. 资源优化
  - 图片压缩与格式转换
  - CSS/JS 代码分割
  - Tree Shaking
  - 动态导入 (路由懒加载)

- [ ] 3. 缓存策略
  - 强缓存与协商缓存配置
  - Service Worker 缓存
  - CDN 配置（如使用）
  - 缓存清理机制

- [ ] 4. 动画性能优化
  - GPU 加速 (transform, opacity)
  - will-change 优化
  - 动画帧率监控
  - 动画降级策略

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
