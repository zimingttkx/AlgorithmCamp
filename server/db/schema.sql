-- AlgorithmCamp PostgreSQL Schema
-- Run this once to set up the database

-- Create database (run as superuser)
-- CREATE DATABASE algorithmcamp;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE COLLATE "C",
  password_hash TEXT,
  github_id     BIGINT UNIQUE,
  github_login  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login    TIMESTAMPTZ
);

-- Progress table (normalized, not JSON)
CREATE TABLE IF NOT EXISTS progress (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id  TEXT NOT NULL,
  problem_id  TEXT NOT NULL,
  checked     BOOLEAN NOT NULL DEFAULT FALSE,
  checked_at  TIMESTAMPTZ,
  UNIQUE(user_id, chapter_id, problem_id)
);

-- Progress history for conflict tracking
CREATE TABLE IF NOT EXISTS progress_history (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id  TEXT NOT NULL,
  problem_id  TEXT NOT NULL,
  checked     BOOLEAN NOT NULL,
  changed_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  client_id   TEXT NOT NULL
);

-- GitHub stats
CREATE TABLE IF NOT EXISTS github_stats (
  user_id         BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  total_commits   INTEGER DEFAULT 0,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  calendar        JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id   BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme     TEXT DEFAULT 'dark',
  lang      TEXT DEFAULT 'zh',
  client_id TEXT NOT NULL
);

-- Chapters (seed data)
CREATE TABLE IF NOT EXISTS chapters (
  id             TEXT PRIMARY KEY,
  title          TEXT,
  short          TEXT,
  file           TEXT,
  color          TEXT,
  light          TEXT,
  total_problems INTEGER DEFAULT 0
);

-- Refresh tokens with family support for rotation detection
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  family      TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_chapter ON progress(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON progress_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_time ON progress_history(user_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(user_id, family);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Seed chapters
INSERT INTO chapters (id, title, short, file, color, light, total_problems) VALUES
  ('chapter-01', '滑动窗口与双指针', '滑动窗口', 'docs/chapter-01.md', '#3a8a2a', '#7cc427', 0),
  ('chapter-02', '模拟与枚举', '模拟枚举', 'docs/chapter-02.md', '#2a6a8a', '#4a9ac4', 0),
  ('chapter-03', '栈与队列', '栈与队列', 'docs/chapter-03.md', '#8a2a6a', '#c44a9a', 0),
  ('chapter-04', '哈希表', '哈希表', 'docs/chapter-04.md', '#8a6a2a', '#c49a4a', 0),
  ('chapter-05', '二叉树', '二叉树', 'docs/chapter-05.md', '#2a8a6a', '#4ac49a', 0),
  ('chapter-06', '二叉搜索树', '二叉搜索树', 'docs/chapter-06.md', '#6a2a8a', '#9a4ac4', 0),
  ('chapter-07', '图论基础', '图论基础', 'docs/chapter-07.md', '#8a3a2a', '#c46a4a', 0),
  ('chapter-08', '动态规划', '动态规划', 'docs/chapter-08.md', '#3a2a8a', '#6a4ac4', 0),
  ('chapter-09', '回溯与深搜', '回溯深搜', 'docs/chapter-09.md', '#2a8a3a', '#4ac46a', 0),
  ('chapter-10', '贪心', '贪心', 'docs/chapter-10.md', '#8a8a2a', '#c4c44a', 0),
  ('chapter-11', '分治与递归', '分治递归', 'docs/chapter-11.md', '#2a3a8a', '#4a6ac4', 0),
  ('chapter-12', '字符串', '字符串', 'docs/chapter-12.md', '#8a2a3a', '#c44a6a', 0)
ON CONFLICT (id) DO NOTHING;
