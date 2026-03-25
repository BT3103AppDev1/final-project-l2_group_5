<template>
    <div class="job-creation-container">
      <div class="breadcrumbs">
        <router-link to="/hr-dashboard" class="muted" style="text-decoration: none;">Dashboard</router-link> &gt; 
        <span class="active">Edit Job Posting</span>
      </div>
  
      <header class="page-header">
        <div class="header-titles">
          <h1>Edit Job Posting</h1>
          <p class="muted">Update role details and sync changes to the candidate portal.</p>
        </div>
        <button class="btn-secondary" @click="router.push('/hr-dashboard')">Cancel</button>
      </header>
  
      <div v-if="pageLoading" style="text-align: center; padding: 3rem;">
        <div class="spinner" style="margin: 0 auto 1rem; width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1e3a8a; border-radius: 50%; animation: spin 0.7s linear infinite;"></div>
        <p class="muted">Loading job details...</p>
      </div>
  
      <main v-else class="grid-layout">
        
        <section class="card-column basic-info-col">
          <div class="card basic-info-card">
            <div class="section-header">
              <span class="step-badge">1</span>
              <h2>Basic Information</h2>
              <p class="muted header-info">Core details candidates see first.</p>
            </div>
            
            <div class="form-group">
              <label>Job Title <span class="required-star">*</span></label>
              <p class="muted field-info">Use a clear, searchable title.</p>
              <input type="text" v-model="form.title" placeholder="e.g. Senior Product Designer" />
            </div>
  
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Department <span class="required-star">*</span></label>
                <select v-model="form.department">
                  <option value="" disabled selected>Select department</option>
                  <option v-for="dept in dropdownOptions.departments" :key="dept" :value="dept">
                    {{ dept }}
                  </option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Employment Type <span class="required-star">*</span></label>
                <select v-model="form.employmentType">
                  <option value="" disabled selected>Select type</option>
                  <option v-for="type in dropdownOptions.types" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
            </div>
  
            <div class="form-group">
              <label>Location <span class="required-star">*</span></label>
              <p class="muted field-info">City, state, 'Remote', or 'Hybrid'.</p>
              <select v-model="form.location">
                <option value="" disabled selected>Select location</option>
                <option v-for="loc in dropdownOptions.locations" :key="loc" :value="loc">
                  {{ loc }}
                </option>
              </select>
            </div>
  
          </div>
        </section>
  
        <section class="card-column role-details-col">
          <div class="card role-details-card">
            <div class="section-header">
              <span class="step-badge">2</span>
              <h2>Role Details</h2>
              <p class="muted header-info">Describe the position and its requirements.</p>
            </div>
  
            <div class="form-group">
              <label>Job Description <span class="required-star">*</span></label>
              <p class="muted field-info">Key responsibilities and day-to-day expectations.</p>
              <div class="textarea-wrapper">
                <div class="textarea-toolbar">
                  <button type="button">B</button><button type="button">I</button><button type="button">U</button> |
                </div>
                <textarea v-model="form.description" rows="10"></textarea>
                <div class="word-count muted">
                  {{ descriptionWordCount }} words
                </div>
              </div>
            </div>
  
            <div class="form-group mt-4">
              <label>Requirements <span class="required-star">*</span></label>
              <p class="muted field-info">Qualifications, skills, and experience levels.</p>
              <div class="textarea-wrapper">
                  <div class="textarea-toolbar">
                  <button type="button">B</button><button type="button">I</button><button type="button">U</button> |
                </div>
                <textarea v-model="form.requirements" rows="10"></textarea>
                <div class="word-count muted">
                  {{ requirementsWordCount }} words
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <aside class="sidebar-col">
          <div class="card sidebar-unified-card">
              
              <div class="section-header">
              <span class="step-badge">3</span>
              <h2>Posting Status</h2>
              <p class="muted header-info">Controls visibility on the portal.</p>
              </div>
  
              <div class="checklist-section mb-4">
              <h4 class="checklist-title muted">COMPLETION</h4>
              <ul class="checklist">
                  <li><input type="radio" :checked="completionState.titleFilled" disabled> Job Title</li>
                  <li><input type="radio" :checked="completionState.departmentFilled" disabled> Department</li>
                  <li><input type="radio" :checked="completionState.locationFilled" disabled> Location</li>
                  <li><input type="radio" :checked="completionState.typeFilled" disabled> Employment Type</li>
                  <li><input type="radio" :checked="completionState.descriptionFilled" disabled> Job Description</li>
                  <li><input type="radio" :checked="completionState.requirementsFilled" disabled> Requirements</li>
              </ul>
              </div>
  
              <div class="status-toggle-horizontal mb-4">
                  <label class="status-card" :class="{ 'selected-active': form.status === 'active' }" style="cursor: default;">
                      <input type="radio" :checked="form.status === 'active'" disabled>
                      <span class="status-dot green"></span>
                      <div class="status-text-content"><strong>Active</strong></div>
                  </label>
                  
                  <label class="status-card" :class="{ 'selected-inactive-red': form.status === 'inactive' }" style="cursor: default;">
                      <input type="radio" :checked="form.status === 'inactive'" disabled>
                      <span class="status-dot red"></span>
                      <div class="status-text-content"><strong>Inactive</strong></div>
                  </label>
              </div>
  
              <button class="btn-primary full-width" @click="updateJob" :disabled="isSaving">
                {{ isSaving ? 'Updating...' : (form.status === 'active' ? 'Update & Publish' : 'Update Draft') }}
              </button>
          </div>
          </aside>
  
      </main>
    </div>
</template>
  
<script setup>
  import { ref, computed, reactive, watch, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { db, auth } from '@/firebaseConfig'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  
  const router = useRouter()
  const route = useRoute()
  const pageLoading = ref(true)
  const isSaving = ref(false)
  const jobId = route.params.id
  
  // 1. Reactive form exactly like CreateJob
  const form = reactive({
    title: '',
    department: '',
    employmentType: '',
    location: '',
    status: 'active',
    description: '',
    requirements: ''
  })
  
  const dropdownOptions = reactive({
    departments: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'],
    types: ['Full-time', 'Part-time', 'Contract'],
    locations: ['Remote', 'Hybrid', 'On-site']
  })
  
  // 2. Fetch data on load
  onMounted(async () => {
    if (!jobId) return
    try {
      const docRef = doc(db, 'jobs', jobId)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        Object.assign(form, snap.data())
      } else {
        alert("Job not found.")
        router.push('/hr-dashboard')
      }
    } catch (e) {
      console.error("Error loading job:", e)
    } finally {
      pageLoading.value = false
    }
  })
  
  // 3. Logic helpers
  const countWords = (text) => text ? text.trim().split(/\s+/).filter(Boolean).length : 0
  const descriptionWordCount = computed(() => countWords(form.description))
  const requirementsWordCount = computed(() => countWords(form.requirements))
  
  const completionState = reactive({
    titleFilled: computed(() => !!form.title),
    departmentFilled: computed(() => !!form.department),
    locationFilled: computed(() => !!form.location),
    typeFilled: computed(() => !!form.employmentType),
    descriptionFilled: computed(() => !!form.description),
    requirementsFilled: computed(() => !!form.requirements)
  })
  
  const isFormComplete = computed(() => Object.values(completionState).every(val => val))
  
  // 4. Status brain
  watch(isFormComplete, (complete) => {
    form.status = complete ? 'active' : 'inactive'
  }, { immediate: true })
  
  // 5. Update Action
  const updateJob = async () => {
    if (!auth.currentUser) return alert('You must be logged in.')
    isSaving.value = true
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        ...form,
        hrId: auth.currentUser.uid
      })
      alert('Job updated successfully!')
      router.push('/hr-dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update job. Please check permissions.')
    } finally {
      isSaving.value = false
    }
  }
</script>
  
<style scoped>
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Global Resets */
  .job-creation-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2.5rem; color: #1a1f2c; background-color: #f8fafc; min-height: 100vh; }
  h1, h2, h3, h4, strong { margin: 0; font-weight: 600; }
  p { margin: 0; }
  .muted { color: #6e7a8e; font-weight: 400; }
  .flex-1 { flex: 1; }
  .mt-4 { margin-top: 1.5rem; }
  .required-star { color: #e53e3e; }
  
  /* Breadcrumbs & Header */
  .breadcrumbs { font-size: 0.85rem; margin-bottom: 0.5rem; }
  .breadcrumbs .active { color: #1a1f2c; font-weight: 500; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .page-header h1 { font-size: 1.75rem; }
  
  /* Layout & Cards */
  .grid-layout { display: grid; grid-template-columns: 1.5fr 2fr 1.5fr; gap: 1.5rem; align-items: stretch; }
  .card { background-color: #ffffff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
  .section-header { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
  .step-badge { background-color: #1e3a8a; color: #ffffff; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin-top: 0.15rem; }
  .section-header h2 { font-size: 1.1rem; flex: 1; }
  .header-info { width: 100%; padding-left: 2rem; font-size: 0.9rem; margin-top: -0.25rem; }
  
  /* Forms */
  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.35rem; }
  .field-info { font-size: 0.8rem; margin-bottom: 0.5rem; margin-top: -0.2rem;}
  .form-row { display: flex; gap: 1rem; }
  input[type="text"], select, textarea { width: 100%; box-sizing: border-box; padding: 0.6rem; border-radius: 6px; border: 1px solid #cbd5e1; background-color: #ffffff; font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s; }
  input[type="text"]:focus, select:focus, textarea:focus { outline: none; border-color: #1e3a8a; box-shadow: 0 0 0 1px rgba(30, 58, 138, 0.2); }
  
  /* Textarea Toolbar */
  .textarea-wrapper { position: relative; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #ffffff; }
  .textarea-wrapper textarea { border: none; padding: 1rem; padding-top: 2.5rem; resize: vertical; margin-bottom: 2rem;}
  .textarea-toolbar { position: absolute; top: 0; left: 0; right: 0; border-bottom: 1px solid #e2e8f0; padding: 0.4rem 1rem; display: flex; gap: 0.25rem; font-size: 0.8rem; background-color: #ffffff; border-radius: 6px 6px 0 0; }
  .textarea-toolbar button { background: none; border: none; cursor: pointer; padding: 2px 5px; font-family: serif; font-weight: bold;}
  .textarea-toolbar button:hover { background-color: #f1f5f9; }
  .word-count { position: absolute; bottom: 0.6rem; right: 0.6rem; font-size: 0.75rem; pointer-events: none;}
  
  /* Checklist (Fixed dot centering) */
  .checklist-title { font-size: 0.7rem; letter-spacing: 0.1em; margin-bottom: 1rem;}
  .checklist { list-style: none; padding: 0; margin: 0; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .checklist li { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
  .checklist input[type="radio"] { appearance: none; width: 16px; height: 16px; border-radius: 50%; border: 1px solid #cbd5e1; background-color: #ffffff; position: relative; margin: 0; }
  .checklist input[type="radio"]:checked { border-color: #22c55e; }
  .checklist input[type="radio"]:checked::after { content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; }
  
  /* Status Cards (Fixed colors and red text) */
  .mb-4 { margin-bottom: 1.5rem;}
  .status-toggle-horizontal { display: flex; gap: 0.75rem; width: 100%; margin-bottom: 1.5rem;}
  .status-card { flex: 1; display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; }
  .status-card input[type="radio"] { display: none; }
  .status-text-content { display: flex; flex-direction: column;}
  
  /* Active State */
  .status-card.selected-active { border-color: #22c55e; background-color: #f0fdf4; }
  .selected-active .status-dot.green { background-color: #22c55e; border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2); }
  
  /* Inactive State */
  .status-card.selected-inactive-red { border-color: #e53e3e; background-color: #fff5f5; }
  .selected-inactive-red .status-text-content strong { color: #c53030; }
  .selected-inactive-red .status-dot.red { background-color: #e53e3e; border-color: #e53e3e; box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.2); }
  
  /* Status Dots Default */
  .status-dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1; background-color: #ffffff; flex-shrink: 0; }
  
  /* Buttons */
  .btn-primary { background-color: #1e3a8a; color: #ffffff; border: none; font-size: 0.85rem; font-weight: 500; padding: 0.8rem 1.25rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;}
  .btn-primary:hover { background-color: #172554; }
  .btn-primary:disabled { background-color: #94a3b8; cursor: not-allowed; }
  .btn-secondary { background-color: #ffffff; color: #1a1f2c; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 500; border-radius: 6px; padding: 0.6rem 1.25rem; cursor: pointer; transition: all 0.2s;}
  .btn-secondary:hover { background-color: #f1f5f9; }
  .full-width { width: 100%; }
</style>