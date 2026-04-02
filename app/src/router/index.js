import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Blog from '../views/Blog.vue'
import BlogPost from '../views/BlogPost.vue'
import Projects from '../views/Projects.vue'
import Practice from '../views/Practice.vue'
import Progress from '../views/Progress.vue'
import Stats from '../views/Stats.vue'
import Review from '../views/Review.vue'
import Login from '../views/Login.vue'
import Recommendation from '../views/Recommendation.vue'
import ProblemDetail from '../views/ProblemDetail.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/blog', component: Blog },
  { path: '/blog/:id', component: BlogPost },
  { path: '/projects', component: Projects },
  { path: '/practice', component: Practice },
  { path: '/progress', component: Progress },
  { path: '/stats', component: Stats },
  { path: '/recommend', component: Recommendation },
  { path: '/review', component: Review },
  { path: '/problem/:chapterId/:probId', component: ProblemDetail },
  { path: '/login', component: Login },
  { path: '/:pathMatch(.*)+', component: NotFound },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
