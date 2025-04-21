// src/services/chocolateFirebaseService.js
import { db, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Collection references
const chocolatesCollection = collection(db, 'chocolates');
const makersCollection = collection(db, 'makers');
const reviewsCollection = collection(db, 'reviews');
const tagsCollection = collection(db, 'tags');

// Chocolate CRUD operations
export const getAllChocolates = async () => {
  const snapshot = await getDocs(chocolatesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getChocolateById = async (id) => {
  const docRef = doc(db, 'chocolates', id);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } else {
    throw new Error('Chocolate not found');
  }
};

export const searchChocolates = async (searchTerm) => {
  // Basic search implementation
  // For more advanced search, consider using Algolia or Elasticsearch
  const chocolates = await getAllChocolates();
  return chocolates.filter(chocolate => 
    chocolate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chocolate.maker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chocolate.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chocolate.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const addChocolate = async (chocolateData, imageFile) => {
  // Handle image upload if provided
  let imageUrl = null;
  if (imageFile) {
    const storageRef = ref(storage, `chocolate-images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }
  
  // Create the chocolate document
  const docRef = await addDoc(chocolatesCollection, {
    ...chocolateData,
    imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
    averageRating: 0,
    reviewCount: 0
  });
  
  return {
    id: docRef.id,
    ...chocolateData,
    imageUrl
  };
};

// Reviews operations
export const getChocolateReviews = async (chocolateId) => {
  const q = query(
    reviewsCollection, 
    where("chocolateId", "==", chocolateId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addReview = async (reviewData) => {
  // Add the review
  const docRef = await addDoc(reviewsCollection, {
    ...reviewData,
    createdAt: new Date()
  });
  
  // Update the chocolate's average rating and review count
  const chocolateRef = doc(db, 'chocolates', reviewData.chocolateId);
  const chocolateDoc = await getDoc(chocolateRef);
  
  if (chocolateDoc.exists()) {
    const chocolateData = chocolateDoc.data();
    const currentTotal = chocolateData.averageRating * chocolateData.reviewCount;
    const newCount = chocolateData.reviewCount + 1;
    const newAverage = (currentTotal + reviewData.rating) / newCount;
    
    await updateDoc(chocolateRef, {
      averageRating: newAverage,
      reviewCount: newCount
    });
  }
  
  return {
    id: docRef.id,
    ...reviewData
  };
};

// Tags operations
export const getAllTags = async () => {
  const snapshot = await getDocs(tagsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Makers operations
export const getAllMakers = async () => {
  const snapshot = await getDocs(makersCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getMakerById = async (id) => {
  const docRef = doc(db, 'makers', id);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } else {
    throw new Error('Maker not found');
  }
};

// Featured chocolates
export const getFeaturedChocolates = async () => {
  const q = query(
    chocolatesCollection,
    orderBy("averageRating", "desc"),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};