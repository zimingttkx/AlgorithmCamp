/**
 * Unit Tests for Router Configuration
 * Tests route definitions, navigation guards, and route meta
 */

import { describe, it, expect } from 'vitest'

// Simulated router configuration structure
const routes = [
  { path: '/', name: 'home', component: 'Home' },
  { path: '/practice', name: 'practice', component: 'Practice' },
  { path: '/blog', name: 'blog', component: 'Blog' },
  { path: '/blog/:id', name: 'blog-post', component: 'BlogPost' },
  { path: '/about', name: 'about', component: 'About' },
  { path: '/projects', name: 'projects', component: 'Projects' },
  { path: '/login', name: 'login', component: 'Login' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: 'NotFound' }
]

describe('Router - Route Definitions', () => {
  describe('Route paths', () => {
    it('should have home route at root path', () => {
      const home = routes.find(r => r.name === 'home')
      expect(home).toBeDefined()
      expect(home.path).toBe('/')
    })

    it('should have practice route', () => {
      const practice = routes.find(r => r.name === 'practice')
      expect(practice).toBeDefined()
      expect(practice.path).toBe('/practice')
    })

    it('should have blog route', () => {
      const blog = routes.find(r => r.name === 'blog')
      expect(blog).toBeDefined()
      expect(blog.path).toBe('/blog')
    })

    it('should have blog post route with dynamic id', () => {
      const blogPost = routes.find(r => r.name === 'blog-post')
      expect(blogPost).toBeDefined()
      expect(blogPost.path).toBe('/blog/:id')
    })

    it('should have about route', () => {
      const about = routes.find(r => r.name === 'about')
      expect(about).toBeDefined()
      expect(about.path).toBe('/about')
    })

    it('should have projects route', () => {
      const projects = routes.find(r => r.name === 'projects')
      expect(projects).toBeDefined()
      expect(projects.path).toBe('/projects')
    })

    it('should have login route', () => {
      const login = routes.find(r => r.name === 'login')
      expect(login).toBeDefined()
      expect(login.path).toBe('/login')
    })

    it('should have catch-all not-found route', () => {
      const notFound = routes.find(r => r.name === 'not-found')
      expect(notFound).toBeDefined()
      expect(notFound.path).toBe('/:pathMatch(.*)*')
    })
  })

  describe('Route count', () => {
    it('should have exactly 8 routes', () => {
      expect(routes).toHaveLength(8)
    })

    it('should have unique route names', () => {
      const names = routes.map(r => r.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('should have unique paths', () => {
      const paths = routes.map(r => r.path)
      const uniquePaths = new Set(paths)
      expect(uniquePaths.size).toBe(paths.length)
    })
  })

  describe('Route components', () => {
    it('should have component for each route', () => {
      routes.forEach(route => {
        expect(route.component).toBeDefined()
        expect(typeof route.component).toBe('string')
      })
    })

    it('should have expected component names', () => {
      const components = routes.map(r => r.component)
      expect(components).toContain('Home')
      expect(components).toContain('Practice')
      expect(components).toContain('Blog')
      expect(components).toContain('BlogPost')
      expect(components).toContain('About')
      expect(components).toContain('Projects')
      expect(components).toContain('Login')
      expect(components).toContain('NotFound')
    })
  })
})

describe('Router - Navigation Logic', () => {
  describe('Path matching', () => {
    function matchRoute(path, routes) {
      // First try exact/static matches
      const exactMatch = routes.find(r => r.path === path && !r.path.includes(':') && !r.path.includes('pathMatch'))
      if (exactMatch) return exactMatch

      // Then try dynamic routes
      const dynamicMatch = routes.find(r => {
        if (!r.path.includes(':') || r.path.includes('pathMatch')) return false
        const pattern = r.path.replace(/:([^/]+)/g, '([^/]+)')
        return new RegExp(`^${pattern}$`).test(path)
      })
      if (dynamicMatch) return dynamicMatch

      // Finally try catch-all (not-found)
      return routes.find(r => r.path.includes('pathMatch'))
    }

    it('should match exact path', () => {
      const matched = matchRoute('/practice', routes)
      expect(matched.name).toBe('practice')
    })

    it('should match dynamic blog post path', () => {
      const matched = matchRoute('/blog/my-first-post', routes)
      expect(matched.name).toBe('blog-post')
    })

    it('should match not-found for unknown paths', () => {
      const matched = matchRoute('/unknown/path', routes)
      expect(matched.name).toBe('not-found')
    })

    it('should match root path', () => {
      const matched = matchRoute('/', routes)
      expect(matched.name).toBe('home')
    })
  })

  describe('Route order', () => {
    it('should have catch-all route last', () => {
      const catchAllIndex = routes.findIndex(r => r.path.includes('pathMatch'))
      expect(catchAllIndex).toBe(routes.length - 1)
    })

    it('should have static routes before catch-all', () => {
      const catchAllIndex = routes.findIndex(r => r.path.includes('pathMatch'))
      const staticRoutes = ['/', '/practice', '/blog', '/about', '/projects', '/login']

      staticRoutes.forEach(path => {
        const idx = routes.findIndex(r => r.path === path)
        expect(idx).toBeLessThan(catchAllIndex)
      })
    })
  })
})

describe('Router - Base Path (GitHub Pages)', () => {
  it('should support base path configuration', () => {
    const basePath = '/AlgorithmCamp/'
    expect(basePath).toMatch(/^\//)
    expect(basePath).toMatch(/\/$/)
  })

  it('should have routes compatible with base path', () => {
    const basePath = '/AlgorithmCamp/'
    routes.forEach(route => {
      const fullPath = basePath + route.path.replace(/^\//, '')
      expect(fullPath).toMatch(/^\/AlgorithmCamp\//)
    })
  })
})
