// src/services/feedService.js
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { getFollowing } from "./followService";
import { getChocolateById, getFeaturedChocolates } from "./chocolateFirebaseService";

// Get recent reviews from users the current user follows
export const getFollowingFeedReviews = async (userId, limitCount = 10) => {
  try {
    const following = await getFollowing(userId);
    if (following.length === 0) return [];

    const followedIds = following.map(u => u.id);

    // Firestore 'in' queries support max 30 values — chunk if needed
    const chunks = [];
    for (let i = 0; i < followedIds.length; i += 30) {
      chunks.push(followedIds.slice(i, i + 30));
    }

    let allReviews = [];

    for (const chunk of chunks) {
      const q = query(
        collection(db, "reviews"),
        where("userId", "in", chunk),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        allReviews.push({ id: docSnap.id, ...docSnap.data() });
      }
    }

    // Sort combined results and limit
    allReviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    allReviews = allReviews.slice(0, limitCount);

    // Enrich with chocolate data + user info in parallel
    await Promise.all(allReviews.map(async (review) => {
      if (!review.chocolate || !review.chocolate.name) {
        try {
          const choc = await getChocolateById(review.chocolateId);
          review.chocolate = {
            id: choc.id,
            name: choc.name,
            maker: choc.maker,
            imageUrl: choc.imageUrl
          };
        } catch {
          review.chocolate = {
            id: review.chocolateId,
            name: 'Unknown Chocolate',
            maker: 'Unknown Maker'
          };
        }
      }

      const user = following.find(u => u.id === review.userId);
      if (user) {
        review.userName = review.userName || user.displayName;
        review.userPhotoURL = review.userPhotoURL || user.photoURL;
      }
    }));

    return allReviews;
  } catch (error) {
    console.error("Error getting following feed:", error);
    return [];
  }
};

// Deterministic daily chocolate spotlight
export const getDailyDiscovery = async () => {
  try {
    const chocolates = await getFeaturedChocolates(20);
    if (chocolates.length === 0) return null;

    // Hash today's date to pick a consistent chocolate for the day
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % chocolates.length;

    return chocolates[index];
  } catch (error) {
    console.error("Error getting daily discovery:", error);
    return null;
  }
};

// Get recommended chocolates the user hasn't favorited
export const getRecommendedChocolates = async (userFavorites = [], limitCount = 6) => {
  try {
    const chocolates = await getFeaturedChocolates(limitCount * 3);
    const favSet = new Set(userFavorites);
    const filtered = chocolates.filter(c => !favSet.has(c.id));
    return filtered.slice(0, limitCount);
  } catch (error) {
    console.error("Error getting recommended chocolates:", error);
    return [];
  }
};
