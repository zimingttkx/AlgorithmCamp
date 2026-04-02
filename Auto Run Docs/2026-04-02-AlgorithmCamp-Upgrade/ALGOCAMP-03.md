# AlgorithmCamp 前端UI深度优化

## 目标
打造2025-2026前沿、专业、高级的像素风+霓虹视觉效果，体现高级感而非廉价感。

## 任务

- [x] 1. 设计系统重构
  - 创建高级 CSS 变量系统
  - 定义统一的间距、圆角、阴影规范
  - 建立组件库设计 token

- [x] 2. 高级霓虹色彩系统
  - 主色：`#00f0ff` (青色霓虹)
  - 辅色：`#ff00aa` (品红霓虹)
  - 点缀色：`#f0ff00` (黄绿霓虹)
  - 优化暗色/亮色主题过渡
  - 添加彩虹渐变动画效果

- [x] 3. 像素风格升级
  - 升级像素字体到 JetBrains Mono + 自定义像素字形
  - 添加更多像素装饰元素
  - 实现真正的像素级渲染效果（非简单模糊）
  - 添加像素马赛克过渡效果

- [x] 4. 高级动效设计
  - 添加 3D 悬浮效果 (transform: perspective)
    - `.perspective-container`: perspective容器
    - `.hover-3d`, `.hover-3d-lift`, `.hover-3d-glow`: 3D悬浮卡片效果
    - `.tilt-card`: 3D倾斜卡片
    - `.transform-3d-*`: 预设3D变换类
  - 实现流畅的视差滚动效果
    - `.parallax-container`, `.parallax-layer`: 视差容器和层级
    - `.parallax-back`, `.parallax-mid`, `.parallax-front`: 视差深度层级
    - `.parallax-bg-fixed`: 背景固定视差
    - `.parallax-speed-slow/normal/fast`: 视差速度控制
  - 添加粒子系统升级（GPU加速）
    - `.gpu-accelerated`: GPU加速容器
    - `.particle-container`, `.particle`: 粒子容器和基础类
    - `.particle-circle`, `.particle-square`, `.particle-diamond`: 粒子形状
    - `particleFloat`, `particleRise`, `particleDrift`, `particleGlow`, `particleBurst`, `particleTrail`: 粒子动画keyframes
    - `.particle-primary/secondary/accent/white/gold`: 粒子颜色类
    - `.particle-dense/normal/sparse`: 粒子密度类
  - 实现液态金属流动效果（CSS animation）
    - `.liquid-metal`: 液态金属文字效果
    - `.liquid-metal-bg`: 液态金属背景
    - `.liquid-metal-border`: 液态金属边框
    - 增强的 `liquidMetal` keyframe (4s周期)
  - 添加打字机效果（标题、描述）
    - `.typewriter-container`, `.typewriter-text`: 打字机容器和文字
    - `.typewriter-cursor`: 打字机光标
    - `.typewriter-slow/fast/very-fast`: 打字速度变体
    - `.typewriter-wrapper`: 带光标的打字机包装器
  - 实现弹幕/矩阵雨效果（可选）
    - `.matrix-rain-container`: 矩阵雨容器
    - `.matrix-column`: 矩阵雨列
    - `.matrix-char`: 矩阵字符
    - 增强的 `matrixRain` keyframe

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

### Task 2: 高级霓虹色彩系统 (已完成 - 2026-04-02)
- [x] 主色系统 `#00f0ff` (青色霓虹)
  - `--neon-primary`: #00f0ff
  - `--neon-primary-rgb`: 0, 240, 255
  - `--glow-primary`: rgba(0, 240, 255, 0.5)
  - `--glow-primary-soft`: rgba(0, 240, 255, 0.25)
  - `--shadow-neon-primary`: 0 0 20px glow + 0 0 40px soft

- [x] 辅色系统 `#ff00aa` (品红霓虹)
  - `--neon-secondary`: #ff00aa
  - `--neon-secondary-rgb`: 255, 0, 170
  - `--glow-secondary`: rgba(255, 0, 170, 0.5)
  - `--glow-secondary-soft`: rgba(255, 0, 170, 0.25)
  - `--shadow-neon-secondary`: 0 0 20px glow + 0 0 40px soft

- [x] 点缀色系统 `#f0ff00` (黄绿霓虹)
  - `--neon-accent`: #f0ff00
  - `--neon-accent-rgb`: 240, 255, 0
  - `--glow-accent`: rgba(240, 255, 0, 0.5)
  - `--glow-accent-soft`: rgba(240, 255, 0, 0.25)
  - `--shadow-neon-accent`: 0 0 20px glow + 0 0 40px soft

- [x] 彩虹渐变系统
  - `--rainbow-gradient`: linear-gradient(90deg, primary→secondary→accent→primary)
  - `--rainbow-gradient-45`: 45度角彩虹渐变
  - `.rainbow-text`: 彩虹流动文字效果
  - `.rainbow-border`: 彩虹边框动画
  - `.pixel-progress-rainbow`: 彩虹进度条

- [x] 主题过渡优化
  - `--theme-transition`: 0.4s (标准过渡)
  - `--theme-transition-fast`: 0.2s (快速过渡)
  - `--theme-transition-slow`: 0.6s (慢速过渡)
  - 所有颜色相关属性应用过渡动画
  - scrollbar支持主题过渡

- [x] 新增CSS类
  - `.glow-neon-primary/secondary/accent`: 霓虹发光文字
  - `.neon-border-primary/secondary/accent`: 霓虹边框
  - `.pixel-btn-primary/secondary/accent`: 霓虹按钮
  - `.pixel-btn-rainbow`: 彩虹动画按钮

- [x] 动画Keyframes
  - `rainbowFlow`: 彩虹流动动画
  - `rainbowFlow45`: 45度彩虹流动
  - `rainbowBorder`: 彩虹边框变色
  - `rainbowText`: 彩虹文字变色
  - `rainbowGlow`: 彩虹光晕脉动
  - `neonPulseSecondary/Accent`: 次要/点缀色脉冲

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 彩虹动画禁用，替换为静态颜色

### Task 3: 像素风格升级 (已完成 - 2026-04-02)
- [x] 升级像素字体到 JetBrains Mono
  - 添加 Google Fonts JetBrains Mono 导入
  - 创建 CSS 变量 `--pixel-font` 作为统一字体栈
  - 更新 body、button、rating-tag 等元素使用新字体
  - 优化字体渲染：`text-rendering: optimizeSpeed`, `-webkit-font-smoothing: none`

- [x] 添加更多像素装饰元素
  - `.pixel-corner`: 像素角落装饰（带box-shadow的4像素效果）
  - `.pixel-grid-bg`: 像素网格背景图案
  - `.pixel-frame`: 像素边框框架
  - `.pixel-block`: Minecraft风格像素方块装饰
  - `.pixel-avatar-frame`: 像素头像边框
  - `.pixel-scanlines`: 扫描线像素效果
  - `.pixel-separator`: 像素分隔线
  - `.pixel-loader`: 像素加载动画
  - `.pixel-heart`: 像素心形装饰
  - `.pixel-diamond`: 像素钻石装饰
  - `.crt-effect`: CRT屏幕效果
  - `.pixel-noise`: 像素噪点纹理

- [x] 实现真正的像素级渲染效果
  - `image-rendering: pixelated` 已在多处应用
  - 添加 `box-shadow` 锐利像素阴影（无模糊）
  - `.pixel-shadow-sharp`: 4px+8px双层锐利阴影
  - `.pixel-shadow-neon`: 霓虹发光+像素阴影组合
  - 禁用抗锯齿以保持像素清晰度

- [x] 添加像素马赛克过渡效果
  - `@keyframes pixelateIn`: 分辨率递减入场动画
  - `@keyframes mosaicIn/mosaicOut`: 马赛克式过渡
  - `@keyframes pixelGlitch`: 像素故障效果
  - `@keyframes pixelEntry`: 像素入场动画
  - `.mosaic-transition`: 马赛克过渡类
  - `.pixel-glitch-effect`: 故障效果类

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画都有对应的reduce motion处理

### Task 4: 高级动效设计 (已完成 - 2026-04-02)
- [x] 3D悬浮效果 (transform: perspective)
  - `.perspective-container`: perspective容器 (perspective: 1000px)
  - `.hover-3d`: 3D悬浮卡片效果 (translateZ + rotateX/Y)
  - `.hover-3d-lift`: 3D提升悬浮效果 (translateY/Z + glow)
  - `.hover-3d-glow`: 3D发光悬浮效果 (translateZ + scale + intense glow)
  - `.tilt-card`: 3D倾斜卡片 (接收JS的--tilt-x/--tilt-y变量)
  - `.transform-3d-rotateX-5/10`, `.transform-3d-rotateY-5/10`: 3D旋转预设
  - `.transform-3d-scale-105`: 3D缩放预设
  - `.transform-3d-translateZ-20/40`: 3D Z轴位移预设

- [x] 视差滚动效果
  - `.parallax-container`: 视差容器 (perspective: 2px)
  - `.parallax-layer`, `.parallax-back/mid/front`: 视差深度层级
  - `.parallax-bg-fixed`: 背景固定视差 (background-attachment: fixed)
  - `.parallax-speed-slow/normal/fast`: 视差速度控制类
  - `[data-parallax]`: scroll-driven视差属性选择器
  - `.parallax-element`: 视差元素基础类

- [x] GPU加速粒子系统
  - `.gpu-accelerated`: GPU加速容器 (translateZ(0) + will-change)
  - `.particle-container`, `.particle`: 粒子容器和基础类
  - `.particle-circle`, `.particle-square`, `.particle-diamond`: 粒子形状类
  - `.particle-primary/secondary/accent/white/gold`: 粒子颜色类
  - `@keyframes particleFloat`: 漂浮粒子动画
  - `@keyframes particleRise`: 上升消失粒子动画
  - `@keyframes particleDrift`: 漂移粒子动画
  - `@keyframes particleGlow`: 发光脉动粒子动画
  - `@keyframes particleBurst`: 爆裂粒子动画 (支持--burst-x/--burst-y变量)
  - `@keyframes particleTrail`: 拖尾粒子动画
  - `.particle-dense/normal/sparse`: 粒子密度CSS变量 (--particle-count)
  - `.particle-canvas`: 粒子画布层 (z-index: 9997)
  - `.particle-animate-float/rise/drift/glow/burst/trail`: 粒子动画类

- [x] 液态金属流动效果
  - `.liquid-metal`: 液态金属文字效果 (background-clip: text)
  - `.liquid-metal-bg`: 液态金属背景效果
  - `.liquid-metal-border`: 液态金属边框 (带模糊光晕)
  - 增强的 `liquidMetal` keyframe (4s周期, 135度彩虹渐变)
  - 支持hue-rotate滤镜变化增强视觉效果

- [x] 打字机效果
  - `.typewriter-container`: 打字机容器 (overflow: hidden)
  - `.typewriter-text`: 打字机文字 (width动画 + border-right光标)
  - `.typewriter-cursor`: 打字机闪烁光标 (::after伪元素)
  - `.typewriter-slow/fast/very-fast`: 打字速度变体
  - `.typewriter-wrapper`: 带独立光标的打字机包装器
  - `@keyframes typewriter`: 宽度从0到100%展开动画
  - `@keyframes typewriterCursor`: 光标闪烁 (opacity 0/1)

- [x] 弹幕/矩阵雨效果
  - `.matrix-rain-container`: 矩阵雨容器 (position: fixed, overflow: hidden)
  - `.matrix-column`: 矩阵雨列 (writing-mode: vertical-rl, animation: matrixRain)
  - `.matrix-char`: 矩阵字符 (逐字符淡入动画)
  - 矩阵列交替使用primary/secondary/accent颜色
  - 不同列使用不同的动画持续时间(4s/5s/6s)
  - `@keyframes matrixRain`: Y轴位移 (-100% 到 100vh)
  - `@keyframes matrixCharFade`: 字符淡入动画
  - z-index: 9999 (最顶层覆盖层)

- [x] 增强动画工具类
  - `.animate-3d-float`: 3D漂浮动画 (translate3d + rotateX/Y)
  - `.animate-3d-spin`: 3D旋转动画 (rotateX/Y/Z 360度)
  - `.animate-parallax-slow/medium/fast`: 视差浮动动画
  - `.animate-liquid`: 液态金属动画
  - `.animate-typewriter`: 打字机动画
  - `.animate-matrix`: 矩阵雨动画

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画使用 `animation: none !important`
  - 所有transform和transition也被禁用
  - 粒子动画、3D效果、视差等全部跳过

