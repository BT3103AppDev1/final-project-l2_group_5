<!-- src/views/ForgotPassword.vue -->
<template>
  <div class="center-page">
    <div class="card">
      <div class="icon">🔒</div>
      <h2>Reset Your Password</h2>
      <p>Enter your registered email and we'll send a secure reset link.</p>
      <form @submit.prevent="sendReset" class="form">
        <input v-model="email" type="email" placeholder="you@example.com" required />
        <button type="submit" :disabled="sent">{{ sent ? '✓ Reset link sent!' : 'Send Reset Link →' }}</button>
        <p v-if="error" class="err">{{ error }}</p>
      </form>
      <router-link to="/login">← Back to Sign In</router-link>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { sendPasswordResetEmail } from 'firebase/auth'
const email = ref(''), sent = ref(false), error = ref('')
async function sendReset() {
  try { await sendPasswordResetEmail(auth, email.value); sent.value = true }
  catch (e) { error.value = 'Could not send reset email. Check the address.' }
}
</script>
<style scoped>
.center-page { min-height: 100vh; display: grid; place-items: center; background: var(--cs-bg); }
.card { background: #fff; border: 1px solid var(--cs-border); border-radius: 16px; padding: 40px; max-width: 420px; width: 90%; text-align: center; }
.icon { font-size: 40px; margin-bottom: 12px; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
p { font-size: 13px; color: var(--cs-muted); margin-bottom: 20px; }
.form { display: flex; flex-direction: column; gap: 12px; }
input { padding: 11px 14px; border: 1.5px solid var(--cs-border); border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; }
input:focus { border-color: var(--cs-blue); }
button { padding: 11px; background: var(--cs-blue); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; }
button:disabled { opacity: .6; cursor: not-allowed; }
a { font-size: 13px; color: var(--cs-blue); margin-top: 8px; display: block; }
.err { font-size: 13px; color: var(--cs-red); }
</style>
