<!-- src/views/Register.vue -->
<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left__logo"><span style="color:var(--cs-teal)">⟳</span> CareerSwipe</div>
      <h2 style="color:#fff;font-size:22px;font-weight:700;margin-top:auto">Join CareerSwipe today.</h2>
      <p style="color:rgba(255,255,255,.55);font-size:13px;margin-top:8px;margin-bottom:auto">Create your account and start your journey — whether you're hiring or applying.</p>
    </div>
    <div class="auth-right">
      <div class="auth-card">
        <div class="role-toggle" style="margin-bottom:20px">
          <span style="font-size:13px;color:var(--cs-muted)">I am a:</span>
          <button :class="{ active: roleTab === 'candidate' }" @click="roleTab = 'candidate'">Candidate</button>
          <button :class="{ active: roleTab === 'hr' }" @click="roleTab = 'hr'">HR</button>
        </div>

        <h3>Create {{ roleTab === 'hr' ? 'HR' : 'Candidate' }} Account</h3>
        <div class="tab-switch" style="margin:16px 0">
          <router-link to="/login" class="tab-switch__btn">Sign In</router-link>
          <button class="tab-switch__btn tab-switch__btn--active">Create Account</button>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="field-row">
            <div class="field"><label>First Name</label><input v-model="form.firstName" placeholder="Alex" required /></div>
            <div class="field"><label>Last Name</label><input v-model="form.lastName" placeholder="Johnson" required /></div>
          </div>
          <div class="field"><label>Email Address</label><input v-model="form.email" type="email" placeholder="you@example.com" required /></div>
          <template v-if="roleTab === 'hr'">
            <div class="field"><label>Company Name</label><input v-model="form.company" placeholder="Acme Corporation" /></div>
            <div class="field"><label>Job Title</label><input v-model="form.jobTitle" placeholder="Head of Talent Acquisition" /></div>
          </template>
          <div class="field"><label>Password</label><input v-model="form.password" type="password" placeholder="Minimum 8 characters" required minlength="8" /></div>
          <div class="field"><label>Confirm Password</label><input v-model="form.confirm" type="password" placeholder="••••••••" required /></div>

          <p v-if="error" class="form-error">{{ error }}</p>
          <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
            {{ loading ? 'Creating account…' : `Create ${roleTab === 'hr' ? 'HR' : 'Candidate'} Account →` }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase/config'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const roleTab = ref('candidate')
const loading = ref(false), error = ref('')
const form = ref({ firstName: '', lastName: '', email: '', password: '', confirm: '', company: '', jobTitle: '' })

async function handleRegister() {
  if (form.value.password !== form.value.confirm) { error.value = 'Passwords do not match.'; return }
  loading.value = true; error.value = ''
  try {
    const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      firstName: form.value.firstName,
      lastName:  form.value.lastName,
      email:     form.value.email,
      role:      roleTab.value,
      company:   form.value.company || '',
      jobTitle:  form.value.jobTitle || '',
      createdAt: serverTimestamp()
    })
    router.push(roleTab.value === 'hr' ? '/hr/dashboard' : '/careers')
  } catch (e) {
    error.value = e.message || 'Registration failed. Please try again.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }
.auth-left { width: 300px; flex-shrink: 0; background: var(--cs-navy); padding: 40px; display: flex; flex-direction: column; font-weight: 700; font-size: 18px; color: #fff; }
.auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
.auth-card { background: #fff; border: 1px solid var(--cs-border); border-radius: 16px; padding: 36px; width: 100%; max-width: 480px; }
.auth-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.role-toggle { display: flex; align-items: center; gap: 8px; }
.role-toggle button { padding: 5px 14px; border-radius: 20px; border: 1.5px solid var(--cs-border); font-size: 13px; font-weight: 600; background: #fff; color: var(--cs-muted); cursor: pointer; transition: all .15s; }
.role-toggle button.active { background: var(--cs-blue); border-color: var(--cs-blue); color: #fff; }
.tab-switch { display: flex; gap: 4px; background: var(--cs-bg); border-radius: 8px; padding: 4px; }
.tab-switch__btn { flex: 1; text-align: center; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; border: none; background: transparent; color: var(--cs-muted); cursor: pointer; transition: all .15s; text-decoration: none; display: block; }
.tab-switch__btn--active { background: #fff; color: var(--cs-text); }
.auth-form { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; }
.field input { padding: 10px 12px; border: 1.5px solid var(--cs-border); border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; }
.field input:focus { border-color: var(--cs-blue); }
.btn { padding: 11px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all .15s; }
.btn--primary { background: var(--cs-blue); color: #fff; }
.btn--primary:disabled { opacity: .6; cursor: not-allowed; }
.btn--full { width: 100%; }
.form-error { font-size: 13px; color: var(--cs-red); background: #FEF2F2; padding: 10px 12px; border-radius: 8px; }
@media (max-width: 768px) { .auth-left { display: none; } }
</style>
