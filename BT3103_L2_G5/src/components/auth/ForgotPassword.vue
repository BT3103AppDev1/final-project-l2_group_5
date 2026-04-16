<template>
  <div class="page-wrapper">
    <nav class="navbar">
      <div class="brand">CareerSwipe</div>
      <router-link to="/login" class="back-link">← Back to Sign In</router-link>
    </nav>

    <main class="main">
      <div class="card">
        <div class="left-panel">
          <div class="left-brand">CareerSwipe</div>
          <h2 class="left-headline">Your account,<br>always secure.</h2>
          <p class="left-desc">Recovering access is quick and safe. Enter your email and we'll send a verified reset link within seconds.</p>
        </div>

        <div class="right-panel">
          <div class="icon">🔒</div>
          <h3 class="form-title">Reset Your Password</h3>
          <p class="form-sub">Enter your registered email address and we'll send you a secure link to reset your password.</p>

          <div class="field-group">
            <label class="field-label">Registered Email Address</label>
            <input
              v-model="email"
              type="email"
              class="field-input"
              placeholder="you@example.com"
              :disabled="sent"
            />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="sent" class="success-msg">✓ Reset link sent! Check your inbox.</p>

          <button class="submit-btn" @click="sendReset" :disabled="sent || loading">
            {{ loading ? 'Sending…' : sent ? '✓ Link Sent' : '→ Send Reset Link' }}
          </button>

          <router-link to="/login" class="back-link-bottom">← Back to Sign In</router-link>

          <p class="note">For your security, we never reveal whether an email is registered. Reset links are single-use and time-limited.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebaseConfig'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      sent: false,
      loading: false,
      error: ''
    }
  },
  methods: {
    // Sends a Firebase password reset email to the entered address.
    // Sets `sent` to true on success to disable the button and show confirmation.
    // Errors are caught generically — Firebase intentionally does not reveal
    // whether the email is registered (security best practice).
    async sendReset() {
      if (!this.email) {
        this.error = 'Please enter your email address.'
        return
      }
      this.loading = true
      this.error = ''
      try {
        await sendPasswordResetEmail(auth, this.email)
        this.sent = true
      } catch (e) {
        this.error = 'Could not send reset email. Please check the address and try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

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

.brand { font-size: 1.25rem; font-weight: 700; color: #1a237e; }
.back-link { font-size: 0.875rem; color: #1a237e; text-decoration: none; font-weight: 500; }
.back-link:hover { text-decoration: underline; }

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
  max-width: 900px;
  min-height: 480px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.10);
}

.left-panel {
  background: #1a237e;
  width: 42%;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}

.left-brand { font-size: 1.1rem; font-weight: 700; color: #fff; }
.left-headline {
  font-family: 'DM Serif Display', serif;
  font-size: 1.85rem;
  color: #fff;
  line-height: 1.25;
}
.left-desc { font-size: 0.875rem; color: rgba(255,255,255,0.7); line-height: 1.6; }

.right-panel {
  flex: 1;
  background: #fff;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.icon { font-size: 36px; }
.form-title { font-size: 1.3rem; font-weight: 700; color: #111827; }
.form-sub { font-size: 0.875rem; color: #6b7280; line-height: 1.6; }

.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.field-input {
  padding: 11px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #1a237e; }
.field-input:disabled { background: #f9fafb; color: #9ca3af; }

.submit-btn {
  width: 100%;
  padding: 13px;
  background: #1a237e;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #151b60; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.back-link-bottom { font-size: 0.875rem; color: #1a237e; text-decoration: none; font-weight: 500; text-align: center; }
.back-link-bottom:hover { text-decoration: underline; }

.error-msg { font-size: 0.85rem; color: #dc2626; background: #fef2f2; padding: 10px 12px; border-radius: 8px; }
.success-msg { font-size: 0.85rem; color: #16a34a; background: #f0fdf4; padding: 10px 12px; border-radius: 8px; }
.note { font-size: 0.78rem; color: #9ca3af; line-height: 1.5; }

@media (max-width: 640px) { .left-panel { display: none; } }
</style>