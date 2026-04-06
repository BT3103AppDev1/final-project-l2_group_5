<template>
  <div class="candidates-layout">

    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="logo-icon">⟳</span>
        <span class="logo-text">CareerSwipe</span>
      </div>
      <nav class="sidebar__nav">
        <span class="nav-label">Main</span>
        <router-link to="/hr-dashboard" class="nav-item">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-3a1 1 0 100 2 1 1 0 000-2zm0 4a3 3 0 100-6 3 3 0 000 6z"/></svg>
          Dashboard
        </router-link>
        <span class="nav-label" style="margin-top:16px">Screening</span>
        <router-link to="/hr/candidates" class="nav-item nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          Candidates
        </router-link>
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

    <main class="main">
      <header class="topbar">
        <div>
          <p class="topbar__breadcrumb">HR Portal / Candidates</p>
          <h1 class="topbar__title">All Candidates</h1>
          <p class="topbar__sub">Every applicant across all your job postings</p>
        </div>
        <router-link
          v-if="pendingCount > 0"
          to="/hr/screen"
          class="btn btn--screen"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          Screen Candidates
          <span class="screen-badge">{{ pendingCount }}</span>
        </router-link>
     </header>

      <!-- Stats -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
          </div>
          <div>
            <p class="stat-label">Total Applicants</p>
            <p class="stat-value">{{ candidates.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--amber">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-label">Pending Review</p>
            <p class="stat-value">{{ pendingCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--green">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-label">Shortlisted</p>
            <p class="stat-value">{{ shortlistedCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--red">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="stat-label">Rejected</p>
            <p class="stat-value">{{ rejectedCount }}</p>
          </div>
        </div>
      </section>

      <!-- Candidates table -->
      <section class="section">
        <div class="section__header">
          <div class="section__title-group">
            <h2 class="section__title">Applicants</h2>
            <div class="tab-group">
              <button
                v-for="tab in ['All', 'Pending', 'Shortlisted', 'Rejected']"
                :key="tab"
                class="tab"
                :class="{ 'tab--active': activeTab === tab }"
                @click="activeTab = tab"
              >
                {{ tab }} <span class="tab-count">{{ tabCounts[tab] }}</span>
              </button>
            </div>
          </div>

        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading candidates…</p>
        </div>

        <div v-else-if="filteredCandidates.length === 0" class="empty-state">
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64"><circle cx="32" cy="32" r="30" stroke="#E2E8F6" stroke-width="2"/><path d="M22 32h20M32 22v20" stroke="#6B7A99" stroke-width="2" stroke-linecap="round"/></svg>
          <p>{{ candidates.length === 0 ? 'No applications yet.' : 'No candidates match this filter.' }}</p>
        </div>

        <div v-else class="candidate-list">
          <div
            v-for="candidate in filteredCandidates"
            :key="candidate.id"
            class="candidate-card"
          >
            <div class="candidate-card__left">
              <div class="avatar">{{ initials(candidate.candidateName) }}</div>
              <div class="candidate-info">
                <h3 class="candidate-name">{{ candidate.candidateName || 'Unknown Applicant' }}</h3>
                <p class="candidate-email">{{ candidate.candidateEmail || 'No email' }}</p>
                <p class="candidate-meta">
                  Applied to: <strong>{{ jobTitles[candidate.jobId] || candidate.jobId }}</strong>
                  · {{ formatDate(candidate.createdAt) }}
                </p>
              </div>
            </div>

            <div class="candidate-card__middle">
              <span class="status-pill" :class="{
                'status-pill--pending':     candidate.status === 'Pending',
                'status-pill--shortlisted': candidate.status === 'Shortlisted',
                'status-pill--rejected':    candidate.status === 'Rejected'
              }">{{ candidate.status }}</span>
            </div>

            <div class="candidate-card__actions">
              <router-link
                :to="`/hr/jobs/${candidate.jobId}/candidates`"
                class="btn btn--ghost btn--sm"
              >View Job →</router-link>
              <button
                v-if="candidate.status === 'Pending'"
                class="btn btn--shortlist"
                @click="updateStatus(candidate.id, 'Shortlisted')"
                :disabled="processing === candidate.id"
              >✓ Shortlist</button>
              <button
                v-if="candidate.status === 'Pending'"
                class="btn btn--reject"
                @click="updateStatus(candidate.id, 'Rejected')"
                :disabled="processing === candidate.id"
              >✕ Reject</button>
              <button
                v-if="candidate.status !== 'Pending'"
                class="btn btn--ghost btn--sm"
                @click="updateStatus(candidate.id, 'Pending')"
                :disabled="processing === candidate.id"
              >↩ Undo</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Logout Modal -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="modal">
          <div class="modal__icon">🔒</div>
          <h3 class="modal__title">Confirm Logout</h3>
          <p class="modal__body">You will be securely signed out.</p>
          <p class="modal__note">✓ Active session will be terminated</p>
          <div class="modal__actions">
            <button class="btn btn--ghost" @click="showLogoutModal = false">Cancel</button>
            <button class="btn btn--danger" @click="confirmLogout">← Log Out</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebaseConfig'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import {
  collection, query, where, getDocs,
  doc, updateDoc, getDoc, increment
} from 'firebase/firestore'

const router = useRouter()

const candidates     = ref([])
const jobTitles      = ref({})
const loading        = ref(true)
const processing     = ref(null)
const activeTab      = ref('All')
const showLogoutModal = ref(false)
const userName       = ref('HR User')
const userInitials   = ref('HR')

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { router.push('/login'); return }

    // Fetch user name
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const data = snap.data()
      userName.value = data.fullName || 'HR User'
      userInitials.value = data.fullName?.split(' ').map(w => w[0]).slice(0,2).join('') || 'HR'
    }

    // Fetch jobs to build jobTitles map
    const jobsSnap = await getDocs(
      query(collection(db, 'jobs'), where('hrId', '==', user.uid))
    )
    jobsSnap.forEach(d => {
      jobTitles.value[d.id] = d.data().title
    })

    // Directly query applications by hrId — no need for two-step join
    const appSnap = await getDocs(
      query(collection(db, 'applications'), where('hrId', '==', user.uid))
    )
    candidates.value = appSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    loading.value = false
  })
})

async function updateStatus(applicationId, newStatus) {
  processing.value = applicationId
  try {
    const candidateIdx = candidates.value.findIndex(c => c.id === applicationId)
    if (candidateIdx === -1) return
    
    const candidate = candidates.value[candidateIdx]
    const previousStatus = candidate.status
    const jobId = candidate.jobId
    
    // Update application
    await updateDoc(doc(db, 'applications', applicationId), { status: newStatus })
    
    // Update job counters with safety checks
    const jobRef = doc(db, 'jobs', jobId)
    const jobSnap = await getDoc(jobRef)
    const jobData = jobSnap.data() || {}
    
    const counterUpdates = {}
    // Safely decrement from previous status
    if (previousStatus === 'Shortlisted') {
      counterUpdates.shortlistedCount = Math.max(0, (jobData.shortlistedCount || 0) - 1)
    } else if (previousStatus === 'Rejected') {
      counterUpdates.rejectedCount = Math.max(0, (jobData.rejectedCount || 0) - 1)
    }
    // Increment new status
    if (newStatus === 'Shortlisted') {
      counterUpdates.shortlistedCount = (jobData.shortlistedCount || 0) + 1
    } else if (newStatus === 'Rejected') {
      counterUpdates.rejectedCount = (jobData.rejectedCount || 0) + 1
    }
    
    if (Object.keys(counterUpdates).length > 0) {
      await updateDoc(jobRef, counterUpdates)
    }
    
    candidates.value[candidateIdx].status = newStatus
  } catch (e) {
    console.error('Error updating status:', e)
    alert('Failed to update status.')
  } finally {
    processing.value = null
  }
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(ts) {
  if (!ts) return 'N/A'
  try { return new Date(ts.toDate()).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return 'N/A' }
}

function handleLogout() { showLogoutModal.value = true }
async function confirmLogout() { await signOut(auth); router.push('/login') }

const pendingCount     = computed(() => candidates.value.filter(c => c.status === 'Pending').length)
const shortlistedCount = computed(() => candidates.value.filter(c => c.status === 'Shortlisted').length)
const rejectedCount    = computed(() => candidates.value.filter(c => c.status === 'Rejected').length)

const tabCounts = computed(() => ({
  All: candidates.value.length,
  Pending: pendingCount.value,
  Shortlisted: shortlistedCount.value,
  Rejected: rejectedCount.value,
}))

const filteredCandidates = computed(() => {
  if (activeTab.value === 'All') return candidates.value
  return candidates.value.filter(c => c.status === activeTab.value)
})
</script>

<style scoped>
.candidates-layout {
  --cs-navy: #0D1B3E; --cs-blue: #1E6FEB; --cs-teal: #00C2A8;
  --cs-bg: #F4F7FD; --cs-surface: #FFFFFF; --cs-border: #E2E8F6;
  --cs-text: #1A2340; --cs-muted: #6B7A99; --cs-green: #22C55E;
  --cs-red: #EF4444; --radius: 12px;
  --shadow-sm: 0 1px 3px rgba(13,27,62,.08);
  --shadow-md: 0 4px 16px rgba(13,27,62,.12);
  --shadow-lg: 0 8px 32px rgba(13,27,62,.16);
  display: flex; min-height: 100vh; background: var(--cs-bg);
  font-family: 'DM Sans', -apple-system, sans-serif;
}

.btn--screen {
  background: var(--cs-blue);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all .15s;
  white-space: nowrap;
}
.btn--screen:hover { background: #1460d4; box-shadow: 0 4px 12px rgba(30,111,235,.35); }
.screen-badge {
  background: rgba(255,255,255,.25);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}

.sidebar { width: 240px; flex-shrink: 0; background: var(--cs-navy); display: flex; flex-direction: column; padding: 24px 16px; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.sidebar__logo { display: flex; align-items: center; gap: 10px; padding: 0 8px 28px; border-bottom: 1px solid rgba(255,255,255,.1); margin-bottom: 20px; }
.logo-icon { font-size: 22px; color: var(--cs-teal); }
.logo-text { font-size: 17px; font-weight: 700; color: #fff; }
.nav-label { display: block; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,.35); padding: 0 10px; margin-bottom: 6px; }
.sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,.65); font-size: 14px; font-weight: 500; transition: all .15s; cursor: pointer; text-decoration: none; }
.nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
.nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-item--active { background: var(--cs-blue) !important; color: #fff !important; }
.sidebar__footer { display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,.1); padding-top: 16px; }
.user-chip { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--cs-blue); color: #fff; font-weight: 700; font-size: 13px; display: grid; place-items: center; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: rgba(255,255,255,.45); }
.logout-btn { background: transparent; border: none; color: rgba(255,255,255,.4); padding: 6px; border-radius: 6px; display: grid; place-items: center; transition: all .15s; cursor: pointer; }
.logout-btn:hover { background: rgba(239,68,68,.2); color: var(--cs-red); }
.logout-btn svg { width: 18px; height: 18px; }

.main { flex: 1; min-width: 0; padding: 28px 32px; display: flex; flex-direction: column; gap: 28px; }
.topbar { display: flex; align-items: flex-start; justify-content: space-between; }
.topbar__breadcrumb { font-size: 12px; color: var(--cs-muted); margin-bottom: 4px; }
.topbar__title { font-size: 24px; font-weight: 700; letter-spacing: -.4px; }
.topbar__sub { font-size: 13px; color: var(--cs-muted); margin-top: 2px; }

.btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; transition: all .15s; cursor: pointer; text-decoration: none; font-family: inherit; }
.btn--ghost { background: transparent; color: var(--cs-text); border: 1.5px solid var(--cs-border); }
.btn--ghost:hover { border-color: var(--cs-blue); color: var(--cs-blue); }
.btn--danger { background: var(--cs-red); color: #fff; }
.btn--sm { padding: 7px 13px; font-size: 13px; border-radius: 7px; }
.btn--shortlist { background: #DCFCE7; color: #16A34A; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn--shortlist:hover:not(:disabled) { background: #bbf7d0; }
.btn--reject { background: #FEE2E2; color: #DC2626; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn--reject:hover:not(:disabled) { background: #fecaca; }
.btn--shortlist:disabled, .btn--reject:disabled { opacity: .6; cursor: not-allowed; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: var(--cs-surface); border: 1px solid var(--cs-border); border-radius: var(--radius); padding: 20px; display: flex; align-items: flex-start; gap: 14px; box-shadow: var(--shadow-sm); }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
.stat-icon svg { width: 20px; height: 20px; }
.stat-icon--blue  { background: #E0EDFF; color: var(--cs-blue); }
.stat-icon--amber { background: #FEF3C7; color: #D97706; }
.stat-icon--green { background: #DCFCE7; color: #16A34A; }
.stat-icon--red   { background: #FEE2E2; color: var(--cs-red); }
.stat-label { font-size: 12px; color: var(--cs-muted); margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; letter-spacing: -.5px; line-height: 1; }

.section { background: var(--cs-surface); border: 1px solid var(--cs-border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
.section__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.section__title-group { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.section__title { font-size: 17px; font-weight: 700; }
.tab-group { display: flex; gap: 4px; }
.tab { padding: 5px 12px; border-radius: 6px; border: none; font-size: 13px; font-weight: 500; background: transparent; color: var(--cs-muted); cursor: pointer; transition: all .15s; }
.tab:hover { background: var(--cs-bg); color: var(--cs-text); }
.tab--active { background: var(--cs-bg); color: var(--cs-blue); font-weight: 600; }
.tab-count { font-size: 11px; background: var(--cs-border); color: var(--cs-muted); padding: 1px 6px; border-radius: 20px; margin-left: 4px; }
.search-bar { display: flex; align-items: center; gap: 10px; background: var(--cs-bg); border: 1.5px solid var(--cs-border); border-radius: 8px; padding: 0 14px; }
.search-icon { width: 16px; height: 16px; color: var(--cs-muted); flex-shrink: 0; }
.search-input { border: none; background: transparent; padding: 9px 0; font-size: 13px; font-family: inherit; color: var(--cs-text); outline: none; width: 200px; }

.candidate-list { display: flex; flex-direction: column; gap: 12px; }
.candidate-card { display: flex; align-items: center; gap: 20px; padding: 18px 20px; border: 1.5px solid var(--cs-border); border-radius: 10px; transition: all .2s; background: #fff; }
.candidate-card:hover { border-color: #93c5fd; box-shadow: var(--shadow-md); }
.candidate-card__left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--cs-blue); color: #fff; font-weight: 700; font-size: 15px; display: grid; place-items: center; flex-shrink: 0; }
.candidate-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
.candidate-email { font-size: 13px; color: var(--cs-muted); margin-bottom: 2px; }
.candidate-meta { font-size: 12px; color: var(--cs-muted); }
.candidate-card__middle { flex-shrink: 0; }
.candidate-card__actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
.status-pill { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
.status-pill--pending     { background: #FEF3C7; color: #92400E; }
.status-pill--shortlisted { background: #DCFCE7; color: #166534; }
.status-pill--rejected    { background: #FEE2E2; color: #991B1B; }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px; color: var(--cs-muted); text-align: center; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--cs-border); border-top-color: var(--cs-blue); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-overlay { position: fixed; inset: 0; background: rgba(13,27,62,.55); display: grid; place-items: center; z-index: 100; backdrop-filter: blur(4px); }
.modal { background: #fff; border-radius: 16px; padding: 36px 40px; max-width: 380px; width: 90%; text-align: center; box-shadow: var(--shadow-lg); }
.modal__icon { font-size: 32px; margin-bottom: 12px; }
.modal__title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.modal__body { font-size: 14px; color: var(--cs-muted); margin-bottom: 10px; }
.modal__note { font-size: 12px; color: var(--cs-muted); background: var(--cs-bg); border-radius: 6px; padding: 8px 14px; margin-bottom: 20px; }
.modal__actions { display: flex; gap: 10px; justify-content: center; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }

@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .sidebar { display: none; } .main { padding: 20px 16px; } .candidate-card { flex-direction: column; align-items: flex-start; } }
</style>
EOF