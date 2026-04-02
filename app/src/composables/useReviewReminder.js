/**
 * Review Reminder Composable
 * Implements SM-2 spaced repetition algorithm for scheduling problem reviews
 *
 * SM-2 Algorithm:
 * - Each problem has: easeFactor, interval, repetitions, nextReviewDate
 * - Quality 0-2: Failed/Forgot (reset repetitions)
 * - Quality 3-5: Solved (advance interval based on ease factor)
 */

import { ref, computed } from 'vue'

const REVIEW_KEY = 'mc-algo-reviews'
const NOTIFICATION_KEY = 'mc-algo-notification-settings'

// SM-2 Algorithm constants
const MIN_EASE_FACTOR = 1.3
const INITIAL_EASE_FACTOR = 2.5
const EASE_BONUS = 0.1
const EASE_PENALTY = 0.2

/**
 * Calculate next review date based on SM-2 algorithm
 * @param {number} quality - 0-5 rating (0-2=failed, 3=solved hard, 4=solved medium, 5=solved easy)
 * @param {number} repetitions - Number of successful reviews
 * @param {number} easeFactor - Current ease factor (difficulty multiplier)
 * @param {number} interval - Current interval in days
 * @returns {object} - New state after review
 */
export function calculateSM2(quality, repetitions, easeFactor, interval) {
  let newRepetitions = repetitions
  let newEaseFactor = easeFactor
  let newInterval = interval

  if (quality < 3) {
    // Failed - reset to beginning
    newRepetitions = 0
    newInterval = 1
  } else {
    // Successful recall
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions += 1

    // Update ease factor based on quality
    newEaseFactor = easeFactor + (EASE_BONUS - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEaseFactor < MIN_EASE_FACTOR) {
      newEaseFactor = MIN_EASE_FACTOR
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: new Date().toISOString()
  }
}

/**
 * Load reviews from localStorage
 */
function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Save reviews to localStorage
 */
function saveReviews(reviews) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews))
}

/**
 * Load notification settings
 */
function loadNotificationSettings() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '{}')
  } catch {
    return { inApp: true, email: false, dailyReminder: true }
  }
}

/**
 * Save notification settings
 */
function saveNotificationSettings(settings) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings))
}

export function useReviewReminder() {
  const reviews = ref(loadReviews())
  const notificationSettings = ref(loadNotificationSettings())
  const showNotification = ref(false)
  const notificationMessage = ref('')

  /**
   * Get review data for a specific problem
   */
  function getReviewData(chapterId, problemId) {
    const chapterReviews = reviews.value[chapterId] || {}
    return chapterReviews[problemId] || null
  }

  /**
   * Check if a problem is due for review
   */
  function isDueForReview(chapterId, problemId) {
    const review = getReviewData(chapterId, problemId)
    if (!review) return false

    const now = new Date()
    const nextReview = new Date(review.nextReviewDate)
    return now >= nextReview
  }

  /**
   * Get all problems due for review across all chapters
   */
  function getDueReviews() {
    const due = []
    const now = new Date()

    for (const [chapterId, problems] of Object.entries(reviews.value)) {
      for (const [problemId, review] of Object.entries(problems)) {
        const nextReview = new Date(review.nextReviewDate)
        if (now >= nextReview) {
          due.push({
            chapterId,
            problemId,
            ...review
          })
        }
      }
    }

    // Sort by most overdue first
    due.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
    return due
  }

  /**
   * Get count of problems due for review
   */
  const dueReviewCount = computed(() => getDueReviews().length)

  /**
   * Get upcoming reviews (next 7 days)
   */
  function getUpcomingReviews() {
    const upcoming = []
    const now = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(now.getDate() + 7)

    for (const [chapterId, problems] of Object.entries(reviews.value)) {
      for (const [problemId, review] of Object.entries(problems)) {
        const nextReview = new Date(review.nextReviewDate)
        if (nextReview > now && nextReview <= weekFromNow) {
          upcoming.push({
            chapterId,
            problemId,
            ...review
          })
        }
      }
    }

    upcoming.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
    return upcoming
  }

  /**
   * Mark a problem as reviewed with quality rating
   * @param {string} chapterId
   * @param {string} problemId
   * @param {number} quality - 0-5 rating (0-2=failed, 3=hard, 4=medium, 5=easy)
   */
  function markReviewed(chapterId, problemId, quality) {
    const current = getReviewData(chapterId, problemId)

    const currentRepetitions = current?.repetitions || 0
    const currentEaseFactor = current?.easeFactor || INITIAL_EASE_FACTOR
    const currentInterval = current?.interval || 0

    const newState = calculateSM2(
      quality,
      currentRepetitions,
      currentEaseFactor,
      currentInterval
    )

    // Initialize chapter if needed
    if (!reviews.value[chapterId]) {
      reviews.value[chapterId] = {}
    }

    // Save review data
    reviews.value[chapterId][problemId] = {
      ...newState,
      quality,
      createdAt: current?.createdAt || new Date().toISOString()
    }

    saveReviews(reviews.value)

    // Show notification for successful review
    if (quality >= 3) {
      showReviewNotification(problemId, newState.interval)
    }

    return newState
  }

  /**
   * Add a problem to the review system (when first solved)
   */
  function addToReview(chapterId, problemId) {
    if (!reviews.value[chapterId]) {
      reviews.value[chapterId] = {}
    }

    reviews.value[chapterId][problemId] = {
      repetitions: 0,
      easeFactor: INITIAL_EASE_FACTOR,
      interval: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewDate: null,
      quality: null,
      createdAt: new Date().toISOString()
    }

    saveReviews(reviews.value)
  }

  /**
   * Remove a problem from the review system
   */
  function removeFromReview(chapterId, problemId) {
    if (reviews.value[chapterId]?.[problemId]) {
      delete reviews.value[chapterId][problemId]
      saveReviews(reviews.value)
    }
  }

  /**
   * Show in-app notification
   */
  function showReviewNotification(problemId, daysUntilReview) {
    if (!notificationSettings.value.inApp) return

    notificationMessage.value = `下次复习: ${daysUntilReview} 天后`
    showNotification.value = true

    // Auto-hide after 3 seconds
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
  }

  /**
   * Update notification settings
   */
  function updateNotificationSettings(newSettings) {
    notificationSettings.value = { ...notificationSettings.value, ...newSettings }
    saveNotificationSettings(notificationSettings.value)
  }

  /**
   * Get review statistics
   */
  function getReviewStats() {
    const allReviews = []
    for (const [chapterId, problems] of Object.entries(reviews.value)) {
      for (const [problemId, review] of Object.entries(problems)) {
        allReviews.push({
          chapterId,
          problemId,
          ...review
        })
      }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return {
      totalTracked: allReviews.length,
      dueToday: allReviews.filter(r => {
        const reviewDate = new Date(r.nextReviewDate)
        const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate())
        return reviewDay.getTime() === today.getTime()
      }).length,
      overdue: allReviews.filter(r => new Date(r.nextReviewDate) < now).length,
      upcoming: allReviews.filter(r => new Date(r.nextReviewDate) > now).length,
      averageEaseFactor: allReviews.length > 0
        ? Math.round(allReviews.reduce((sum, r) => sum + r.easeFactor, 0) / allReviews.length * 100) / 100
        : INITIAL_EASE_FACTOR
    }
  }

  /**
   * Get mastery level for a problem
   */
  function getMasteryLevel(chapterId, problemId) {
    const review = getReviewData(chapterId, problemId)
    if (!review) return 0

    // Mastery levels based on repetitions
    if (review.repetitions >= 5) return 5 // Expert
    if (review.repetitions >= 4) return 4 // Advanced
    if (review.repetitions >= 3) return 3 // Intermediate
    if (review.repetitions >= 2) return 2 // Basic
    if (review.repetitions >= 1) return 1 // Learning
    return 0 // New
  }

  /**
   * Get mastery label
   */
  function getMasteryLabel(level) {
    const labels = ['新题', '学习中', '基础', '中级', '高级', '专家']
    return labels[level] || labels[0]
  }

  return {
    reviews,
    notificationSettings,
    showNotification,
    notificationMessage,
    dueReviewCount,
    getReviewData,
    isDueForReview,
    getDueReviews,
    getUpcomingReviews,
    markReviewed,
    addToReview,
    removeFromReview,
    showReviewNotification,
    updateNotificationSettings,
    getReviewStats,
    getMasteryLevel,
    getMasteryLabel
  }
}