<!-- src/views/Login.vue -->
<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left__logo">
        <span class="logo-icon">⟳</span>
        <span>CareerSwipe</span>
      </div>
      <div class="auth-left__tagline">
        <h2>{{ roleTab === 'candidate' ? 'Your career, your story.' : 'Hire faster. Hire smarter.' }}</h2>
        <p>{{ roleTab === 'candidate'
          ? 'Discover roles matched to your skills. Track every step in real time.'
          : 'Manage your talent pipeline from a single structured dashboard.' }}</p>
      </div>
      <div class="auth-left__stat">
        <span class="stat-num">{{ roleTab === 'candidate' ? '12,400+' : '3,200+' }}</span>
        <span class="stat-label">{{ roleTab === 'candidate' ? 'candidates placed in 2025' : 'HR teams onboarded' }}</span>
      </div>
    </div>

    <div class="auth-right">
      <div class="role-toggle">
        <span class="role-toggle__label">I am a:</span>
        <button :class="{ active: roleTab === 'candidate' }" @click="roleTab = 'candidate'">Candidate</button>
        <button :class="{ active: roleTab === 'hr' }" @click="roleTab = 'hr'">HR</button>
        <router-link to="/careers" class="back-link">← Back to Jobs</router-link>
      </div>

      <div class="auth-card">
        <span class="auth-badge">{{ roleTab === 'candidate' ? '👤 Candidate Account' : '🏢 HR Professional' }}</span>
        <h3>Sign In to CareerSwipe</h3>
        <p class="auth-sub">{{ roleTab === 'candidate' ? 'Access your applications and track your journey.' : 'Access your HR dashboard and screening tools.' }}</p>

        <div class="tab-switch">
          <button class="tab-switch__btn tab-switch__btn--active">Sign In</button>
          <router-link to="/register" class="tab-switch__btn">Create Account</router-link>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="field">
            <label>Email Address</label>
            <input v-model="email" type="email" placeholder="you@example.com" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input v-model="password" type="password" placeholder="••••••••" required />
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign In →' }}
          </button>

          <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const router = useRouter()
const roleTab = ref('candidate')
const email = ref(''), password = ref('')
const loading = ref(false), error = ref('')

async function handleLogin() {
  loading.value = true; error.value = ''
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    const role = snap.data()?.role
    router.push(role === 'hr' ? '/hr/dashboard' : '/careers')
  } catch (e) {
    error.value = 'Invalid email or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }

.auth-left {
  width: 380px; flex-shrink: 0; background: var(--cs-navy);
  padding: 40px; display: flex; flex-direction: column; gap: 40px;
  color: #fff;
}
.auth-left__logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; }
.logo-icon { font-size: 24px; color: var(--cs-teal); }
.auth-left__tagline h2 { font-size: 26px; font-weight: 700; line-height: 1.3; margin-bottom: 10px; }
.auth-left__tagline p { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.6; }
.auth-left__stat { margin-top: auto; }
.stat-num { display: block; font-size: 36px; font-weight: 700; color: var(--cs-teal); }
.stat-label { font-size: 13px; color: rgba(255,255,255,.5); }

.auth-right { flex: 1; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; }

.role-toggle { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
.role-toggle__label { font-size: 14px; color: var(--cs-muted); }
.role-toggle button { padding: 6px 16px; border-radius: 20px; border: 1.5px solid var(--cs-border); font-size: 13px; font-weight: 600; background: #fff; color: var(--cs-muted); cursor: pointer; transition: all .15s; }
.role-toggle button.active { background: var(--cs-blue); border-color: var(--cs-blue); color: #fff; }
.back-link { font-size: 13px; color: var(--cs-blue); margin-left: 8px; }

.auth-card { background: #fff; border: 1px solid var(--cs-border); border-radius: 16px; padding: 36px; width: 100%; max-width: 440px; box-shadow: var(--shadow-md); }
.auth-badge { font-size: 12px; font-weight: 600; background: var(--cs-bg); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 14px; }
.auth-card h3 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.auth-sub { font-size: 13px; color: var(--cs-muted); margin-bottom: 20px; }

.tab-switch { display: flex; gap: 4px; background: var(--cs-bg); border-radius: 8px; padding: 4px; margin-bottom: 24px; }
.tab-switch__btn { flex: 1; text-align: center; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; border: none; background: transparent; color: var(--cs-muted); cursor: pointer; transition: all .15s; text-decoration: none; display: block; }
.tab-switch__btn--active { background: #fff; color: var(--cs-text); box-shadow: var(--shadow-sm); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; }
.field input { padding: 10px 12px; border: 1.5px solid var(--cs-border); border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; transition: border-color .15s; }
.field input:focus { border-color: var(--cs-blue); }

.btn { padding: 11px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all .15s; }
.btn--primary { background: var(--cs-blue); color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1460d4; }
.btn--primary:disabled { opacity: .6; cursor: not-allowed; }
.btn--full { width: 100%; }
.form-error { font-size: 13px; color: var(--cs-red); background: #FEF2F2; padding: 10px 12px; border-radius: 8px; }
.forgot-link { font-size: 13px; color: var(--cs-blue); text-align: center; text-decoration: none; }

@media (max-width: 768px) { .auth-left { display: none; } }
</style>
