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
  limit,
  startAfter,
  runTransaction
} from "firebase/firestore";
import { db } from "../firebase";
import { getChocolateById } from './chocolateFirebaseService';
import { uploadReviewPhotos, deleteReviewPhotos } from './reviewPhotoService';
import { deleteAllCommentsForReview } from './commentService';

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
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    // Process all reviews in parallel instead of sequentially
    const reviews = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const reviewData = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };

        if (reviewData.chocolate && reviewData.chocolate.name) {
          return reviewData;
        }

        try {
          const chocolateData = await getChocolateById(reviewData.chocolateId);
          reviewData.chocolate = {
            id: chocolateData.id,
            name: chocolateData.name,
            maker: chocolateData.maker,
            origin: chocolateData.origin,
            imageUrl: chocolateData.imageUrl || 'https://placehold.co/300x300?text=Chocolate'
          };
        } catch (chocolateError) {
          reviewData.chocolate = {
            id: reviewData.chocolateId || 'unknown',
            name: 'Unknown Chocolate',
            maker: 'Unknown Maker',
            imageUrl: 'https://placehold.co/300x300?text=Unknown'
          };
        }

        return reviewData;
      })
    );

    return reviews;
    
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
};

// Lightweight: get only origin data from user reviews (for map, no full enrichment)
export const getUserReviewOrigins = async (userId) => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const origins = [];
    const needsFetch = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const origin = data.chocolate?.origin || data.origin;
      if (origin) {
        origins.push(origin);
      } else if (data.chocolateId) {
        needsFetch.push(data.chocolateId);
      }
    }

    // Batch-fetch missing origins in parallel (deduplicate IDs first)
    const uniqueIds = [...new Set(needsFetch)];
    if (uniqueIds.length > 0) {
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const choc = await getChocolateById(id);
            return { id, origin: choc.origin || null };
          } catch {
            return { id, origin: null };
          }
        })
      );
      const originMap = new Map(results.map(r => [r.id, r.origin]));
      for (const id of needsFetch) {
        const o = originMap.get(id);
        if (o) origins.push(o);
      }
    }

    return origins;
  } catch (error) {
    console.error("Error getting user review origins:", error);
    return [];
  }
};

// Add a review (with optional photo files).
// The review doc ID is deterministic ({chocolateId}_{userId}) so the database
// itself enforces one review per user per chocolate, and the review + rating
// aggregate are written in one atomic transaction (no lost updates, and
// security rules can require they change together).
export const addReview = async (reviewData, photoFiles = []) => {
  try {
    const { chocolateId, userId } = reviewData;
    if (!chocolateId || !userId) {
      throw new Error("A review needs both a chocolate and a signed-in user.");
    }

    // Legacy reviews used random doc IDs, so also check by query.
    const existingReviewQuery = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      where("chocolateId", "==", chocolateId),
      limit(1)
    );
    const existingSnapshot = await getDocs(existingReviewQuery);
    if (!existingSnapshot.empty) {
      throw new Error('You have already reviewed this chocolate. Please edit your existing review instead.');
    }

    const reviewId = `${chocolateId}_${userId}`;
    const reviewRef = doc(db, "reviews", reviewId);
    const chocolateRef = doc(db, "chocolates", chocolateId);

    const newReview = {
      ...reviewData,
      photoUrls: [],
      hasPhotos: false,
      likeCount: 0,
      commentCount: 0,
      createdAt: reviewData.createdAt || new Date(),
      updatedAt: new Date()
    };

    await runTransaction(db, async (tx) => {
      const [existingDoc, chocolateDoc] = await Promise.all([
        tx.get(reviewRef),
        tx.get(chocolateRef)
      ]);
      if (existingDoc.exists()) {
        throw new Error('You have already reviewed this chocolate. Please edit your existing review instead.');
      }

      tx.set(reviewRef, newReview);

      if (chocolateDoc.exists()) {
        const c = chocolateDoc.data();
        const count = c.reviewCount || 0;
        const total = (c.averageRating || 0) * count;
        tx.update(chocolateRef, {
          averageRating: (total + (reviewData.rating || 0)) / (count + 1),
          reviewCount: count + 1,
          updatedAt: new Date()
        });
      }
    });

    // Upload photos if provided (needs review ID for storage path)
    if (photoFiles.length > 0) {
      try {
        const photoUrls = await uploadReviewPhotos(userId, reviewId, photoFiles);
        await updateDoc(reviewRef, {
          photoUrls,
          hasPhotos: true
        });
        newReview.photoUrls = photoUrls;
        newReview.hasPhotos = true;
      } catch (photoError) {
        console.error("Error uploading review photos:", photoError);
        // Review still saved without photos
      }
    }

    await updateUserReviewCount(userId);

    return {
      id: reviewId,
      ...newReview
    };
  } catch (error) {
    console.error("Error adding review:", error);
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
    // Don't throw - this is non-critical
  }
};  

// Update a review; if the rating changed, adjust the chocolate's aggregate
// in the same atomic transaction.
export const updateReview = async (reviewId, updatedData) => {
  try {
    const reviewRef = doc(db, "reviews", reviewId);

    await runTransaction(db, async (tx) => {
      const reviewDoc = await tx.get(reviewRef);
      if (!reviewDoc.exists()) {
        throw new Error("Review not found.");
      }
      const oldReview = reviewDoc.data();
      const newRating = updatedData.rating ?? oldReview.rating;
      const ratingChanged =
        typeof newRating === "number" && newRating !== oldReview.rating;

      let chocolateRef = null;
      let chocolateDoc = null;
      if (ratingChanged && oldReview.chocolateId) {
        chocolateRef = doc(db, "chocolates", oldReview.chocolateId);
        chocolateDoc = await tx.get(chocolateRef);
      }

      tx.update(reviewRef, {
        ...updatedData,
        updatedAt: new Date()
      });

      if (chocolateDoc && chocolateDoc.exists()) {
        const c = chocolateDoc.data();
        const count = c.reviewCount || 0;
        if (count > 0) {
          const total = (c.averageRating || 0) * count;
          tx.update(chocolateRef, {
            averageRating: (total - (oldReview.rating || 0) + newRating) / count,
            updatedAt: new Date()
          });
        }
      }
    });

    return {
      id: reviewId,
      ...updatedData
    };
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Delete a review; the review removal and the chocolate aggregate decrement
// happen in one atomic transaction, then photos/likes/comments are cleaned up
// best-effort. (Like/comment docs left behind by permission limits are
// harmless orphans — nothing queries comments for a deleted review.)
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, "reviews", reviewId);

    let chocolateId = null;
    let userId = null;
    let photoUrls = [];

    await runTransaction(db, async (tx) => {
      const reviewDoc = await tx.get(reviewRef);
      if (!reviewDoc.exists()) {
        return;
      }
      const reviewData = reviewDoc.data();
      chocolateId = reviewData.chocolateId || null;
      userId = reviewData.userId || null;
      photoUrls = reviewData.photoUrls || [];

      let chocolateRef = null;
      let chocolateDoc = null;
      if (chocolateId) {
        chocolateRef = doc(db, "chocolates", chocolateId);
        chocolateDoc = await tx.get(chocolateRef);
      }

      tx.delete(reviewRef);

      if (chocolateDoc && chocolateDoc.exists()) {
        const c = chocolateDoc.data();
        const count = c.reviewCount || 0;
        const newCount = Math.max(0, count - 1);
        const total = (c.averageRating || 0) * count;
        tx.update(chocolateRef, {
          averageRating: newCount > 0
            ? (total - (reviewData.rating || 0)) / newCount
            : 0,
          reviewCount: newCount,
          updatedAt: new Date()
        });
      }
    });

    // Clean up photos from Storage
    if (photoUrls.length > 0) {
      deleteReviewPhotos(photoUrls).catch(err =>
        console.error("Error cleaning up review photos:", err)
      );
    }

    // Clean up likes (best-effort)
    const likesQuery = query(
      collection(db, "reviewLikes"),
      where("reviewId", "==", reviewId)
    );
    getDocs(likesQuery).then(snap =>
      Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
    ).catch(err => console.error("Error cleaning up likes:", err));

    // Clean up comments (best-effort)
    deleteAllCommentsForReview(reviewId).catch(err =>
      console.error("Error cleaning up comments:", err)
    );

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
    
    return reviews;
    
  } catch (error) {
    console.error("Error getting recent top reviews:", error);
    return [];
  }
};

// FIXED: Get featured reviews with proper error handling
export const getFeaturedReviews = async (limitCount = 3) => {
  try {
    // First try to get recent reviews (any rating)
    const recentReviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const recentSnapshot = await getDocs(recentReviewsQuery);
    
    if (recentSnapshot.empty) {
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
          // Could not parse review date
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
    
    return uniqueReviews;

  } catch (error) {
    console.error("Error getting featured reviews:", error);
    return [];
  }
};

// Get photo reviews for the community feed (cursor-based pagination)
export const getPhotoReviews = async (lastDocument = null, limitCount = 10) => {
  try {
    let q;

    if (lastDocument) {
      q = query(
        collection(db, "reviews"),
        where("hasPhotos", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(lastDocument),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "reviews"),
        where("hasPhotos", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const reviews = [];

    for (const docSnapshot of snapshot.docs) {
      const reviewData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        _doc: docSnapshot // Keep reference for pagination cursor
      };

      // Enrich with chocolate data if missing
      if (!reviewData.chocolate || !reviewData.chocolate.name) {
        try {
          const chocolateDoc = await getDoc(doc(db, "chocolates", reviewData.chocolateId));
          if (chocolateDoc.exists()) {
            reviewData.chocolate = {
              id: chocolateDoc.id,
              name: chocolateDoc.data().name,
              maker: chocolateDoc.data().maker,
              imageUrl: chocolateDoc.data().imageUrl
            };
          }
        } catch (err) {
          reviewData.chocolate = {
            id: reviewData.chocolateId,
            name: "Unknown Chocolate",
            maker: "Unknown Maker"
          };
        }
      }

      reviews.push(reviewData);
    }

    const lastDoc = snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

    return { reviews, lastDoc, hasMore: snapshot.docs.length === limitCount };
  } catch (error) {
    console.error("Error getting photo reviews:", error);
    return { reviews: [], lastDoc: null, hasMore: false };
  }
};