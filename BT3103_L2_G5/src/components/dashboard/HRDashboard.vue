<template>
  <div class="hr-layout">

    <!-- ── SIDEBAR ── -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="logo-icon">⟳</span>
        <span class="logo-text">CareerSwipe</span>
      </div>

      <nav class="sidebar__nav">
        <span class="nav-label">Main</span>
        <router-link to="/hr-dashboard" class="nav-item" active-class="nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-3a1 1 0 100 2 1 1 0 000-2zm0 4a3 3 0 100-6 3 3 0 000 6z"/></svg>
          Dashboard
        </router-link>
        <router-link to="/hr/jobs/create" class="nav-item" :class="{ 'nav-item--active': $route.path.includes('jobs') }">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/></svg>
          Job Postings
        </router-link>

        <span class="nav-label" style="margin-top:16px">Screening</span>
        <a class="nav-item" @click="scrollToCandidates">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          Candidates
        </a>
      </nav>

      <div class="sidebar__footer">
        <div class="user-chip">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">HR Professional</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Sign Out">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </aside>

    <!-- ── MAIN CONTENT ── -->
    <main class="main">

      <!-- Top bar -->
      <header class="topbar">
        <div>
          <p class="topbar__breadcrumb">HR Portal</p>
          <h1 class="topbar__title">Dashboard</h1>
        </div>
        <router-link to="/hr/jobs/create" class="btn btn--primary">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          Create New Job
        </router-link>
      </header>

      <!-- Stats row -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-card__label">Active Job Postings</p>
            <p class="stat-card__value">{{ stats.activeJobs }}</p>
            <p class="stat-card__delta stat-card__delta--up">↑ +2 this week</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--teal">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          </div>
          <div>
            <p class="stat-card__label">Total Applicants</p>
            <p class="stat-card__value">{{ stats.totalApplicants }}</p>
            <p class="stat-card__delta stat-card__delta--up">↑ +34 this week</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-card__label">Interviews Scheduled</p>
            <p class="stat-card__value">{{ stats.interviews }}</p>
            <p class="stat-card__delta stat-card__delta--neutral">— Stable</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--amber">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-card__label">Positions Filled</p>
            <p class="stat-card__value">{{ stats.filled }}</p>
            <p class="stat-card__delta stat-card__delta--up">↑ +1 today</p>
          </div>
        </div>
      </section>

      <!-- Job Postings Table -->
      <section class="section" ref="candidatesSection">
        <div class="section__header">
          <div class="section__title-group">
            <h2 class="section__title">Job Postings</h2>
            <div class="tab-group">
              <button
                v-for="tab in ['All', 'Active', 'Closed']"
                :key="tab"
                class="tab"
                :class="{ 'tab--active': activeTab === tab }"
                @click="activeTab = tab"
              >{{ tab }} <span class="tab-count">{{ tabCounts[tab] }}</span></button>
            </div>
          </div>
          <div class="search-bar">
            <svg viewBox="0 0 20 20" fill="currentColor" class="search-icon"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search jobs..." class="search-input" />
            <span class="live-badge">● Live Updates</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading job postings…</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredJobs.length === 0" class="empty-state">
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64"><circle cx="32" cy="32" r="30" stroke="var(--cs-border)" stroke-width="2"/><path d="M22 32h20M32 22v20" stroke="var(--cs-muted)" stroke-width="2" stroke-linecap="round"/></svg>
          <p>No job postings found.</p>
          <router-link to="/hr/jobs/create" class="btn btn--primary btn--sm">Create your first job</router-link>
        </div>

        <!-- Job cards -->
        <div v-else class="job-list">
          <div
            v-for="job in filteredJobs"
            :key="job.id"
            class="job-card"
            :class="{ 'job-card--closed': job.status === 'closed' }"
          >
            <div class="job-card__left">
              <div class="job-card__meta">
                <span class="dept-badge" :style="{ background: deptColor(job.department) }">
                  {{ job.department || 'General' }}
                </span>
                <span class="job-card__location">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" clip-rule="evenodd"/></svg>
                  {{ job.location || 'Remote' }}
                </span>
                <span class="job-card__type">{{ job.employmentType || 'Full-time' }}</span>
              </div>
              <h3 class="job-card__title">{{ job.title }}</h3>
              <p class="job-card__posted">Posted {{ formatDate(job.createdAt) }}</p>
            </div>

            <div class="job-card__pipeline">
              <p class="pipeline-label">Applicant Pipeline</p>
              <div class="pipeline-stats">
                <div class="pipeline-stat">
                  <span class="pipeline-stat__num">{{ job.totalApplicants || 0 }}</span>
                  <span class="pipeline-stat__label">Total</span>
                </div>
                <div class="pipeline-stat">
                  <span class="pipeline-stat__num">{{ job.reviewed || 0 }}</span>
                  <span class="pipeline-stat__label">Reviewed</span>
                </div>
                <div class="pipeline-stat pipeline-stat--green">
                  <span class="pipeline-stat__num">{{ job.shortlisted || 0 }}</span>
                  <span class="pipeline-stat__label">Shortlisted</span>
                </div>
                <div class="pipeline-stat pipeline-stat--blue">
                  <span class="pipeline-stat__num">{{ job.interviews || 0 }}</span>
                  <span class="pipeline-stat__label">Interviews</span>
                </div>
              </div>
            </div>

            <div class="job-card__actions">
              <span class="status-pill" :class="job.status === 'active' ? 'status-pill--active' : 'status-pill--closed'">
                {{ job.status === 'active' ? '● Active' : '○ Closed' }}
              </span>
              <button class="btn btn--ghost btn--sm" @click="editJob(job.id)">
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M12.146.854a.5.5 0 01.707 0l2.293 2.293a.5.5 0 010 .707l-9.5 9.5A.5.5 0 015.5 13.5H3a.5.5 0 01-.5-.5v-2.5a.5.5 0 01.146-.354l9.5-9.292z"/></svg>
                Edit Job
              </button>
              <router-link
                :to="`/hr/jobs/${job.id}/candidates`"
                class="btn btn--primary btn--sm"
              >
                View Candidates →
              </router-link>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- ── LOGOUT MODAL ── -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="modal">
          <div class="modal__icon">🔒</div>
          <h3 class="modal__title">Confirm Logout</h3>
          <p class="modal__body">You will be securely signed out. Any unsaved changes will be lost.</p>
          <p class="modal__note">✓ Active session will be terminated</p>
          <div class="modal__actions">
            <button class="btn btn--ghost" @click="showLogoutModal = false">Cancel</button>
            <button class="btn btn--danger" @click="confirmLogout">← Log Out</button>
          </div>
          <p class="modal__footer">Your session data is securely cleared on logout.</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase/Config'
import { signOut } from 'firebase/auth'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, orderBy
} from 'firebase/firestore'

const router = useRouter()

// ─── State ────────────────────────────────────────────────────────────────
const jobs          = ref([])
const loading       = ref(true)
const activeTab     = ref('All')
const searchQuery   = ref('')
const showLogoutModal = ref(false)
const userName      = ref('HR User')
const userInitials  = ref('HR')
const candidatesSection = ref(null)

const stats = ref({ activeJobs: 0, totalApplicants: 0, interviews: 0, filled: 0 })

let unsubscribeJobs = null

// ─── Lifecycle ────────────────────────────────────────────────────────────
onMounted(async () => {
  // Fetch current user's name
  const user = auth.currentUser
  if (user) {
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const data = snap.data()
      userName.value = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'HR User'
      userInitials.value = (data.firstName?.[0] || '') + (data.lastName?.[0] || '') || 'HR'
    }
  }

  // Real-time listener for jobs
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
  unsubscribeJobs = onSnapshot(q, snapshot => {
    jobs.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    computeStats()
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribeJobs) unsubscribeJobs()
})

// ─── Computed ──────────────────────────────────────────────────────────────
const filteredJobs = computed(() => {
  let list = jobs.value
  if (activeTab.value === 'Active')  list = list.filter(j => j.status === 'active')
  if (activeTab.value === 'Closed')  list = list.filter(j => j.status === 'closed')
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.department?.toLowerCase().includes(q)
    )
  }
  return list
})

const tabCounts = computed(() => ({
  All:    jobs.value.length,
  Active: jobs.value.filter(j => j.status === 'active').length,
  Closed: jobs.value.filter(j => j.status === 'closed').length,
}))

// ─── Methods ───────────────────────────────────────────────────────────────
function computeStats() {
  const active  = jobs.value.filter(j => j.status === 'active')
  stats.value.activeJobs       = active.length
  stats.value.totalApplicants  = jobs.value.reduce((s, j) => s + (j.totalApplicants || 0), 0)
  stats.value.interviews       = jobs.value.reduce((s, j) => s + (j.interviews || 0), 0)
  stats.value.filled           = jobs.value.filter(j => j.status === 'closed').length
}

function formatDate(ts) {
  if (!ts) return 'recently'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function deptColor(dept) {
  const map = {
    'Engineering': '#E0EDFF', 'Product': '#FFF3E0',
    'Marketing': '#E8F5E9',  'Design': '#FCE4EC',
    'HR': '#F3E5F5',         'Finance': '#E3F2FD',
  }
  return map[dept] || '#F0F4FF'
}

function editJob(id) {
  router.push(`/hr/jobs/${id}/edit`)
}

function scrollToCandidates() {
  candidatesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function handleLogout() {
  showLogoutModal.value = true
}

async function confirmLogout() {
  await signOut(auth)
  router.push('/login')
}
</script>

<style scoped>
/* ── Layout ── */
.hr-layout {
  --cs-navy:    #0D1B3E;
  --cs-blue:    #1E6FEB;
  --cs-blue-lt: #4A90F5;
  --cs-teal:    #00C2A8;
  --cs-bg:      #F4F7FD;
  --cs-surface: #FFFFFF;
  --cs-border:  #E2E8F6;
  --cs-text:    #1A2340;
  --cs-muted:   #6B7A99;
  --cs-green:   #22C55E;
  --cs-red:     #EF4444;
  --cs-amber:   #F59E0B;
  --radius:     12px;
  --shadow-sm:  0 1px 3px rgba(13,27,62,.08);
  --shadow-md:  0 4px 16px rgba(13,27,62,.12);
  --shadow-lg:  0 8px 32px rgba(13,27,62,.16);
  display: flex;
  min-height: 100vh;
  background: var(--cs-bg);
}
/* ── Sidebar ── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--cs-navy);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 28px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  margin-bottom: 20px;
}
.logo-icon { font-size: 22px; color: var(--cs-teal); }
.logo-text  { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.3px; }

.nav-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,.35);
  padding: 0 10px;
  margin-bottom: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,.65);
  font-size: 14px;
  font-weight: 500;
  transition: all .15s;
  cursor: pointer;
}
.nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
.nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-item--active { background: var(--cs-blue); color: #fff !important; }

.sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }

.sidebar__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba(255,255,255,.1);
  padding-top: 16px;
}

.user-chip { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--cs-blue);
  color: #fff; font-weight: 700; font-size: 13px;
  display: grid; place-items: center; flex-shrink: 0;
}
.user-info  { display: flex; flex-direction: column; min-width: 0; }
.user-name  { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role  { font-size: 11px; color: rgba(255,255,255,.45); }

.logout-btn {
  background: transparent; border: none; color: rgba(255,255,255,.4);
  padding: 6px; border-radius: 6px; display: grid; place-items: center;
  transition: all .15s;
}
.logout-btn:hover { background: rgba(239,68,68,.2); color: var(--cs-red); }
.logout-btn svg { width: 18px; height: 18px; }

/* ── Main ── */
.main { flex: 1; min-width: 0; padding: 28px 32px; display: flex; flex-direction: column; gap: 28px; }

/* ── Top bar ── */
.topbar { display: flex; align-items: center; justify-content: space-between; }
.topbar__breadcrumb { font-size: 12px; color: var(--cs-muted); margin-bottom: 4px; }
.topbar__title { font-size: 24px; font-weight: 700; letter-spacing: -.4px; }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 8px; font-size: 14px;
  font-weight: 600; border: none; transition: all .15s;
}
.btn--primary { background: var(--cs-blue); color: #fff; }
.btn--primary:hover { background: #1460d4; box-shadow: 0 4px 12px rgba(30,111,235,.35); }
.btn--ghost { background: transparent; color: var(--cs-text); border: 1.5px solid var(--cs-border); }
.btn--ghost:hover { border-color: var(--cs-blue); color: var(--cs-blue); }
.btn--danger { background: var(--cs-red); color: #fff; }
.btn--danger:hover { background: #dc2626; }
.btn--sm { padding: 7px 13px; font-size: 13px; border-radius: 7px; }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.stat-card {
  background: var(--cs-surface);
  border: 1px solid var(--cs-border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow .2s;
}
.stat-card:hover { box-shadow: var(--shadow-md); }

.stat-card__icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
}
.stat-card__icon svg { width: 20px; height: 20px; }
.stat-card__icon--blue   { background: #E0EDFF; color: var(--cs-blue); }
.stat-card__icon--teal   { background: #D0F7F2; color: #00A390; }
.stat-card__icon--green  { background: #DCFCE7; color: #16A34A; }
.stat-card__icon--amber  { background: #FEF3C7; color: #D97706; }

.stat-card__label { font-size: 12px; color: var(--cs-muted); margin-bottom: 4px; }
.stat-card__value { font-size: 28px; font-weight: 700; letter-spacing: -.5px; line-height: 1; }
.stat-card__delta { font-size: 11px; margin-top: 4px; }
.stat-card__delta--up      { color: var(--cs-green); }
.stat-card__delta--neutral { color: var(--cs-muted); }

/* ── Section ── */
.section { background: var(--cs-surface); border: 1px solid var(--cs-border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }

.section__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.section__title-group { display: flex; align-items: center; gap: 16px; }
.section__title { font-size: 17px; font-weight: 700; }

.tab-group { display: flex; gap: 4px; }
.tab {
  padding: 5px 12px; border-radius: 6px; border: none;
  font-size: 13px; font-weight: 500; background: transparent;
  color: var(--cs-muted); transition: all .15s;
}
.tab:hover { background: var(--cs-bg); color: var(--cs-text); }
.tab--active { background: var(--cs-bg); color: var(--cs-blue); font-weight: 600; }
.tab-count { font-size: 11px; background: var(--cs-border); color: var(--cs-muted); padding: 1px 6px; border-radius: 20px; margin-left: 4px; }

.search-bar { display: flex; align-items: center; gap: 10px; background: var(--cs-bg); border: 1.5px solid var(--cs-border); border-radius: 8px; padding: 0 14px; }
.search-icon { width: 16px; height: 16px; color: var(--cs-muted); flex-shrink: 0; }
.search-input { border: none; background: transparent; padding: 9px 0; font-size: 13px; font-family: inherit; color: var(--cs-text); outline: none; width: 180px; }
.search-input::placeholder { color: var(--cs-muted); }
.live-badge { font-size: 11px; color: var(--cs-green); font-weight: 600; white-space: nowrap; }

/* ── Job List ── */
.job-list { display: flex; flex-direction: column; gap: 12px; }

.job-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 20px;
  border: 1.5px solid var(--cs-border);
  border-radius: 10px;
  transition: all .2s;
}
.job-card:hover { border-color: var(--cs-blue-lt); box-shadow: var(--shadow-md); }
.job-card--closed { opacity: .65; }

.job-card__left { flex: 1; min-width: 0; }
.job-card__meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.dept-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; color: var(--cs-text); }
.job-card__location, .job-card__type { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--cs-muted); }
.job-card__title { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
.job-card__posted { font-size: 12px; color: var(--cs-muted); }

.job-card__pipeline { flex-shrink: 0; }
.pipeline-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: var(--cs-muted); margin-bottom: 8px; }
.pipeline-stats { display: flex; gap: 20px; }
.pipeline-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pipeline-stat__num { font-size: 18px; font-weight: 700; }
.pipeline-stat__label { font-size: 11px; color: var(--cs-muted); }
.pipeline-stat--green .pipeline-stat__num { color: var(--cs-green); }
.pipeline-stat--blue  .pipeline-stat__num { color: var(--cs-blue); }

.job-card__actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.status-pill { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.status-pill--active { background: #DCFCE7; color: #16A34A; }
.status-pill--closed { background: var(--cs-bg); color: var(--cs-muted); }

/* ── Loading / Empty ── */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 60px; color: var(--cs-muted); text-align: center;
}
.spinner {
  width: 36px; height: 36px; border: 3px solid var(--cs-border);
  border-top-color: var(--cs-blue); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(13,27,62,.55);
  display: grid; place-items: center; z-index: 100;
  backdrop-filter: blur(4px);
}
.modal {
  background: #fff; border-radius: 16px; padding: 36px 40px;
  max-width: 380px; width: 90%; text-align: center;
  box-shadow: var(--shadow-lg);
}
.modal__icon  { font-size: 32px; margin-bottom: 12px; }
.modal__title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.modal__body  { font-size: 14px; color: var(--cs-muted); margin-bottom: 10px; }
.modal__note  { font-size: 12px; color: var(--cs-muted); background: var(--cs-bg); border-radius: 6px; padding: 8px 14px; margin-bottom: 20px; }
.modal__actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 14px; }
.modal__footer  { font-size: 11px; color: var(--cs-muted); }

.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }

/* ── Responsive ── */
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main { padding: 20px 16px; }
  .job-card { flex-direction: column; align-items: flex-start; }
  .job-card__actions { flex-direction: row; flex-wrap: wrap; }
}
</style>
