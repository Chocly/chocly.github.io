// src/services/reviewService.js - FIXED VERSION
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
  serverTimestamp,
  limit 
} from "firebase/firestore";
import { db } from "../firebase";
import { getChocolateById } from './chocolateFirebaseService';

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
    
    return reviews.length > 0 ? reviews : [];
  } catch (error) {
    console.error("Error getting chocolate reviews:", error);
    return [];
  }
};

// Get reviews for a specific user
export const getUserReviews = async (userId) => {
  try {
    console.log('🔍 Getting reviews for user:', userId);
    
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No reviews found for user');
      return [];
    }
    
    const reviews = [];
    
    // Process each review and fetch chocolate data
    for (const docSnapshot of snapshot.docs) {
      const reviewData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      console.log('📝 Processing review:', reviewData.id);
      
      // If the review already has chocolate data, use it
      if (reviewData.chocolate && reviewData.chocolate.name) {
        console.log('✅ Review already has chocolate data');
        reviews.push(reviewData);
      } else {
        // Fetch chocolate data using the chocolateId
        try {
          console.log('🔍 Fetching chocolate data for ID:', reviewData.chocolateId);
          const chocolateData = await getChocolateById(reviewData.chocolateId);
          
          // Add chocolate info to the review
          reviewData.chocolate = {
            id: chocolateData.id,
            name: chocolateData.name,
            maker: chocolateData.maker,
            imageUrl: chocolateData.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
          };
          
          console.log('✅ Added chocolate data:', reviewData.chocolate.name);
          reviews.push(reviewData);
          
        } catch (chocolateError) {
          console.error('❌ Failed to fetch chocolate for review:', reviewData.id, chocolateError);
          
          // Add review with fallback chocolate info
          reviewData.chocolate = {
            id: reviewData.chocolateId || 'unknown',
            name: 'Unknown Chocolate',
            maker: 'Unknown Maker',
            imageUrl: 'https://placehold.co/300x300?text=Unknown'
          };
          
          reviews.push(reviewData);
        }
      }
    }
    
    console.log('✅ Processed', reviews.length, 'reviews with chocolate data');
    return reviews;
    
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
};

// Add a review
export const addReview = async (reviewData) => {
  try {
    // SAFETY CHECK: Prevent duplicate reviews for the same user and chocolate
    if (reviewData.userId && reviewData.chocolateId) {
      const existingReviewQuery = query(
        collection(db, "reviews"),
        where("userId", "==", reviewData.userId),
        where("chocolateId", "==", reviewData.chocolateId),
        limit(1)
      );

      const existingSnapshot = await getDocs(existingReviewQuery);

      if (!existingSnapshot.empty) {
        console.warn('⚠️ User already has a review for this chocolate. Use updateReview instead.');
        throw new Error('You have already reviewed this chocolate. Please edit your existing review instead.');
      }
    }

    const newReview = {
      ...reviewData,
      createdAt: reviewData.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Add the review document to Firestore
    const docRef = await addDoc(collection(db, "reviews"), newReview);

    // Update chocolate average rating and review count
    await updateChocolateRating(reviewData.chocolateId);

    // Update user review count if userId exists
    if (reviewData.userId) {
      await updateUserReviewCount(reviewData.userId);
    }

    return {
      id: docRef.id,
      ...newReview
    };
  } catch (error) {
    console.error("Error adding review:", error);
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
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
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
    // Don't throw - this is non-critical
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
    // Don't throw - this is non-critical
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
      await updateChocolateRating(reviewDoc.data().chocolateId);
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
      await updateChocolateRating(chocolateId);
    }
    
    // Update user review count
    if (userId) {
      await updateUserReviewCount(userId);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// FIXED: Get recent top reviews with proper error handling
export const getRecentTopReviews = async (limitCount = 3) => {
  try {
    console.log('Fetching recent top reviews...');
    
    // Try to get recent high-quality reviews from the database
    const recentHighRatingQuery = query(
      collection(db, "reviews"),
      where("rating", ">=", 4),
      orderBy("rating", "desc"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(recentHighRatingQuery);
    
    if (snapshot.empty) {
      console.log('No reviews found in database');
      return [];
    }
    
    const reviews = [];
    const processedChocolateIds = new Set();
    
    for (const docSnapshot of snapshot.docs) {
      if (reviews.length >= limitCount) break;
      
      const reviewData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // Skip if we already have a review for this chocolate
      if (processedChocolateIds.has(reviewData.chocolateId)) {
        continue;
      }
      
      // Get the chocolate data for this review
      try {
        const chocolateDoc = await getDoc(doc(db, "chocolates", reviewData.chocolateId));
        if (chocolateDoc.exists()) {
          reviewData.chocolate = {
            id: chocolateDoc.id,
            ...chocolateDoc.data()
          };
          
          reviews.push(reviewData);
          processedChocolateIds.add(reviewData.chocolateId);
        }
      } catch (err) {
        console.error("Error fetching chocolate for review:", err);
      }
    }
    
    console.log(`Found ${reviews.length} featured reviews`);
    return reviews;
    
  } catch (error) {
    console.error("Error getting recent top reviews:", error);
    return [];
  }
};

// FIXED: Get featured reviews with proper error handling
export const getFeaturedReviews = async (limitCount = 3) => {
  try {
    console.log('Fetching featured reviews...');
    
    // First try to get recent reviews (any rating)
    const recentReviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const recentSnapshot = await getDocs(recentReviewsQuery);
    
    if (recentSnapshot.empty) {
      console.log('No reviews found');
      return [];
    }
    
    const allRecentReviews = [];
    
    for (const docSnapshot of recentSnapshot.docs) {
      const reviewData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
      
      // Get chocolate data
      try {
        const chocolateDoc = await getDoc(doc(db, "chocolates", reviewData.chocolateId));
        if (chocolateDoc.exists()) {
          reviewData.chocolate = {
            id: chocolateDoc.id,
            ...chocolateDoc.data()
          };
          allRecentReviews.push(reviewData);
        }
      } catch (err) {
        console.error("Error fetching chocolate for review:", err);
      }
    }
    
    // Score reviews based on rating, recency, and review length
    const scoredReviews = allRecentReviews.map(review => {
      const rating = review.rating || 0;
      const textLength = (review.text && typeof review.text === 'string') ? review.text.length : 0;
      
      // Safely handle date conversion
      let daysSinceReview = 999;
      if (review.createdAt) {
        try {
          // Handle Firestore timestamp
          const reviewDate = review.createdAt.toDate ? review.createdAt.toDate() : new Date(review.createdAt);
          daysSinceReview = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
        } catch (e) {
          console.warn('Could not parse review date:', e);
        }
      }
      
      // Scoring: higher rating + longer text + more recent = higher score
      const score = (rating * 0.4) + 
                   (Math.min(textLength / 200, 1) * 0.3) + 
                   (Math.max(0, (30 - daysSinceReview) / 30) * 0.3);
      
      return {
        ...review,
        featuredScore: score
      };
    });
    
    // Return top scored reviews, ensuring no duplicate chocolates
    const uniqueReviews = [];
    const usedChocolateIds = new Set();
    
    scoredReviews
      .sort((a, b) => b.featuredScore - a.featuredScore)
      .forEach(review => {
        if (!usedChocolateIds.has(review.chocolateId) && uniqueReviews.length < limitCount) {
          uniqueReviews.push(review);
          usedChocolateIds.add(review.chocolateId);
        }
      });
    
    console.log(`Returning ${uniqueReviews.length} featured reviews`);
    return uniqueReviews;
    
  } catch (error) {
    console.error("Error getting featured reviews:", error);
    return [];
  }
};