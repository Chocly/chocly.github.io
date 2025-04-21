// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAMKxVJqQyhB726ZIpqzrnlJwlVMEompzI",
    authDomain: "chocolate-review-web.firebaseapp.com",
    projectId: "chocolate-review-web",
    storageBucket: "chocolate-review-web.firebasestorage.app",
    messagingSenderId: "40760554846",
    appId: "1:40760554846:web:af7701c50e3a44c13acbcf",
    measurementId: "G-CQXWMKJDQW"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { db, storage, auth, googleProvider, facebookProvider };