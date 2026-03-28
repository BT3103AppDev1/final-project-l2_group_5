<template>
  <div class="swipe-page">

    <!-- Top bar -->
    <nav class="swipe-nav">
      <div class="swipe-nav__left">
        <router-link to="/hr/candidates" class="exit-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
          Exit Screening
        </router-link>
      </div>
      <div class="swipe-nav__center">
        <span class="logo">⟳ CareerSwipe</span>
      </div>
      <div class="swipe-nav__right">
        <span class="progress-text">{{ reviewedCount }} reviewed · {{ pendingCandidates.length }} remaining</span>
      </div>
    </nav>

    <!-- Main area -->
    <main class="swipe-main">

      <!-- Loading -->
      <div v-if="loading" class="center-state">
        <div class="spinner"></div>
        <p>Loading candidates…</p>
      </div>

      <!-- All done -->
      <div v-else-if="pendingCandidates.length === 0" class="center-state">
        <div class="done-circle">🎉</div>
        <h2>All caught up!</h2>
        <p>{{ shortlistedCount }} shortlisted · {{ rejectedCount }} rejected · {{ reviewedCount }} total reviewed</p>
        <router-link to="/hr/candidates" class="action-btn action-btn--primary">
          ← Back to All Candidates
        </router-link>
      </div>

      <!-- Swipe card -->
      <div v-else class="swipe-content">

        <!-- Job selector -->
        <div class="job-selector">
          <label class="job-selector__label">Screening job:</label>
          <select v-model="selectedJobId" class="job-selector__select" @change="filterCandidates">
            <option value="all">All Jobs ({{ allPending.length }} pending)</option>
            <option v-for="(title, jobId) in jobTitles" :key="jobId" :value="jobId">
              {{ title }} ({{ pendingByJob[jobId] || 0 }} pending)
            </option>
          </select>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar-wrap">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="progress-bar-label">{{ reviewedCount }} / {{ totalCandidates }} reviewed</span>
        </div>

        <!-- Card -->
        <div class="card-area" v-if="currentCandidate">
          <div class="candidate-card" :class="{ 'card--exit-left': exitLeft, 'card--exit-right': exitRight }">

            <!-- Card header -->
            <div class="card__header">
              <div class="card__avatar">{{ initials(currentCandidate.candidateName) }}</div>
              <div class="card__identity">
                <h2 class="card__name">{{ currentCandidate.candidateName || 'Unknown Applicant' }}</h2>
                <p class="card__email">{{ currentCandidate.candidateEmail }}</p>
                <p class="card__job">Applying for: <strong>{{ jobTitles[currentCandidate.jobId] || 'Unknown Role' }}</strong></p>
              </div>
              <div class="card__date">
                <span class="date-label">Applied</span>
                <span class="date-value">{{ formatDate(currentCandidate.createdAt) }}</span>
              </div>
            </div>

            <div class="card__divider"></div>

            <!-- Resume section -->
            <div class="card__resume-section">
              <div class="resume-header">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>
                <span>Resume</span>
              </div>

              <div v-if="currentCandidate.resumeUrl" class="resume-preview">
                <iframe
                  :src="currentCandidate.resumeUrl"
                  class="resume-iframe"
                  title="Candidate Resume"
                ></iframe>
                <a :href="currentCandidate.resumeUrl" target="_blank" class="resume-open-link">
                  Open in new tab ↗
                </a>
              </div>

              <div v-else class="resume-unavailable">
                <svg viewBox="0 0 20 20" fill="currentColor" width="32" height="32"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>
                <p>No resume uploaded</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Decision buttons -->
        <div class="decision-bar" v-if="currentCandidate">
          <button
            class="decision-btn decision-btn--reject"
            @click="decide('Rejected')"
            :disabled="processing"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            Reject
          </button>

          <button
            class="undo-btn"
            @click="undoLast"
            :disabled="!lastDecision || processing"
            title="Undo last decision"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
            Undo
          </button>

          <button
            class="decision-btn decision-btn--shortlist"
            @click="decide('Shortlisted')"
            :disabled="processing"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Shortlist
          </button>
        </div>

        <!-- Keyboard hint -->
        <p class="keyboard-hint">← Reject &nbsp;|&nbsp; → Shortlist &nbsp;|&nbsp; Space Skip &nbsp;|&nbsp; Z Undo</p>>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, query, where, getDocs,
  doc, updateDoc, getDoc
} from 'firebase/firestore'

const router = useRouter()

// ── State ──────────────────────────────────────────────────────────────────
const allCandidates  = ref([])
const jobTitles      = ref({})
const loading        = ref(true)
const processing     = ref(false)
const selectedJobId  = ref('all')
const lastDecision   = ref(null) // { id, previousStatus }
const exitLeft       = ref(false)
const exitRight      = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────
const allPending = computed(() =>
  allCandidates.value.filter(c => c.status === 'Pending')
)

const pendingCandidates = computed(() => {
  if (selectedJobId.value === 'all') return allPending.value
  return allPending.value.filter(c => c.jobId === selectedJobId.value)
})

const currentCandidate = computed(() => pendingCandidates.value[0] || null)

const pendingByJob = computed(() => {
  const map = {}
  allPending.value.forEach(c => {
    map[c.jobId] = (map[c.jobId] || 0) + 1
  })
  return map
})

const reviewedCount   = computed(() => allCandidates.value.filter(c => c.status !== 'Pending').length)
const shortlistedCount = computed(() => allCandidates.value.filter(c => c.status === 'Shortlisted').length)
const rejectedCount   = computed(() => allCandidates.value.filter(c => c.status === 'Rejected').length)
const totalCandidates = computed(() => allCandidates.value.length)
const progressPercent = computed(() =>
  totalCandidates.value > 0
    ? Math.round((reviewedCount.value / totalCandidates.value) * 100)
    : 0
)

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { router.push('/login'); return }

    // Fetch all jobs by this HR user
    const jobsSnap = await getDocs(
      query(collection(db, 'jobs'), where('hrId', '==', user.uid))
    )
    const jobIds = []
    jobsSnap.forEach(d => {
      jobIds.push(d.id)
      jobTitles.value[d.id] = d.data().title
    })

    // Fetch all applications
    if (jobIds.length > 0) {
      const chunks = []
      for (let i = 0; i < jobIds.length; i += 30) chunks.push(jobIds.slice(i, i + 30))
      const all = []
      for (const chunk of chunks) {
        const snap = await getDocs(
          query(collection(db, 'applications'), where('jobId', 'in', chunk))
        )
        snap.forEach(d => all.push({ id: d.id, ...d.data() }))
      }
      allCandidates.value = all
    }

    loading.value = false
  })

  // Keyboard shortcuts
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// ── Methods ────────────────────────────────────────────────────────────────
function handleKeydown(e) {
  if (!currentCandidate.value || processing.value) return
  if (e.key === 'ArrowLeft')  decide('Rejected')
  if (e.key === 'ArrowRight') decide('Shortlisted')
  if (e.key === 'z' || e.key === 'Z') undoLast()
  if (e.key === ' ') {
    e.preventDefault() // prevents page from scrolling down
    skipCandidate()
  }
}

async function decide(newStatus) {
  if (!currentCandidate.value || processing.value) return
  processing.value = true

  const candidate = currentCandidate.value
  const previousStatus = candidate.status

  // Animate card exit
  if (newStatus === 'Rejected') exitLeft.value = true
  else exitRight.value = true

  await new Promise(r => setTimeout(r, 280))
  exitLeft.value = false
  exitRight.value = false

  try {
    await updateDoc(doc(db, 'applications', candidate.id), { status: newStatus })
    const idx = allCandidates.value.findIndex(c => c.id === candidate.id)
    if (idx !== -1) allCandidates.value[idx].status = newStatus
    lastDecision.value = { id: candidate.id, previousStatus }
  } catch (e) {
    console.error('Error updating status:', e)
    alert('Failed to update candidate status.')
  } finally {
    processing.value = false
  }
}

async function undoLast() {
  if (!lastDecision.value || processing.value) return
  processing.value = true
  try {
    await updateDoc(doc(db, 'applications', lastDecision.value.id), {
      status: lastDecision.value.previousStatus
    })
    const idx = allCandidates.value.findIndex(c => c.id === lastDecision.value.id)
    if (idx !== -1) allCandidates.value[idx].status = lastDecision.value.previousStatus
    lastDecision.value = null
  } catch (e) {
    alert('Failed to undo.')
  } finally {
    processing.value = false
  }
}

function skipCandidate() {
  if (!currentCandidate.value || processing.value) return
  // Move current candidate to the end of the list so they appear again later
  const idx = allCandidates.value.findIndex(c => c.id === currentCandidate.value.id)
  if (idx !== -1) {
    const candidate = allCandidates.value.splice(idx, 1)[0]
    allCandidates.value.push(candidate)
  }
}

function filterCandidates() {
  // reactive — computed handles filtering
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(ts) {
  if (!ts) return 'N/A'
  try {
    return new Date(ts.toDate()).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch { return 'N/A' }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.swipe-page {
  min-height: 100vh;
  background: #F0F2F8;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
}

/* ── Nav ── */
.swipe-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  background: #fff;
  border-bottom: 1px solid #E2E8F6;
  position: sticky;
  top: 0;
  z-index: 10;
}
.exit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6B7A99;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid #E2E8F6;
  transition: all .15s;
}
.exit-btn:hover { color: #1E6FEB; border-color: #1E6FEB; background: #F0F6FF; }
.logo { font-size: 16px; font-weight: 700; color: #0D1B3E; }
.progress-text { font-size: 13px; color: #6B7A99; font-weight: 500; }

/* ── Main ── */
.swipe-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 24px 40px;
}

.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  margin-top: 80px;
  color: #6B7A99;
}
.done-circle {
  width: 80px; height: 80px;
  background: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 36px;
  box-shadow: 0 4px 20px rgba(13,27,62,.1);
}
.center-state h2 { font-size: 22px; font-weight: 700; color: #1A2340; margin: 0; }
.center-state p { font-size: 14px; margin: 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #E2E8F6; border-top-color: #1E6FEB; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Swipe content ── */
.swipe-content {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ── Job selector ── */
.job-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #E2E8F6;
  border-radius: 10px;
  padding: 10px 16px;
  width: 100%;
}
.job-selector__label { font-size: 13px; font-weight: 600; color: #6B7A99; white-space: nowrap; }
.job-selector__select {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #1A2340;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

/* ── Progress bar ── */
.progress-bar-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-bar-track {
  flex: 1;
  height: 6px;
  background: #E2E8F6;
  border-radius: 99px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1E6FEB, #00C2A8);
  border-radius: 99px;
  transition: width .4s ease;
}
.progress-bar-label { font-size: 12px; color: #6B7A99; white-space: nowrap; }

/* ── Card ── */
.card-area { width: 100%; perspective: 1000px; }

.candidate-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(13,27,62,.12);
  overflow: hidden;
  transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .28s ease;
}

.card--exit-left {
  transform: translateX(-120%) rotate(-8deg);
  opacity: 0;
}
.card--exit-right {
  transform: translateX(120%) rotate(8deg);
  opacity: 0;
}

/* Card header */
.card__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 28px 28px 20px;
}
.card__avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1E6FEB, #00C2A8);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.card__identity { flex: 1; min-width: 0; }
.card__name { font-size: 20px; font-weight: 700; color: #1A2340; margin: 0 0 4px; }
.card__email { font-size: 13px; color: #6B7A99; margin: 0 0 4px; }
.card__job { font-size: 13px; color: #6B7A99; margin: 0; }
.card__job strong { color: #1E6FEB; }
.card__date { text-align: right; flex-shrink: 0; }
.date-label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; color: #6B7A99; margin-bottom: 2px; }
.date-value { font-size: 13px; font-weight: 600; color: #1A2340; }

.card__divider { height: 1px; background: #F0F4FF; margin: 0 28px; }

/* Resume section */
.card__resume-section { padding: 20px 28px 28px; }
.resume-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: #6B7A99;
  margin-bottom: 14px;
}
.resume-iframe {
  width: 100%;
  height: 400px;
  border: 1.5px solid #E2E8F6;
  border-radius: 10px;
  display: block;
}
.resume-open-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #1E6FEB;
  text-decoration: none;
}
.resume-open-link:hover { text-decoration: underline; }
.resume-unavailable {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  background: #F8FAFC;
  border: 1.5px dashed #E2E8F6;
  border-radius: 10px;
  color: #6B7A99;
  font-size: 14px;
}

/* ── Decision bar ── */
.decision-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.decision-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}

.decision-btn--reject {
  background: #fff;
  color: #EF4444;
  border-color: #FCA5A5;
}
.decision-btn--reject:hover:not(:disabled) {
  background: #FEF2F2;
  border-color: #EF4444;
  box-shadow: 0 4px 16px rgba(239,68,68,.2);
}

.decision-btn--shortlist {
  background: #1E3A8A;
  color: #fff;
  border-color: #1E3A8A;
}
.decision-btn--shortlist:hover:not(:disabled) {
  background: #172d6c;
  box-shadow: 0 4px 16px rgba(30,58,138,.3);
}

.decision-btn:disabled { opacity: .5; cursor: not-allowed; }

.undo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #fff;
  border: 1.5px solid #E2E8F6;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7A99;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  font-family: inherit;
}
.undo-btn:hover:not(:disabled) { border-color: #1E6FEB; color: #1E6FEB; }
.undo-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Keyboard hint ── */
.keyboard-hint {
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
}

.action-btn--primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1E6FEB;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all .15s;
}
.action-btn--primary:hover { background: #1460d4; }

@media (max-width: 768px) {
  .swipe-main { padding: 20px 16px; }
  .swipe-nav { padding: 12px 16px; }
  .progress-text { display: none; }
  .resume-iframe { height: 280px; }
}
</style>
EOF