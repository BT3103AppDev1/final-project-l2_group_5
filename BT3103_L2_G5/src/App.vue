<template>
  <LoginPage 
    v-if="currentPage === 'login'"
    @switch-to-signup="switchToSignup"
    @user-logged-in="handleUserLoggedIn"
  />
  <SignUp 
    v-else-if="currentPage === 'signup'"
    :initialRole="userRole"
    @switch-to-login="switchToLogin"
  />
  <CandidateDashboard 
    v-else-if="currentPage === 'dashboard' && currentUser.role === 'candidate'"
    :user="currentUser"
    @logout="handleLogout"
  />
  <HRDashboard 
    v-else-if="currentPage === 'dashboard' && currentUser.role === 'hr'"
    :user="currentUser"
    @logout="handleLogout"
  />
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import LoginPage from '@/components/LoginPage.vue'
import SignUp from '@/components/SignUp.vue'
import CandidateDashboard from '@/components/CandidateDashboard.vue'
import HRDashboard from '@/components/HRDashboard.vue'

export default {
  name: 'App',
  components: {
    LoginPage,
    SignUp,
    CandidateDashboard,
    HRDashboard
  },
  data() {
    return {
      currentPage: 'login',
      userRole: 'candidate',
      currentUser: null
    }
  },
  methods: {
    switchToSignup(role) {
      this.userRole = role
      this.currentPage = 'signup'
    },
    switchToLogin(role) {
      this.userRole = role
      this.currentPage = 'login'
    },
    handleUserLoggedIn(userData) {
      // Store only the logged-in user's data
      this.currentUser = userData
      this.currentPage = 'dashboard'
      console.log('User logged in with data:', userData)
    },
    async handleLogout() {
      try {
        await signOut(auth)
        this.currentUser = null
        this.currentPage = 'login'
        alert('Logged out successfully')
      } catch (error) {
        console.error('Logout error:', error.message)
        alert('Logout failed: ' + error.message)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  min-height: 100vh;
}
</style>