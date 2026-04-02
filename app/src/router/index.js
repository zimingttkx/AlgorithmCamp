import { createRouter, createWebHashHistory } from 'vue-router'

// Route-based code splitting: all route components are lazy-loaded
// This enables tree-shaking and reduces initial bundle size
const routes = [
  { path: '/', component: () => import('../views/Home.vue') },
  { path: '/about', component: () => import('../views/About.vue') },
  { path: '/blog', component: () => import('../views/Blog.vue') },
  { path: '/blog/:id', component: () => import('../views/BlogPost.vue') },
  { path: '/projects', component: () => import('../views/Projects.vue') },
  { path: '/practice', component: () => import('../views/Practice.vue') },
  { path: '/progress', component: () => import('../views/Progress.vue') },
  { path: '/stats', component: () => import('../views/Stats.vue') },
  { path: '/recommend', component: () => import('../views/Recommendation.vue') },
  { path: '/review', component: () => import('../views/Review.vue') },
  { path: '/problem/:chapterId/:probId', component: () => import('../views/ProblemDetail.vue') },
  { path: '/search', component: () => import('../views/Search.vue') },
  { path: '/goal', component: () => import('../views/Goal.vue') },
  { path: '/export', component: () => import('../views/Export.vue') },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/:pathMatch(.*)+', component: () => import('../views/NotFound.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
