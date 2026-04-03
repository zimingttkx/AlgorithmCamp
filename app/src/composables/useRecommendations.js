/**
 * Recommendation Composable
 * Smart problem recommendation based on chapters, difficulty, and forgetting curve
 *
 * Features:
 * - Chapter-based recommendation: prioritize partially completed chapters
 * - Difficulty-based recommendation: recommend based on user skill level
 * - Forgetting curve review: SM-2 algorithm for spaced repetition
 * - Multi-factor scoring for problem priority
 */

import { ref, computed } from 'vue'
import { CHAPTERS } from './data.js'

const REVIEW_KEY = 'mc-algo-reviews'
const SETTINGS_KEY = 'mc-algo-recommend-settings'

// Default interval multipliers for SM-2 (in days)
const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

// Singleton state
const recommendationSettings = ref(loadSettings())
const reviewData = ref(loadReviewData())

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return { dailyGoal: 5, preferDifficulty: 'medium' }
  }
}

function loadReviewData() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(recommendationSettings.value))
}

function saveReviewData() {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(reviewData.value))
}

export function useRecommendations() {

  /**
   * Get user's solved problems with their ratings
   */
  function getSolvedProblemsWithRating(progress, mdCache) {
    const solved = []
    for (const [chapterId, problems] of Object.entries(progress)) {
      const chapter = CHAPTERS.find(c => c.id === chapterId)
      if (!chapter) continue

      const sections = mdCache[chapterId]
      if (!sections) continue

      // Build problem lookup
      const problemMap = {}
      for (const sec of sections) {
        for (const row of sec.rows || []) {
          problemMap[row.probId] = row
        }
      }

      for (const [probId, status] of Object.entries(problems)) {
        if (status && status.checked) {
          const prob = problemMap[probId]
          if (prob) {
            solved.push({
              chapterId,
              chapterTitle: chapter.title,
              probId,
              num: prob.num,
              title: prob.title,
              url: prob.url,
              rating: prob.rating,
              solvedAt: status.checkedAt || null,
              source: status.source || 'local'
            })
          }
        }
      }
    }
    return solved
  }

  /**
   * Calculate user's average rating (skill level)
   */
  function calculateSkillLevel(solvedProblems) {
    const rated = solvedProblems.filter(p => p.rating && p.rating !== '—' && !p.isMember)
    if (rated.length === 0) return 1400 // Default beginner level

    const sum = rated.reduce((acc, p) => acc + parseInt(p.rating), 0)
    return Math.round(sum / rated.length)
  }

  /**
   * Get user's proficiency by chapter
   */
  function getChapterProficiency(progress, mdCache) {
    const proficiency = {}
    for (const ch of CHAPTERS) {
      const sections = mdCache[ch.id]
      if (!sections) {
        proficiency[ch.id] = { attempted: 0, solved: 0, avgRating: 0 }
        continue
      }

      let attempted = 0, solved = 0, ratingSum = 0, ratingCount = 0

      for (const sec of sections) {
        for (const row of sec.rows || []) {
          if (row.isMember) continue
          attempted++
          const isSolved = progress[ch.id]?.[row.probId]?.checked
          if (isSolved) {
            solved++
            if (row.rating && row.rating !== '—') {
              ratingSum += parseInt(row.rating)
              ratingCount++
            }
          }
        }
      }

      proficiency[ch.id] = {
        attempted,
        solved,
        avgRating: ratingCount > 0 ? Math.round(ratingSum / ratingCount) : 0
      }
    }
    return proficiency
  }

  /**
   * Get chapter-based recommendations
   * Prioritize partially completed chapters
   */
  function getChapterRecommendations(progress, mdCache, limit = 10) {
    const recommendations = []
    const proficiency = getChapterProficiency(progress, mdCache)
    const solved = getSolvedProblemsWithRating(progress, mdCache)
    const skillLevel = calculateSkillLevel(solved)

    // Score chapters: prefer partially completed (more than 20% but less than 100%)
    for (const ch of CHAPTERS) {
      const prof = proficiency[ch.id]
      if (!prof || prof.attempted === 0) continue

      const completionRate = prof.solved / prof.attempted
      if (completionRate >= 1 || completionRate < 0.2) continue // Skip completed or not started

      const sections = mdCache[ch.id]
      if (!sections) continue

      // Find unsolved problems in this chapter
      for (const sec of sections) {
        for (const row of sec.rows || []) {
          if (row.isMember) continue
          if (progress[ch.id]?.[row.probId]?.checked) continue

          // Calculate priority score
          const baseScore = 50 + completionRate * 50 // 50-100 based on chapter progress
          // Difficulty bonus: reward problems that are slightly above user's skill level
          const difficultyBonus = row.rating && row.rating !== '—'
            ? Math.max(0, 30 - Math.abs(parseInt(row.rating) - (skillLevel + 200)) / 20)
            : 15

          recommendations.push({
            ...row,
            chapterId: ch.id,
            chapterTitle: ch.title,
            chapterColor: ch.color,
            reason: `章节「${ch.short}」进度 ${Math.round(completionRate * 100)}%`,
            priority: baseScore + difficultyBonus,
            algorithm: 'chapter'
          })
        }
      }
    }

    // Sort by priority and return top N
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  }

  /**
   * Get difficulty-based recommendations
   * Recommend problems slightly above current skill level
   */
  function getDifficultyRecommendations(progress, mdCache, limit = 10) {
    const solved = getSolvedProblemsWithRating(progress, mdCache)
    const skillLevel = calculateSkillLevel(solved)
    const recommendations = []

    // Target: problems rated 100-300 points above skill level
    const minTarget = skillLevel - 100
    const maxTarget = skillLevel + 300

    for (const ch of CHAPTERS) {
      const sections = mdCache[ch.id]
      if (!sections) continue

      for (const sec of sections) {
        for (const row of sec.rows || []) {
          if (row.isMember) continue
          if (progress[ch.id]?.[row.probId]?.checked) continue
          if (!row.rating || row.rating === '—') continue

          const rating = parseInt(row.rating)
          if (rating < minTarget || rating > maxTarget + 200) continue

          // Score based on how close to optimal difficulty
          const optimalDiff = 200 // Target: 200 points above skill
          const diffFromOptimal = Math.abs(rating - skillLevel - optimalDiff)
          const priority = Math.max(0, 100 - diffFromOptimal / 5)

          if (priority > 20) {
            recommendations.push({
              ...row,
              chapterId: ch.id,
              chapterTitle: ch.title,
              chapterColor: ch.color,
              reason: `难度匹配 (Rating ${rating} vs 你的水平 ~${skillLevel})`,
              priority,
              algorithm: 'difficulty'
            })
          }
        }
      }
    }

    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  }

  /**
   * SM-2 Algorithm: Calculate next review date
   * https://en.wikipedia.org/wiki/SuperMemo_2
   */
  function calculateSM2(quality, previousInterval, previousEaseFactor, repetitionCount) {
    // Quality: 0-5 (0-2 = fail, 3-5 = pass)
    // For our use: 3 = correct with difficulty, 4 = easy, 5 = very easy

    let newEaseFactor = previousEaseFactor
    let newInterval = 1
    let newRepetition = repetitionCount

    if (quality < 3) {
      // Failed - reset
      newRepetition = 0
      newInterval = 1
    } else {
      // Passed
      if (repetitionCount === 0) {
        newInterval = 1
      } else if (repetitionCount === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(previousInterval * newEaseFactor)
      }
      newRepetition = repetitionCount + 1

      // Update ease factor
      newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor)
    }

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetition: newRepetition,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  /**
   * Update review data for a problem after practice
   */
  function updateReview(problemKey, quality) {
    if (!reviewData.value[problemKey]) {
      reviewData.value[problemKey] = {
        easeFactor: DEFAULT_EASE_FACTOR,
        interval: 0,
        repetition: 0,
        nextReview: new Date().toISOString(),
        lastReview: null
      }
    }

    const current = reviewData.value[problemKey]
    const updated = calculateSM2(quality, current.interval, current.easeFactor, current.repetition)

    reviewData.value[problemKey] = {
      ...current,
      ...updated,
      lastReview: new Date().toISOString()
    }

    saveReviewData()
  }

  /**
   * Get problems due for review (forgetting curve)
   */
  function getReviewRecommendations(progress, mdCache, limit = 10) {
    const now = new Date()
    const due = []

    for (const [problemKey, review] of Object.entries(reviewData.value)) {
      const [chapterId, probId] = problemKey.split('::')
      if (!progress[chapterId]?.[probId]?.checked) continue

      const nextReview = new Date(review.nextReview)
      if (nextReview <= now) {
        // Find problem details
        let probInfo = null
        for (const ch of CHAPTERS) {
          if (ch.id !== chapterId) continue
          const sections = mdCache[ch.id]
          if (!sections) continue
          for (const sec of sections) {
            for (const row of sec.rows || []) {
              if (row.probId === probId) {
                probInfo = row
                break
              }
            }
            if (probInfo) break
          }
          if (probInfo) break
        }

        if (probInfo) {
          const daysOverdue = Math.floor((now - nextReview) / (24 * 60 * 60 * 1000))
          due.push({
            ...probInfo,
            chapterId,
            chapterTitle: CHAPTERS.find(c => c.id === chapterId)?.title || '',
            chapterColor: CHAPTERS.find(c => c.id === chapterId)?.color || '#666',
            reason: daysOverdue > 0 ? `逾期 ${daysOverdue} 天需要复习` : '今日复习',
            priority: 80 + Math.min(daysOverdue * 5, 20),
            algorithm: 'forgetting',
            daysOverdue
          })
        }
      }
    }

    return due
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, limit)
  }

  /**
   * Get combined recommendations with all algorithms
   */
  function getCombinedRecommendations(progress, mdCache, limit = 15) {
    const chapterRecs = getChapterRecommendations(progress, mdCache, limit)
    const difficultyRecs = getDifficultyRecommendations(progress, mdCache, limit)
    const reviewRecs = getReviewRecommendations(progress, mdCache, Math.floor(limit / 3))

    // Merge and deduplicate
    const seen = new Set()
    const merged = [...reviewRecs, ...chapterRecs, ...difficultyRecs]
      .filter(rec => {
        const key = `${rec.chapterId}::${rec.probId}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)

    return merged
  }

  /**
   * Get recommendation explanation text
   */
  function getRecommendationExplanation() {
    return {
      chapter: {
        title: '章节推荐算法',
        icon: '📚',
        description: '优先推荐已完成 20%-100% 的章节中的未做题。这样可以保持学习的连续性，在某个领域达到一定熟练度后再转向新领域。',
        factors: [
          '章节完成度 (20%-100%)',
          '题目难度匹配度',
          '章节内题目连贯性'
        ]
      },
      difficulty: {
        title: '难度推荐算法',
        icon: '🎯',
        description: '根据你已经解决的题目 Rating，计算你的当前水平，推荐难度略高于你实力的题目（+100~+300分）。这样既能巩固已学，又能适当挑战提升。',
        factors: [
          '已解题目的平均难度 Rating',
          '目标难度 = 水平 + 200',
          '跳过太难或太简单的题目'
        ]
      },
      forgetting: {
        title: '遗忘曲线复习 (SM-2)',
        icon: '🧠',
        description: '基于 SuperMemo SM-2 间隔重复算法，在你即将遗忘时提醒复习。每次练习后算法会自动调整下次复习间隔，帮助你长期记忆。',
        factors: [
          'SM-2 间隔重复算法',
          '根据答题质量调整间隔',
          ' easeFactor 难度系数 (最低 1.3)'
        ],
        formula: '间隔 = 上次间隔 × easeFactor'
      }
    }
  }

  /**
   * Get user's learning statistics
   */
  function getLearningStats(progress, mdCache) {
    const solved = getSolvedProblemsWithRating(progress, mdCache)
    const skillLevel = calculateSkillLevel(solved)
    const proficiency = getChapterProficiency(progress, mdCache)

    const stats = {
      totalSolved: solved.length,
      skillLevel,
      skillLevelLabel: skillLevel < 1400 ? '初学者' :
                       skillLevel < 1600 ? '入门' :
                       skillLevel < 1800 ? '中等' :
                       skillLevel < 2000 ? '熟练' : '高手',
      chapterStats: [],
      reviewDue: getReviewRecommendations(progress, mdCache, 100).length
    }

    for (const ch of CHAPTERS) {
      const prof = proficiency[ch.id]
      stats.chapterStats.push({
        id: ch.id,
        title: ch.short,
        color: ch.color,
        ...prof
      })
    }

    return stats
  }

  /**
   * Settings management
   */
  function updateSettings(newSettings) {
    recommendationSettings.value = { ...recommendationSettings.value, ...newSettings }
    saveSettings()
  }

  return {
    // Data
    recommendationSettings,
    reviewData,

    // Algorithms
    getSolvedProblemsWithRating,
    calculateSkillLevel,
    getChapterProficiency,
    getChapterRecommendations,
    getDifficultyRecommendations,
    getReviewRecommendations,
    getCombinedRecommendations,
    getLearningStats,
    updateReview,
    calculateSM2,

    // Info
    getRecommendationExplanation
  }
}