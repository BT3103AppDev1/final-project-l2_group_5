<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Apply for {{ job?.title }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="submitForm" class="application-form">
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="phone"
            type="text"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div class="form-group">
          <label for="resumeUrl">Resume Link</label>
          <input
            id="resumeUrl"
            v-model="resumeUrl"
            type="url"
            placeholder="Paste your resume / Google Drive / LinkedIn link"
            required
          />
        </div>

        <div class="form-group">
          <label for="coverLetter">Cover Letter</label>
          <textarea
            id="coverLetter"
            v-model="coverLetter"
            rows="5"
            placeholder="Write a short cover letter"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApplicationFormModal',
  emits: ['close', 'submit-application'],
  props: {
    job: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      phone: '',
      resumeUrl: '',
      coverLetter: ''
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit-application', {
        phone: this.phone.trim(),
        resumeUrl: this.resumeUrl.trim(),
        coverLetter: this.coverLetter.trim()
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  color: #1a237e;
  font-size: 1.4rem;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #111827;
}

.form-group input,
.form-group textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.cancel-btn {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>