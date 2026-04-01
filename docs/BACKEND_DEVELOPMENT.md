# AlgorithmCamp 后端开发详细指南

> 创建时间: 2026-04-01
> 状态: 进行中
> 目标: 完成生产级后端架构

---

## 目录

1. [项目概述](#1-项目概述)
2. [当前已实现](#2-当前已实现)
3. [待实现清单](#3-待实现清单)
4. [数据库设计](#4-数据库设计)
5. [API 文档](#5-api-文档)
6. [环境配置](#6-环境配置)
7. [部署指南](#7-部署指南)
8. [测试方案](#8-测试方案)

---

## 1. 项目概述

### 1.1 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 数据库 | PostgreSQL | 生产级关系数据库 |
| 连接池 | pg (node-postgres) | 高效连接管理 |
| 框架 | Express.js | 轻量 Node.js 框架 |
| 认证 | JWT + httpOnly Cookie | 安全令牌存储 |
| 验证 | Zod | Schema 验证 |
| OAuth | GitHub OAuth | 第三方登录 |

### 1.2 目录结构

```
server/
├── index.js                 # Express 入口
├── db/
│   └── index.js           # PostgreSQL 连接池
├── routes/
│   ├── auth.js            # 认证路由
│   ├── progress.js        # 进度路由
│   ├── chapters.js        # 章节路由 (待实现)
│   └── stats.js           # 统计路由 (待实现)
├── middleware/
│   ├── auth.js            # JWT 验证中间件
│   ├── validation.js      # Zod 验证中间件 (待实现)
│   └── logger.js          # 请求日志 (待实现)
├── scripts/
│   ├── migrate-to-postgres.js    # 数据迁移脚本 (待实现)
│   └── fetch-github-stats.js     # GitHub 统计获取
├── ecosystem.config.js     # PM2 配置 (需修复)
├── .env.example           # 环境变量模板
└── package.json
```

---

## 2. 当前已实现

### 2.1 数据库连接 (db/index.js) ✅

```javascript
// 已实现功能:
- pg Pool 连接池 (max: 20)
- all(), get(), run(), getClient(), close() 辅助方法
- 错误处理和连接释放
```

### 2.2 认证路由 (routes/auth.js) ✅

```javascript
// 已实现端点:
POST /api/auth/register     - 用户注册 (用户名密码)
POST /api/auth/login        - 用户登录 (返回 httpOnly cookie)
POST /api/auth/logout       - 登出 (清除 cookie + 撤销 token)
GET  /api/auth/me           - 获取当前用户信息
GET  /api/auth/github       - GitHub OAuth 发起
GET  /api/auth/github/callback - GitHub OAuth 回调
POST /api/auth/refresh      - 刷新 Access Token
PUT  /api/auth/settings     - 更新用户设置

// 已实现功能:
- httpOnly Cookie 存储 Access Token (15min) 和 Refresh Token (7d)
- Refresh Token 轮换机制 (family tracking)
- Token 重用检测 (入侵警报)
- GitHub OAuth 完整流程
- 密码哈希 (bcrypt)
```

### 2.3 进度路由 (routes/progress.js) ✅

```javascript
// 已实现端点:
GET  /api/progress              - 获取用户所有进度
PUT  /api/progress              - 批量同步进度
PUT  /api/progress/:chapterId/:problemId - 单题切换
GET  /api/progress/history      - 进度历史 (cursor 分页)
GET  /api/progress/stats        - 各章节完成统计

// 已实现功能:
- 事务支持 (批量操作原子性)
- Debounced 更新
- Union-based Smart Merge
- Cursor 分页
```

---

## 3. 待实现清单

### 3.1 路由 (routes/)

| 文件 | 端点 | 状态 | 优先级 |
|------|------|------|--------|
| chapters.js | GET /api/chapters | 待实现 | P1 |
| chapters.js | GET /api/chapters/:id | 待实现 | P1 |
| stats.js | GET /api/stats | 待实现 | P2 |
| stats.js | GET /api/stats/calendar | 待实现 | P2 |

### 3.2 中间件 (middleware/)

| 文件 | 功能 | 状态 |
|------|------|------|
| validation.js | Zod Schema 验证 | 待实现 |
| logger.js | 请求日志 (文件 + 控制台) | 待实现 |

### 3.3 脚本 (scripts/)

| 文件 | 功能 | 状态 |
|------|------|------|
| migrate-to-postgres.js | sql.js → PostgreSQL 迁移 | 待实现 |
| fetch-github-stats.js | 更新 GitHub 统计到数据库 | 需检查 |

### 3.4 配置

| 文件 | 问题 | 状态 |
|------|------|------|
| ecosystem.config.js | exec_mode: 'cluster' 应为 'fork' | 需修复 |
| .env.example | 环境变量模板 | 待创建 |
| schema.sql | 数据库初始化 SQL | 待创建 |

---

## 4. 数据库设计

### 4.1 Schema SQL

```sql
-- 文件: server/db/schema.sql

-- 启用 UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    github_id BIGINT UNIQUE,
    github_username VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 用户设置表
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark',
    lang VARCHAR(10) DEFAULT 'zh',
    client_id VARCHAR(100),
    github_username VARCHAR(255),  -- 用于获取 GitHub 统计
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 章节表
CREATE TABLE chapters (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short VARCHAR(255),
    file VARCHAR(255),
    color VARCHAR(7),
    light VARCHAR(7),
    total_problems INTEGER DEFAULT 0,
    sort_order INTEGER
);

-- 进度表 (范式化设计)
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chapter_id VARCHAR(50) REFERENCES chapters(id),
    problem_id VARCHAR(50),
    checked BOOLEAN DEFAULT false,
    checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chapter_id, problem_id)
);

-- 进度历史表 (用于审计和历史追踪)
CREATE TABLE progress_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chapter_id VARCHAR(50),
    problem_id VARCHAR(50),
    checked BOOLEAN,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_id VARCHAR(100)
);

-- GitHub 统计表
CREATE TABLE github_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    github_username VARCHAR(255) NOT NULL,
    total_commits INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    calendar JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Token 表 (支持轮换)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    family VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_progress_user_chapter ON progress(user_id, chapter_id);
CREATE INDEX idx_progress_history_user_time ON progress_history(user_id, changed_at DESC);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family);
CREATE INDEX idx_github_stats_username ON github_stats(github_username);
```

### 4.2 初始化脚本

```javascript
// server/db/init.js
const { readFileSync } = require('fs');
const { Pool } = require('pg');
const { db } = require('./index');

async function initDatabase() {
  const schema = readFileSync('./db/schema.sql', 'utf-8');

  // 使用单独客户端执行事务
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// 填充章节数据 (从现有 CHAPTERS)
const chaptersData = [
  { id: 'chapter-01', title: '排序算法', short: '排序', file: 'docs/chapter-01.md', color: '#6366f1', light: '#818cf8', total_problems: 12, sort_order: 1 },
  // ... 其他 11 个章节
];

async function seedChapters() {
  for (const ch of chaptersData) {
    await db.run(
      `INSERT INTO chapters (id, title, short, file, color, light, total_problems, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [ch.id, ch.title, ch.short, ch.file, ch.color, ch.light, ch.total_problems, ch.sort_order]
    );
  }
}

module.exports = { initDatabase, seedChapters };
```

---

## 5. API 文档

### 5.1 认证端点

#### POST /api/auth/register
注册新用户 (用户名密码备用方式)

**请求体:**
```json
{
  "username": "string (3-50字符)",
  "password": "string (最小8字符)"
}
```

**响应 (201):**
```json
{
  "user": { "id": "uuid", "username": "string" },
  "message": "注册成功"
}
```

**错误 (400):**
```json
{ "error": "用户名已存在" }
```

---

#### POST /api/auth/login
用户登录

**请求体:**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应 (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "avatar_url": "string",
    "github_username": "string"
  }
}
```
*注: Token 通过 httpOnly Cookie 返回*

**Set-Cookie:**
```
accessToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

---

#### POST /api/auth/logout
登出

**响应 (200):**
```json
{ "message": "登出成功" }
```

*注: 清除 cookies + 撤销 refresh token*

---

#### GET /api/auth/github
发起 GitHub OAuth

**重定向:**
```
https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=read:user
```

---

#### GET /api/auth/github/callback
GitHub OAuth 回调

**查询参数:**
```
?code=xxx&state=xxx
```

**处理流程:**
1. 用 code 换取 GitHub access_token
2. 调用 GitHub API 获取用户信息
3. 查询/创建用户
4. 签发 JWT cookies
5. 重定向到前端

**成功重定向:**
```
https://yourdomain.com/#/login?success=1
```

---

#### POST /api/auth/refresh
刷新 Access Token

**请求Cookie:**
```
refreshToken=xxx
```

**响应 (200):**
```json
{
  "user": { "id": "uuid", "username": "string" }
}
```

**Set-Cookie (新 Access Token):**
```
accessToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900
```

**错误 (401):** - Token 被撤销/过期
```json
{ "error": "认证已过期，请重新登录" }
```

---

#### GET /api/auth/me
获取当前用户信息

**请求Cookie:**
```
accessToken=xxx
```

**响应 (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "avatar_url": "string",
    "github_username": "string",
    "settings": {
      "theme": "dark",
      "lang": "zh"
    }
  }
}
```

---

### 5.2 进度端点

#### GET /api/progress
获取用户所有进度

**响应 (200):**
```json
{
  "progress": {
    "chapter-01": {
      "1": true,
      "2": { "checked": true, "checkedAt": "2024-01-15T10:30:00Z" }
    },
    "chapter-02": { "3": true }
  }
}
```

---

#### PUT /api/progress
批量同步进度 (Smart Merge)

**请求体:**
```json
{
  "progress": {
    "chapter-01": {
      "1": { "checked": true, "checkedAt": "2024-01-15T10:30:00Z" }
    }
  },
  "clientId": "device-xxx"
}
```

**响应 (200):**
```json
{
  "progress": {
    "chapter-01": { "1": { "checked": true, "checkedAt": "2024-01-15T10:30:00Z" } }
  },
  "merged": true
}
```

---

#### PUT /api/progress/:chapterId/:problemId
单题切换

**URL参数:**
- `chapterId`: chapter-01
- `problemId`: 1

**请求体:**
```json
{
  "checked": true,
  "clientId": "device-xxx"
}
```

**响应 (200):**
```json
{
  "chapterId": "chapter-01",
  "problemId": "1",
  "checked": true,
  "checkedAt": "2024-01-15T10:30:00Z"
}
```

---

#### GET /api/progress/history
获取进度历史

**查询参数:**
- `cursor`: string (可选，上次的最后 id)
- `limit`: number (默认 20，最大 100)

**响应 (200):**
```json
{
  "history": [
    {
      "id": "uuid",
      "chapterId": "chapter-01",
      "problemId": "1",
      "checked": true,
      "changedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "nextCursor": "uuid-of-last-item",
  "hasMore": true
}
```

---

#### GET /api/progress/stats
获取各章节完成统计

**响应 (200):**
```json
{
  "stats": [
    {
      "chapterId": "chapter-01",
      "title": "排序算法",
      "total": 12,
      "completed": 5,
      "percentage": 42
    }
  ],
  "totalProblems": 150,
  "totalCompleted": 45,
  "overallPercentage": 30
}
```

---

### 5.3 章节端点 (待实现)

#### GET /api/chapters
获取所有章节

**响应 (200):**
```json
{
  "chapters": [
    {
      "id": "chapter-01",
      "title": "排序算法",
      "short": "排序",
      "file": "docs/chapter-01.md",
      "color": "#6366f1",
      "light": "#818cf8",
      "totalProblems": 12
    }
  ]
}
```

---

#### GET /api/chapters/:id
获取单个章节详情

**响应 (200):**
```json
{
  "chapter": {
    "id": "chapter-01",
    "title": "排序算法",
    "short": "排序",
    "file": "docs/chapter-01.md",
    "color": "#6366f1",
    "light": "#818cf8",
    "totalProblems": 12,
    "problems": [
      { "id": "1", "title": "冒泡排序", "difficulty": "easy" },
      { "id": "2", "title": "快速排序", "difficulty": "medium" }
    ]
  }
}
```

---

### 5.4 统计端点 (待实现)

#### GET /api/stats
获取用户 GitHub 统计

**响应 (200):**
```json
{
  "stats": {
    "totalCommits": 1234,
    "currentStreak": 15,
    "longestStreak": 30,
    "calendar": {
      "2024-01-01": 3,
      "2024-01-02": 5
    },
    "level": 5,
    "title": "开发者"
  }
}
```

---

#### GET /api/stats/calendar
获取贡献日历 (用于前端 heatmap)

**响应 (200):**
```json
{
  "calendar": {
    "2024-01": [
      { "date": "2024-01-01", "count": 3, "dayOfWeek": 0 },
      { "date": "2024-01-02", "count": 5, "dayOfWeek": 1 }
    ]
  },
  "totalWeeks": 52,
  "colorScale": ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
}
```

---

## 6. 环境配置

### 6.1 .env.example

```bash
# Server
NODE_ENV=development
PORT=3000
LOG_DIR=./logs

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/algorithmcamp
DB_POOL_MAX=20

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### 6.2 GitHub OAuth App 配置

在 GitHub Settings → Developer settings → OAuth Apps 创建:

| 字段 | 值 |
|------|------|
| Application name | AlgorithmCamp |
| Homepage URL | https://yourdomain.com |
| Authorization callback URL | https://yourdomain.com/api/auth/github/callback |

---

## 7. 部署指南

### 7.1 服务器要求

- Ubuntu 22.04 LTS
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (进程管理)

### 7.2 安装 PostgreSQL

```bash
# 安装
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE algorithmcamp;
CREATE USER appuser WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE algorithmcamp TO appuser;
\c algorithmcamp
GRANT ALL ON SCHEMA public TO appuser;
```

### 7.3 PM2 配置 (ecosystem.config.js)

```javascript
// server/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'algorithmcamp-api',
    script: 'index.js',
    cwd: './server',
    instances: 1,           // 单实例
    exec_mode: 'fork',      // 不是 cluster!
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    time: true
  }]
}
```

### 7.4 Nginx 配置

```nginx
# /etc/nginx/sites-available/algorithmcamp

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # 前端静态文件
    location / {
        root /var/www/algorithmcamp/app/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持 (如有)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 7.5 部署步骤

```bash
# 1. 克隆代码
git clone https://github.com/zimingttkx/AlgorithmCamp.git
cd AlgorithmCamp

# 2. 安装依赖
cd server && npm install
cd ../app && npm install

# 3. 初始化数据库
cd ../server
cp .env.example .env
# 编辑 .env 填入实际值
node db/init.js

# 4. 构建前端
cd ../app
npm run build

# 5. 启动服务
cd ../server
pm2 start ecosystem.config.js
pm2 save

# 6. 配置 Nginx
sudo ln -s /etc/nginx/sites-available/algorithmcamp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. 测试方案

### 8.1 API 测试

```bash
# 启动开发服务器
cd server && npm run dev

# 运行测试 (集成测试)
npm test
```

### 8.2 测试用例清单

| 模块 | 测试内容 | 状态 |
|------|---------|------|
| Auth | 注册/登录/登出 | 待实现 |
| Auth | GitHub OAuth 流程 | 待实现 |
| Auth | Token 刷新/轮换 | 待实现 |
| Auth | Token 过期处理 | 待实现 |
| Progress | CRUD 操作 | 待实现 |
| Progress | Smart Merge | ✅ 已测试 (progressSync.test.js) |
| Chapters | 获取章节列表 | 待实现 |
| Stats | GitHub 统计 | 待实现 |

### 8.3 前端测试

```bash
cd app

# 运行所有测试
npm test

# 运行测试 (监视模式)
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

---

## 9. 开发待办清单

### 今日完成 ✅
- [x] 创建开发指南文档
- [x] 梳理当前已实现功能
- [x] 明确待实现清单

### 明日任务 📋
- [ ] 实现 chapters.js 路由
- [ ] 实现 stats.js 路由
- [ ] 实现 validation.js 中间件
- [ ] 实现 logger.js 中间件
- [ ] 创建 schema.sql 数据库初始化脚本
- [ ] 创建 .env.example
- [ ] 修复 ecosystem.config.js (cluster → fork)
- [ ] 实现 migrate-to-postgres.js 迁移脚本
- [ ] 测试完整 API 流程
- [ ] 更新前端 API 调用代码 (如有需要)

---

## 10. 关键文件路径

| 文件 | 绝对路径 |
|------|---------|
| 后端入口 | `E:/AlgorithmCamp/AlgorithmCamp/server/index.js` |
| 数据库连接 | `E:/AlgorithmCamp/AlgorithmCamp/server/db/index.js` |
| 认证路由 | `E:/AlgorithmCamp/AlgorithmCamp/server/routes/auth.js` |
| 进度路由 | `E:/AlgorithmCamp/AlgorithmCamp/server/routes/progress.js` |
| 前端入口 | `E:/AlgorithmCamp/AlgorithmCamp/app/src/main.js` |
| 前端样式 | `E:/AlgorithmCamp/AlgorithmCamp/app/src/style.css` |
| 开发指南 | `E:/AlgorithmCamp/AlgorithmCamp/docs/BACKEND_DEVELOPMENT.md` |

---

## 11. 联系与支持

如有疑问，请查看:
- 完整架构计划: `C:\Users\Administrator\.claude\plans\twinkly-inventing-blossom.md`
- 项目记忆: `C:\Users\Administrator\.claude\projects\E--AlgorithmCamp-AlgorithmCamp\memory\MEMORY.md`

---

*最后更新: 2026-04-01*
