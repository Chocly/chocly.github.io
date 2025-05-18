// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getUserProfile } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setLoading(true);
      setError(null);
      
      try {
        if (user) {
          console.log("User authenticated:", user.uid);
          setCurrentUser(user);
          
          // Load the user's profile from Firestore
          try {
            const profile = await getUserProfile(user.uid);
            console.log("User profile loaded:", profile ? "success" : "not found");
            setUserProfile(profile);
          } catch (profileError) {
            console.error("Error loading user profile:", profileError);
            setError("Failed to load user profile");
          }
        } else {
          console.log("No user authenticated");
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (authError) {
        console.error("Auth state change error:", authError);
        setError("Authentication error");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}