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
    
    // If no favorites, return sample favorites for demo
    if (favorites.length === 0) {
      return getSampleFavorites();
    }
    
    // Get the chocolate documents for each favorite ID
    const chocolates = [];
    for (const id of favorites) {
      const chocolateDoc = await getDoc(doc(db, "chocolates", id));
      if (chocolateDoc.exists()) {
        chocolates.push({
          id: chocolateDoc.id,
          ...chocolateDoc.data()
        });
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

// Sample favorites for demo purposes
const getSampleFavorites = () => {
  return [
    {
      id: '1',
      name: 'Valrhona Guanaja 70%',
      maker: 'Valrhona',
      type: 'Dark',
      origin: 'Blend (South America and Caribbean)',
      cacaoPercentage: 70,
      averageRating: 4.5,
      ratings: 356,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    },
    {
      id: '5',
      name: 'Sea Salt Caramel Crunch',
      maker: 'Coastal Confections',
      type: 'Dark Milk',
      origin: 'Belgium',
      cacaoPercentage: 55,
      averageRating: 4.8,
      ratings: 425,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    },
    {
      id: '3',
      name: 'Dandelion Madagascar',
      maker: 'Dandelion Chocolate',
      type: 'Dark',
      origin: 'Madagascar',
      cacaoPercentage: 70,
      averageRating: 4.7,
      ratings: 178,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate'
    }
  ];
};