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

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      
      if (user) {
        // Load the user's profile from Firestore
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}