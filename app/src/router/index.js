import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Blog from '../views/Blog.vue'
import BlogPost from '../views/BlogPost.vue'
import Projects from '../views/Projects.vue'
import Practice from '../views/Practice.vue'
import Login from '../views/Login.vue'
import Recommendation from '../views/Recommendation.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/blog', component: Blog },
  { path: '/blog/:id', component: BlogPost },
  { path: '/projects', component: Projects },
  { path: '/practice', component: Practice },
  { path: '/recommend', component: Recommendation },
  { path: '/login', component: Login },
  { path: '/:pathMatch(.*)+', component: NotFound },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
