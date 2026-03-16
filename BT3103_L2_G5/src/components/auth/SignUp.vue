<template>
  <div class="page-wrapper">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="brand">CareerSwipe</div>
      <div class="nav-center">
        <span class="nav-label">I am a:</span>
        <div class="toggle-group">
          <button
            :class="['toggle-btn', role === 'candidate' ? 'active' : '']"
            @click="role = 'candidate'"
          >Candidate</button>
          <button
            :class="['toggle-btn', role === 'hr' ? 'active' : '']"
            @click="role = 'hr'"
          >HR</button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main">
      <div class="card">
        <!-- Left Panel -->
        <div class="left-panel">
          <div class="left-top">
            <div class="left-brand">CareerSwipe</div>
            <div class="left-subtitle">{{ role === 'hr' ? 'HR Portal' : 'Candidate Portal' }}</div>
          </div>

          <div v-if="role === 'hr'" class="left-body">
            <h2 class="left-headline">Hire faster.<br>Hire smarter.</h2>
            <p class="left-desc">Manage your entire talent pipeline from a single, structured dashboard built for enterprise HR teams.</p>
            <ul class="feature-list">
              <li><span class="check-icon">✓</span> AI-assisted candidate screening</li>
              <li><span class="check-icon">✓</span> Collaborative shortlisting and review</li>
              <li><span class="check-icon">✓</span> Real-time pipeline analytics &amp; reporting</li>
            </ul>
          </div>
          <div v-else class="left-body">
            <h2 class="left-headline">Find your<br>dream job.</h2>
            <p class="left-desc">Discover opportunities tailored to your skills, apply with one swipe, and track every application in real time.</p>
            <ul class="feature-list">
              <li><span class="check-icon">✓</span> Personalized job recommendations</li>
              <li><span class="check-icon">✓</span> One-click applications</li>
              <li><span class="check-icon">✓</span> Real-time application tracking</li>
            </ul>
          </div>

          <div class="left-footer">
            <div class="stat-number">{{ role === 'hr' ? '3,200+' : '120,000+' }}</div>
            <div class="stat-label">{{ role === 'hr' ? 'HR teams onboarded' : 'Jobs available today' }}</div>
          </div>
        </div>

        <!-- Right Panel: Sign Up Form -->
        <div class="right-panel">
          <h3 class="form-title">Create your account</h3>

          <!-- Full Name -->
          <div class="field-group">
            <label class="field-label">Full Name</label>
            <input
              v-model="fullName"
              type="text"
              class="field-input"
              placeholder="John Doe"
            />
          </div>

          <!-- Company Name (HR Only) -->
          <div v-if="role === 'hr'" class="field-group">
            <label class="field-label">Company Name</label>
            <input
              v-model="companyName"
              type="text"
              class="field-input"
              placeholder="Your Company"
            />
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label">{{ role === 'hr' ? 'Work Email' : 'Email' }}</label>
            <input
              v-model="email"
              type="email"
              class="field-input"
              :placeholder="role === 'hr' ? 'you@company.com' : 'you@email.com'"
            />
          </div>

          <!-- Password -->
          <div class="field-group">
            <label class="field-label">Password</label>
            <div class="password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
              />
              <button class="eye-btn" @click="showPassword = !showPassword" type="button">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="field-group">
            <label class="field-label">Confirm Password</label>
            <div class="password-wrapper">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
              />
              <button class="eye-btn" @click="showConfirmPassword = !showConfirmPassword" type="button">
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button class="submit-btn" @click="handleSignUp">
            Sign Up &rarr;
          </button>

          <p class="login-prompt">
            Already have an account?
            <router-link to="/login" class="login-link">Sign in</router-link>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/firebaseConfig'
import { useRouter } from 'vue-router'

export default {
  name: 'SignUp',
  props: {
    initialRole: {
      type: String,
      default: 'candidate'
    }
  },
  setup() {
    return {
      router: useRouter()
    }
  },
  data() {
    return {
      role: this.initialRole,
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
    }
  },
  methods: {
    async handleSignUp() {
      if (this.role === 'hr') {
        if (!this.fullName || !this.companyName || !this.email || !this.password || !this.confirmPassword) {
          alert('Please fill in all fields.')
          return
        }
      } else {
        if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
          alert('Please fill in all fields.')
          return
        }
      }
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match.')
        return
      }

      this.isLoading = true
      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        const user = userCredential.user

        // Save user details to Firestore
        const userRef = doc(db, 'users', user.uid)
        const userData = {
          uid: user.uid,
          fullName: this.fullName,
          email: this.email,
          role: this.role,
          createdAt: new Date(),
        }

        // Add company name for HR users
        if (this.role === 'hr') {
          userData.companyName = this.companyName
        }

        await setDoc(userRef, userData)
        
        console.log('User signed up:', user)
        alert(`Account created successfully as ${this.role === 'hr' ? 'HR' : 'Candidate'}`)
        // Redirect to login page
        this.router.push('/login')
      } catch (error) {
        console.error('Sign up error:', error.message)
        alert(`Sign up failed: ${error.message}`)
      } finally {
        this.isLoading = false
      }
    }
  },
  watch: {
    initialRole(newRole) {
      this.role = newRole
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

/* ---- Navbar ---- */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a237e;
  letter-spacing: -0.3px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.toggle-group {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
}

.toggle-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #1a237e;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

/* ---- Main ---- */
.main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.card {
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 560px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.10);
}

/* ---- Left Panel ---- */
.left-panel {
  background: #1a237e;
  width: 42%;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.left-panel::before {
  content: '';
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  top: -60px;
  right: -80px;
}

.left-panel::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: 60px;
  left: -60px;
}

.left-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.left-subtitle {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
}

.left-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 0 16px;
  position: relative;
  z-index: 1;
}

.left-headline {
  font-family: 'DM Serif Display', serif;
  font-size: 1.85rem;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 14px;
}

.left-desc {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.72);
  line-height: 1.6;
  margin-bottom: 22px;
}

.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-list li {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.left-footer {
  border-top: 1px solid rgba(255,255,255,0.18);
  padding-top: 20px;
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin-top: 2px;
}

/* ---- Right Panel ---- */
.right-panel {
  flex: 1;
  background: #fff;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  max-height: 660px;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 28px;
}

.field-group {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111827;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.field-input::placeholder { color: #9ca3af; }
.field-input:focus { border-color: #1a237e; }

.password-wrapper {
  position: relative;
}

.password-wrapper .field-input {
  padding-right: 42px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
}

.eye-btn:hover { color: #374151; }

.submit-btn {
  width: 100%;
  padding: 13px;
  background: #1a237e;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s, transform 0.1s;
}

.submit-btn:hover { background: #151b60; }
.submit-btn:active { transform: scale(0.99); }

.login-prompt {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 20px;
}

.login-link {
  color: #1a237e;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover { text-decoration: underline; }
</style>
