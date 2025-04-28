// src/services/reviewService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  // Get all reviews for a chocolate

export const getChocolateReviews = async (chocolateId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("chocolateId", "==", chocolateId),
        orderBy("createdAt", "desc")
      );
  
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no reviews found in the database, return empty array
      if (reviews.length === 0) {
        return [];
      }
      
      return reviews;
    } catch (error) {
      console.error("Error getting chocolate reviews:", error);
      throw error;
    }
  };
  
  // Get all reviews by a user
  export const getUserReviews = async (userId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
  
      const snapshot = await getDocs(q);
      
      // For demo purposes, we'll add some sample reviews if none exist
      if (snapshot.empty) {
        return getSampleUserReviews();
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting user reviews:", error);
      throw error;
    }
  };
  
  // Add a review
  export const addReview = async (reviewData) => {
    try {
      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp()
      };
  
      const docRef = await addDoc(collection(db, "reviews"), newReview);
      
      // Update chocolate average rating
      updateChocolateRating(reviewData.chocolateId);
      
      // Update user review count
      updateUserReviewCount(reviewData.userId);
      
      return {
        id: docRef.id,
        ...newReview
      };
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  };
  
  // Update a review
  export const updateReview = async (reviewId, updatedData) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      
      // Update chocolate average rating
      const reviewDoc = await getDoc(reviewRef);
      if (reviewDoc.exists()) {
        updateChocolateRating(reviewDoc.data().chocolateId);
      }
      
      return {
        id: reviewId,
        ...updatedData
      };
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  };
  
  // Delete a review
  export const deleteReview = async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      
      // Get the chocolate ID before deleting
      const reviewDoc = await getDoc(reviewRef);
      const chocolateId = reviewDoc.exists() ? reviewDoc.data().chocolateId : null;
      const userId = reviewDoc.exists() ? reviewDoc.data().userId : null;
      
      await deleteDoc(reviewRef);
      
      // Update chocolate average rating if we have the ID
      if (chocolateId) {
        updateChocolateRating(chocolateId);
      }
      
      // Update user review count
      if (userId) {
        updateUserReviewCount(userId);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  };
  
  // Helper function to update a chocolate's average rating
  const updateChocolateRating = async (chocolateId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("chocolateId", "==", chocolateId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const reviews = snapshot.docs.map(doc => doc.data());
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        const chocolateRef = doc(db, "chocolates", chocolateId);
        await updateDoc(chocolateRef, {
          averageRating,
          ratings: reviews.length,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating chocolate rating:", error);
    }
  };
  
  // Helper function to update a user's review count
  const updateUserReviewCount = async (userId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      const reviewCount = snapshot.size;
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        reviewCount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating user review count:", error);
    }
  };
  
  // Sample reviews for demo purposes
  const getSampleUserReviews = () => {
    return [
      {
        id: 'sample1',
        userId: 'currentUser',
        chocolateId: '1',
        rating: 4,
        text: 'This dark chocolate has a wonderful depth of flavor with notes of cherry and a hint of vanilla. The texture is smooth with a clean snap. I particularly enjoyed the long finish that develops additional complexity over time.',
        createdAt: { toDate: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        chocolate: {
          id: '1',
          name: 'Valrhona Guanaja 70%',
          maker: 'Valrhona',
          imageUrl: 'https://placehold.co/300x300?text=Chocolate'
        }
      },
      {
        id: 'sample2',
        userId: 'currentUser',
        chocolateId: '2',
        rating: 5,
        text: 'Absolutely perfect balance of creaminess and cocoa flavor! This milk chocolate has a silky texture that melts beautifully on the tongue. There are subtle caramel notes and a hint of malt that make it incredibly satisfying. Will definitely purchase again.',
        createdAt: { toDate: () => new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        chocolate: {
          id: '2',
          name: 'Lindt Excellence Milk Chocolate',
          maker: 'Lindt & Sprüngli',
          imageUrl: 'https://placehold.co/300x300?text=Chocolate'
        }
      },
      {
        id: 'sample3',
        userId: 'currentUser',
        chocolateId: '3',
        rating: 3,
        text: 'An interesting single-origin bar with bright acidity and prominent fruity notes. While the quality is apparent, I found the texture slightly grainy and the finish a bit too acidic for my taste. Still worth trying for chocolate enthusiasts interested in exploring different flavor profiles.',
        createdAt: { toDate: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        chocolate: {
          id: '3',
          name: 'Dandelion Madagascar',
          maker: 'Dandelion Chocolate',
          imageUrl: 'https://placehold.co/300x300?text=Chocolate'
        }
      }
    ];
  };