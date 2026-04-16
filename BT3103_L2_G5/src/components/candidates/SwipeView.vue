<template>
  <div class="swipe-page">
    <header class="screen-header">
      <div>
        <h1 class="screen-title">Job: {{ selectedJobTitle }}</h1>
        <p class="screen-subtitle">Applicants Remaining: {{ pendingCandidates.length }}</p>
      </div>

      <div class="header-actions">
        <button
          class="header-btn"
          @click="undoLast"
          :disabled="!lastDecision || processing"
          type="button"
        >
          ← Undo
        </button>
        <router-link
          :to="route.query.jobId ? `/hr/jobs/${route.query.jobId}/candidates` : '/hr/candidates'"
          class="header-btn header-btn--ghost"
        >
          Exit
        </router-link>
      </div>
    </header>

    <main class="swipe-main">
      <div v-if="loading" class="center-state">
        <div class="spinner"></div>
        <p>Loading candidates...</p>
      </div>

      <div v-else-if="pendingCandidates.length === 0" class="center-state">
        <div class="done-circle">Done</div>
        <h2>All candidates reviewed</h2>
        <p>{{ shortlistedCount }} shortlisted · {{ rejectedCount }} rejected</p>
        <router-link
          :to="route.query.jobId ? `/hr/jobs/${route.query.jobId}/candidates` : '/hr/candidates'"
          class="back-link"
        >
          Back to candidates
        </router-link>
      </div>

      <section v-else class="swipe-content">
        <div class="job-selector" v-if="!isSingleJobMode">
          <label class="job-selector__label">Screening job</label>
          <select v-model="selectedJobId" class="job-selector__select">
            <option value="all">All Jobs ({{ allPending.length }} pending)</option>
            <option v-for="(title, jobId) in jobTitles" :key="jobId" :value="jobId">
              {{ title }} ({{ pendingByJob[jobId] || 0 }} pending)
            </option>
          </select>
        </div>

        <p class="swipe-stats-line">
          {{ pendingCandidates.length }} remaining · {{ reviewedCount }} screened · {{ shortlistedCount }} shortlisted
        </p>

        <div class="card-area" v-if="currentCandidate">
          <article class="candidate-card" :class="{ 'card--exit-left': exitLeft, 'card--exit-right': exitRight }">
            <div class="card-top-row">
              <div>
                <h2 class="candidate-name">{{ aiSummary.candidateName }}</h2>
                <p class="candidate-meta">{{ aiSummary.location }} · {{ yearsExperienceLabel }}</p>
              </div>
              <div class="match-pill" :class="matchPillClass">{{ matchLabel }}</div>
            </div>

            <section class="card-section" v-if="aiSummary.primarySkills.length">
              <p class="section-label">TOP SKILLS</p>
              <div class="skills-wrap">
                <span v-for="skill in aiSummary.primarySkills" :key="skill" class="skill-pill">{{ skill }}</span>
              </div>
            </section>

            <section class="card-section">
              <p class="section-label">EXPERIENCE</p>
              <p class="section-content">{{ aiSummary.experienceSummary }}</p>
            </section>

            <section class="card-section">
              <p class="section-label">EDUCATION</p>
              <p class="section-content">{{ aiSummary.educationSummary }}</p>
            </section>

            <p v-if="aiSummary.matchReason !== 'Not found'" class="match-reason">
              {{ aiSummary.matchReason }}
            </p>

            <button
              v-if="currentCandidate.resumeUrl"
              @click="openResumeModal(currentCandidate.resumeUrl)"
              class="resume-link"
            >
              View Full Resume →
            </button>
          </article>
        </div>

        <div class="decision-bar" v-if="currentCandidate">
          <button class="decision-btn decision-btn--reject" @click="decide('Rejected')" :disabled="processing">
            Reject
          </button>
          <button class="decision-btn decision-btn--shortlist" @click="decide('Shortlisted')" :disabled="processing">
            Shortlist
          </button>
        </div>

        <p class="keyboard-hint">← Reject | → Shortlist | Space Skip | {{ isMac ? 'Cmd+Z' : 'Ctrl+Z' }} Undo</p>
      </section>

      <!-- Resume Modal -->
      <div v-if="showResumeModal" class="resume-modal-overlay" @click="closeResumeModal">
        <div class="resume-modal" @click.stop>
          <button class="resume-modal-close" @click="closeResumeModal">✕</button>
          <iframe
            v-if="modalResumeUrl"
            :src="modalResumeUrl"
            class="resume-iframe"
            title="Full Resume"
          ></iframe>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '@/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  limit
} from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const isMac = navigator.platform.toUpperCase().includes('MAC')

const allCandidates = ref([])
const jobTitles = ref({})
const loading = ref(true)
const processing = ref(false)
const selectedJobId = ref(route.query.jobId || 'all')
const lastDecision = ref(null)
const exitLeft = ref(false)
const exitRight = ref(false)
const extractionByApplication = ref({})
const showResumeModal = ref(false)
const modalResumeUrl = ref(null)

const isSingleJobMode = computed(() => !!route.query.jobId)

const allPending = computed(() =>
  allCandidates.value.filter((c) => c.status === 'Pending')
)

const pendingCandidates = computed(() => {
  if (selectedJobId.value === 'all') return allPending.value
  return allPending.value.filter((c) => c.jobId === selectedJobId.value)
})

const sortedPendingCandidates = computed(() => {
  return [...pendingCandidates.value].sort((a, b) => {
    const scoreA = extractionByApplication.value[a.id]?.matchScore ?? -1
    const scoreB = extractionByApplication.value[b.id]?.matchScore ?? -1
    return scoreB - scoreA
  })
})

const currentCandidate = computed(() => sortedPendingCandidates.value[0] || null)

const pendingByJob = computed(() => {
  const map = {}
  allPending.value.forEach((c) => {
    map[c.jobId] = (map[c.jobId] || 0) + 1
  })
  return map
})

const reviewedCount = computed(() => allCandidates.value.filter((c) => c.status !== 'Pending').length)
const shortlistedCount = computed(() => allCandidates.value.filter((c) => c.status === 'Shortlisted').length)
const rejectedCount = computed(() => allCandidates.value.filter((c) => c.status === 'Rejected').length)

const selectedJobTitle = computed(() => {
  if (selectedJobId.value === 'all') return 'All Open Roles'
  return jobTitles.value[selectedJobId.value] || 'Role Screening'
})

const aiSummary = computed(() => {
  const fallback = {
    candidateName: currentCandidate.value?.candidateName || 'Unknown Candidate',
    location: 'Location unavailable',
    totalYearsExperience: null,
    primarySkills: [],
    experienceSummary: 'AI extraction is still in progress. Resume details will appear shortly.',
    educationSummary: 'Education details unavailable.',
    matchScore: currentCandidate.value?.matchScore ?? null,
    matchReason: 'Not found'
  }

  if (!currentCandidate.value) return fallback
  const extracted = extractionByApplication.value[currentCandidate.value.id]
  if (!extracted) return fallback

  return {
    candidateName: extracted.candidateName || fallback.candidateName,
    location: extracted.location || fallback.location,
    totalYearsExperience:
      typeof extracted.totalYearsExperience === 'number'
        ? extracted.totalYearsExperience
        : fallback.totalYearsExperience,
    primarySkills: Array.isArray(extracted.primarySkills) ? extracted.primarySkills.slice(0, 6) : [],
    experienceSummary: extracted.experienceSummary || fallback.experienceSummary,
    educationSummary: extracted.educationSummary || fallback.educationSummary,
    matchScore:
      Number.isInteger(extracted.matchScore) || typeof extracted.matchScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(extracted.matchScore)))
        : fallback.matchScore,
    matchReason: extracted.matchReason || fallback.matchReason
  }
})

const matchLabel = computed(() => {
  if (typeof aiSummary.value.matchScore !== 'number') return 'Pending Match'
  return `${aiSummary.value.matchScore}% Match`
})

const yearsExperienceLabel = computed(() => {
  if (typeof aiSummary.value.totalYearsExperience !== 'number') return 'experience not available'
  const years = aiSummary.value.totalYearsExperience
  return `${years} years experience`
})

const matchPillClass = computed(() => {
  if (typeof aiSummary.value.matchScore !== 'number') return 'match-pill--pending'
  if (aiSummary.value.matchScore >= 70) return 'match-pill--strong'
  if (aiSummary.value.matchScore >= 40) return 'match-pill--medium'
  return 'match-pill--low'
})

watch(currentCandidate, (candidate) => {
  if (candidate && sortedPendingCandidates.value.length > 1) {
    const nextIdx = sortedPendingCandidates.value.indexOf(candidate) + 1
    if (nextIdx < sortedPendingCandidates.value.length) {
      const nextCandidate = sortedPendingCandidates.value[nextIdx]
      prefetchExtraction(nextCandidate.id)
    }
  }
}, { immediate: false })

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push('/login')
      return
    }

    const jobsSnap = await getDocs(
      query(collection(db, 'jobs'), where('hrId', '==', user.uid))
    )
    jobsSnap.forEach((d) => {
      jobTitles.value[d.id] = d.data().title
    })

    const appSnap = await getDocs(
      query(collection(db, 'applications'), where('hrId', '==', user.uid))
    )
    allCandidates.value = appSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Batch-load all extractions upfront (parallel queries)
    await batchLoadExtractions(allCandidates.value.map(c => c.id))

    loading.value = false
  })

  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if (!currentCandidate.value || processing.value) return
  if (e.key === 'ArrowLeft') decide('Rejected')
  if (e.key === 'ArrowRight') decide('Shortlisted')
  if ((e.key === 'z' || e.key === 'Z') && (isMac ? e.metaKey : e.ctrlKey)) undoLast()
  if (e.key === ' ') {
    e.preventDefault()
    skipCandidate()
  }
}

// ── Resume Extraction Loading Strategy ──
// AI-extracted resume data is stored in a Firestore subcollection:
//   applications/{appId}/resumeExtraction  (written by a Cloud Function after upload)
//
// Three functions handle loading this data at different points in the lifecycle:
//   1. batchLoadExtractions — called once on mount; pre-loads all candidates in parallel
//      so the first card and all subsequent cards have data ready immediately.
//   2. prefetchExtraction   — called by a watcher on currentCandidate; fetches the
//      NEXT candidate's data while the HR user is reviewing the current card (look-ahead).
//   3. loadLatestExtraction — utility function; single-candidate fetch with fallback,
//      available if a specific candidate's data needs to be loaded on demand.
//
// All three use a two-step query strategy:
//   Step 1: orderBy('extractedAt', 'desc') + limit(1)  — fast path, requires a Firestore index
//   Step 2: fetch all docs + sort in JS               — fallback if the index doesn't exist
//           or if the ordered query returns empty

// Fetches AI extraction data for all candidates in parallel at page load.
// Uses Promise.all for maximum throughput. Skips candidates already in the cache.
async function batchLoadExtractions(applicationIds) {
  if (!applicationIds.length) return
  try {
    console.log(`[Batch] Loading extractions for ${applicationIds.length} candidates...`, applicationIds)
    // Load extractions in parallel for all candidates
    await Promise.all(
      applicationIds.map(async (appId) => {
        if (extractionByApplication.value[appId]) {
          console.log(`[Batch] ${appId} already loaded, skipping`)
          return
        }
        try {
          // Try with orderBy first
          console.log(`[Batch] Querying ${appId}...`)
          let extractionSnap = await getDocs(
            query(
              collection(db, 'applications', appId, 'resumeExtraction'),
              orderBy('extractedAt', 'desc'),
              limit(1)
            )
          )
          
          console.log(`[Batch] Query result for ${appId}: ${extractionSnap.empty ? 'EMPTY' : extractionSnap.docs.length + ' docs'}`)
          
          // Fallback: if orderBy fails, fetch all and pick latest
          if (extractionSnap.empty) {
            console.log(`[Batch] Fallback: fetching all docs for ${appId}...`)
            extractionSnap = await getDocs(
              collection(db, 'applications', appId, 'resumeExtraction')
            )
            console.log(`[Batch] Fallback result: ${extractionSnap.docs.length} docs`)
            
            if (!extractionSnap.empty) {
              const docs = extractionSnap.docs.sort((a, b) => {
                const aTime = a.data().extractedAt?.toMillis?.() ?? 0
                const bTime = b.data().extractedAt?.toMillis?.() ?? 0
                return bTime - aTime
              })
              extractionByApplication.value[appId] = docs[0].data()
              console.log(`[Batch] ✓ Loaded ${appId}`, docs[0].data())
            }
          } else {
            const data = extractionSnap.docs[0].data()
            extractionByApplication.value[appId] = data
            console.log(`[Batch] ✓ Loaded ${appId}`, data)
          }
        } catch (e) {
          console.warn(`[Batch] Query error for ${appId}:`, e.code, e.message)
          // Try simple collection fetch as last resort
          try {
            const snap = await getDocs(collection(db, 'applications', appId, 'resumeExtraction'))
            console.log(`[Batch] Direct fetch got ${snap.docs.length} docs for ${appId}`)
            if (!snap.empty) {
              extractionByApplication.value[appId] = snap.docs[0].data()
              console.log(`[Batch] ✓ Loaded ${appId} (fallback)`, snap.docs[0].data())
            }
          } catch (fallbackError) {
            console.error(`[Batch] All queries failed for ${appId}:`, fallbackError.code, fallbackError.message)
          }
        }
      })
    )
    console.log(`[Batch] Complete. Total loaded: ${Object.keys(extractionByApplication.value).length}`, extractionByApplication.value)
  } catch (error) {
    console.error('Batch extraction load error:', error)
  }
}

// Silently pre-fetches the extraction for the next candidate while the HR user
// is still reviewing the current card. Skips if data is already cached.
async function prefetchExtraction(applicationId) {
  if (!applicationId || extractionByApplication.value[applicationId]) return
  try {
    const extractionSnap = await getDocs(
      query(
        collection(db, 'applications', applicationId, 'resumeExtraction'),
        orderBy('extractedAt', 'desc'),
        limit(1)
      )
    )
    if (!extractionSnap.empty) {
      extractionByApplication.value[applicationId] = extractionSnap.docs[0].data()
      console.log(`[Prefetch] Loaded ${applicationId}`)
    }
  } catch (error) {
    // Fallback: fetch all and pick latest
    try {
      const snap = await getDocs(collection(db, 'applications', applicationId, 'resumeExtraction'))
      if (!snap.empty) {
        const docs = snap.docs.sort((a, b) => {
          const aTime = a.data().extractedAt?.toMillis?.() ?? 0
          const bTime = b.data().extractedAt?.toMillis?.() ?? 0
          return bTime - aTime
        })
        extractionByApplication.value[applicationId] = docs[0].data()
        console.log(`[Prefetch] Loaded ${applicationId} (fallback)`)
      }
    } catch (fallbackError) {
      console.warn(`[Prefetch] Failed for ${applicationId}:`, fallbackError.message)
    }
  }
}

// On-demand single-candidate extraction loader, available as a fallback if
// a candidate's data was missed by the batch load (e.g., late application).
// Skips silently if data is already in the cache.
async function loadLatestExtraction(applicationId) {
  if (!applicationId || extractionByApplication.value[applicationId]) return
  try {
    const extractionSnap = await getDocs(
      query(
        collection(db, 'applications', applicationId, 'resumeExtraction'),
        orderBy('extractedAt', 'desc'),
        limit(1)
      )
    )
    if (!extractionSnap.empty) {
      extractionByApplication.value[applicationId] = extractionSnap.docs[0].data()
    }
  } catch (error) {
    // Fallback: fetch all and pick latest
    try {
      const snap = await getDocs(collection(db, 'applications', applicationId, 'resumeExtraction'))
      if (!snap.empty) {
        const docs = snap.docs.sort((a, b) => {
          const aTime = a.data().extractedAt?.toMillis?.() ?? 0
          const bTime = b.data().extractedAt?.toMillis?.() ?? 0
          return bTime - aTime
        })
        extractionByApplication.value[applicationId] = docs[0].data()
      }
    } catch {
      console.warn(`[Load] Could not load extraction for ${applicationId}`)
    }
  }
}

// Records a Shortlist or Reject decision for the current candidate.
// Triggers the card exit animation (slide left/right) before updating Firestore,
// so the UI feels responsive. Saves the decision in lastDecision to enable undo.
async function decide(newStatus) {
  if (!currentCandidate.value || processing.value) return
  processing.value = true

  const candidate = currentCandidate.value
  const previousStatus = candidate.status

  if (newStatus === 'Rejected') exitLeft.value = true
  else exitRight.value = true

  await new Promise((r) => setTimeout(r, 260))
  exitLeft.value = false
  exitRight.value = false

  try {
    await updateDoc(doc(db, 'applications', candidate.id), { status: newStatus })
    const idx = allCandidates.value.findIndex((c) => c.id === candidate.id)
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
    const idx = allCandidates.value.findIndex((c) => c.id === lastDecision.value.id)
    if (idx !== -1) allCandidates.value[idx].status = lastDecision.value.previousStatus
    lastDecision.value = null
  } catch {
    alert('Failed to undo.')
  } finally {
    processing.value = false
  }
}

// Moves the current candidate to the end of the list without making a decision.
// Implemented by splicing from the array and pushing to the back.
function skipCandidate() {
  if (!currentCandidate.value || processing.value) return
  const idx = allCandidates.value.findIndex((c) => c.id === currentCandidate.value.id)
  if (idx !== -1) {
    const candidate = allCandidates.value.splice(idx, 1)[0]
    allCandidates.value.push(candidate)
  }
}

function openResumeModal(resumeUrl) {
  modalResumeUrl.value = resumeUrl
  showResumeModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeResumeModal() {
  showResumeModal.value = false
  modalResumeUrl.value = null
  document.body.style.overflow = 'auto'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.swipe-page {
  min-height: 100vh;
  background: #f2f4f8;
  font-family: 'DM Sans', sans-serif;
  color: #1b223a;
  padding: 32px 24px 40px;
}

.screen-header {
  max-width: 980px;
  margin: 0 auto 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.screen-title {
  margin: 0;
  font-size: 38px;
  line-height: 1.08;
}

.screen-subtitle {
  margin: 8px 0 0;
  font-size: 17px;
  color: #6d7383;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-btn {
  border: 1px solid #d6dbe8;
  border-radius: 10px;
  padding: 10px 16px;
  background: #fff;
  color: #27304b;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.header-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.header-btn--ghost {
  background: transparent;
}

.swipe-main {
  max-width: 980px;
  margin: 0 auto;
}

.center-state {
  min-height: 55vh;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
  color: #6d7383;
}

.center-state h2 {
  margin: 8px 0;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid #dbe2f2;
  border-top-color: #213f95;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
}

.done-circle {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  background: #e7ecfb;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #1f377d;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-link {
  color: #1f377d;
  text-decoration: none;
  font-weight: 600;
}

.swipe-content {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.job-selector {
  background: #fff;
  border: 1px solid #d9deeb;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.job-selector__label {
  font-size: 13px;
  color: #60677b;
  font-weight: 600;
}

.job-selector__select {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1f2640;
  width: 100%;
  font-family: inherit;
}

.swipe-stats-line {
  text-align: center;
  margin: 0;
  color: #7a8092;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.card-area {
  perspective: 1200px;
}

.candidate-card {
  background: #fff;
  border: 1px solid #e2e6f0;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(31, 40, 70, 0.08);
  padding: 28px 30px;
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.card--exit-left {
  transform: translateX(-120%) rotate(-7deg);
  opacity: 0;
}

.card--exit-right {
  transform: translateX(120%) rotate(7deg);
  opacity: 0;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.candidate-name {
  margin: 0;
  font-size: 40px;
  line-height: 1.05;
}

.candidate-meta {
  margin: 8px 0 0;
  color: #5f677c;
  font-size: 17px;
}

.match-pill {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.match-pill--strong {
  background: #dff7e8;
  color: #1d8450;
}

.match-pill--medium {
  background: #fff4d7;
  color: #9a6a07;
}

.match-pill--low {
  background: #ffe2e2;
  color: #b42323;
}

.match-pill--pending {
  background: #eceff5;
  color: #5b6377;
}

.card-section {
  margin-top: 22px;
}

.section-label {
  margin: 0 0 10px;
  font-size: 12px;
  color: #7f8698;
  letter-spacing: 0.8px;
  font-weight: 700;
}

.skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-pill {
  background: #f0f2f6;
  color: #2f3550;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
}

.section-content {
  margin: 0;
  line-height: 1.6;
  color: #2b3450;
  font-size: 16px;
}

.match-reason {
  margin: 18px 0 0;
  padding-top: 16px;
  border-top: 1px solid #e7ebf4;
  color: #5f677c;
  font-size: 14px;
}

.resume-link {
  display: inline-block;
  margin-top: 18px;
  color: #2243a6;
  text-decoration: none;
  font-weight: 700;
  font-size: 17px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.resume-link:hover {
  text-decoration: underline;
}

.decision-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.decision-btn {
  border-radius: 12px;
  border: 2px solid transparent;
  padding: 15px 16px;
  font-size: 22px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.decision-btn--reject {
  background: #fff;
  border-color: #ed7f7f;
  color: #c13535;
}

.decision-btn--shortlist {
  background: #203b8d;
  color: #fff;
}

.decision-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.keyboard-hint {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #8a90a2;
}

@media (max-width: 768px) {
  .swipe-page {
    padding: 18px 14px 28px;
  }

  .screen-header {
    flex-direction: column;
    margin-bottom: 16px;
  }

  .screen-title {
    font-size: 30px;
  }

  .screen-subtitle {
    font-size: 15px;
  }

  .header-actions {
    width: 100%;
  }

  .header-btn,
  .header-btn--ghost {
    flex: 1;
    text-align: center;
  }

  .candidate-card {
    padding: 20px;
  }

  .candidate-name {
    font-size: 28px;
  }

  .candidate-meta {
    font-size: 14px;
  }

  .match-pill {
    font-size: 13px;
    padding: 7px 10px;
  }

  .decision-btn {
    font-size: 18px;
  }
}

.resume-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.resume-modal {
  position: relative;
  width: 90%;
  max-width: 900px;
  height: 90vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.resume-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f2f6;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  color: #1b223a;
  transition: background-color 0.2s ease;
}

.resume-modal-close:hover {
  background-color: #e0e5f2;
}

.resume-iframe {
  flex: 1;
  border: none;
  border-radius: 0 0 12px 12px;
}
</style>