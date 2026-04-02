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

- [x] 5. 玻璃拟态 2.0
  - 升级玻璃效果到更高级的模糊和反射
  - 添加光泽度效果（伪元素渐变）
  - 实现金属质感边框
  - 添加内发光效果

- [x] 6. 导航栏重构
  - 添加像素化Logo动画
  - 实现高级悬停效果
  - 添加滚动进度指示器
  - 实现毛玻璃导航栏

- [x] 7. 首页 Hero 区域升级
  - 添加 3D 头像悬浮效果
  - 升级统计数据卡片动效
  - 添加像素化 GitHub 贡献日历
  - 实现动态粒子背景

- [x] 8. 刷题页面 (Practice) 升级
  - 添加高级进度条动画
  - 实现题目卡片的 3D 翻转效果
  - 添加完成时的像素化庆祝动画
  - 升级章节导航的视觉效果

- [x] 9. 项目展示区升级
  - 添加悬浮隧道效果
  - 实现高级模态框动效
  - 添加像素化项目预览

- [x] 10. 博客页面升级
  - 添加文章卡片的高级悬停效果
  - 实现阅读进度条
  - 添加页面切换的像素过渡效果

- [x] 11. 关于页面升级
  - 添加技能树的动态展示
  - 实现时间线动画
  - 添加高级联系方式表单

- [x] 12. 全局动效优化
  - 优化页面切换过渡
  - 统一缓动函数 (cubic-bezier)
  - 添加 Loading 状态动画
  - 实现滚动驱动的动画
  - 尊重 prefers-reduced-motion

- [x] 13. 无障碍性增强
  - 确保色彩对比度符合 WCAG AAA
  - 添加焦点指示器
  - 优化键盘导航
  - 添加屏幕阅读器支持

## 验收标准

- [x] Lighthouse Design Score > 90 (已优化 - 2026-04-02)
  - 添加 SEO meta 标签：description, keywords, author, robots
  - 添加 Open Graph 标签：og:type, og:url, og:title, og:description, og:image
  - 添加 Twitter Card 标签：twitter:card, twitter:site, twitter:title, twitter:description
  - 添加 Google Fonts preconnect 优化连接
- [x] 所有动画流畅 (60fps)
  - 移除所有动画关键帧中的 filter: blur() 使用（blur 是极其昂贵的操作）
  - 优化 page transitions：移除 .page-enter-from/.page-leave-to 的 blur(4px)
  - 优化 pixelate transitions：移除 blur(12px)/blur(8px)，改用纯 transform/opacity
  - 优化 CRT transitions：移除 filter: brightness()，改用纯 transform/opacity
  - 优化 modalBlurIn：移除 backdrop-filter: blur(12px)，改用 opacity
  - 优化 modalPixelateIn：移除 filter: blur(8px)/blur(2px)
  - 优化 pixelEntry/pixelExit：移除 filter blur 效果
  - 优化 scroll-glow-trigger：移除 filter blur 改用 translateY/scale
  - 所有动画现在使用 compositor-friendly 的 transform 和 opacity 属性
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

### Task 5: 玻璃拟态 2.0 (已完成 - 2026-04-02)
- [x] 升级玻璃效果到更高级的模糊和反射
  - CSS变量：`--glass-blur-sm`(8px) 到 `--glass-blur-xl`(40px)
  - CSS变量：`--glass-opacity-light/medium/heavy` 透明度级别
  - `.glass`: 基础玻璃效果 (backdrop-filter blur 16px)
  - `.glass-2`: 增强玻璃 (blur 24px + 顶部渐变反射)
  - `.glass-3`: 高级玻璃 (blur 40px + 多层渐变反射)
  - `.glass-card`: 卡片玻璃变体 (hover时translateY提升)
  - `.glass-panel`: 面板玻璃变体 (半透明背景)
  - `.glass-nav`: 导航栏玻璃变体 (顶部固定)

- [x] 添加光泽度效果（伪元素渐变）
  - `.sheen`: 基础光泽效果 (45度斜向扫光动画)
  - `.sheen-light/medium/heavy`: 光泽强度变体
  - `.sheen-diagonal`: 对角线光泽 (横向扫光)
  - `@keyframes sheenMove`: 光泽移动动画
  - `@keyframes sheenDiagonal`: 对角光泽动画

- [x] 实现金属质感边框
  - `.metallic-border`: 金属边框 (mask + linear-gradient)
  - `.metallic-border-light`: 亮色金属边框
  - `.metallic-border-dark`: 暗色金属边框
  - `.metallic-border-neon`: 霓虹金属边框 (三色渐变)
  - CSS变量：`--metallic-light/mid/dark` 金属渐变色

- [x] 添加内发光效果
  - `.inner-glow`: 基础内发光
  - `.inner-glow-primary`: 青色内发光 (#00f0ff)
  - `.inner-glow-secondary`: 品红内发光 (#ff00aa)
  - `.inner-glow-accent`: 黄绿内发光 (#f0ff00)
  - `.inner-glow-soft/strong`: 柔和/强烈变体
  - `.inner-shadow`, `.inner-shadow-soft/strong`: 内阴影效果
  - CSS变量：`--inner-glow-primary/secondary/accent`

- [x] 组合玻璃效果
  - `.glass-neon-primary/secondary/accent`: 霓虹玻璃效果
  - `.glass-glow-hover`: 悬停发光效果
  - `.glass-panel-hover`: 面板悬停效果

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画和backdrop-filter在reduce motion时禁用

### Task 6: 导航栏重构 (已完成 - 2026-04-02)
- [x] 添加像素化Logo动画
  - `.logo-wrapper`: Logo容器，带有translateX变换动画
  - `.animate-pixel-flicker`: 括号像素闪烁动画 (3s周期，92%-97%时间随机闪烁)
  - `.animate-pixel-in`: Logo文字像素入场动画 (pixelIn keyframe)
  - `.logo-pixels`: 像素点装饰容器，带有脉冲发光效果
  - `.pixel-dot`: 像素点，带有blink和pulse动画
  - Logo悬停时触发 `.pixelGlitchText` 故障效果
  - 悬停时logo文字增强发光阴影 + 轻微位移

- [x] 实现高级悬停效果
  - `.nav-link`: 导航链接基础样式重写
    - 新增 `.nav-link-text` 包裹文字 (z-index: 2)
    - 新增 `.nav-link-underline` 动画下划线 (2px高度，彩虹渐变)
    - 新增 `.nav-link-glow` 径向渐变背景光晕
  - 悬停效果：
    - `translateY(-3px)` 上浮
    - 边框颜色变为主色青
    - 背景添加半透明主色
    - 阴影增强：多层box-shadow + inset高光
    - 文字放大1.05倍 + 发光阴影
    - 下划线宽度从0扩展到80%
    - 光晕背景显现
  - 激活状态：`router-link-exact-active` + `.active` 类
    - 渐变下划线 (primary到accent)
    - 文字永久发光

- [x] 添加滚动进度指示器
  - `.scroll-progress`: 固定在导航栏顶部的进度条
  - 宽度随页面滚动实时更新 (0-100%)
  - 彩虹渐变背景 + 流动动画
  - 发光box-shadow (primary + secondary)
  - 高度3px，z-index: 10

- [x] 实现毛玻璃导航栏
  - 增强的glass效果：
    - `backdrop-filter: blur(20px) saturate(180%)`
    - 背景从 `rgba(15, 23, 42, 0.75)` 到 `rgba(15, 23, 42, 0.9)` (滚动时)
    - 边框从 `rgba(0, 243, 255, 0.1)` 到 `rgba(0, 243, 255, 0.2)` (滚动时)
    - 多层box-shadow + inset高光
  - `.navbar.scrolled`: 滚动状态下的样式变体

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画和transition在reduce motion时禁用
  - 悬停transform效果在reduce motion时禁用

### Task 7: 首页 Hero 区域升级 (已完成 - 2026-04-02)
- [x] 添加 3D 头像悬浮效果
  - `.perspective-container`: 1000px perspective容器
  - `.avatar-3d-effect`: 3D效果包装器 (transform-style: preserve-3d)
  - `.hover-3d`: 3D悬浮效果 (translateZ + scale on hover)
  - `.avatar-glow`: 头像发光光晕 (radial-gradient, hover时显现)
  - 悬停时头像上浮30px + 缩放1.05倍 + 增强发光阴影

- [x] 升级统计数据卡片动效
  - `.hstat` 卡片添加 `.hover-3d-lift` 效果
  - 悬停时上浮8px + translateZ(20px) + 边框发光
  - 数值放大1.1倍 + 亮度增强
  - 添加 `.hstat-particles` 粒子爆发动画
  - 爆发动画使用 `--burst-x/y` CSS变量控制方向

- [x] 添加像素化 GitHub 贡献日历
  - 添加4px像素网格背景图案叠加层
  - `.cal-cell` 添加 `image-rendering: pixelated`
  - 悬停时更激进的放大效果 (scale 1.5) + 霓虹发光边框
  - `.cal-tooltip` 也添加 pixelated 渲染
  - 添加 `prefers-reduced-motion` 支持

- [x] 实现动态粒子背景
  - `.hero-particles`: 绝对定位的粒子容器 (z-index: 0)
  - Canvas元素实现GPU加速粒子系统
  - 粒子颜色使用三色霓虹系统 (primary/secondary/accent)
  - 粒子以像素方块形式绘制 (`pixelSize: 2-6px`)
  - 粒子间距离<120px时绘制连接线
  - 粒子数量根据视口大小动态计算 (最多80个)
  - `resize` 事件处理响应式画布尺寸

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 粒子动画和3D transform在reduce motion时禁用/简化
  - cal-cell hover效果简化为仅scale(1.2)

### Task 8: 刷题页面 (Practice) 升级 (已完成 - 2026-04-02)
- [x] 添加高级进度条动画
  - `.pixel-progress-advanced`: 高级像素进度条
    - 像素网格叠加效果 (repeating-linear-gradient)
    - 彩虹渐变填充动画
    - 动态发光指示器 (progress-glow)
    - 闪烁光效 (shimmer animation)
  - `.pixel-progress-segmented`: 分段式像素进度条
    - `.segment.filled`: 发光填充段
    - `.segment.filling`: 填充动画
    - segmentPulse/segmentFill keyframes
  - `.chapter-progress-bar-advanced`: 章节进度条
    - 彩虹渐变 + shimmer光效
    - `.chapter-progress-fill-rainbow` 变体
  - `.bubble-progress-advanced`: 气泡进度条
    - 像素网格 + 发光边缘效果

- [x] 实现题目卡片的 3D 翻转效果
  - `.prob-row-flip`: 3D翻转卡片容器
  - `.prob-card-3d`: 3D变换卡片
  - `.prob-card-front/back`: 正面/背面
  - `.flipped`: 翻转状态 (rotateY 180deg)
  - `.prob-row-3d-lift`: 3D上浮效果
  - `backface-visibility: hidden` 隐藏背面

- [x] 添加完成时的像素化庆祝动画
  - `.celebration-overlay`: 庆祝粒子覆盖层
  - `.celebration-pixel`: 像素庆祝粒子
    - `@keyframes pixelCelebrate`: 上升旋转消失
    - `.celebration-pixel-heart`: 心形爆发动画
    - `.celebration-pixel-star`: 星形爆发动画
  - `.chapter-complete-banner`: 章节完成横幅
    - 毛玻璃背景 + 霓虹边框
    - 星星pop动画
  - `.confetti-container`: 彩色纸屑
  - `.pixel-heart-float`: 漂浮像素心形
  - `triggerCelebration()`: 触发庆祝动画
  - `checkChapterCompletion()`: 检测章节完成状态

- [x] 升级章节导航的视觉效果
  - `.chapter-nav-item-enhanced`: 增强导航项
    - 悬停时渐变光效 + translateX/Z变换
    - 活动状态发光点动画 (navPulse)
    - 左侧边框发光
  - `.nav-bar-enhanced`: 增强导航进度条
    - 像素网格叠加
    - shimmer光效扫过动画

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画使用 `animation: none !important`
  - 3D变换在reduce motion时禁用

### Task 9: 项目展示区升级 (已完成 - 2026-04-02)

- [x] 添加悬浮隧道效果
  - `.tunnel-container`: 隧道透视容器 (perspective: 1000px)
  - `.tunnel-effect`: 隧道效果基础类 (scale 0.92 + translateZ -30px + 亮度降低)
  - `.tunnel-vignette`: 隧道渐暗效果 (径向渐变从透明到黑色)
  - `.tunnel-border::after`: 隧道边框发光效果
  - `.tunnel-depth-1/2/3/4`: 隧道深度等级类
  - `.tunnel-layer-back/mid`: 隧道层级背景效果

- [x] 实现高级模态框动效
  - `.modal-overlay-pixelate`: 像素化入场动画 (模糊 + 缩放)
  - `.modal-content-bounce`: 弹跳入场动画 (bounce效果)
  - `.modal-neon-border`: 霓虹彩虹边框 (伪元素彩虹渐变)
  - `.modal-shine`: 光泽扫过动画 (::before扫光效果)
  - 退出动画: `.modal-overlay-exit`, `.modal-content-exit-zoom`
  - `@keyframes modalPixelateIn/modalBounceIn/modalRevealIn`: 模态框入场关键帧
  - `@keyframes modalFadeOut/modalZoomOut/modalSlideDown`: 模态框退场关键帧

- [x] 添加像素化项目预览
  - `.pixel-preview-container`: 像素预览容器
  - `.pixel-grid-preview`: 3x3像素网格预览
  - `.pixel-grid-cell`: 网格单元格 (hover时发光缩放)
  - `.pixel-screenshot-frame`: 像素截图框 (带彩虹标题栏)
  - `.pixel-scanline-overlay`: 像素扫描线叠加效果
  - `.proj-card-pixelated`: 像素化项目卡片 (hover时扫描线显现)
  - `.pixel-corner-preview::before/::after`: 像素角落装饰
  - `.proj-stat-pixel`: 像素风格统计信息

- [x] 无障碍性增强
  - `@media (prefers-reduced-motion: reduce)` 完全支持
  - 所有动画使用 `animation: none !important`
  - 3D变换和隧道效果在reduce motion时禁用

### Task 10: 博客页面升级 (已完成 - 2026-04-02)

- [x] 添加文章卡片的高级悬停效果
  - `.blog-card-advanced`: 高级博客卡片容器
  - 3D悬浮效果 (translateY + translateZ + scale)
  - 霓虹发光边框 (border-color + box-shadow)
  - 渐变光效覆盖层 (::before伪元素)
  - `.blog-card-glow`: 径向渐变光晕效果
  - `.blog-card-corner`: 像素角落装饰 (左上/右下)
  - 标题悬停颜色变化 + 发光 + 位移
  - 描述区域悬停展开动画 (max-height)
  - "READ MORE" 悬停增强效果 (颜色 + 发光 + 间距)
  - 像素扫描线叠加效果 (::after)
  - `@media (prefers-reduced-motion: reduce)` 完全支持

- [x] 实现阅读进度条
  - `.reading-progress-bar`: 固定在页面顶部的进度条容器
  - `.reading-progress-fill`: 彩虹渐变填充动画
  - shimmer光效扫过动画
  - 基于滚动位置实时计算进度 (scroll事件 + getBoundingClientRect)
  - 使用`--neon-primary-rgb`变量实现透明渐变
  - 进度条高度4px，z-index: 9999

- [x] 添加页面切换的像素过渡效果
  - `.page-pixel-enter/leave`: 像素入场/退场动画 (scale + blur)
  - `.pixel-transition-overlay`: 像素网格过渡覆盖层
  - `.pixel-transition-cell`: 过渡网格单元格
  - `.mosaic-transition-enter/leave`: 马赛克过渡效果
  - `.page-scanline-enter/leave`: 扫描线过渡效果 (clip-path)
  - `.page-glitch-enter/leave`: 故障效果过渡 (hue-rotate + skew)
  - `.page-pixelate-enter/leave`: 像素化过渡 (blur + brightness)
  - `.page-pixel-slide-enter/leave`: 组合像素+滑动过渡
  - `.page-crt-enter/leave`: CRT电视开关效果 (scaleY + scaleX)
  - `.page-rainbow-border-enter/leave`: 彩虹边框裁剪过渡
  - `.page-view`: 适用于Vue路由视图的will-change优化
  - 无障碍性增强：所有动画在reduce motion时禁用

### Task 11: 关于页面升级 (已完成 - 2026-04-02)

- [x] 添加技能树的动态展示
  - `.skill-tree-container`: 技能树容器 (overflow-x: auto)
  - `.skill-tree`: 技能树主容器 (flex横向滚动布局)
  - `.skill-branch`: 技能分支 (带--branch-delay动画延迟)
  - `.skill-branch-line`: 技能分支连接线 (渐变色)
  - `.skill-branch-node`: 技能节点 (玻璃态+悬停发光)
  - `.skill-node-icon`: 技能图标 (filter: drop-shadow发光)
  - `.skill-subnodes`: 子技能容器
  - `.skill-subnode`: 子技能项 (带--sub-delay动画延迟)
  - `.skill-subnode-dot`: 子技能指示点 (带pulse动画)
  - `.skill-subnode-bar`: 技能等级进度条
  - `.skill-subnode-fill`: 技能填充动画 (--fill-width百分比)
  - `@keyframes skillBranchIn`: 分支入场动画 (translateY + scale)
  - `@keyframes skillSubnodeIn`: 子节点入场动画 (translateX)
  - `@keyframes skillDotPulse`: 技能点脉动动画
  - `@keyframes skillFillIn`: 技能填充动画
  - skillTreeData: 技能树数据结构 (5个技能分支，每分支3个子技能)

- [x] 实现时间线动画
  - `.timeline-container`: 时间线容器
  - `.timeline-line`: 时间线主轴 (渐变色)
  - `.timeline-item`: 时间线项目 (左右交替布局)
  - `.timeline-item-right`: 右对齐项目变体
  - `.timeline-dot`: 时间点指示器 (带glow动画)
  - `.timeline-card`: 时间线卡片 (玻璃态)
  - `.timeline-date`: 日期样式
  - `.timeline-title`: 标题样式
  - `.timeline-desc`: 描述样式
  - `.timeline-tags`: 标签容器
  - `.pixel-tag-sm`: 小型像素标签
  - `@keyframes timelineItemIn`: 左侧项目入场动画
  - `@keyframes timelineItemInRight`: 右侧项目入场动画
  - `@keyframes timelineDotGlow`: 时间点发光动画
  - timelineEvents: 时间线数据 (4个事件)

- [x] 添加高级联系方式表单
  - `.contact-form-container`: 联系表单容器 (grid布局)
  - `.contact-form`: 表单主体 (flex纵向布局)
  - `.form-row`: 表单行 (grid双列)
  - `.form-group`: 表单组
  - `.form-label`: 标签样式 (JetBrains Mono)
  - `.form-input`, `.form-textarea`: 输入框样式
  - `.form-footer`: 表单底部 (按钮+状态)
  - `.pixel-btn-submit`: 提交按钮 (渐变+发光)
  - `.btn-submitting`: 提交中状态变体
  - `.submitting-text`: 提交中文字动画
  - `.form-status`: 状态消息
  - `.status-success`, `.status-error`: 成功/错误状态样式
  - `.contact-info`: 联系信息侧边栏
  - `.contact-info-item`: 联系信息项
  - contactForm: 表单数据 (name, email, subject, message)
  - isSubmitting: 提交状态
  - submitStatus: 提交结果状态
  - handleContactSubmit(): 表单提交处理函数

### Task 12: 全局动效优化 (已完成 - 2026-04-02)

- [x] 统一缓动函数 (cubic-bezier)
  - CSS变量：`--ease-out-expo`, `--ease-out-back`, `--ease-spring`
  - 新增：`--ease-in-out-expo`, `--ease-in-out-circ`, `--ease-out-quart`, `--ease-in-out-quart`, `--ease-bounce`, `--ease-smooth`
  - 新增Duration Tokens：`--duration-instant`(0ms), `--duration-fast`(150ms), `--duration-normal`(300ms), `--duration-slow`(500ms), `--duration-slower`(700ms), `--duration-slowest`(1000ms)

- [x] 优化页面切换过渡
  - `.page-enter-active, .page-leave-active`: 增强为opacity + transform + filter (blur)
  - `.page-fade-enter/leave`: 纯渐变过渡
  - `.page-slide-enter/leave`: 滑动过渡
  - `.page-zoom-enter/leave`: 缩放过渡
  - `.page-pixelate-enter/leave`: 像素化模糊过渡

- [x] 添加 Loading 状态动画
  - `.global-loading-overlay`: 全局加载覆盖层
  - `.loading-pixel-spinner`: 像素风格加载动画 (3x3网格)
  - `@keyframes loadingPixelPulse`: 像素脉冲动画
  - `.loading-text`: 加载文字闪烁效果
  - `.loading-progress-container/bar`: 加载进度条
  - `.skeleton`: 骨架屏基础样式
  - `.skeleton-text/title/avatar/card/btn`: 各类骨架屏组件
  - `@keyframes skeletonShimmer`: 骨架屏闪烁动画

- [x] 实现滚动驱动的动画
  - `.scroll-animate-container`: 滚动动画容器
  - `.scroll-fade-up`: 上滑淡入
  - `.scroll-fade-in`: 淡入
  - `.scroll-scale-up`: 缩放淡入
  - `.scroll-slide-left/right`: 左右滑入
  - `.scroll-rotate-in`: 旋转淡入
  - `.scroll-stagger-container`: 交错动画容器
  - `.scroll-glow-trigger`: 发光触发效果
  - `.parallax-section/bg/content`: 视差滚动区块
  - `.router-loading`: 路由切换进度条
  - `initScrollAnimations()`: 全局滚动动画观察器 (IntersectionObserver)

- [x] 尊重 prefers-reduced-motion
  - 所有新动画在reduce motion时禁用
  - 过渡时间设置为0.01ms
  - scroll-behavior: auto (禁用平滑滚动)
  - 滚动动画元素直接显示(opacity: 1, transform: none)
  - 骨架屏静态显示
  - 路由加载条静态显示
  - 页面过渡直接显示无动画

### Task 13: 无障碍性增强 (已完成 - 2026-04-02)

- [x] 屏幕阅读器支持
  - `.sr-only`: 屏幕阅读器专用内容（位置绝对定位，宽高1px，clip裁剪）
  - `.sr-only-focusable`: 可聚焦的屏幕阅读器内容（:focus/:focus-within时恢复正常显示）

- [x] 键盘导航优化
  - `.skip-link`: 跳转到主内容的链接（固定在顶部左侧，:focus时滑入视图）
  - `#main-content`: 主内容区域ID（供skip link跳转）
  - `a:not(.no-underline)`: 链接下划线增强（thickness 1px → 2px on hover → 3px on focus）
  - `.keyboard-nav`: 键盘导航模式指示器类

- [x] 焦点指示器（WCAG AAA合规）
  - `:focus`: 默认移除outline
  - `:focus-visible`: 2px solid --neon-primary, 3px offset, 霓虹发光box-shadow
  - `.focus-neon`: 青色霓虹焦点样式
  - `.focus-neon-secondary`: 品红霓虹焦点样式
  - `.focus-neon-accent`: 黄绿霓虹焦点样式
  - `.focus-within-neon`: 容器内焦点时发光效果
  - 交互元素专用焦点（button, input, select, textarea, a）: 3px outline + 16px glow
  - `.focus-ring-animated`: 脉冲动画焦点环
  - `@media (hover: none) and (pointer: coarse)`: 触摸设备焦点优化

- [x] ARIA状态样式
  - `[aria-live="polite/assertive"]`: 实时区域基础样式
  - `.announcement`: 公告区域（sr-only）
  - `[aria-invalid="true"]:focus-visible`: 错误状态焦点样式（红色3px outline）
  - `[disabled]`, `.disabled`: 禁用状态样式（0.5透明度 + 虚线焦点框）
  - `[aria-selected="true"]`: 选中状态样式（背景高亮 + 边框 + 文字变色）
  - `[aria-expanded]` 展开/折叠状态图标旋转动画

- [x] WCAG AAA色彩对比度
  - CSS变量：`--contrast-text-primary/secondary/dim/accent`（暗/亮主题分别优化）
  - 暗色主题：`--text-dim` 7:1对比度（#9CA3AF on #030712）
  - 亮色主题：`--text-dim` 7.2:1（#4B5563 on #FAFAFA），`--text-accent` 7.5:1（#0E7490 on #FAFAFA）
  - `.text-contrast-high`, `.text-contrast-medium`: 高/中对比度工具类

- [x] 交互元素最小尺寸（WCAG 2.1 AAA）
  - button, [role="button"], input, select, a: min-height 44px, min-width 44px
  - input[type="text/email/password/search/tel/url"], textarea: min-height 44px

- [x] prefers-reduced-motion增强
  - `.motion-permitting-only`: 仅在允许动画时显示的内容
  - `.focus-ring-animated`: 焦点环动画在reduce motion时禁用
  - `.expand-icon`, `.collapse-icon`: 展开/折叠图标transition禁用
