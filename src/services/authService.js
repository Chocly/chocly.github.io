// src/services/authService.js - ENHANCED: Profile update support
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../firebase";

// Utility function to detect mobile devices
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for common mobile indicators
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  // Additional check for touch capability and screen size
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return isMobile || (isTouchDevice && isSmallScreen);
};

// Create a new user with email and password
export const registerWithEmailPassword = async (email, password, displayName) => {
  try {
    console.log("Creating user account...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    console.log("Updating user profile...");
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create user document in Firestore immediately
    console.log("Creating user profile in Firestore...");
    const profile = await createUserProfile(userCredential.user, { displayName });
    
    console.log("User registration complete");
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error);
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

// Sign in with Google - Mobile-friendly with redirect/popup detection
export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google sign-in process");

    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    console.log("Initialized Google provider");

    const mobile = isMobileDevice();
    console.log("Device type:", mobile ? "mobile" : "desktop");

    let result;

    if (mobile) {
      // Use redirect for mobile devices
      console.log("Using redirect method for mobile device");
      await signInWithRedirect(auth, googleProvider);
      // signInWithRedirect doesn't return immediately, the page will redirect
      // The result will be handled by getRedirectResult in a separate function
      return null; // Indicates redirect in progress
    } else {
      // Use popup for desktop devices
      console.log("Using popup method for desktop device");
      result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful", result.user.uid);

      // Check if it's a new user and create profile if needed
      await handleUserProfileCreation(result.user);

      return result.user;
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Better error handling with specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. You closed the login popup.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Login popup was blocked. Please enable popups for this site or try refreshing the page.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw error;
    }
  }
};

// Handle redirect result for mobile authentication
export const handleRedirectResult = async () => {
  try {
    console.log("Checking for redirect result");
    const result = await getRedirectResult(auth);

    if (result && result.user) {
      console.log("Redirect sign-in successful", result.user.uid);

      // Check if it's a new user and create profile if needed
      await handleUserProfileCreation(result.user);

      return result.user;
    }

    return null;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
};

// Helper function to handle user profile creation
const handleUserProfileCreation = async (user) => {
  console.log("Checking if user profile exists");
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    console.log("Creating new user profile for Google user");
    await createUserProfile(user);
  } else {
    console.log("User profile already exists");
  }
};

// IMPROVED: More robust profile creation with retries
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) {
    throw new Error("User object is required");
  }
  
  const userRef = doc(db, "users", user.uid);
  
  try {
    // Check if profile already exists
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      console.log("Profile already exists, returning existing profile");
      return getUserProfile(user.uid);
    }
    
    const { displayName, email, photoURL } = user;
    
    const profileData = {
      displayName: displayName || additionalData.displayName || '',
      email,
      photoURL: photoURL || '',
      bio: '',
      location: '',
      favoriteChocolateTypes: [],
      isProfilePublic: true,
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
      wantToTry: [],
      ...additionalData
    };
    
    console.log("Creating profile with data:", profileData);
    
    // Use setDoc to ensure the document is created
    await setDoc(userRef, profileData);
    
    console.log("Profile created successfully");
    
    // Return the created profile
    return getUserProfile(user.uid);
    
  } catch (error) {
    console.error("Error creating user profile:", error);
    
    // If Firestore is having issues, we'll throw but the auth context
    // will handle this gracefully with a fallback profile
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
};

// IMPROVED: More robust profile fetching
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return { 
        id: userDoc.id, 
        ...userDoc.data() 
      };
    } else {
      console.log("User profile not found for:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// NEW: Upload profile picture to Firebase Storage
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Create a reference to the profile picture
    const fileName = `profile-pictures/${userId}-${Date.now()}.${file.name.split('.').pop()}`;
    const imageRef = ref(storage, fileName);
    
    // Upload the file
    console.log("Uploading profile picture...");
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Profile picture uploaded successfully:", downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw new Error(`Failed to upload profile picture: ${error.message}`);
  }
};

// NEW: Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    
    // Handle profile picture upload if provided
    if (updates.profilePicture) {
      console.log("Uploading new profile picture...");
      
      // Get current profile to potentially delete old picture
      const currentProfile = await getUserProfile(userId);
      
      // Upload new picture
      const photoURL = await uploadProfilePicture(userId, updates.profilePicture);
      
      // Update auth profile if display name or photo changed
      const authUpdates = {};
      if (updates.displayName) {
        authUpdates.displayName = updates.displayName;
      }
      if (photoURL) {
        authUpdates.photoURL = photoURL;
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }
      
      // Update Firestore profile
      const profileUpdates = {
        ...updates,
        photoURL,
        updatedAt: serverTimestamp()
      };
      
      // Remove the file object from updates
      delete profileUpdates.profilePicture;
      
      await updateDoc(userRef, profileUpdates);
      
      // TODO: Delete old profile picture from storage if it exists and is different
      // This would require storing the old image path and comparing
      
      console.log("Profile updated with new picture");
      return await getUserProfile(userId);
    } else {
      // Update without profile picture
      const profileUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Update auth profile if display name changed
      if (updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }
      
      await updateDoc(userRef, profileUpdates);
      
      console.log("Profile updated successfully");
      return await getUserProfile(userId);
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
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