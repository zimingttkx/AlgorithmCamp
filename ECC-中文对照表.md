# Everything Claude Code (ECC) 中文对照表

> 文件名不能改（改了插件会坏），用这份对照表查找即可。

---

## 代理 (Agents) — 38 个

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `architect` | 架构师 | 系统设计、可扩展性、技术决策 |
| `planner` | 规划师 | 复杂功能实现规划、重构方案 |
| `code-reviewer` | 代码审查员 | 代码质量、安全、可维护性审查 |
| `security-reviewer` | 安全审查员 | 安全漏洞检测、OWASP Top 10 |
| `tdd-guide` | TDD 向导 | 测试驱动开发，先写测试再写代码 |
| `build-error-resolver` | 构建错误修复 | 修复构建/编译/类型错误 |
| `e2e-runner` | E2E 测试员 | 端到端测试、Playwright 自动化 |
| `performance-optimizer` | 性能优化师 | 性能分析、瓶颈识别、优化建议 |
| `refactor-cleaner` | 重构清理员 | 死代码清理、依赖分析、代码合并 |
| `doc-updater` | 文档更新员 | 更新文档、代码地图、README |
| `docs-lookup` | 文档查询 | 查找库/框架/API 的最新文档和示例 |
| `loop-operator` | 循环操作员 | 管理自主代理循环、监控进度、干预卡死 |
| `harness-optimizer` | 配置优化师 | 分析和改进代理配置，提升可靠性/成本/吞吐量 |
| `typescript-reviewer` | TypeScript 审查员 | TS/JS 类型安全、异步正确性、Web 安全 |
| `python-reviewer` | Python 审查员 | PEP 8 规范、Pythonic 风格、类型提示 |
| `go-reviewer` | Go 审查员 | 惯用 Go、并发模式、错误处理 |
| `rust-reviewer` | Rust 审查员 | 所有权、生命周期、unsafe 用法 |
| `java-reviewer` | Java 审查员 | 分层架构、JPA 模式、Spring Boot |
| `kotlin-reviewer` | Kotlin 审查员 | 协程安全、Compose 最佳实践 |
| `cpp-reviewer` | C++ 审查员 | 内存安全、现代 C++、并发性能 |
| `csharp-reviewer` | C# 审查员 | .NET 规范、异步模式、可空引用类型 |
| `flutter-reviewer` | Flutter 审查员 | Widget 最佳实践、状态管理、Dart 惯用法 |
| `database-reviewer` | 数据库审查员 | PostgreSQL 查询优化、Schema 设计 |
| `healthcare-reviewer` | 医疗审查员 | 临床安全、PHI 合规、医疗数据完整性 |
| `go-build-resolver` | Go 构建修复 | Go 编译/vet/依赖错误 |
| `java-build-resolver` | Java 构建修复 | Maven/Gradle 编译错误 |
| `kotlin-build-resolver` | Kotlin 构建修复 | Gradle 编译错误 |
| `rust-build-resolver` | Rust 构建修复 | Cargo 编译、借用检查器错误 |
| `cpp-build-resolver` | C++ 构建修复 | CMake/链接/模板错误 |
| `dart-build-resolver` | Dart 构建修复 | Flutter 编译/pub 依赖冲突 |
| `pytorch-build-resolver` | PyTorch 构建修复 | 张量形状/CUDA/梯度/DataLoader 错误 |
| `chief-of-staff` | 幕僚长 | 邮件/Slack/LINE/Messenger 消息分类和回复 |
| `opensource-forker` | 开源分叉器 | 清理密钥和凭据、准备开源项目 |
| `opensource-sanitizer` | 开源消毒器 | 扫描泄露密钥/PII/内部引用 |
| `opensource-packager` | 开源打包器 | 生成 CLAUDE.md、LICENSE、README 等 |
| `gan-planner` | GAN 规划器 | 将需求扩展为完整产品规格 |
| `gan-generator` | GAN 生成器 | 按规格实现功能 |
| `gan-evaluator` | GAN 评估器 | 测试运行中的应用、评分、反馈 |

---

## 技能 (Skills) — 123 个

### 开发工作流

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `tdd-workflow` | TDD 工作流 | 红-绿-重构 测试驱动开发 |
| `e2e-testing` | E2E 测试 | 端到端测试最佳实践 |
| `verification-loop` | 验证循环 | 反复验证直到质量达标 |
| `eval-harness` | 评估工具 | 评估代理输出质量 |
| `coding-standards` | 编码标准 | 代码风格和标准定义 |
| `strategic-compact` | 战略压缩 | 上下文窗口管理和压缩策略 |
| `continuous-learning` | 持续学习 | 从会话中自动提取模式 |
| `continuous-learning-v2` | 持续学习 V2 | 本能式学习系统，带置信度评分 |
| `continuous-agent-loop` | 持续代理循环 | 自主代理循环模式 |
| `autonomous-loops` | 自主循环 | 多代理自主协作模式 |

### 语言/框架模式

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `python-patterns` | Python 模式 | Python 设计模式和惯用法 |
| `python-testing` | Python 测试 | Python 测试框架和覆盖率 |
| `golang-patterns` | Go 模式 | Go 惯用模式 |
| `golang-testing` | Go 测试 | Go 测试最佳实践 |
| `rust-patterns` | Rust 模式 | Rust 所有权/生命周期模式 |
| `rust-testing` | Rust 测试 | Rust 测试策略 |
| `java-coding-standards` | Java 编码标准 | Java 编码规范 |
| `springboot-patterns` | Spring Boot 模式 | Spring Boot 开发模式 |
| `springboot-tdd` | Spring Boot TDD | Spring Boot 测试驱动开发 |
| `springboot-security` | Spring Boot 安全 | Spring Boot 安全配置 |
| `springboot-verification` | Spring Boot 验证 | Spring Boot 验证流程 |
| `nestjs-patterns` | NestJS 模式 | NestJS 开发模式 |
| `laravel-patterns` | Laravel 模式 | Laravel 开发模式 |
| `laravel-tdd` | Laravel TDD | Laravel 测试驱动开发 |
| `laravel-security` | Laravel 安全 | Laravel 安全最佳实践 |
| `laravel-verification` | Laravel 验证 | Laravel 验证流程 |
| `django-patterns` | Django 模式 | Django 开发模式 |
| `django-tdd` | Django TDD | Django 测试驱动开发 |
| `django-security` | Django 安全 | Django 安全实践 |
| `django-verification` | Django 验证 | Django 验证流程 |
| `kotlin-patterns` | Kotlin 模式 | Kotlin 开发模式 |
| `kotlin-testing` | Kotlin 测试 | Kotlin 测试策略 |
| `kotlin-coroutines-flows` | Kotlin 协程流 | Kotlin 协程和 Flow 模式 |
| `kotlin-exposed-patterns` | Kotlin Exposed | Kotlin Exposed ORM 模式 |
| `kotlin-ktor-patterns` | Ktor 模式 | Kotlin Ktor 服务端模式 |
| `swiftui-patterns` | SwiftUI 模式 | SwiftUI 开发模式 |
| `swift-concurrency-6-2` | Swift 并发 | Swift 6.2 并发模式 |
| `swift-actor-persistence` | Swift Actor 持久化 | Swift Actor 持久化模式 |
| `swift-protocol-di-testing` | Swift DI 测试 | Swift 协议依赖注入测试 |
| `cpp-coding-standards` | C++ 编码标准 | C++ 编码规范 |
| `cpp-testing` | C++ 测试 | C++ 测试框架和策略 |
| `perl-patterns` | Perl 模式 | Perl 开发模式 |
| `perl-testing` | Perl 测试 | Perl 测试策略 |
| `perl-security` | Perl 安全 | Perl 安全实践 |
| `dotnet-patterns` | .NET 模式 | .NET 开发模式 |
| `csharp-testing` | C# 测试 | C# 测试策略 |
| `dart-flutter-patterns` | Dart/Flutter 模式 | Flutter 和 Dart 开发模式 |
| `compose-multiplatform-patterns` | Compose 多平台 | Kotlin Multiplatform Compose 模式 |
| `jpa-patterns` | JPA 模式 | Java JPA 数据访问模式 |
| `frontend-patterns` | 前端模式 | 前端开发最佳实践 |
| `frontend-slides` | 前端幻灯片 | 前端演示文稿生成 |

### 安全与质量

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `security-review` | 安全审查 | 代码安全审查流程 |
| `security-scan` | 安全扫描 | 自动化安全扫描 |
| `plankton-code-quality` | 代码质量 | 代码质量标准和检查 |
| `ai-regression-testing` | AI 回归测试 | AI 输出回归测试 |
| `data-scraper-agent` | 数据抓取代理 | 安全合规的数据抓取 |

### 基础设施与 DevOps

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `docker-patterns` | Docker 模式 | Docker 容器化最佳实践 |
| `deployment-patterns` | 部署模式 | 部署策略和流程 |
| `database-migrations` | 数据库迁移 | 数据库迁移管理 |
| `mcp-server-patterns` | MCP 服务器模式 | MCP 服务器开发模式 |
| `clickhouse-io` | ClickHouse | ClickHouse 数据库操作 |
| `postgres-patterns` | PostgreSQL 模式 | PostgreSQL 查询优化和设计 |

### API 与后端

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `api-design` | API 设计 | RESTful API 设计最佳实践 |
| `backend-patterns` | 后端模式 | 后端架构和设计模式 |
| `claude-api` | Claude API | Anthropic Claude API 使用 |
| `x-api` | X (Twitter) API | X 平台 API 集成 |
| `exa-search` | Exa 搜索 | Exa 搜索引擎集成 |

### AI 与代理

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `agent-harness-construction` | 代理构建 | 构建代理工具包 |
| `agentic-engineering` | 代理工程 | AI 代理工程最佳实践 |
| `ai-first-engineering` | AI 优先工程 | AI 驱动的工程方法论 |
| `claude-devfleet` | Claude 开发舰队 | 多代理协作开发 |
| `nanoclaw-repl` | 纳爪 REPL | 轻量级代理 REPL 环境 |
| `cost-aware-llm-pipeline` | 成本感知 LLM | 成本优化的 LLM 管道 |
| `token-budget-advisor` | Token 预算顾问 | Token 用量和成本管理 |
| `prompt-optimizer` | 提示词优化 | 提示词质量优化 |
| `enterprise-agent-ops` | 企业代理运营 | 企业级代理管理和运营 |
| `foundation-models-on-device` | 端侧大模型 | 设备端基础模型部署 |
| `regex-vs-llm-structured-text` | 正则 vs LLM | 正则表达式与 LLM 结构化文本提取对比 |

### 商业与内容

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `article-writing` | 文章写作 | 技术文章写作 |
| `content-engine` | 内容引擎 | 内容生成和管理 |
| `brand-voice` | 品牌语调 | 品牌语言风格定义 |
| `market-research` | 市场研究 | 市场分析和调研 |
| `investor-materials` | 投资者资料 | 融资材料生成 |
| `investor-outreach` | 投资者外联 | 投资人沟通策略 |
| `lead-intelligence` | 潜在客户情报 | 销售线索分析 |
| `crosspost` | 跨平台发布 | 多平台内容同步发布 |
| `social-graph-ranker` | 社交图谱排名 | 社交网络分析排名 |
| `blueprint` | 蓝图 | 项目蓝图和规划 |

### 供应链与物流

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `carrier-relationship-management` | 承运商管理 | 物流承运商关系管理 |
| `customs-trade-compliance` | 关贸合规 | 海关和贸易合规 |
| `energy-procurement` | 能源采购 | 能源采购优化 |
| `inventory-demand-planning` | 库存需求规划 | 库存和需求预测 |
| `logistics-exception-management` | 物流异常管理 | 物流异常处理 |
| `production-scheduling` | 生产排程 | 生产计划排程 |
| `quality-nonconformance` | 质量不合格 | 质量不合格管理 |
| `returns-reverse-logistics` | 退货逆向物流 | 退货和逆向物流管理 |

### 媒体与创作

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `manim-video` | Manim 视频 | 数学动画视频制作 |
| `remotion-video-creation` | Remotion 视频 | React 视频创建 |
| `video-editing` | 视频编辑 | 视频编辑工作流 |
| `fal-ai-media` | Fal AI 媒体 | Fal AI 媒体生成 |
| `videodb` | VideoDB | 视频数据库操作 |
| `ui-demo` | UI 演示 | UI 组件演示生成 |

### 其他工具

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `configure-ecc` | 配置 ECC | Everything Claude Code 配置 |
| `deep-research` | 深度研究 | 深度主题研究 |
| `search-first` | 搜索优先 | 先搜索再实现的开发模式 |
| `iterative-retrieval` | 迭代检索 | 迭代式信息检索 |
| `connections-optimizer` | 连接优化 | 优化网络和数据库连接 |
| `content-hash-cache-pattern` | 内容哈希缓存 | 基于内容哈希的缓存模式 |
| `ralphinho-rfc-pipeline` | RFC 管道 | RFC 文档生成管道 |
| `project-flow-ops` | 项目流程运营 | 项目流程管理 |
| `project-guidelines-example` | 项目指南示例 | 项目配置指南模板 |
| `dmux-workflows` | dmux 工作流 | dmux 多路复用工作流 |
| `google-workspace-ops` | Google Workspace | Google Workspace 操作 |
| `jira-integration` | Jira 集成 | Jira 项目管理集成 |
| `customer-billing-ops` | 客户计费 | 客户账单和计费操作 |
| `nutrient-document-processing` | 文档处理 | Nutrient 文档处理 |
| `visa-doc-translate` | 签证文档翻译 | 签证文件翻译 |
| `workspace-surface-audit` | 工作区审计 | 工作区表面审计 |
| `android-clean-architecture` | Android 干净架构 | Android 清洁架构模式 |
| `liquid-glass-design` | 液态玻璃设计 | Apple 液态玻璃设计风格 |
| `skill-stocktake` | 技能盘点 | 技能清单管理和审查 |
| `team-builder` | 团队构建 | 多代理团队构建 |
| `nextjs-turbopack` | Next.js Turbopack | Next.js Turbopack 配置 |
| `hexagonal-architecture` | 六边形架构 | 端口适配器架构模式 |
| `bun-runtime` | Bun 运行时 | Bun JavaScript 运行时 |
| `learned` | 已学习 | 已学到的模式和经验 |

---

## 规则 (Rules) — 16 个目录

### 通用规则 (common/)

| 英文名 | 中文名 | 用途 |
|--------|--------|------|
| `coding-style` | 编码风格 | 不可变性、文件组织、错误处理 |
| `git-workflow` | Git 工作流 | 提交格式、PR 流程 |
| `testing` | 测试要求 | 80% 覆盖率、TDD 方法 |
| `performance` | 性能优化 | 模型选择、上下文窗口管理 |
| `patterns` | 常用模式 | 仓储模式、API 响应格式 |
| `hooks` | 钩子系统 | 自动化触发器配置 |
| `agents` | 代理编排 | 代理使用和并行执行 |
| `security` | 安全指南 | 安全检查、密钥管理 |
| `code-review` | 代码审查 | 审查标准和检查清单 |
| `development-workflow` | 开发工作流 | 完整功能开发管道 |

### 语言专属规则

| 目录名 | 语言 | 包含规则 |
|--------|------|----------|
| `typescript/` | TypeScript | 编码风格、测试、安全、模式、钩子 |
| `python/` | Python | 编码风格、测试、安全、模式、钩子 |
| `golang/` | Go | 编码风格、测试、安全、模式、钩子 |
| `rust/` | Rust | 编码风格、测试、安全、模式、钩子 |
| `java/` | Java | 编码风格、测试、安全、模式、钩子 |
| `kotlin/` | Kotlin | 编码风格、测试、安全、模式、钩子 |
| `swift/` | Swift | 编码风格、测试、安全、模式、钩子 |
| `cpp/` | C++ | 编码风格、测试、安全、模式、钩子 |
| `csharp/` | C# | 编码风格、测试、安全、模式、钩子 |
| `dart/` | Dart | 编码风格、测试、安全、模式、钩子 |
| `perl/` | Perl | 编码风格、测试、安全、模式、钩子 |
| `php/` | PHP | 编码风格、测试、安全、模式、钩子 |
| `web/` | Web 前端 | 编码风格、测试、安全、模式、钩子、性能、设计质量 |
| `zh/` | 中文翻译 | common/ 的中文版本（无需改动） |

---

## 钩子 (Hooks)

| ID | 中文名 | 触发时机 | 用途 |
|----|--------|----------|------|
| `pre:bash:block-no-verify` | 禁止跳过钩子 | Bash 命令前 | 阻止 `--no-verify` 绕过 Git 钩子 |
| `pre:bash:auto-tmux-dev` | 自动启动开发服务 | Bash 命令前 | 在 tmux 中自动启动开发服务器 |
| `pre:bash:tmux-reminder` | tmux 提醒 | Bash 命令前 | 提醒用 tmux 运行长命令 |
| `pre:bash:git-push-reminder` | 推送提醒 | Bash 命令前 | git push 前提醒审查变更 |
| `pre:bash:commit-quality` | 提交质量检查 | Bash 命令前 | 检查 lint、提交格式、console.log、密钥 |
| `pre:write:doc-file-warning` | 文档文件警告 | Write 前 | 警告非标准文档文件 |
| `pre:edit-write:suggest-compact` | 建议压缩 | Edit/Write 前 | 在逻辑节点建议手动压缩上下文 |
| `pre:observe:continuous-learning` | 持续学习观察 | 所有工具前 | 捕获工具使用观察用于持续学习 |
| `pre:insaits-security` | 安全检查 | Bash/Write/Edit 前 | 实时安全扫描 |

---

## 常用命令速查

| 命令 | 中文说明 |
|------|----------|
| `/plan` | 创建实现计划 |
| `/tdd` | 启动 TDD 工作流 |
| `/code-review` | 代码审查 |
| `/build-fix` | 修复构建错误 |
| `/e2e` | 运行 E2E 测试 |
| `/security-scan` | 安全扫描 |
| `/refactor-clean` | 清理死代码 |
| `/orchestrate` | 编排多代理工作流 |
| `/learn` | 持续学习 |
| `/checkpoint` | 创建检查点 |
| `/verify` | 验证实现 |
| `/docs` | 更新文档 |
| `/save-session` | 保存会话 |
| `/resume-session` | 恢复会话 |
| `/context-budget` | 上下文预算管理 |
| `/prompt-optimize` | 优化提示词 |
| `/eval` | 运行评估 |
