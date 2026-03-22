// src/services/likeService.js
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Find existing like doc for a user + review
const getLikeDoc = async (reviewId, userId) => {
  const q = query(
    collection(db, "reviewLikes"),
    where("reviewId", "==", reviewId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0];
};

// Toggle like on/off. Returns { liked: boolean, newCount: number }
export const toggleLike = async (reviewId, userId) => {
  const existing = await getLikeDoc(reviewId, userId);
  const reviewRef = doc(db, "reviews", reviewId);

  if (existing) {
    await deleteDoc(existing.ref);
    await updateDoc(reviewRef, { likeCount: increment(-1) });
    return { liked: false };
  } else {
    await addDoc(collection(db, "reviewLikes"), {
      reviewId,
      userId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(reviewRef, { likeCount: increment(1) });
    return { liked: true };
  }
};

// Check if a single review is liked by user
export const hasUserLikedReview = async (reviewId, userId) => {
  const existing = await getLikeDoc(reviewId, userId);
  return existing !== null;
};

// Batch check like statuses for a list of review IDs (max 30)
export const getUserLikeStatuses = async (reviewIds, userId) => {
  if (!userId || reviewIds.length === 0) return {};

  const statuses = {};
  reviewIds.forEach((id) => (statuses[id] = false));

  // Firestore "in" supports up to 30 values
  const chunks = [];
  for (let i = 0; i < reviewIds.length; i += 30) {
    chunks.push(reviewIds.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const q = query(
      collection(db, "reviewLikes"),
      where("userId", "==", userId),
      where("reviewId", "in", chunk)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => {
      statuses[d.data().reviewId] = true;
    });
  }

  return statuses;
};
