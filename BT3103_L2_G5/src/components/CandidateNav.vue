<template>
<nav class="candidate-nav">
  <div class="brand" @click="goToJobs">CareerSwipe</div>
  <div class="nav-right">
  <div class="nav-links">
    <span
      class="nav-link"
      :class="{ active: isActive('/candidate-dashboard') }"
      @click="goToJobs"
    >
      Jobs
    </span>

    <span
      class="nav-link"
      :class="{ active: isActive('/applications') }"
      @click="goToApplications"
    >
      My Applications
    </span>
  </div>
  <div class="nav-divider"></div>

  <button @click="handleLogout" class="logout-btn">Logout</button>
</div>
  

  
</nav>
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig.js'

export default {
  name: 'CandidateNav',
  methods: {
    goToJobs() {
      this.$router.push('/candidate-dashboard')
    },
    goToApplications() {
      this.$router.push('/applications')
    },
    isActive(path) {
      return this.$route.path === path
    },
    async handleLogout() {
      try {
        await signOut(auth)
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
        alert('Failed to log out')
      }
    }
  }
}
</script>

<style scoped>
.candidate-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a8a;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  font-size: 16px;
  font-weight: 600;
  color: #374151; 
  cursor: pointer;
  position: relative;
  padding-bottom: 6px;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #111827;
}

.nav-link.active {
  color: #1e3a8a;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 3px;
  background: #1e3a8a;
  border-radius: 2px;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: #d1d5db;
}

/* LOGOUT BUTTON */
.logout-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #dc2626;
}

@media (max-width: 640px) {
  .candidate-nav {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .nav-right {
    width: 100%;
    justify-content: space-between;
  }

  .nav-links {
    gap: 20px;
  }
}
</style>