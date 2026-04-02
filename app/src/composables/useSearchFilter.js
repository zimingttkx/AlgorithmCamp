/**
 * Search Filter Composable
 * Provides search and filter functionality for problems
 */

import { ref, computed } from 'vue'
import { CHAPTERS } from './data.js'

const DIFFICULTY_LEVELS = {
  NONE: 'none',
  LOW: 'low',      // < 1600
  MED: 'med',      // 1600-1999
  HIGH: 'high'     // >= 2000
}

const STATUS_FILTERS = {
  ALL: 'all',
  NOT_STARTED: 'not_started',  // 未做
  DONE: 'done',                // 已做
  REVIEW: 'review'              // 复习中
}

export function useSearchFilter() {
  // Search and filter state
  const searchQuery = ref('')
  const difficultyFilter = ref(DIFFICULTY_LEVELS.NONE)
  const statusFilter = ref(STATUS_FILTERS.ALL)
  const chapterFilter = ref(null) // null means all chapters

  /**
   * Get difficulty level from rating string
   */
  function getDifficultyLevel(rating) {
    if (!rating || rating === '—') return DIFFICULTY_LEVELS.NONE
    const n = parseInt(rating)
    if (isNaN(n)) return DIFFICULTY_LEVELS.NONE
    if (n < 1600) return DIFFICULTY_LEVELS.LOW
    if (n < 2000) return DIFFICULTY_LEVELS.MED
    return DIFFICULTY_LEVELS.HIGH
  }

  /**
   * Check if a problem matches the search query
   */
  function matchesSearch(problem, query) {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      problem.title.toLowerCase().includes(q) ||
      problem.num.toLowerCase().includes(q) ||
      problem.probId.toLowerCase().includes(q)
    )
  }

  /**
   * Check if a problem matches the difficulty filter
   */
  function matchesDifficulty(problem, filter) {
    if (filter === DIFFICULTY_LEVELS.NONE) return true
    return getDifficultyLevel(problem.rating) === filter
  }

  /**
   * Check if a problem matches the status filter
   * @param {object} problem - The problem object
   * @param {string} chapterId - The chapter ID
   * @param {object} progress - Progress data { chapterId: { probId: { checked: boolean } } }
   * @param {object} reviews - Review data { chapterId: { probId: reviewData } }
   * @param {string} filter - Status filter value
   */
  function matchesStatus(problem, chapterId, progress, reviews, filter) {
    if (filter === STATUS_FILTERS.ALL) return true

    const chapterProgress = progress?.[chapterId]
    const isChecked = chapterProgress?.[problem.probId]?.checked ||
                      chapterProgress?.[problem.probId] === true
    const hasReview = reviews?.[chapterId]?.[problem.probId]

    switch (filter) {
      case STATUS_FILTERS.NOT_STARTED:
        return !isChecked
      case STATUS_FILTERS.DONE:
        return isChecked && !hasReview
      case STATUS_FILTERS.REVIEW:
        return hasReview
      default:
        return true
    }
  }

  /**
   * Check if a problem matches the chapter filter
   */
  function matchesChapter(chapterId, filter) {
    if (!filter) return true
    return chapterId === filter
  }

  /**
   * Filter problems across all chapters
   * @param {object} mdCache - Cache of parsed markdown { chapterId: sections[] }
   * @param {object} progress - Progress data
   * @param {object} reviews - Review data
   * @returns {array} - Filtered problems with chapter info
   */
  function filterProblems(mdCache, progress, reviews) {
    const results = []
    const query = searchQuery.value.trim().toLowerCase()
    const diffFilter = difficultyFilter.value
    const statFilter = statusFilter.value
    const chFilter = chapterFilter.value

    for (const chapter of CHAPTERS) {
      const sections = mdCache[chapter.id]
      if (!sections) continue

      // Skip if chapter filter is set and doesn't match
      if (!matchesChapter(chapter.id, chFilter)) continue

      for (const section of sections) {
        for (const problem of section.rows) {
          // Apply search query
          if (!matchesSearch(problem, query)) continue

          // Apply difficulty filter
          if (!matchesDifficulty(problem, diffFilter)) continue

          // Apply status filter
          if (!matchesStatus(problem, chapter.id, progress, reviews, statFilter)) continue

          results.push({
            ...problem,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sectionH2: section.h2,
            sectionH3: section.h3
          })
        }
      }
    }

    return results
  }

  /**
   * Filter problems for a specific chapter
   * @param {string} chapterId - Chapter ID
   * @param {array} sections - Parsed sections from markdown
   * @param {object} progress - Progress data
   * @param {object} reviews - Review data
   * @returns {array} - Filtered sections with problems
   */
  function filterChapterProblems(chapterId, sections, progress, reviews) {
    if (!sections) return []

    const query = searchQuery.value.trim().toLowerCase()
    const diffFilter = difficultyFilter.value
    const statFilter = statusFilter.value

    // If no filters are active, return all sections as-is
    if (!query && diffFilter === DIFFICULTY_LEVELS.NONE && statFilter === STATUS_FILTERS.ALL) {
      return sections
    }

    const filteredSections = []

    for (const section of sections) {
      const filteredRows = section.rows.filter(problem => {
        // Apply search query
        if (!matchesSearch(problem, query)) return false

        // Apply difficulty filter
        if (!matchesDifficulty(problem, diffFilter)) return false

        // Apply status filter
        if (!matchesStatus(problem, chapterId, progress, reviews, statFilter)) return false

        return true
      })

      if (filteredRows.length > 0) {
        filteredSections.push({
          ...section,
          rows: filteredRows
        })
      }
    }

    return filteredSections
  }

  /**
   * Get count of filtered problems
   */
  function getFilteredCount(mdCache, progress, reviews) {
    return filterProblems(mdCache, progress, reviews).length
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    searchQuery.value = ''
    difficultyFilter.value = DIFFICULTY_LEVELS.NONE
    statusFilter.value = STATUS_FILTERS.ALL
    chapterFilter.value = null
  }

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return (
      searchQuery.value.trim() !== '' ||
      difficultyFilter.value !== DIFFICULTY_LEVELS.NONE ||
      statusFilter.value !== STATUS_FILTERS.ALL ||
      chapterFilter.value !== null
    )
  })

  return {
    // State
    searchQuery,
    difficultyFilter,
    statusFilter,
    chapterFilter,

    // Constants
    DIFFICULTY_LEVELS,
    STATUS_FILTERS,

    // Methods
    getDifficultyLevel,
    matchesSearch,
    matchesDifficulty,
    matchesStatus,
    matchesChapter,
    filterProblems,
    filterChapterProblems,
    getFilteredCount,
    resetFilters,
    hasActiveFilters
  }
}