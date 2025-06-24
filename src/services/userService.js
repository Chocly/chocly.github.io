// src/services/userService.js
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";


// Update user profile
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated profile
    const updatedDoc = await getDoc(userRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Add a chocolate to favorites
export const addToFavorites = async (userId, chocolateId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(chocolateId),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

// Remove a chocolate from favorites
export const removeFromFavorites = async (userId, chocolateId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(chocolateId),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Get all favorite chocolates for a user
export const getFavoriteChocolates = async (userId) => {
  try {
    // Get the user document to get the favorites array
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const favorites = userDoc.data().favorites || [];
    
    // If no favorites, return empty array (no more sample data)
    if (favorites.length === 0) {
      return [];
    }
    
    // Get the chocolate documents for each favorite ID
    const chocolates = [];
    for (const id of favorites) {
      try {
        const chocolateDoc = await getDoc(doc(db, "chocolates", id));
        if (chocolateDoc.exists()) {
          chocolates.push({
            id: chocolateDoc.id,
            ...chocolateDoc.data()
          });
        }
      } catch (error) {
        console.error(`Error fetching chocolate ${id}:`, error);
        // Continue with other chocolates if one fails
      }
    }
    
    return chocolates;
  } catch (error) {
    console.error("Error getting favorite chocolates:", error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

// Check if a chocolate is in user's favorites
export const isChocolateFavorited = async (userId, chocolateId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const favorites = userDoc.data().favorites || [];
    return favorites.includes(chocolateId);
  } catch (error) {
    console.error("Error checking if chocolate is favorited:", error);
    return false;
  }
};

// Toggle favorite status for a chocolate
export const toggleFavorite = async (userId, chocolateId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const favorites = userDoc.data().favorites || [];
    const isFavorited = favorites.includes(chocolateId);
    
    if (isFavorited) {
      // Remove from favorites
      await updateDoc(userRef, {
        favorites: arrayRemove(chocolateId),
        updatedAt: serverTimestamp()
      });
      return false; // Now not favorited
    } else {
      // Add to favorites
      await updateDoc(userRef, {
        favorites: arrayUnion(chocolateId),
        updatedAt: serverTimestamp()
      });
      return true; // Now favorited
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export const addToWantToTry = async (userId, chocolate) => {
  try {
    const userRef = doc(db, 'users', userId);
    const wantToTryItem = {
      chocolateId: chocolate.id,
      name: chocolate.name,
      maker: chocolate.maker,
      imageUrl: chocolate.imageUrl || 'https://placehold.co/300x300?text=Chocolate',
      addedAt: new Date()
    };
    
    await updateDoc(userRef, {
      wantToTry: arrayUnion(wantToTryItem)
    });
    
    return wantToTryItem;
  } catch (error) {
    console.error('Error adding to want to try:', error);
    throw error;
  }
};

export const removeFromWantToTry = async (userId, chocolate) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current want to try list to find exact item to remove
    const userDoc = await getDoc(userRef);
    const wantToTryList = userDoc.data()?.wantToTry || [];
    const itemToRemove = wantToTryList.find(item => item.chocolateId === chocolate.id);
    
    if (itemToRemove) {
      await updateDoc(userRef, {
        wantToTry: arrayRemove(itemToRemove)
      });
    }
  } catch (error) {
    console.error('Error removing from want to try:', error);
    throw error;
  }
};

export const isChocolateInWantToTry = async (userId, chocolateId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const wantToTryList = userDoc.data()?.wantToTry || [];
    
    return wantToTryList.some(item => item.chocolateId === chocolateId);
  } catch (error) {
    console.error('Error checking want to try status:', error);
    return false;
  }
};
