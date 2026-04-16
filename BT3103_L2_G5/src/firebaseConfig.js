// firebaseConfig.js
// Initialises the Firebase app and exports the service instances used across the application.
// - auth: Firebase Authentication (email/password and Google OAuth)
// - db: Firestore database (jobs, applications, users collections)
// - storage: Firebase Storage (resume PDF uploads)
// - googleProvider: pre-configured GoogleAuthProvider for OAuth sign-in

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase project configuration for bt3103-final-project-e7ec3
const firebaseConfig = {
  apiKey: "AIzaSyDK0i3SlLXfz0d02hVwaQuCzKx68HsY9Aw",
  authDomain: "bt3103-final-project-e7ec3.firebaseapp.com",
  projectId: "bt3103-final-project-e7ec3",
  storageBucket: "bt3103-final-project-e7ec3.firebasestorage.app",
  messagingSenderId: "161349421860",
  appId: "1:161349421860:web:b748cb7eeaa018c9d141b1",
  measurementId: "G-B4KQWXW7SF"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)                    // Used for login, signup, and session management
export const googleProvider = new GoogleAuthProvider() // Used for Google OAuth sign-in (candidates only)
export const db = getFirestore(app)                 // Used for all Firestore reads/writes
export const storage = getStorage(app)              // Used for resume PDF uploads

export default app