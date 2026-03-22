// src/services/commentService.js
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Add a comment to a review
export const addComment = async (reviewId, userId, userName, userPhotoURL, text) => {
  const commentRef = await addDoc(collection(db, "reviewComments"), {
    reviewId,
    userId,
    userName,
    userPhotoURL: userPhotoURL || "",
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  // Increment comment count on the review
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, { commentCount: increment(1) });

  return {
    id: commentRef.id,
    reviewId,
    userId,
    userName,
    userPhotoURL: userPhotoURL || "",
    text: text.trim(),
    createdAt: new Date(),
  };
};

// Get comments for a review, ordered oldest first
export const getComments = async (reviewId, limitCount = 50) => {
  const q = query(
    collection(db, "reviewComments"),
    where("reviewId", "==", reviewId),
    orderBy("createdAt", "asc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

// Delete a comment
export const deleteComment = async (commentId, reviewId) => {
  await deleteDoc(doc(db, "reviewComments", commentId));

  // Decrement comment count on the review
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, { commentCount: increment(-1) });
};

// Delete all comments for a review (used when deleting a review)
export const deleteAllCommentsForReview = async (reviewId) => {
  const q = query(
    collection(db, "reviewComments"),
    where("reviewId", "==", reviewId)
  );
  const snapshot = await getDocs(q);
  const deletes = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
};
