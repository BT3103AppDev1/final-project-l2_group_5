<template>
  <div class="applications-page">
    <CandidateNav />
    <section class="page-header">
      <div class="header-content">
        <div class="breadcrumb">Careers / My Applications</div>
        <h1>My Applications</h1>
        <p>
          Track the status of the roles you have applied for.
        </p>
      </div>
    </section>

    <main class="page-content">
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ applications.length }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card accepted">
          <div class="stat-number">{{ acceptedCount }}</div>
          <div class="stat-label">Accepted</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-number">{{ rejectedCount }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </section>

      <section class="toolbar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search applications..."
          />
        </div>

        <div class="filter-group">
          <button
            class="filter-btn"
            :class="{ active: activeFilter === 'All' }"
            @click="activeFilter = 'All'"
          >
            All
          </button>
          <button
            class="filter-btn"
            :class="{ active: activeFilter === 'Pending' }"
            @click="activeFilter = 'Pending'"
          >
            Pending
          </button>
          <button
            class="filter-btn"
            :class="{ active: activeFilter === 'Accepted' }"
            @click="activeFilter = 'Accepted'"
          >
            Accepted
          </button>
          <button
            class="filter-btn"
            :class="{ active: activeFilter === 'Rejected' }"
            @click="activeFilter = 'Rejected'"
          >
            Rejected
          </button>
        </div>
      </section>

      <section class="results-meta">
        <span>
          {{ filteredApplications.length }} application<span v-if="filteredApplications.length !== 1">s</span>
        </span>
      </section>

      <section v-if="loading" class="empty-state">
        <h3>Loading applications...</h3>
      </section>

      <section v-else-if="filteredApplications.length > 0" class="applications-list">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="application-card"
          :class="statusClass(app.status)"
        >
          <div class="card-top-border"></div>

          <div class="application-card-content">
            <div class="card-header">
              <div class="job-meta">
                <div class="job-title-row">
                  <h3>{{ getJobTitle(app) }}</h3>
                  <span class="status-badge" :class="statusClass(app.status)">
                    {{ app.status }}
                  </span>
                </div>

                <div class="job-subinfo">
                  <span class="department">
                    {{ app.department || 'General' }}
                  </span>
                  <span>•</span>
                  <span>{{ app.location || 'N/A' }}</span>
                  <span>•</span>
                  <span>{{ app.employmentType || app.type || 'Full-time' }}</span>
                </div>
              </div>
            </div>

            <div class="status-note" :class="statusClass(app.status)">
              <template v-if="app.status === 'Pending'">
                Your application is currently under review.
              </template>
              <template v-else-if="app.status === 'Accepted'">
                Your application has been accepted for the next stage.
              </template>
              <template v-else>
                Your application was not successful.
              </template>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Submitted</div>
                <div class="detail-value">{{ formatDate(app.createdAt) }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">{{ formatDate(app.updatedAt || app.createdAt) }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Reference</div>
                <div class="detail-value mono">{{ app.id }}</div>
              </div>
            </div>

            <div class="card-actions">
              <button
                v-if="app.status === 'Pending'"
                class="secondary-btn"
                @click="withdrawApplication(app.id)"
              >
                Withdraw
              </button>

              <button class="primary-btn" @click="toggleDetails(app.id)">
                {{ expandedApplicationId === app.id ? 'Hide Details' : 'View Details' }}
              </button>
            </div>

            <div
              v-if="expandedApplicationId === app.id"
              class="expanded-details"
            >
              <div class="expanded-section">
                <h4>Application Details</h4>
                <p><strong>Candidate Name:</strong> {{ app.candidateName || user?.fullName || 'N/A' }}</p>
                <p><strong>Candidate Email:</strong> {{ app.candidateEmail || user?.email || 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ app.phone || 'Not provided' }}</p>
              </div>

              <div class="expanded-section">
                <h4>Cover Letter</h4>
                <p class="cover-letter-text">
                  {{ app.coverLetter || 'No cover letter submitted.' }}
                </p>
              </div>

              <div v-if="app.resumeUrl" class="expanded-section">
                <h4>Resume</h4>
                <a
                  :href="app.resumeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="resume-link"
                >
                  View Uploaded Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="empty-state">
        <h3>No applications found</h3>
        <p>
          {{
            searchQuery || activeFilter !== 'All'
              ? 'Try adjusting your search or filter.'
              : 'You have not applied to any jobs yet.'
          }}
        </p>
      </section>
    </main>
  </div>
</template>

<script>
import CandidateNav from '@/components/CandidateNav.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebaseConfig.js'

export default {
  components: {
    CandidateNav
  },
  name: 'MyApplications',
  data() {
    return {
      user: null,
      applications: [],
      jobsMap: {},
      loading: true,
      searchQuery: '',
      activeFilter: 'All',
      expandedApplicationId: null
    }
  },
  computed: {
    pendingCount() {
      return this.applications.filter(app => app.status === 'Pending').length
    },
    acceptedCount() {
      return this.applications.filter(app => app.status === 'Accepted').length
    },
    rejectedCount() {
      return this.applications.filter(app => app.status === 'Rejected').length
    },
    filteredApplications() {
      let filtered = [...this.applications]

      if (this.activeFilter !== 'All') {
        filtered = filtered.filter(app => app.status === this.activeFilter)
      }

      const queryText = this.searchQuery.trim().toLowerCase()

      if (queryText) {
        filtered = filtered.filter(app => {
          const title = this.getJobTitle(app).toLowerCase()
          const department = (app.department || '').toLowerCase()
          const location = (app.location || '').toLowerCase()
          const status = (app.status || '').toLowerCase()

          return (
            title.includes(queryText) ||
            department.includes(queryText) ||
            location.includes(queryText) ||
            status.includes(queryText)
          )
        })
      }

      return filtered.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
        return dateB - dateA
      })
    }
  },
  methods: {
    async fetchApplications() {
      if (!this.user?.uid) return

      try {
        const appsQuery = query(
          collection(db, 'applications'),
          where('candidateId', '==', this.user.uid)
        )

        const snapshot = await getDocs(appsQuery)

        this.applications = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
      } catch (error) {
        console.error('Error fetching applications:', error)
        alert('Failed to load applications.')
      }
    },

    async fetchJobs() {
      try {
        const snapshot = await getDocs(collection(db, 'jobs'))
        const map = {}

        snapshot.docs.forEach(docSnap => {
          map[docSnap.id] = {
            id: docSnap.id,
            ...docSnap.data()
          }
        })

        this.jobsMap = map
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    },

    getJobTitle(app) {
      if (app.jobTitle) return app.jobTitle

      const job = this.jobsMap[app.jobId]
      return job?.title || 'Unknown Job'
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'

      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'N/A'
      }
    },

    statusClass(status) {
      switch (status) {
        case 'Accepted':
          return 'accepted'
        case 'Rejected':
          return 'rejected'
        default:
          return 'pending'
      }
    },

    toggleDetails(applicationId) {
      this.expandedApplicationId =
        this.expandedApplicationId === applicationId ? null : applicationId
    },

    async withdrawApplication(applicationId) {
      const confirmed = window.confirm(
        'Are you sure you want to withdraw this application?'
      )

      if (!confirmed) return

      try {
        await deleteDoc(doc(db, 'applications', applicationId))
        this.applications = this.applications.filter(app => app.id !== applicationId)

        if (this.expandedApplicationId === applicationId) {
          this.expandedApplicationId = null
        }

        alert('Application withdrawn successfully.')
      } catch (error) {
        console.error('Error withdrawing application:', error)
        alert('Failed to withdraw application.')
      }
    }
  },
  mounted() {
    const auth = getAuth()

    onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) {
        this.loading = false
        return
      }

      this.user = currentUser

      await this.fetchJobs()
      await this.fetchApplications()

      this.loading = false
    })
  }
}
</script>

<style scoped>
.applications-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 28px;
}

.breadcrumb {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 14px;
}

.page-header h1 {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.page-header p {
  margin: 0;
  font-size: 15px;
  color: #64748b;
}

.page-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.stat-card.pending {
  border-left: 5px solid #f59e0b;
}

.stat-card.accepted {
  border-left: 5px solid #22c55e;
}

.stat-card.rejected {
  border-left: 5px solid #ef4444;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 240px;
}

.search-box input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #dbe1ea;
  background: white;
  font-size: 14px;
  outline: none;
}

.search-box input:focus {
  border-color: #1d4ed8;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  border: 1px solid #dbe1ea;
  background: white;
  color: #475569;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.filter-btn:hover {
  border-color: #1d4ed8;
  color: #1d4ed8;
}

.filter-btn.active {
  background: #1d4ed8;
  color: white;
  border-color: #1d4ed8;
}

.results-meta {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
  font-size: 14px;
  color: #64748b;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.application-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.card-top-border {
  height: 5px;
  background: #f59e0b;
}

.application-card.accepted .card-top-border {
  background: #22c55e;
}

.application-card.rejected .card-top-border {
  background: #ef4444;
}

.application-card-content {
  padding: 24px;
}

.card-header {
  margin-bottom: 18px;
}

.job-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
}

.job-title-row h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 750;
  color: #0f172a;
}

.job-subinfo {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  color: #64748b;
  font-size: 14px;
}

.department {
  color: #1d4ed8;
  font-weight: 700;
}

.status-badge {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-badge.pending {
  background: #fff7ed;
  color: #b45309;
}

.status-badge.accepted {
  background: #ecfdf5;
  color: #15803d;
}

.status-badge.rejected {
  background: #fef2f2;
  color: #b91c1c;
}

.status-note {
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-note.pending {
  background: #fff7ed;
  color: #b45309;
  border: 1px solid #fed7aa;
}

.status-note.accepted {
  background: #ecfdf5;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-note.rejected {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.detail-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 700;
}

.detail-value {
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.detail-value.mono {
  font-family: monospace;
  word-break: break-all;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  border-radius: 10px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-btn {
  border: none;
  background: #1d4ed8;
  color: white;
}

.primary-btn:hover {
  background: #1e40af;
}

.secondary-btn {
  background: white;
  color: #475569;
  border: 1px solid #dbe1ea;
}

.secondary-btn:hover {
  border-color: #94a3b8;
  color: #0f172a;
}

.expanded-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: grid;
  gap: 18px;
}

.expanded-section h4 {
  margin: 0 0 10px;
  font-size: 15px;
  color: #0f172a;
}

.expanded-section p {
  margin: 0 0 8px;
  color: #475569;
  line-height: 1.6;
  font-size: 14px;
}

.cover-letter-text {
  white-space: pre-wrap;
}

.resume-link {
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}

.resume-link:hover {
  text-decoration: underline;
}

.empty-state {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 56px 24px;
  text-align: center;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .job-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .card-actions {
    justify-content: stretch;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>