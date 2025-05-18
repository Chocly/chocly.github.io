// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,  // Make sure these providers are imported here
  FacebookAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase"; // Don't import providers from firebase.js

// Create a new user with email and password
export const registerWithEmailPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    await createUserProfile(userCredential.user, { displayName });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with Google - THIS IS THE UPDATED SECTION
export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google sign-in process");
    
    // Create a new provider instance here instead of importing from firebase.js
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("Initialized Google provider");
    
    // Use signInWithPopup with the local provider instance
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful", result.user.uid);
    
    // Check if it's a new user and create profile if needed
    console.log("Checking if user profile exists");
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    
    if (!userDoc.exists()) {
      console.log("Creating new user profile");
      await createUserProfile(result.user);
    } else {
      console.log("User profile already exists");
    }
    
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Better error handling with specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. You closed the login popup.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Login popup was blocked. Please enable popups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled.');
    } else {
      throw error;
    }
  }
};

// Sign in with Facebook - SIMILAR UPDATE
export const signInWithFacebook = async () => {
  try {
    console.log("Starting Facebook sign-in process");
    
    // Create a new provider instance here
    const facebookProvider = new FacebookAuthProvider();
    
    console.log("Initialized Facebook provider");
    
    // Use signInWithPopup with the local provider instance
    const result = await signInWithPopup(auth, facebookProvider);
    console.log("Facebook sign-in successful", result.user.uid);
    
    // Check if it's a new user and create profile if needed
    console.log("Checking if user profile exists");
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    
    if (!userDoc.exists()) {
      console.log("Creating new user profile");
      await createUserProfile(result.user);
    } else {
      console.log("User profile already exists");
    }
    
    return result.user;
  } catch (error) {
    console.error("Facebook sign-in error:", error);
    throw error;
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    
    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || '',
        email,
        photoURL: photoURL || '',
        createdAt: serverTimestamp(),
        reviewCount: 0,
        tastingCount: 0,
        favorites: [],
        badges: ["Newcomer"],
        preferences: {
          favoriteTypes: [],
          dietaryRestrictions: [],
          flavorPreferences: []
        },
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user profile", error);
      throw error;
    }
  }
  
  return getUserProfile(user.uid);
};

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Listen for auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};