# AlgorithmCamp 前端UI深度优化

## 目标
打造2025-2026前沿、专业、高级的像素风+霓虹视觉效果，体现高级感而非廉价感。

## 任务

- [x] 1. 设计系统重构
  - 创建高级 CSS 变量系统
  - 定义统一的间距、圆角、阴影规范
  - 建立组件库设计 token

- [ ] 2. 高级霓虹色彩系统
  - 主色：`#00f0ff` (青色霓虹)
  - 辅色：`#ff00aa` (品红霓虹)
  - 点缀色：`#f0ff00` (黄绿霓虹)
  - 优化暗色/亮色主题过渡
  - 添加彩虹渐变动画效果

- [ ] 3. 像素风格升级
  - 升级像素字体到 JetBrains Mono + 自定义像素字形
  - 添加更多像素装饰元素
  - 实现真正的像素级渲染效果（非简单模糊）
  - 添加像素马赛克过渡效果

- [ ] 4. 高级动效设计
  - 添加 3D 悬浮效果 (transform: perspective)
  - 实现流畅的视差滚动效果
  - 添加粒子系统升级（GPU加速）
  - 实现液态金属流动效果（CSS animation）
  - 添加打字机效果（标题、描述）
  - 实现弹幕/矩阵雨效果（可选）

- [ ] 5. 玻璃拟态 2.0
  - 升级玻璃效果到更高级的模糊和反射
  - 添加光泽度效果（伪元素渐变）
  - 实现金属质感边框
  - 添加内发光效果

- [ ] 6. 导航栏重构
  - 添加像素化Logo动画
  - 实现高级悬停效果
  - 添加滚动进度指示器
  - 实现毛玻璃导航栏

- [ ] 7. 首页 Hero 区域升级
  - 添加 3D 头像悬浮效果
  - 升级统计数据卡片动效
  - 添加像素化 GitHub 贡献日历
  - 实现动态粒子背景

- [ ] 8. 刷题页面 (Practice) 升级
  - 添加高级进度条动画
  - 实现题目卡片的 3D 翻转效果
  - 添加完成时的像素化庆祝动画
  - 升级章节导航的视觉效果

- [ ] 9. 项目展示区升级
  - 添加悬浮隧道效果
  - 实现高级模态框动效
  - 添加像素化项目预览

- [ ] 10. 博客页面升级
  - 添加文章卡片的高级悬停效果
  - 实现阅读进度条
  - 添加页面切换的像素过渡效果

- [ ] 11. 关于页面升级
  - 添加技能树的动态展示
  - 实现时间线动画
  - 添加高级联系方式表单

- [ ] 12. 全局动效优化
  - 优化页面切换过渡
  - 统一缓动函数 (cubic-bezier)
  - 添加 Loading 状态动画
  - 实现滚动驱动的动画
  - 尊重 prefers-reduced-motion

- [ ] 13. 无障碍性增强
  - 确保色彩对比度符合 WCAG AAA
  - 添加焦点指示器
  - 优化键盘导航
  - 添加屏幕阅读器支持

## 验收标准

- [ ] Lighthouse Design Score > 90
- [ ] 所有动画流畅 (60fps)
- [ ] 暗色/亮色主题完美切换
- [ ] 移动端动画性能优化
- [ ] 像素风格统一且高级
- [ ] 无重大 CLS (布局偏移)

## 备注

- 动效优先级：核心交互 > 装饰效果
- 避免过度动画导致性能问题
- 保持像素风格的克制与优雅
- 参考：Dribbble 2025-2026 设计趋势

## 完成记录

### Task 1: 设计系统重构 (已完成 - 2026-04-02)
- [x] 创建高级 CSS 变量系统
  - 霓虹色彩系统：`--neon-primary` (#00f0ff), `--neon-secondary` (#ff00aa), `--neon-accent` (#f0ff00)
  - RGB变量支持：`--neon-primary-rgb`, `--neon-secondary-rgb`, `--neon-accent-rgb`
  - 发光效果变量：`--glow-primary`, `--glow-secondary`, `--glow-accent`
  - 向后兼容的legacy映射（--neon-blue, --neon-purple等）

- [x] 定义统一的间距、圆角、阴影规范
  - 间距系统（14级）：`--space-1`(4px) 到 `--space-24`(96px)
  - 组件间距：`--spacing-inline-*`, `--spacing-stack-*`
  - 圆角系统：`--radius-sm`(4px) 到 `--radius-full`(9999px)
  - 阴影系统：soft shadows (--shadow-xs 到 --shadow-2xl) + neon glow shadows

- [x] 建立组件库设计 token
  - 按钮token：`--btn-*` 系列变量
  - 卡片token：`--card-*` 系列变量
  - 表单token：`--input-*` 系列变量
  - 标签token：`--tag-*` 系列变量
  - 过渡token：`--ease-*`, `--duration-*`, `--transition-*`
  - Z-index系统：`--z-base` 到 `--z-toast`

- [x] 新增动画keyframes
  - 像素风格：`pixelIn`, `pixelOut`, `pixelGlitch`
  - 视觉效果：`rainbowFlow`, `borderGlow`, `liquidMetal`, `neonFlicker`
  - 打字机效果：`typewriter`, `typewriterCursor`
  - Matrix效果：`matrixRain`, `scanlineMove`
  - 健康效果：`heartbeat`

- [x] 新增组件库CSS类
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-ghost`
  - `.card`, `.card-hover`, `.card-glass`, `.card-elevated`
  - `.tag`, `.tag-primary`, `.tag-secondary`, `.tag-accent`
  - `.input` 表单组件
  - 布局工具：`.stack-*`, `.inline-*`, `.grid-*`
  - 动画工具：`.animate-*`

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 支持
  - 所有动画都有对应的reduce motion处理
