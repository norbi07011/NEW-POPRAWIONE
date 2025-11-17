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

// FIREBASE CONFIG - ✅ SKONFIGUROWANE!
const firebaseConfig = {
  apiKey: "AIzaSyC0KzCniUt_NYRYaefG7bUQZ4AqvO7dMUk",
  authDomain: "messu-bouw-management-system.firebaseapp.com",
  projectId: "messu-bouw-management-system",
  storageBucket: "messu-bouw-management-system.firebasestorage.app",
  messagingSenderId: "988554164944",
  appId: "1:988554164944:web:acf82fcd8c987364d6fcd5"
};

// DEMO CONFIG (działa offline, bez Firebase)
const DEMO_MODE = false; // ✅ CLOUD MODE WŁĄCZONY!

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
