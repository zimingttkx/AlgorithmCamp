/**
 * GitHub Stats & Level System Configuration
 * ──────────────────────────────────────────────
 * 经验值体系：每次 Commit = XP_PER_COMMIT 点经验值
 * 等级体系：可自由配置等级名称、经验阈值
 */

/* ── 可配置项 ── */
export const CONFIG = {
  // GitHub 用户名
  githubUser: 'zimingttkx',

  // 每次 Commit 获得的经验值
  xpPerCommit: 10,

  // 数据文件路径（GitHub Actions 生成）
  statsFile: 'stats.json',

  // 前端缓存时间（毫秒），避免频繁请求
  cacheTTL: 30 * 60 * 1000, // 30 分钟

  // 等级体系配置
  levels: [
    { level: 1,  title: '新手',  titleEn: 'Novice',       xpRequired: 0,      icon: '☆' },
    { level: 2,  title: '学徒',  titleEn: 'Apprentice',   xpRequired: 100,    icon: '★' },
    { level: 3,  title: '码农',  titleEn: 'Coder',        xpRequired: 300,    icon: '★' },
    { level: 4,  title: '开发者', titleEn: 'Developer',    xpRequired: 700,    icon: '★★' },
    { level: 5,  title: '工程师', titleEn: 'Engineer',     xpRequired: 1500,   icon: '★★' },
    { level: 6,  title: '⚒',  titleEn: '⚒',           xpRequired: 3000,   icon: '★★★' },
    { level: 7,  title: '专家',  titleEn: 'Expert',       xpRequired: 6000,   icon: '★★★' },
    { level: 8,  title: '大师',  titleEn: 'Master',       xpRequired: 10000,  icon: '★★★★' },
    { level: 9,  title: '宗师',  titleEn: 'Grandmaster',  xpRequired: 20000,  icon: '★★★★' },
    { level: 10, title: '传奇',  titleEn: 'Legend',       xpRequired: 50000,  icon: '★★★★★' },
  ],

  // 贡献日历颜色（从浅到深）
  calendarColors: [
    'var(--bg-panel)',   // 0 commits
    '#0c4a6e',           // 1-2 commits
    '#0369a1',           // 3-5 commits
    '#0284c7',           // 6-9 commits
    '#0EA5E9',           // 10+ commits
  ],

  // 连续打卡奖励（额外XP倍率）
  streakBonus: {
    7: 1.2,    // 连续7天 +20%
    30: 1.5,   // 连续30天 +50%
    100: 2.0,  // 连续100天 +100%
  }
}

/**
 * 根据总经验值计算当前等级信息
 */
export function calcLevel(totalXP) {
  const levels = CONFIG.levels
  let current = levels[0]
  let next = levels[1] || null

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].xpRequired) {
      current = levels[i]
      next = levels[i + 1] || null
      break
    }
  }

  const currentLevelXP = current.xpRequired
  const nextLevelXP = next ? next.xpRequired : current.xpRequired
  const xpInLevel = totalXP - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  const progress = next ? Math.min(100, Math.round(xpInLevel / xpNeeded * 100)) : 100

  return {
    level: current.level,
    title: current.title,
    titleEn: current.titleEn,
    icon: current.icon,
    totalXP,
    currentLevelXP,
    nextLevelXP,
    xpInLevel,
    xpNeeded,
    progress,
    isMaxLevel: !next,
  }
}

/**
 * 计算连续打卡天数
 */
export function calcStreak(calendar) {
  if (!calendar) return { current: 0, longest: 0 }

  const dates = Object.keys(calendar).sort().reverse()
  if (dates.length === 0) return { current: 0, longest: 0 }

  // 当前连续天数
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let checkDate = new Date(today)
  // 如果今天没提交，从昨天开始算
  const todayStr = formatDate(checkDate)
  if (!calendar[todayStr] || calendar[todayStr] === 0) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const dateStr = formatDate(checkDate)
    if (calendar[dateStr] && calendar[dateStr] > 0) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // 最长连续天数
  let longestStreak = 0
  let tempStreak = 0
  const sortedDates = Object.keys(calendar).sort()
  for (const date of sortedDates) {
    if (calendar[date] > 0) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return { current: currentStreak, longest: longestStreak }
}

/**
 * 获取贡献日历数据（近52周）
 */
export function getCalendarWeeks(calendar) {
  const weeks = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 找到本周日
  const dayOfWeek = today.getDay()
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek))

  // 往前推52周
  const startDate = new Date(endOfWeek)
  startDate.setDate(startDate.getDate() - (52 * 7 + 6))

  let currentWeek = []
  let d = new Date(startDate)

  while (d <= endOfWeek) {
    const dateStr = formatDate(d)
    currentWeek.push({
      date: dateStr,
      count: calendar?.[dateStr] || 0,
      dayOfWeek: d.getDay(),
    })
    if (d.getDay() === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    d.setDate(d.getDate() + 1)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

/**
 * 获取颜色等级
 */
export function getCommitColor(count) {
  const colors = CONFIG.calendarColors
  if (count === 0) return colors[0]
  if (count <= 2) return colors[1]
  if (count <= 5) return colors[2]
  if (count <= 9) return colors[3]
  return colors[4]
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
