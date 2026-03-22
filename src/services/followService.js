// src/services/followService.js
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore";
import { db } from "../firebase";

// Internal: find existing follow document
const getFollowDoc = async (followerId, followingId) => {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", followerId),
    where("followingId", "==", followingId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) return;

  const existing = await getFollowDoc(currentUserId, targetUserId);
  if (existing) return;

  await addDoc(collection(db, "follows"), {
    followerId: currentUserId,
    followingId: targetUserId,
    createdAt: serverTimestamp()
  });

  await Promise.all([
    updateDoc(doc(db, "users", currentUserId), { followingCount: increment(1) }),
    updateDoc(doc(db, "users", targetUserId), { followerCount: increment(1) })
  ]);
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  const followDoc = await getFollowDoc(currentUserId, targetUserId);
  if (!followDoc) return;

  await deleteDoc(doc(db, "follows", followDoc.id));

  await Promise.all([
    updateDoc(doc(db, "users", currentUserId), { followingCount: increment(-1) }),
    updateDoc(doc(db, "users", targetUserId), { followerCount: increment(-1) })
  ]);
};

export const isFollowing = async (currentUserId, targetUserId) => {
  const followDoc = await getFollowDoc(currentUserId, targetUserId);
  return !!followDoc;
};

export const getFollowing = async (userId) => {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", userId)
  );
  const snapshot = await getDocs(q);

  const profiles = [];
  for (const followDoc of snapshot.docs) {
    try {
      const userDoc = await getDoc(doc(db, "users", followDoc.data().followingId));
      if (userDoc.exists()) {
        const d = userDoc.data();
        profiles.push({
          id: userDoc.id,
          displayName: d.displayName || 'User',
          photoURL: d.photoURL || '',
          bio: d.bio || '',
          reviewCount: d.reviewCount || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching followed user:", err);
    }
  }
  return profiles;
};

export const getFollowers = async (userId) => {
  const q = query(
    collection(db, "follows"),
    where("followingId", "==", userId)
  );
  const snapshot = await getDocs(q);

  const profiles = [];
  for (const followDoc of snapshot.docs) {
    try {
      const userDoc = await getDoc(doc(db, "users", followDoc.data().followerId));
      if (userDoc.exists()) {
        const d = userDoc.data();
        profiles.push({
          id: userDoc.id,
          displayName: d.displayName || 'User',
          photoURL: d.photoURL || '',
          bio: d.bio || '',
          reviewCount: d.reviewCount || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching follower:", err);
    }
  }
  return profiles;
};
