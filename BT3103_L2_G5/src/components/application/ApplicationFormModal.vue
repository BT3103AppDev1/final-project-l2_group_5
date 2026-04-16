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
          <label>Resume <span class="required">*</span></label>
          <p class="helper-text">PDF format only · Max 10 MB</p>

          <div
            class="upload-box"
            :class="{ 'drag-active': isDragActive }"
            @click="triggerFilePicker"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              id="resumeFile"
              type="file"
              accept="application/pdf,.pdf"
              class="hidden-file-input"
              @change="handleFileChange"
            />

            <div class="upload-icon">⬆</div>
            <p class="upload-title">Drag & drop your resume</p>
            <p class="upload-subtitle">
              or <span class="browse-link">click to browse</span>
            </p>
          </div>

          <p v-if="resumeFileName" class="file-name">
            Selected file: {{ resumeFileName }}
          </p>
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
      resumeFile: null,
      resumeFileName: '',
      coverLetter: '',
      isDragActive: false
    }
  },
  methods: {
    // Programmatically opens the hidden file input when the upload box is clicked
    triggerFilePicker() {
      this.$refs.fileInput.click()
    },

    // Central validation method called by both the file-picker and the drag-and-drop handler.
    // Validates that the file is a PDF (checked by MIME type and extension) and
    // is within the 10 MB size limit. Clears the input on failure to allow re-selection.
    // `resetInput` should be true when triggered from the <input> change event so that
    // the browser's file input value is cleared (required on some browsers to allow
    // re-selecting the same file after rejection).
    validateAndStoreFile(file, resetInput = false) {
      if (!file) {
        this.resumeFile = null
        this.resumeFileName = ''
        return
      }

      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')

      const maxSizeInBytes = 10 * 1024 * 1024

      if (!isPdf) {
        alert('Please upload a PDF file only.')
        if (resetInput && this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
        this.resumeFile = null
        this.resumeFileName = ''
        return
      }

      if (file.size > maxSizeInBytes) {
        alert('File size must be 10 MB or less.')
        if (resetInput && this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
        this.resumeFile = null
        this.resumeFileName = ''
        return
      }

      this.resumeFile = file
      this.resumeFileName = file.name
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      this.validateAndStoreFile(file, true)
    },

    handleDragOver() {
      this.isDragActive = true
    },

    handleDragLeave() {
      this.isDragActive = false
    },

    handleDrop(event) {
      this.isDragActive = false
      const file = event.dataTransfer.files[0]
      this.validateAndStoreFile(file)
    },

    // Validates that a resume has been attached, then emits 'submit-application'
    // with the form payload to the parent (CandidateDashboard) which handles
    // the actual Firestore write and Storage upload.
    submitForm() {
      if (!this.resumeFile) {
        alert('Please upload your resume in PDF format.')
        return
      }

      this.$emit('submit-application', {
        phone: this.phone.trim(),
        resumeFile: this.resumeFile,
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
  max-width: 640px;
  border-radius: 16px;
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
  gap: 20px;
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

.required {
  color: #dc2626;
}

.helper-text {
  margin: 0;
  font-size: 0.92rem;
  color: #6b7280;
}

.form-group input,
.form-group textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px;
  font-size: 0.95rem;
}

.form-group textarea {
  resize: vertical;
}

.hidden-file-input {
  display: none;
}

.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: 0.2s ease;
}

.upload-box:hover {
  border-color: #1a237e;
  background: #f5f7ff;
}

.drag-active {
  border-color: #1a237e;
  background: #eef2ff;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  background: #eef2ff;
  color: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.upload-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.upload-subtitle {
  margin: 6px 0 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.browse-link {
  color: #1a237e;
  font-weight: 600;
  text-decoration: underline;
}

.file-name {
  margin: 4px 0 0;
  font-size: 0.92rem;
  color: #374151;
  word-break: break-word;
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