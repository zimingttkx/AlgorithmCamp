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

- [ ] 2. 集成测试
  - API 端点测试
  - 数据库操作测试
  - 认证流程测试
  - OAuth 流程测试

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
