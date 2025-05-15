// src/services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
  } from "firebase/auth";
  import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
  import { auth, db, googleProvider, facebookProvider } from "../firebase";
  
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
  
  // src/services/authService.js
// Add better error handling to signInWithGoogle function

export const signInWithGoogle = async () => {
  try {
    // Configure Google provider with additional settings for better compatibility
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if it's a new user and create profile if needed
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (!userDoc.exists()) {
      await createUserProfile(result.user);
    }
    
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Provide more detailed error information
    if (error.code === 'auth/configuration-not-found') {
      throw new Error('Authentication configuration issue. Please contact support.');
    } else {
      throw error;
    }
  }
};
  
  // Sign in with Facebook
  /*
  export const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Check if it's a new user and create profile if needed
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(result.user);
      }
      
      return result.user;
    } catch (error) {
      throw error;
    }
  };
  */
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