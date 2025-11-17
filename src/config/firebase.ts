/**
 * 🔥 Firebase Configuration
 * 
 * INSTRUKCJA KONFIGURACJI:
 * 1. Idź na https://console.firebase.google.com/
 * 2. Utwórz nowy projekt "MESSU-BOUW"
 * 3. Dodaj aplikację Web
 * 4. Skopiuj config i wklej poniżej
 * 5. Włącz Authentication (Email/Password + Google)
 * 6. Włącz Firestore Database
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// FIREBASE CONFIG - ZAMIEŃ NA SWOJE DANE!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Zamień na swój klucz
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// DEMO CONFIG (działa offline, bez Firebase)
const DEMO_MODE = true; // Zmień na false gdy podłączysz prawdziwy Firebase

// Initialize Firebase
let app;
let auth;
let db;

if (!DEMO_MODE) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { auth, db, DEMO_MODE };
