# AlgorithmCamp GitHub OAuth 与用户系统完善

## 目标
完善 GitHub OAuth 登录流程，优化 Token 管理，增强用户刷题进度同步功能。

## 任务

- [x] 1. 完善 GitHub OAuth 回调处理
  - 添加 state 参数防止 CSRF 攻击
  - 实现错误处理和用户友好的错误页面
  - 添加 OAuth 回调日志记录

  **完成说明:**
  - 在 `GET /api/auth/github` 端点生成 32 字节随机 state 参数
  - 使用 HMAC-SHA256 对 state 签名（结合 IP 和 User-Agent）存储在 httpOnly cookie
  - 回调时验证 state 值和签名，双重 CSRF 防护
  - 所有 OAuth 步骤添加详细日志记录（ initiator IP、token 交换、用户创建/链接等）
  - 错误重定向携带详细 reason 参数供前端展示
  - 已提交: `MAESTRO: Enhance GitHub OAuth with CSRF protection and logging` (be1c4cf)

- [x] 2. 优化 Token 管理
  - 验证现有 JWT + Refresh Token 流程 ✅ (已存在)
  - 添加 Token 过期前自动刷新逻辑 ✅
    - 新增 `GET /api/auth/token-status` 端点，返回 token 剩余时间和是否需要刷新
    - 前端 auth composable 新增 `checkAndRefreshToken()`、`refreshTokens()`、`startTokenRefreshTimer()`、`stopTokenRefreshTimer()` 函数
    - 启动定时器每 60 秒检查一次，token 剩余时间 < 5 分钟时自动刷新
  - 添加 Refresh Token 垃圾回收机制 ✅
    - 新增 `cleanupExpiredTokens()` 函数，删除过期超过 7 天的 refresh tokens
    - 服务器启动时自动运行 GC，并每 24 小时定时执行
    - 新增 `POST /api/auth/cleanup` 管理员手动清理端点

  **完成说明:**
  - Token 状态端点返回详细的过期时间信息供前端判断
  - 前端会在 token 即将过期时自动刷新，无需用户操作
  - GC 保留 7 天内的 token 用于审计追溯

- [x] 3. 实现用户刷题进度同步
  - 创建 `POST /api/progress/sync` 接口
  - 支持批量上传本地刷题进度到服务器
  - 实现冲突检测（以服务器时间戳为准）
  - 支持增量同步

  **完成说明:**
  - 新增 `POST /api/progress/sync` 端点，接受批量进度项
  - 每项包含 `chapterId`, `problemId`, `checked`, `clientTimestamp`
  - 冲突检测：比较客户端时间戳与服务器时间戳，服务器胜出
  - 记录所有冲突并返回解决结果供客户端知晓
  - 支持增量同步：仅同步变化的项
  - 事务处理确保数据一致性
  - 返回详细的同步统计（更新数、冲突数、跳过数）
  - 测试已添加至 `tests/api.test.js`

- [x] 4. 实现 LeetCode 进度导入
  - 添加 `GET /api/progress/import?username=xxx` 接口
  - 爬取 LeetCode 用户解题记录
  - 自动映射到对应章节
  - 处理 API 限流

  **完成说明:**
  - 新增 `GET /api/progress/import` 端点，接受 LeetCode 用户名参数
  - 使用 LeetCode GraphQL API (`acSubmissionList`) 获取用户解题记录
  - 反向查询 `slug_map.json` 将 LeetCode titleSlug 映射到问题 ID
  - 实现 API 限流机制：每秒最多 1 次请求，遇到 429 时等待 5 秒重试
  - 支持分页获取最多 100 页解题记录（安全限制防止无限循环）
  - 自动去重：同一题目保留最新提交记录
  - 事务处理确保数据一致性
  - 返回详细的导入统计（导入数、跳过数、未找到数）
  - 输入验证：检查用户名格式防止 XSS 攻击
  - 测试用例已添加至 `tests/api.test.js`

- [ ] 5. 完善用户设置
  - 主题偏好 (dark/light)
  - 语言偏好 (zh/en)
  - 刷题目标设置
  - 通知设置

- [ ] 6. 添加 LeetCode API 路由
  - `GET /api/leetcode/:username` 获取用户 LeetCode 统计
  - `GET /api/leetcode/:username/solved` 获取已解题列表
  - 缓存机制（1小时刷新）

- [ ] 7. 完善用户数据面板 API
  - 总解题数统计
  - 各类目完成度
  - 刷题日历热力图数据
  - 刷题趋势图数据

## 验收标准

- [ ] GitHub OAuth 登录流程完整且安全
- [ ] 刷题进度可在多设备间同步
- [ ] LeetCode 用户名可导入解题记录
- [ ] Token 自动刷新正常工作
- [ ] API 响应时间 < 200ms

## 备注

- LeetCode API 注意遵守其 robots.txt 和使用条款
- 考虑添加 LeetCode CN 支持
- 考虑添加牛客网等国内平台支持
