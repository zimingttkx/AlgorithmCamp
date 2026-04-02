// Problem Detail Composable - Notes, Favorites, and Solutions
import { ref, computed } from 'vue'

const NOTES_KEY = 'mc-algo-problem-notes'
const FAVORITES_KEY = 'mc-algo-problem-favorites'
const SOLUTIONS_KEY = 'mc-algo-problem-solutions'

// Module-level singleton state
const notes = ref({})
const favorites = ref(new Set())
const solutions = ref({})

// Load from localStorage on first import
function loadFromStorage() {
  try {
    const savedNotes = localStorage.getItem(NOTES_KEY)
    if (savedNotes) notes.value = JSON.parse(savedNotes)

    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) favorites.value = new Set(JSON.parse(savedFavorites))

    const savedSolutions = localStorage.getItem(SOLUTIONS_KEY)
    if (savedSolutions) solutions.value = JSON.parse(savedSolutions)
  } catch (e) {
    console.warn('Failed to load problem detail data from localStorage:', e)
  }
}

loadFromStorage()

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes.value))
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites.value]))
}

// Save solutions to localStorage
function saveSolutions() {
  localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(solutions.value))
}

// Generate unique key for a problem
function getProblemKey(chapterId, probId) {
  return `${chapterId}::${probId}`
}

export function useProblemDetail() {
  // Check if a problem is favorited
  function isFavorite(chapterId, probId) {
    return favorites.value.has(getProblemKey(chapterId, probId))
  }

  // Toggle favorite status
  function toggleFavorite(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    if (favorites.value.has(key)) {
      favorites.value.delete(key)
    } else {
      favorites.value.add(key)
    }
    // Trigger reactivity
    favorites.value = new Set(favorites.value)
    saveFavorites()
  }

  // Get favorite count
  const favoriteCount = computed(() => favorites.value.size)

  // Get favorite problems (returns array of {chapterId, probId, key})
  const favoriteProblems = computed(() => {
    return [...favorites.value].map(key => {
      const [chapterId, probId] = key.split('::')
      return { chapterId, probId, key }
    })
  })

  // Get note for a problem
  function getNote(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    return notes.value[key]?.note || ''
  }

  // Save note for a problem
  function saveNote(chapterId, probId, note) {
    const key = getProblemKey(chapterId, probId)
    notes.value[key] = {
      note,
      updatedAt: new Date().toISOString()
    }
    saveNotes()
  }

  // Get note metadata
  function getNoteInfo(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    return notes.value[key] || null
  }

  // Get solution for a problem
  function getSolution(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    return solutions.value[key]?.content || ''
  }

  // Get solution metadata
  function getSolutionInfo(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    return solutions.value[key] || null
  }

  // Save solution for a problem
  function saveSolution(chapterId, probId, content, author = '匿名用户') {
    const key = getProblemKey(chapterId, probId)
    solutions.value[key] = {
      content,
      author,
      updatedAt: new Date().toISOString(),
      isPublic: true
    }
    saveSolutions()
  }

  // Delete solution for a problem
  function deleteSolution(chapterId, probId) {
    const key = getProblemKey(chapterId, probId)
    delete solutions.value[key]
    saveSolutions()
  }

  // Get all solutions (for sharing)
  const allSolutions = computed(() => solutions.value)

  return {
    notes,
    favorites,
    favoriteCount,
    favoriteProblems,
    isFavorite,
    toggleFavorite,
    getNote,
    saveNote,
    getNoteInfo,
    getSolution,
    getSolutionInfo,
    saveSolution,
    deleteSolution,
    allSolutions
  }
}
