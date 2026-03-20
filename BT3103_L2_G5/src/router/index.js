import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebaseConfig'
import LoginPage from '@/components/auth/LoginPage.vue'
import SignUp from '@/components/auth/SignUp.vue'
import CandidateDashboard from '@/components/dashboard/CandidateDashboard.vue'
import HRDashboard from '@/components/dashboard/HRDashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    component: SignUp,
    meta: { requiresAuth: false }
  },
  {
    path: '/candidate-dashboard',
    component: CandidateDashboard,
    meta: { requiresAuth: true, role: 'candidate' }
  },
  {
    path: '/hr-dashboard',
    component: HRDashboard,
    meta: { requiresAuth: true, role: 'hr' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to check authentication and redirect based on role
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta?.role
  
  // Get current user
  const user = auth.currentUser

  if (requiresAuth) {
    if (!user) {
      // Not authenticated, redirect to login
      return next('/login')
    } 
    
    if (requiredRole) {
      // User is authenticated, check role from Firestore
      try {
        const { getDoc, doc } = await import('firebase/firestore')
        const { db } = await import('@/firebaseConfig')
        
        const userRef = doc(db, 'users', user.uid)
        const userSnapshot = await getDoc(userRef)
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()
          if (userData.role === requiredRole) {
            return next()
          } else {
            // User role doesn't match, redirect to appropriate dashboard
            const targetRoute = userData.role === 'hr' ? '/hr-dashboard' : '/candidate-dashboard'
            return next(targetRoute)
          }
        } else {
          // User data not found, redirect to login
          return next('/login')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        return next('/login')
      }
    } else {
      return next()
    }
  } else {
    // Route doesn't require auth
    if (user && (to.path === '/login' || to.path === '/signup')) {
      // User is logged in but trying to access login/signup, redirect to appropriate dashboard
      try {
        const { getDoc, doc } = await import('firebase/firestore')
        const { db } = await import('@/firebaseConfig')
        
        const userRef = doc(db, 'users', user.uid)
        const userSnapshot = await getDoc(userRef)
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()
          const targetRoute = userData.role === 'hr' ? '/hr-dashboard' : '/candidate-dashboard'
          return next(targetRoute)
        } else {
          return next()
        }
      } catch (error) {
        console.error('Error checking user data:', error)
        return next()
      }
    } else {
      return next()
    }
  }
})

export default router
