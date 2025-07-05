// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// updated firebase js that uses environment variables
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMKxVJqQyhB726ZIpqzrnlJwlVMEompzI",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chocolate-review-web.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chocolate-review-web",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chocolate-review-web.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "40760554846",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:40760554846:web:af7701c50e3a44c13acbcf",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CQXWMKJDQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Don't export providers, only export what's needed
export { db, storage, auth };