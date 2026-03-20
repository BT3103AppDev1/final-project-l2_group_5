// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

// Views
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import HRDashboard from '../views/HRDashboard.vue'
import CreateJob from '../views/CreateJob.vue'
import CandidateSwipe from '../views/CandidateSwipe.vue'
import CareerPortal from '../views/CareerPortal.vue'
import MyApplications from '../views/MyApplications.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guest: true } },
  { path: '/register', component: Register, meta: { guest: true } },
  { path: '/forgot-password', component: ForgotPassword, meta: { guest: true } },

  // HR routes
  { path: '/hr/dashboard', component: HRDashboard, meta: { requiresAuth: true, role: 'hr' } },
  { path: '/hr/jobs/create', component: CreateJob, meta: { requiresAuth: true, role: 'hr' } },
  { path: '/hr/jobs/:jobId/candidates', component: CandidateSwipe, meta: { requiresAuth: true, role: 'hr' } },

  // Candidate routes
  { path: '/careers', component: CareerPortal, meta: { requiresAuth: true, role: 'candidate' } },
  { path: '/my-applications', component: MyApplications, meta: { requiresAuth: true, role: 'candidate' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard helper: waits for Firebase to resolve the auth state
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser()

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  if (to.meta.guest && user) {
    // Fetch role and redirect authenticated users away from guest pages
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const role = userDoc.data()?.role
    return next(role === 'hr' ? '/hr/dashboard' : '/careers')
  }

  if (to.meta.role && user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const role = userDoc.data()?.role
    if (role !== to.meta.role) {
      // Wrong role trying to access wrong portal
      return next(role === 'hr' ? '/hr/dashboard' : '/careers')
    }
  }

  next()
})

export default router
