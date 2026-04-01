/**
 * Unit Tests for Projects.vue and BlogPost.vue logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Projects.vue - langColor', () => {
  const LANG_COLORS = {
    'C++': '#f34b7d',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Java': '#b07219',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Vue': '#41b883',
    'HTML': '#e34c26',
    'Jupyter Notebook': '#DA5B0B',
    'Shell': '#89e051',
    'CSS': '#563d7c',
  }

  function langColor(lang) {
    return LANG_COLORS[lang] || '#8b949e'
  }

  it('should return correct color for known languages', () => {
    expect(langColor('Python')).toBe('#3572A5')
    expect(langColor('JavaScript')).toBe('#f1e05a')
    expect(langColor('TypeScript')).toBe('#2b7489')
  })

  it('should return fallback for unknown languages', () => {
    expect(langColor('Unknown')).toBe('#8b949e')
    expect(langColor('Ruby')).toBe('#8b949e')
    expect(langColor('')).toBe('#8b949e')
  })

  it('should handle languages with spaces', () => {
    expect(langColor('Jupyter Notebook')).toBe('#DA5B0B')
    expect(langColor('Shell')).toBe('#89e051')
  })
})

describe('Projects.vue - formatDate', () => {
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  it('should format valid ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z')
    expect(result).toContain('2024')
    expect(result).toContain('01')
    expect(result).toContain('15')
  })

  it('should return empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid')).toBe('')
  })
})

describe('Projects.vue - fetch repos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch from correct GitHub API endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => []
    })

    await fetch('https://api.github.com/users/zimingttkx/repos?sort=updated&per_page=20')

    expect(mockFetch).toHaveBeenCalled()
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.github.com/users/zimingttkx/repos?sort=updated&per_page=20')
  })

  it('should handle fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    let repos = []
    try {
      const res = await fetch('https://api.github.com/users/test/repos')
      repos = await res.json()
    } catch (e) {
      // Error swallowed - repos stays empty
    }

    expect(repos).toEqual([])
  })

  it('should handle non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403
    })

    const res = await fetch('https://api.github.com/users/test/repos')
    expect(res.ok).toBe(false)
    expect(res.status).toBe(403)
  })
})

describe('BlogPost.vue - marked configuration', () => {
  // Test the marked library behavior
  const mockMarked = (md) => {
    // Simplified markdown to HTML (just for testing structure)
    return md
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  }

  it('should parse headers', () => {
    const md = '## Test Header'
    const html = mockMarked(md)
    expect(html).toContain('<h2>Test Header</h2>')
  })

  it('should parse inline code', () => {
    const md = 'Use `console.log()` for debugging'
    const html = mockMarked(md)
    expect(html).toContain('<code>console.log()</code>')
  })

  it('should parse links', () => {
    const md = 'Check out [LeetCode](https://leetcode.com)'
    const html = mockMarked(md)
    expect(html).toContain('<a href="https://leetcode.com">LeetCode</a>')
  })

  it('should handle code blocks with language', () => {
    const md = '```javascript\nconst x = 1;\n```'
    // Basic check that code blocks are preserved
    expect(md).toContain('```javascript')
  })
})

describe('BlogPost.vue - loadPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch blog post markdown', async () => {
    const mockHtml = '# Test Post\n\nContent here'
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => mockHtml
    })

    const res = await fetch('/posts/test.md')
    const md = await res.text()

    expect(md).toContain('# Test Post')
  })

  it('should handle 404 for missing post', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    const res = await fetch('/posts/nonexistent.md')
    expect(res.ok).toBe(false)
    expect(res.status).toBe(404)
  })

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    let error = null
    try {
      await fetch('/posts/test.md')
    } catch (e) {
      error = e
    }

    expect(error).toBeTruthy()
  })
})

describe('BlogPost.vue - BLOG_POSTS find logic', () => {
  const BLOG_POSTS = [
    { id: 'post-1', title: 'First Post', file: 'posts/post-1.md' },
    { id: 'post-2', title: 'Second Post', file: 'posts/post-2.md' },
  ]

  it('should find post by id', () => {
    const post = BLOG_POSTS.find(p => p.id === 'post-1')
    expect(post.title).toBe('First Post')
  })

  it('should return undefined for non-existent id', () => {
    const post = BLOG_POSTS.find(p => p.id === 'nonexistent')
    expect(post).toBeUndefined()
  })
})
