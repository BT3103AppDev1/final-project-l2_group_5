<template>
  <div class="hr-dashboard">
    <nav class="navbar">
      <div class="brand">CareerSwipe</div>
      <div class="user-info">
        <span class="company-name">{{ user.companyName }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <h1>HR Dashboard - {{ user.fullName }}</h1>

        <!-- Create Job Section -->
        <section class="create-job-section">
          <h2>Post a New Job</h2>
          <form @submit.prevent="submitJob" class="job-form">
            <div class="form-group">
              <label>Job Title</label>
              <input v-model="newJob.title" type="text" required placeholder="e.g., Senior Vue Developer" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newJob.description" required placeholder="Job description..." rows="4"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Location</label>
                <input v-model="newJob.location" type="text" required placeholder="e.g., Singapore" />
              </div>
              <div class="form-group">
                <label>Salary Range (optional)</label>
                <input v-model="newJob.salary" type="text" placeholder="e.g., $5000-$8000/month" />
              </div>
            </div>
            <button :disabled="isLoading" class="submit-btn">
              {{ isLoading ? 'Publishing...' : 'Publish Job' }}
            </button>
          </form>
        </section>

        <!-- Posted Jobs Section -->
        <section class="jobs-section">
          <h2>Your Posted Jobs</h2>
          <div v-if="postedJobs.length === 0" class="no-jobs">
            You haven't posted any jobs yet.
          </div>
          <div v-else class="jobs-list">
            <div v-for="job in postedJobs" :key="job.id" class="job-item">
              <div class="job-title">{{ job.title }}</div>
              <div class="job-meta">
                <span>📍 {{ job.location }}</span>
                <span>Posted: {{ formatDate(job.createdAt) }}</span>
              </div>
              <div class="job-applicants">
                <h4>Applicants ({{ getApplicantCount(job.id) }})</h4>
                <div v-if="getJobApplicants(job.id).length === 0" class="no-applicants">
                  No applicants yet.
                </div>
                <div v-else class="applicants-list">
                  <div v-for="app in getJobApplicants(job.id)" :key="app.id" class="applicant">
                    <div class="applicant-name">{{ app.candidateName }}</div>
                    <div class="applicant-details">
                      <span class="applicant-email">{{ app.candidateEmail }}</span>
                      <select 
                        :value="app.status"
                        @change="updateApplicationStatus(app, $event)"
                        class="status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth, db } from '@/firebaseConfig'
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'

export default {
  name: 'HRDashboard',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      newJob: {
        title: '',
        description: '',
        location: '',
        salary: ''
      },
      postedJobs: [],
      applications: [],
      isLoading: false,
    }
  },
  mounted() {
    this.fetchPostedJobs()
    this.fetchApplications()
  },
  methods: {
    async submitJob() {
      if (!this.newJob.title || !this.newJob.description || !this.newJob.location) {
        alert('Please fill in all required fields')
        return
      }

      this.isLoading = true
      try {
        const jobsRef = collection(db, 'jobs')
        await addDoc(jobsRef, {
          title: this.newJob.title,
          description: this.newJob.description,
          location: this.newJob.location,
          salary: this.newJob.salary || 'Not specified',
          company: this.user.companyName,
          hrId: this.user.uid,
          hrEmail: this.user.email,
          createdAt: serverTimestamp()
        })

        alert('Job posted successfully!')
        this.newJob = { title: '', description: '', location: '', salary: '' }
        this.fetchPostedJobs()
      } catch (error) {
        console.error('Error posting job:', error)
        alert('Failed to post job')
      } finally {
        this.isLoading = false
      }
    },
    async fetchPostedJobs() {
      try {
        const jobsRef = collection(db, 'jobs')
        const q = query(jobsRef, where('hrId', '==', this.user.uid))
        const querySnapshot = await getDocs(q)
        this.postedJobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    },
    async fetchApplications() {
      try {
        const appRef = collection(db, 'applications')
        const q = query(appRef, where('hrId', '==', this.user.uid))
        const querySnapshot = await getDocs(q)
        this.applications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching applications:', error)
      }
    },
    getJobApplicants(jobId) {
      return this.applications.filter(app => app.jobId === jobId)
    },
    getApplicantCount(jobId) {
      return this.getJobApplicants(jobId).length
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp.toDate()).toLocaleDateString()
    },
    async updateApplicationStatus(application, event) {
      const newStatus = event.target.value
      try {
        const appRef = doc(db, 'applications', application.id)
        await updateDoc(appRef, { status: newStatus })
        application.status = newStatus
        alert('Application status updated')
      } catch (error) {
        console.error('Error updating status:', error)
        alert('Failed to update status')
      }
    },
    async handleLogout() {
      try {
        await signOut(auth)
        this.$emit('logout')
      } catch (error) {
        console.error('Logout error:', error)
        alert('Logout failed')
      }
    }
  }
}
</script>

<style scoped>
.hr-dashboard {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.company-name {
  color: #6b7280;
  font-weight: 500;
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

.job-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #1a237e;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.submit-btn {
  padding: 12px 24px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background: #151b60;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-jobs {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-item {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  background: #f9fafb;
}

.job-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.job-meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.job-applicants {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.job-applicants h4 {
  color: #374151;
  margin-bottom: 12px;
}

.no-applicants {
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 10px 0;
}

.applicants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.applicant {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.applicant-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}

.applicant-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.applicant-email {
  color: #6b7280;
  font-size: 0.9rem;
}

.status-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
}

.status-select:focus {
  outline: none;
  border-color: #1a237e;
}
</style>
