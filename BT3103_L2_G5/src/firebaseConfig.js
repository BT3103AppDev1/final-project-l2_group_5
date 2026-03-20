import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDK0i3SlLXfz0d02hVwaQuCzKx68HsY9Aw",
  authDomain: "bt3103-final-project-e7ec3.firebaseapp.com",
  projectId: "bt3103-final-project-e7ec3",
  storageBucket: "bt3103-final-project-e7ec3.firebasestorage.app",
  messagingSenderId: "161349421860",
  appId: "1:161349421860:web:b748cb7eeaa018c9d141b1",
  measurementId: "G-B4KQWXW7SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
