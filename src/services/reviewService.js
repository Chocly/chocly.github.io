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
  
// src/services/reviewService.js

// Add a review
export const addReview = async (reviewData) => {
  try {
    const newReview = {
      ...reviewData,
      createdAt: serverTimestamp()
    };
  
    // Add the review document to Firestore
    const docRef = await addDoc(collection(db, "reviews"), newReview);
    
    // Update chocolate average rating and review count
    await updateChocolateRating(reviewData.chocolateId);
    
    // Update user review count
    await updateUserReviewCount(reviewData.userId);
    
    return {
      id: docRef.id,
      ...newReview
    };
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// Helper function to update a chocolate's average rating (ensure this is defined)
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
        reviewCount: reviews.length,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating chocolate rating:", error);
    throw error;
  }
};

// Helper function to update a user's review count (ensure this is defined)
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
    // We'll just log this error rather than throwing it to prevent
    // blocking the review submission if this update fails
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

  // src/services/reviewService.js - Adding the getRecentTopReviews function

// Add this function to get recent top reviews (reviews with high ratings)
export const getRecentTopReviews = async (limit = 5) => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("rating", ">=", 4), // Only get reviews with 4+ stars
      orderBy("rating", "desc"), // Sort by rating (highest first)
      orderBy("createdAt", "desc"), // Then by date (newest first)
      limit(limit) // Limit to specified number of reviews
    );

    const snapshot = await getDocs(q);
    
    // For demo or development purposes, return sample data if no real reviews exist
    if (snapshot.empty) {
      return getSampleTopReviews(limit);
    }
    
    // Process the reviews and fetch related chocolate data
    const reviews = [];
    for (const doc of snapshot.docs) {
      const reviewData = {
        id: doc.id,
        ...doc.data()
      };
      
      // Get the chocolate data for this review
      try {
        const chocolateDoc = await getDoc(doc(db, "chocolates", reviewData.chocolateId));
        if (chocolateDoc.exists()) {
          reviewData.chocolate = {
            id: chocolateDoc.id,
            ...chocolateDoc.data()
          };
        }
      } catch (err) {
        console.error("Error fetching chocolate for review:", err);
      }
      
      reviews.push(reviewData);
    }
    
    return reviews;
  } catch (error) {
    console.error("Error getting top reviews:", error);
    // Return sample data in case of error to prevent UI disruption
    return getSampleTopReviews(limit);
  }
};

// Sample top reviews for development/demo
const getSampleTopReviews = (limit) => {
  const sampleReviews = [
    {
      id: 'sample1',
      user: 'ChocolateFiend',
      rating: 5,
      text: 'The fruity notes in this Madagascar bar are incredible - bright cherry and subtle citrus that lingers beautifully. One of the best dark chocolates I\'ve ever tasted.',
      createdAt: { seconds: Date.now() / 1000 - 86400 }, // 1 day ago
      chocolateId: '1',
      chocolate: {
        id: '1',
        name: 'Madagascan Dark 72%',
        maker: 'Terroir Artisan',
        imageUrl: '/placeholder-chocolate.jpg'
      }
    },
    {
      id: 'sample2',
      user: 'CocoaExplorer',
      rating: 5,
      text: 'This has to be the most balanced milk chocolate I ever tried. Creamy but not too sweet with complex notes you do not usually find in milk chocolate. Simply divine!',
      createdAt: { seconds: Date.now() / 1000 - 172800 }, // 2 days ago
      chocolateId: '2',
      chocolate: {
        id: '2',
        name: 'Sea Salt Caramel',
        maker: 'Wild Coast Chocolate',
        imageUrl: '/placeholder-chocolate.jpg'
      }
    },
    {
      id: 'sample3',
      user: 'BeanToBarFan',
      rating: 4.5,
      text: 'Exceptional balance of flavors with notes of berries and a hint of earthiness. The mouthfeel is incredibly silky and the finish is long and pleasant.',
      createdAt: { seconds: Date.now() / 1000 - 259200 }, // 3 days ago
      chocolateId: '3',
      chocolate: {
        id: '3',
        name: 'Peruvian Single Origin',
        maker: 'Craft Origins',
        imageUrl: '/placeholder-chocolate.jpg'
      }
    }
  ];
  
  return sampleReviews.slice(0, limit);
};