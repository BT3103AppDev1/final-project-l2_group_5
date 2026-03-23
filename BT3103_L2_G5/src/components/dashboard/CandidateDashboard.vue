<template>
  <div class="candidate-dashboard">
    <nav class="navbar">
      <div class="brand">CareerSwipe</div>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </nav>

    <main v-if="user">
      <section class="hero">
        <div class="hero-overlay"></div>

        <div class="hero-content">
          <div class="hero-pill">
            <span class="pill-dot"></span>
            <span>{{ jobs.length }} open positions</span>
          </div>

          <h1>Find Your Next Opportunity</h1>
          <p>
            Browse open roles across teams and apply directly through CareerSwipe.
            Track your applications in one place.
          </p>

          <div class="hero-search">
            <input
            v-model="searchInput"
            @keyup.enter="applySearch"
            type="text"
            placeholder="Search job titles, keywords, or departments..."
            />
            <button @click="applySearch" type="button">Search</button>
          </div>
        </div>
      </section>

      <section class="filter-bar">
        <div class="filter-inner">
          <span class="filter-label">Filter by:</span>

          <select v-model="department" class="filter-select">
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>

          <select v-model="location" class="filter-select">
            <option v-for="loc in locations" :key="loc" :value="loc">
              {{ loc }}
            </option>
          </select>

          <select v-model="empType" class="filter-select">
            <option v-for="type in empTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <button
            v-if="hasFilters"
            @click="clearFilters"
            class="clear-btn"
            type="button"
          >
            Clear filters
          </button>

          <span class="results-count">
            {{ filteredJobs.length }}
            {{ filteredJobs.length === 1 ? 'role' : 'roles' }} found
          </span>
        </div>
      </section>

      <div class="page-content">
        <section class="jobs-section">
          <div class="section-header">
            <div>
              <h2>{{ hasFilters ? 'Search Results' : 'All Open Positions' }}</h2>
              <p>Updated daily</p>
            </div>
          </div>

          <div v-if="filteredJobs.length === 0" class="empty-state">
            <div class="empty-icon">⌕</div>
            <h3>No roles match your filters</h3>
            <p>Try adjusting or clearing your search criteria.</p>
            <button @click="clearFilters" type="button">Clear all filters</button>
          </div>

          <div v-else class="jobs-grid">
            <div v-for="job in filteredJobs" :key="job.id" class="job-card">
              <div class="job-card-top">
                <span
                  class="dept-badge"
                  :style="getDepartmentBadgeStyle(job.department)"
                >
                  {{ job.department || 'General' }}
                </span>

                <span class="job-type">
                  {{ job.type || 'Full-time' }}
                </span>
              </div>

              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <span class="company">{{ job.company }}</span>
              </div>

              <div class="job-meta">
                <span>📍 {{ job.location }}</span>
                <span v-if="job.posted">{{ job.posted }}</span>
                <span v-if="job.applicants">{{ job.applicants }} applicants</span>
              </div>

              <p class="job-desc">
                {{ job.description }}
              </p>

              <div class="job-footer">
                <button class="details-btn" type="button" @click="viewJobDetails(job.id)">
                  View Details
                </button>

                <button
                  v-if="!hasApplied(job.id)"
                  @click="openApplicationModal(job)"
                  class="apply-btn"
                  :disabled="applyingJobId === job.id"
                  type="button"
                >
                  {{ applyingJobId === job.id ? 'Applying...' : 'Apply Now' }}
                </button>

                <span v-else class="applied-badge">✓ Applied</span>
              </div>
            </div>
          </div>
        </section>

        <section class="applications-section">
          <div class="section-header">
            <div>
              <h2>My Applications</h2>
              <p>Track the status of your submitted applications</p>
            </div>
          </div>

          <div v-if="applications.length === 0" class="no-applications">
            You haven't applied to any jobs yet.
          </div>

          <div v-else class="applications-list">
            <div
              v-for="app in applications"
              :key="app.id"
              class="application-item"
            >
            <div class="app-job-title">{{ getJobTitle(app) }}</div>
              <div class="app-details">
                <span class="app-date">
                  Applied: {{ formatDate(app.createdAt) }}
                </span>
                <span :class="['app-status', app.status.toLowerCase()]">
                  {{ app.status }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">CareerSwipe</span>
            <span class="footer-copy">© 2026. All rights reserved.</span>
          </div>

          <div class="footer-links">
            <button type="button">Privacy Policy</button>
            <button type="button">Terms of Use</button>
            <button type="button">Accessibility</button>
            <button type="button">Contact HR</button>
          </div>
        </div>
      </footer>
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
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore'
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
      selectedJob: null,
      searchInput: '',
      searchQuery: '',
      department: 'All Departments',
      location: 'All Locations',
      empType: 'All Types',
      sortBy: 'Most Recent'
    }
  },
  computed: {
    locations() {
      const uniqueLocations = new Set()
      this.jobs.forEach((job) => {
        if (job.location) {
          uniqueLocations.add(job.location)
        }
      })
      return ['All Locations', ...Array.from(uniqueLocations).sort()]
    },
    departments() {
      const set = new Set()
      this.jobs.forEach(job => {
        if (job.department) set.add(job.department)
      })
    return ['All Departments', ...Array.from(set).sort()]
  },
  empTypes() {
    const set = new Set()
    this.jobs.forEach(job => {
      if (job.type) set.add(job.type)
    })
  return ['All Types', ...Array.from(set).sort()]
},
    filteredJobs() {
      return this.jobs.filter((job) => {
        const q = (this.searchQuery || '').trim().toLowerCase()

        const matchesQuery =
          !q ||
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.department && job.department.toLowerCase().includes(q)) ||
          (job.description && job.description.toLowerCase().includes(q)) ||
          (job.company && job.company.toLowerCase().includes(q))

        const matchesDept =
          this.department === 'All Departments' ||
          (job.department || 'General') === this.department

        const matchesLoc =
          this.location === 'All Locations' || job.location === this.location

        const matchesType =
          this.empType === 'All Types' ||
          (job.type || 'Full-time') === this.empType

        return matchesQuery && matchesDept && matchesLoc && matchesType
      })
    },

    hasFilters() {
      return (
        this.searchQuery !== '' ||
        this.department !== 'All Departments' ||
        this.location !== 'All Locations' ||
        this.empType !== 'All Types'
      )
    }
  },
  mounted() {
    this.fetchUserData().then(() => {
      this.fetchJobs()
      this.fetchApplications()
    })
  },
  methods: {
    applySearch() {
      this.searchQuery = this.searchInput
    },
    async fetchUserData() {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid)
          const userSnapshot = await getDoc(userRef)
          if (userSnapshot.exists()) {
            this.user = {
              uid: currentUser.uid,
              ...userSnapshot.data()
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
    async fetchJobs() {
      try {
        const jobsRef = collection(db, 'jobs')
        const q = query(jobsRef, where('status', '==', 'active'))
        const querySnapshot = await getDocs(q)
        this.jobs = querySnapshot.docs.map((doc) => ({
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
        if (!this.user?.uid) return

        const appRef = collection(db, 'applications')
        const q = query(appRef, where('candidateId', '==', this.user.uid))
        const querySnapshot = await getDocs(q)
        this.applications = querySnapshot.docs.map((doc) => ({
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
      return this.applications.some((app) => app.jobId === jobId)
    },

    getJobTitle(app) {
      return app.jobTitle || 'Unknown Job'
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp.toDate()).toLocaleDateString()
    },

    clearFilters() {
      this.searchInput = ''
      this.searchQuery = ''
      this.department = 'All Departments'
      this.location = 'All Locations'
      this.empType = 'All Types'
    },

    viewJobDetails(jobId) {
      const job = this.jobs.find(j => j.id === jobId)
      if (job) {
        alert(`${job.title}\n\n${job.description}\n\nRequirements:\n${job.requirements || 'N/A'}`)
      }
    },

    getDepartmentBadgeStyle(department) {
      const styles = {
        Product: { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
        Engineering: { backgroundColor: '#F0F9FF', color: '#0369A1' },
        Marketing: { backgroundColor: '#FAF5FF', color: '#7E22CE' },
        Design: { backgroundColor: '#FFF7ED', color: '#C2410C' },
        Analytics: { backgroundColor: '#F0FDFA', color: '#0F766E' },
        Sales: { backgroundColor: '#FFFBEB', color: '#B45309' },
        Finance: { backgroundColor: '#F8FAFC', color: '#475569' },
        'Human Resources': { backgroundColor: '#F0FDF4', color: '#15803D' },
        'Customer Success': { backgroundColor: '#FDF4FF', color: '#9333EA' },
        General: { backgroundColor: '#F3F4F6', color: '#374151' }
      }

      return styles[department] || styles.General
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
  background: #f3f4f6;
  color: #111827;
}

.navbar {
  background: #ffffff;
  padding: 18px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.9rem;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: -0.02em;
}

.logout-btn {
  padding: 10px 18px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #c82333;
}

.hero {
  position: relative;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background:
    linear-gradient(180deg, rgba(15, 34, 96, 0.65), rgba(15, 34, 96, 0.88)),
    url("https://images.unsplash.com/photo-1651331189285-64ef5906d6f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwb2ZmaWNlJTIwYnVpbGRpbmclMjBleHRlcmlvciUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzE4NTQzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080");
  background-size: cover;
  background-position: center 30%;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
}

.hero-content {
  position: relative;
  max-width: 760px;
  text-align: center;
  color: #ffffff;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 6px 14px;
  margin-bottom: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
}

.hero-content h1 {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
}

.hero-content p {
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 28px;
}

.hero-search {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  max-width: 620px;
  margin: 0 auto;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

.hero-search input {
  flex: 1;
  height: 54px;
  border: none;
  outline: none;
  padding: 0 16px;
  font-size: 0.95rem;
  color: #111827;
}

.hero-search button {
  height: 54px;
  padding: 0 24px;
  border: none;
  background: #1e3a8a;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.filter-bar {
  position: sticky;
  top: 76px;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.filter-inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 14px 40px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: nowrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  min-width: 170px;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 0 12px;
  font-size: 0.9rem;
  color: #374151;
  outline: none;
}

.filter-select {
  flex: 1;
  min-width: 220px;
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 14px;
  font-size: 0.95rem;
  color: #374151;
  outline: none;
}

.clear-btn {
  height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: transparent;
  padding: 0 14px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
}

.results-count {
  margin-left: auto;
  font-size: 0.9rem;
  color: #9ca3af;
  white-space: nowrap;
}

.page-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 40px 72px;
}

.jobs-section,
.applications-section {
  background: #ffffff;
  border-radius: 14px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.45rem;
  color: #111827;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.section-header p {
  color: #9ca3af;
  font-size: 0.88rem;
  margin: 0;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.job-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 22px;
  transition: all 0.22s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.job-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.1);
}

.job-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
}

.dept-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.job-type {
  font-size: 0.72rem;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 3px 8px;
  font-weight: 500;
}

.job-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
  line-height: 1.35;
}

.company {
  font-size: 0.9rem;
  color: #6b7280;
  display: inline-block;
  margin-bottom: 12px;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 0.8rem;
  color: #6b7280;
}

.job-desc {
  font-size: 0.92rem;
  color: #4b5563;
  line-height: 1.65;
  margin: 0;
  min-height: 72px;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  gap: 12px;
}

.details-btn {
  background: none;
  border: none;
  padding: 0;
  color: #1e3a8a;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
}

.details-btn:hover {
  text-decoration: underline;
}

.apply-btn {
  padding: 9px 18px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.apply-btn:hover:not(:disabled) {
  background: #172d6c;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.22);
}

.apply-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.applied-badge {
  color: #10b981;
  font-weight: 600;
  font-size: 0.92rem;
}

.empty-state,
.no-applications {
  text-align: center;
  padding: 60px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  color: #6b7280;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 20px 0;
}

.empty-state button {
  font-size: 0.92rem;
  font-weight: 600;
  color: #1e3a8a;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  background: #eff6ff;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
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
  gap: 12px;
  flex-wrap: wrap;
}

.app-date {
  color: #9ca3af;
  font-size: 0.9rem;
}

.app-status {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
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

.footer {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 24px 40px;
}

.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.footer-logo {
  font-size: 1rem;
  font-weight: 700;
  color: #1e3a8a;
}

.footer-copy {
  font-size: 0.78rem;
  color: #9ca3af;
}

.footer-links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-links button {
  font-size: 0.78rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.footer-links button:hover {
  color: #374151;
}

@media (max-width: 900px) {
  .navbar,
  .filter-inner,
  .page-content,
  .footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero-content h1 {
    font-size: 2.2rem;
  }

  .hero-search {
    flex-direction: column;
    border-radius: 12px;
  }

  .hero-search input,
  .hero-search button {
    width: 100%;
  }

  .hero-search button {
    border-top: 1px solid #e5e7eb;
  }

  .results-count {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .brand {
    font-size: 1.5rem;
  }

  .hero {
    min-height: 300px;
    padding: 36px 16px;
  }

  .hero-content h1 {
    font-size: 1.9rem;
  }

  .jobs-section,
  .applications-section {
    padding: 20px;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .job-footer,
  .app-details,
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
