<template>
  <div class="candidate-dashboard">
    <nav class="navbar">
      <div class="brand">CareerSwipe</div>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </nav>

    <main class="main-content" v-if="user">
      <div class="container">
        <h1>Welcome, {{ user.fullName }}!</h1>
        
        <!-- Available Jobs Section -->
        <section class="jobs-section">
          <h2>Available Jobs</h2>
          <div v-if="jobs.length === 0" class="no-jobs">
            No jobs available at the moment.
          </div>
          <div v-else class="jobs-grid">
            <div v-for="job in jobs" :key="job.id" class="job-card">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <span class="company">{{ job.company }}</span>
              </div>
              <p class="job-desc">{{ job.description }}</p>
              <div class="job-footer">
                <span class="location">📍 {{ job.location }}</span>
                <button 
                  v-if="!hasApplied(job.id)" 
                  @click="openApplicationModal(job)"
                  class="apply-btn"
                  :disabled="applyingJobId === job.id"
                >
                  {{ applyingJobId === job.id ? 'Applying...' : 'Apply' }}
                </button>
                <span v-else class="applied-badge">✓ Applied</span>
              </div>
            </div>
          </div>
        </section>

        <!-- My Applications Section -->
        <section class="applications-section">
          <h2>My Applications</h2>
          <div v-if="applications.length === 0" class="no-applications">
            You haven't applied to any jobs yet.
          </div>
          <div v-else class="applications-list">
            <div v-for="app in applications" :key="app.id" class="application-item">
              <div class="app-job-title">{{ getJobTitle(app.jobId) }}</div>
              <div class="app-details">
                <span class="app-date">Applied: {{ formatDate(app.createdAt) }}</span>
                <span :class="['app-status', app.status.toLowerCase()]">
                  {{ app.status }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <ApplicationFormModal
      v-if="showApplicationModal && selectedJob"
      :job="selectedJob"
      :loading="applyingJobId === selectedJob.id"
      @close="closeApplicationModal"
      @submit-application="submitApplicationForm"
    />
  </div>
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth, db, storage } from '@/firebaseConfig'
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import ApplicationFormModal from '@/components/application/ApplicationFormModal.vue'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'CandidateDashboard',
  components: {
    ApplicationFormModal
  },
  setup() {
    return {
      router: useRouter()
    }
  },
  data() {
    return {
      user: null,
      jobs: [],
      applications: [],
      applyingJobId: null,
      showApplicationModal: false,
      selectedJob: null
    }
  },
  mounted() {
    this.fetchUserData().then(() => {
      this.fetchJobs()
      this.fetchApplications()
    })
  },
  methods: {
    async fetchUserData() {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid)
          const userSnapshot = await getDoc(userRef)
          if (userSnapshot.exists()) {
            this.user = userSnapshot.data()
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
    async fetchJobs() {
      try {
        const jobsRef = collection(db, 'jobs')
        const querySnapshot = await getDocs(jobsRef)
        this.jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching jobs:', error)
        alert('Failed to load jobs')
      }
    },
    async fetchApplications() {
      try {
        const appRef = collection(db, 'applications')
        const q = query(appRef, where('candidateId', '==', this.user.uid))
        const querySnapshot = await getDocs(q)
        this.applications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching applications:', error)
      }
    },
    async submitApplicationForm(formData) {
      if (!this.selectedJob) {
        alert('No job selected.')
        return
      }

      const job = this.selectedJob

      if (this.hasApplied(job.id)) {
        alert('You have already applied for this job.')
        return
      }

      this.applyingJobId = job.id

      try {
        let resumeUrl = ''

        if (formData.resumeFile) {
          const file = formData.resumeFile
          const safeFileName = file.name.replace(/\s+/g, '_')
          const filePath = `resumes/${this.user.uid}/${job.id}-${Date.now()}-${safeFileName}`
          const storageRef = ref(storage, filePath)

          await uploadBytes(storageRef, file)
          resumeUrl = await getDownloadURL(storageRef)
        }

        const appRef = collection(db, 'applications')
        await addDoc(appRef, {
          jobId: job.id,
          hrId: job.hrId,
          candidateId: this.user.uid,
          candidateName: this.user.fullName,
          candidateEmail: this.user.email,
          phone: formData.phone,
          resumeUrl: resumeUrl,
          coverLetter: formData.coverLetter,
          status: 'Pending',
          createdAt: serverTimestamp()
        })

        await this.fetchApplications()
        this.closeApplicationModal()
        alert('Application submitted successfully!')
      } catch (error) {
        console.error('Error applying for job:', error)
        alert('Failed to submit application')
      } finally {
        this.applyingJobId = null
      }
    },
    hasApplied(jobId) {
      return this.applications.some(app => app.jobId === jobId)
    },
    getJobTitle(jobId) {
      const job = this.jobs.find(j => j.id === jobId)
      return job ? job.title : 'Unknown Job'
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp.toDate()).toLocaleDateString()
    },
    async handleLogout() {
      try {
        await signOut(auth)
        alert('Logged out successfully')
        this.router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        alert('Logout failed')
      }
    },
    
    openApplicationModal(job) {
      if (this.hasApplied(job.id)) {
        alert('You have already applied for this job.')
        return
      }

      this.selectedJob = job
      this.showApplicationModal = true
    },

    closeApplicationModal() {
      this.showApplicationModal = false
      this.selectedJob = null
    },
  }
}
</script>

<style scoped>
.candidate-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a237e;
}

.logout-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}

.main-content {
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.container > h1 {
  font-size: 2rem;
  color: #1a237e;
  margin-bottom: 40px;
}

section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

section h2 {
  font-size: 1.5rem;
  color: #1a237e;
  margin-bottom: 20px;
  border-bottom: 3px solid #1a237e;
  padding-bottom: 10px;
}

.no-jobs,
.no-applications {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 1rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.job-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
}

.job-card:hover {
  border-color: #1a237e;
  box-shadow: 0 5px 20px rgba(26, 35, 126, 0.15);
}

.job-header {
  margin-bottom: 12px;
}

.job-header h3 {
  font-size: 1.2rem;
  color: #111827;
  margin: 0 0 4px 0;
}

.company {
  font-size: 0.9rem;
  color: #6b7280;
}

.job-desc {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 12px 0;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.location {
  color: #6b7280;
  font-size: 0.9rem;
}

.apply-btn {
  padding: 8px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.apply-btn:hover:not(:disabled) {
  background: #151b60;
}

.apply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.applied-badge {
  color: #10b981;
  font-weight: 600;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  background: #f9fafb;
}

.app-job-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.app-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-date {
  color: #9ca3af;
  font-size: 0.9rem;
}

.app-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.app-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.app-status.accepted {
  background: #d1fae5;
  color: #065f46;
}

.app-status.rejected {
  background: #fee2e2;
  color: #7f1d1d;
}
</style>
