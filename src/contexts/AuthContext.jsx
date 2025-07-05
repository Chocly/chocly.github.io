// src/contexts/AuthContext.jsx - IMPROVED: Better profile creation handling
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getUserProfile, createUserProfile } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCreating, setProfileCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setLoading(true);
      setError(null);
      
      try {
        if (user) {
          console.log("User authenticated:", user.uid);
          setCurrentUser(user);
          
          // Try to load the user's profile from Firestore
          try {
            console.log("Loading user profile...");
            let profile = await getUserProfile(user.uid);
            
            // If no profile exists, create it immediately
            if (!profile) {
              console.log("No profile found, creating new profile...");
              setProfileCreating(true);
              
              try {
                // Create the profile synchronously
                profile = await createUserProfile(user);
                console.log("Profile created successfully:", profile?.id);
              } catch (createError) {
                console.error("Error creating profile:", createError);
                
                // Retry profile creation once more after a brief delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                try {
                  profile = await createUserProfile(user);
                  console.log("Profile created on retry:", profile?.id);
                } catch (retryError) {
                  console.error("Profile creation failed on retry:", retryError);
                  
                  // If we still can't create the profile, create a minimal one
                  profile = {
                    id: user.uid,
                    displayName: user.displayName || '',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    reviewCount: 0,
                    tastingCount: 0,
                    favorites: [],
                    badges: ["Newcomer"],
                    preferences: {
                      favoriteTypes: [],
                      dietaryRestrictions: [],
                      flavorPreferences: []
                    },
                    wantToTry: []
                  };
                  console.log("Using minimal profile as fallback");
                }
              } finally {
                setProfileCreating(false);
              }
            }
            
            console.log("User profile loaded:", profile ? "success" : "failed");
            setUserProfile(profile);
            
          } catch (profileError) {
            console.error("Error loading user profile:", profileError);
            setError("Failed to load user profile");
            
            // Even if profile loading fails, keep the user logged in
            // with a minimal profile so they're not stuck
            setUserProfile({
              id: user.uid,
              displayName: user.displayName || 'User',
              email: user.email,
              photoURL: user.photoURL || '',
              reviewCount: 0,
              tastingCount: 0,
              favorites: [],
              badges: ["Newcomer"],
              preferences: {
                favoriteTypes: [],
                dietaryRestrictions: [],
                flavorPreferences: []
              },
              wantToTry: []
            });
          }
        } else {
          console.log("No user authenticated");
          setCurrentUser(null);
          setUserProfile(null);
          setProfileCreating(false);
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

  // Function to refresh user profile (useful for when profile is updated)
  const refreshProfile = async () => {
    if (!currentUser) return;
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    profileCreating,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}