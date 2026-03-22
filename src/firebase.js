// src/firebase.js - Works in both Vite (import.meta.env) and Next.js (process.env)
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Helper to get env var from either Next.js or Vite
const getEnv = (nextKey, viteKey, fallback) => {
  // Next.js
  if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
    return process.env[nextKey];
  }
  // Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY', "AIzaSyAMKxVJqQyhB726ZIpqzrnlJwlVMEompzI"),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN', "chocolate-review-web.firebaseapp.com"),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID', "chocolate-review-web"),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET', "chocolate-review-web.firebasestorage.app"),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', "40760554846"),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID', "1:40760554846:web:af7701c50e3a44c13acbcf"),
  measurementId: getEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'VITE_FIREBASE_MEASUREMENT_ID', "G-CQXWMKJDQW")
};

// Initialize Firebase (prevent double-init in Next.js dev with hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };