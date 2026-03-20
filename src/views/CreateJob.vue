<!-- src/views/CreateJob.vue -->
<template>
  <div class="hr-layout">
    <!-- Sidebar reused via import ideally, but kept simple here -->
    <main class="main">
      <header class="topbar">
        <div>
          <p class="topbar__breadcrumb">
            <router-link to="/hr/dashboard">HR Portal</router-link> / Jobs / Create Job Posting
          </p>
          <h1 class="topbar__title">Create Job Posting</h1>
          <p class="topbar__sub">Define role details and publish to candidates</p>
        </div>
        <span class="draft-badge">Draft</span>
      </header>

      <form class="job-form" @submit.prevent="publishJob">
        <div class="form-grid">
          <!-- LEFT: Basic Info -->
          <div class="form-card">
            <div class="form-step">
              <span class="step-num">1</span>
              <span class="step-label">Basic Information</span>
            </div>

            <div class="field">
              <label>Job Title *</label>
              <input v-model="form.title" type="text" placeholder="e.g. Senior Product Designer" required />
            </div>
            <div class="field-row">
              <div class="field">
                <label>Department *</label>
                <select v-model="form.department" required>
                  <option value="">Select department</option>
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div class="field">
                <label>Employment Type *</label>
                <select v-model="form.employmentType" required>
                  <option value="">Select type</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Location *</label>
              <input v-model="form.location" type="text" placeholder="e.g. Singapore, Remote, Hybrid" required />
            </div>

            <div class="field">
              <label>Posting Status</label>
              <div class="toggle-group">
                <label class="toggle-option" :class="{ active: form.status === 'active' }">
                  <input type="radio" v-model="form.status" value="active" />
                  <span class="toggle-dot active-dot"></span>
                  <div>
                    <strong>Active</strong>
                    <small>Publish immediately</small>
                  </div>
                </label>
                <label class="toggle-option" :class="{ active: form.status === 'closed' }">
                  <input type="radio" v-model="form.status" value="closed" />
                  <span class="toggle-dot"></span>
                  <div>
                    <strong>Closed</strong>
                    <small>Save as draft</small>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- RIGHT: Role Details -->
          <div class="form-card">
            <div class="form-step">
              <span class="step-num">2</span>
              <span class="step-label">Role Details</span>
            </div>

            <div class="field">
              <label>Job Description * <small>{{ form.description.length }} words</small></label>
              <textarea v-model="form.description" rows="5" placeholder="Describe the role in detail..." required></textarea>
            </div>
            <div class="field">
              <label>Requirements * <small>{{ form.requirements.length }} words</small></label>
              <textarea v-model="form.requirements" rows="5" placeholder="List skills, experience, and qualifications..." required></textarea>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <router-link to="/hr/dashboard" class="btn btn--ghost">Cancel</router-link>
          <button type="submit" class="btn btn--primary" :disabled="publishing">
            <span v-if="publishing">Publishing…</span>
            <span v-else>Publish Job →</span>
          </button>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const publishing = ref(false)
const error = ref('')

const departments = ['Engineering', 'Product', 'Marketing', 'Design', 'HR', 'Finance', 'Operations']

const form = ref({
  title: '', department: '', employmentType: '',
  location: '', status: 'active', description: '', requirements: ''
})

async function publishJob() {
  publishing.value = true
  error.value = ''
  try {
    await addDoc(collection(db, 'jobs'), {
      ...form.value,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      totalApplicants: 0, reviewed: 0, shortlisted: 0, interviews: 0
    })
    router.push('/hr/dashboard')
  } catch (e) {
    error.value = 'Failed to publish job. Please try again.'
    console.error(e)
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.hr-layout { min-height: 100vh; background: var(--cs-bg); }
.main { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }

.topbar { margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
.topbar__breadcrumb { font-size: 12px; color: var(--cs-muted); margin-bottom: 4px; }
.topbar__breadcrumb a { color: var(--cs-blue); }
.topbar__title { font-size: 22px; font-weight: 700; }
.topbar__sub { font-size: 13px; color: var(--cs-muted); margin-top: 2px; }
.draft-badge { font-size: 12px; font-weight: 600; background: #FEF3C7; color: #D97706; padding: 5px 12px; border-radius: 20px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-card { background: #fff; border: 1px solid var(--cs-border); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 16px; }

.form-step { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.step-num { width: 26px; height: 26px; border-radius: 50%; background: var(--cs-blue); color: #fff; font-size: 13px; font-weight: 700; display: grid; place-items: center; }
.step-label { font-size: 15px; font-weight: 700; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: var(--cs-text); }
.field label small { font-weight: 400; color: var(--cs-muted); margin-left: 6px; }
.field input, .field select, .field textarea {
  padding: 10px 12px; border: 1.5px solid var(--cs-border); border-radius: 8px;
  font-family: inherit; font-size: 14px; color: var(--cs-text); background: #fff;
  transition: border-color .15s; outline: none; resize: vertical;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--cs-blue); }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.toggle-group { display: flex; gap: 10px; }
.toggle-option {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 12px; border: 2px solid var(--cs-border); border-radius: 8px; cursor: pointer;
  transition: all .15s;
}
.toggle-option input { display: none; }
.toggle-option.active { border-color: var(--cs-blue); background: #F0F6FF; }
.toggle-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--cs-border); flex-shrink: 0; }
.active-dot { background: var(--cs-green); }
.toggle-option strong { font-size: 13px; display: block; }
.toggle-option small { font-size: 11px; color: var(--cs-muted); }

.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all .15s; text-decoration: none; }
.btn--primary { background: var(--cs-blue); color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1460d4; }
.btn--primary:disabled { opacity: .6; cursor: not-allowed; }
.btn--ghost { background: transparent; color: var(--cs-text); border: 1.5px solid var(--cs-border); }
.form-error { text-align: center; color: var(--cs-red); font-size: 13px; margin-top: 8px; }

@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
</style>
