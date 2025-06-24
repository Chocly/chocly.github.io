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

// Enhanced getUserReviews function in reviewService.js
import { getChocolateById } from './chocolateFirebaseService'; // Import this

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

export const getUserReviews = async (userId) => {
  try {
    console.log('🔍 Getting reviews for user:', userId);
    
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    
    // If no reviews found, return empty array (remove the sample data)
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
    return []; // Return empty array instead of throwing
  }
};

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
      reviewCount: reviews.length,
      updatedAt: serverTimestamp()
    });
  }
} catch (error) {
  console.error("Error updating chocolate rating:", error);
  throw error;
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

// FIXED: Enhanced getRecentTopReviews function with proper imports
export const getRecentTopReviews = async (limitCount = 3) => {
try {
  // Try to get recent high-quality reviews from the database
  const recentHighRatingQuery = query(
    collection(db, "reviews"),
    where("rating", ">=", 4), // Only reviews with 4+ stars
    orderBy("rating", "desc"), // Highest rated first
    orderBy("createdAt", "desc"), // Then most recent
    limit(20) // Get more than we need to allow for filtering
  );

  const snapshot = await getDocs(recentHighRatingQuery);
  
  if (!snapshot.empty) {
    // Process the reviews and get chocolate data
    const reviews = [];
    const processedChocolateIds = new Set(); // Avoid duplicate chocolates
    
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
          
          // Add to our results
          reviews.push(reviewData);
          processedChocolateIds.add(reviewData.chocolateId);
        }
      } catch (err) {
        console.error("Error fetching chocolate for review:", err);
      }
    }
    
    // If we got some real reviews, return them
    if (reviews.length > 0) {
      return reviews.slice(0, limitCount);
    }
  }
  
  // If no database reviews, return empty array (no sample data for reviews)
  return [];
} catch (error) {
  console.error("Error getting recent top reviews:", error);
  // Return empty array instead of sample data
  return [];
}
};

// FIXED: Alternative function to get featured reviews with broader criteria
export const getFeaturedReviews = async (limitCount = 3) => {
try {
  // First try to get recent reviews (any rating)
  const recentReviewsQuery = query(
    collection(db, "reviews"),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const recentSnapshot = await getDocs(recentReviewsQuery);
  
  if (!recentSnapshot.empty) {
    // Get all recent reviews
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
      const textLength = review.text ? review.text.length : 0;
      const daysSinceReview = review.createdAt ? 
        (Date.now() - review.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24) : 999;
      
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
    
    return uniqueReviews;
  }
  
  // If no reviews in database, return empty array
  return [];
} catch (error) {
  console.error("Error getting featured reviews:", error);
  return [];
}
};