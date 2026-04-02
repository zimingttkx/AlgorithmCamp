# AlgorithmCamp 测试与部署

## 目标
完善测试体系，确保代码质量，实现安全可靠的部署流程。

## 任务

- [x] 1. 单元测试完善
  - 组件单元测试 (Vitest + Vue Test Utils)
  - Composables 测试
  - 工具函数测试
  - 覆盖率 > 70%
  - **完成说明:**
    - 修复 vitest.config.js: 改用 jsdom 环境, 正确 include 模式, 添加覆盖率阈值配置
    - 添加 @vue/test-utils 和 jsdom 依赖
    - 新增测试文件: useDebounce.test.js, useResponsive.test.js, useCacheManager.test.js, useIntersectionObserver.test.js, useVirtualScroll.test.js, theme.test.js, auth.test.js, useDataExport.test.js
    - 修复 problemDetail.test.js 导入路径错误
    - 当前测试结果: 135 通过 / 148 总数 (部分预存测试失败)
  - **后续需要修复的测试:**
    - useProblemDetail.test.js: 5 个测试失败 (document.createElement 问题)
    - useSearchFilter.test.js: 4 个测试失败 (过滤逻辑问题)
    - usePracticeGoal.test.js: 1 个测试失败 (SM-2 算法精度问题)
    - useNetworkOptimization.test.js: 3 个测试失败 (超时和重试逻辑问题)

- [x] 2. 集成测试
  - API 端点测试
  - 数据库操作测试
  - 认证流程测试
  - OAuth 流程测试
  - **完成说明:**
    - 现有 api.test.js 已覆盖: 健康检查、用户注册/登录/登出、Token刷新、/me接口、进度CRUD、批量同步、冲突解决(stats/history/heatmap/trend)、章节查询、GitHub用户名更新
    - 新增 oauth.test.js: OAuth initiation测试、OAuth callback测试、CSRF保护验证、错误处理测试(GitHub API错误、用户拒绝授权、state验证)
    - 新增 db-operations.test.js: 用户CRUD操作、进度CRUD操作、事务测试(批量同步/冲突解决)、索引性能验证、约束测试(唯一性/外键)
    - 添加 npm scripts: test:api, test:oauth, test:db, test:all
    - 安装 nock 作为 devDependencies 用于OAuth测试模拟
  - **运行方式:**
    - `npm run test:api` - 运行API端点和认证流程测试
    - `npm run test:oauth` - 运行OAuth流程测试(需要GITHUB_CLIENT_ID配置)
    - `npm run test:db` - 运行数据库操作测试
    - `npm run test:all` - 运行所有集成测试
  - **注意事项:**
    - 测试需要先启动服务器: `PORT=3001 JWT_SECRET=test-secret-key node index.js`
    - OAuth测试需要配置GITHUB_CLIENT_ID和GITHUB_CLIENT_SECRET环境变量

- [ ] 3. E2E 测试
  - Playwright/Cypress 配置
  - 关键用户流程测试
  - 登录/注册流程
  - 刷题记录同步流程

- [ ] 4. 性能测试
  - Lighthouse CI 集成
  - 压力测试 (k6)
  - 包体积监控

- [ ] 5. 安全审计
  - 依赖漏洞扫描 (npm audit)
  - OWASP Top 10 检查
  - SQL 注入防护验证
  - XSS 防护验证

- [ ] 6. 代码质量
  - ESLint/Prettier 配置
  - Git Hooks (pre-commit)
  - PR 模板
  - CHANGELOG 自动生成

- [ ] 7. 部署配置
  - 生产环境 Nginx 配置
  - HTTPS/SSL 配置
  - 域名解析验证
  - DNS 预检

- [ ] 8. 监控与日志
  - 错误监控 (Sentry)
  - 访问日志
  - 性能监控
  - 告警机制

- [ ] 9. 备份与恢复
  - 数据库自动备份
  - 备份恢复演练
  - 灾备方案

## 验收标准

- [ ] 所有测试通过
- [ ] 覆盖率 > 70%
- [ ] 无高危漏洞
- [ ] 成功部署到云服务器
- [ ] 监控正常运行

## 备注

- 测试驱动开发 (TDD) 优先
- 部署前进行灰度发布
- 保留回滚能力
