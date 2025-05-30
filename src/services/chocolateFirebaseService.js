// src/services/chocolateFirebaseService.js - FIXED VERSION with proper imports
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
  limit,  // <-- FIXED: Added missing import
  increment, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Collection references
const chocolatesCollection = collection(db, 'chocolates');
const makersCollection = collection(db, 'makers');
const reviewsCollection = collection(db, 'reviews');
const tagsCollection = collection(db, 'tags');

// Helper function to fetch maker name by ID
const getMakerName = async (makerId) => {
  if (!makerId) return null;
  
  try {
    const makerDoc = await getDoc(doc(db, 'makers', makerId));
    if (makerDoc.exists()) {
      const makerData = makerDoc.data();
      // Try different possible field names for the maker name
      return makerData.name || makerData.brand || makerData.title || makerData.maker || 'Unknown Maker';
    }
  } catch (error) {
    console.error('Error fetching maker:', error);
  }
  
  return 'Unknown Maker';
};

// Helper function to enrich chocolate data with maker names
const enrichChocolateWithMaker = async (chocolate) => {
  const makerName = await getMakerName(chocolate.makerId || chocolate.MakerID);
  return {
    ...chocolate,
    maker: makerName
  };
};

// Helper function to enrich multiple chocolates with maker names
const enrichChocolatesWithMakers = async (chocolates) => {
  const enrichedChocolates = await Promise.all(
    chocolates.map(chocolate => enrichChocolateWithMaker(chocolate))
  );
  return enrichedChocolates;
};

// Updated getAllChocolates function
export const getAllChocolates = async () => {
  try {
    const snapshot = await getDocs(chocolatesCollection);
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enrich with maker names
    return await enrichChocolatesWithMakers(chocolates);
  } catch (error) {
    console.error('Error fetching chocolates:', error);
    throw error;
  }
};

// Updated getChocolateById function
export const getChocolateById = async (id) => {
  console.log('getChocolateById called with ID:', id);
  try {
    const docRef = doc(db, 'chocolates', id);
    const snapshot = await getDoc(docRef);
    
    console.log('Snapshot exists?', snapshot.exists());
    
    if (snapshot.exists()) {
      const chocolateData = {
        id: snapshot.id,
        ...snapshot.data()
      };
      
      // Enrich with maker name
      const enrichedData = await enrichChocolateWithMaker(chocolateData);
      console.log('Returning enriched chocolate data:', enrichedData);
      return enrichedData;
    } else {
      console.log('Chocolate not found in database');
      throw new Error('Chocolate not found');
    }
  } catch (error) {
    console.error('Error in getChocolateById:', error);
    throw error;
  }
};

// Updated searchChocolates function
export const searchChocolates = async (searchTerm) => {
  try {
    // First, check if we are searching for a tag
    const tagsSnapshot = await getDocs(tagsCollection);
    const tags = {};
    tagsSnapshot.docs.forEach(doc => {
      const tagData = doc.data();
      tags[doc.id] = tagData.name.toLowerCase();
    });
    
    // Get all chocolates
    const snapshot = await getDocs(chocolatesCollection);
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enrich with maker names
    const enrichedChocolates = await enrichChocolatesWithMakers(chocolates);
    
    const term = searchTerm.toLowerCase();
    
    // Filter chocolates that match the search term
    return enrichedChocolates.filter(chocolate => {
      // Check basic fields
      const nameMatch = chocolate.name && chocolate.name.toLowerCase().includes(term);
      const makerMatch = chocolate.maker && chocolate.maker.toLowerCase().includes(term);
      const originMatch = chocolate.origin && chocolate.origin.toLowerCase().includes(term);
      const typeMatch = chocolate.type && chocolate.type.toLowerCase().includes(term);
      
      // Check tags
      let tagMatch = false;
      if (chocolate.tagIds && Array.isArray(chocolate.tagIds)) {
        tagMatch = chocolate.tagIds.some(tagId => {
          return tags[tagId] && tags[tagId].includes(term);
        });
      }
      
      return nameMatch || makerMatch || originMatch || typeMatch || tagMatch;
    });
  } catch (error) {
    console.error("Error searching chocolates:", error);
    throw error;
  }
};

// FIXED: Updated getFeaturedChocolates function with proper limit import
export const getFeaturedChocolates = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'chocolates'),
      where('averageRating', '>', 0),
      orderBy('averageRating', 'desc'),
      orderBy('reviewCount', 'desc'),
      limit(limitCount)  // <-- This should now work properly
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database, returning sample data');
      return getSampleFeaturedChocolates(limitCount);
    }
    
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${chocolates.length} chocolates in database`);
    
    // Enrich with maker names
    return await enrichChocolatesWithMakers(chocolates);
  } catch (error) {
    console.error('Error getting featured chocolates:', error);
    console.log('Falling back to sample data due to error');
    return getSampleFeaturedChocolates(limitCount);
  }
};

// Updated getChocolatesByCategory function
export const getChocolatesByCategory = async (filter) => {
  try {
    let q;
    
    if (filter) {
      q = query(
        collection(db, 'chocolates'),
        where(filter.field, filter.operator, filter.value),
        orderBy('averageRating', 'desc'),
        limit(100)
      );
    } else {
      q = query(
        collection(db, 'chocolates'),
        orderBy('averageRating', 'desc'),
        limit(100)
      );
    }
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return getSampleCategoryChocolates(filter?.value);
    }
    
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enrich with maker names
    return await enrichChocolatesWithMakers(chocolates);
  } catch (error) {
    console.error('Error getting chocolates by category:', error);
    return getSampleCategoryChocolates(filter?.value);
  }
};

// Rest of your existing functions (addChocolate, getChocolateReviews, etc.)
export const addChocolate = async (chocolateData, imageFile) => {
  let imageUrl = null;
  if (imageFile) {
    const storageRef = ref(storage, `chocolate-images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }
  
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
  const docRef = await addDoc(reviewsCollection, {
    ...reviewData,
    createdAt: new Date()
  });
  
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

export const getAllTags = async () => {
  const snapshot = await getDocs(tagsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

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

export const updateChocolateImage = async (chocolateId, imageFile) => {
  try {
    const storageRef = ref(storage, `chocolate-images/${chocolateId}_${Date.now()}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    
    const chocolateRef = doc(db, 'chocolates', chocolateId);
    await updateDoc(chocolateRef, {
      imageUrl,
      updatedAt: new Date()
    });
    
    return imageUrl;
  } catch (error) {
    console.error("Error updating chocolate image:", error);
    throw error;
  }
};

export const batchProcessImages = async (chocolates, imageUrlField = 'externalImageUrl') => {
  const results = {
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const chocolate of chocolates) {
    try {
      if (chocolate[imageUrlField] && !chocolate.imageUrl) {
        const response = await fetch(chocolate[imageUrlField]);
        const blob = await response.blob();
        const file = new File([blob], `${chocolate.id}.jpg`, { type: 'image/jpeg' });
        await updateChocolateImage(chocolate.id, file);
        
        results.successful++;
        results.details.push({
          id: chocolate.id,
          name: chocolate.name,
          status: 'success'
        });
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        id: chocolate.id,
        name: chocolate.name,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
};

// Sample data functions (keeping your existing ones)
const getSampleFeaturedChocolates = (limitCount) => {
  const sampleChocolates = [
    {
      id: '1',
      name: 'Madagascan Dark 72%',
      maker: 'Terroir Artisan',
      type: 'Dark',
      origin: 'Madagascar',
      cacaoPercentage: 72,
      averageRating: 4.8,
      ratings: 186,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: '2',
      name: 'Sea Salt Caramel',
      maker: 'Wild Coast Chocolate',
      type: 'Dark Milk',
      origin: 'Ecuador',
      cacaoPercentage: 55,
      averageRating: 4.9,
      ratings: 203,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: '3',
      name: 'Peruvian Single Origin',
      maker: 'Craft Origins',
      type: 'Dark',
      origin: 'Peru',
      cacaoPercentage: 70,
      averageRating: 4.7,
      ratings: 156,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: '4',
      name: 'Vanilla Bean White',
      maker: 'Alpine Confections',
      type: 'White',
      origin: 'Various',
      cacaoPercentage: 33,
      averageRating: 4.5,
      ratings: 98,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: '5',
      name: 'Hazelnut Crunch',
      maker: 'Artisan Delights',
      type: 'Milk',
      origin: 'Italy',
      cacaoPercentage: 45,
      averageRating: 4.6,
      ratings: 124,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  return sampleChocolates.slice(0, limitCount);
};

const getSampleCategoryChocolates = (category) => {
  // Your existing sample data...
  const darkChocolates = [
    {
      id: 'd1',
      name: 'Madagascar 72% Dark',
      maker: 'Terroir Artisan',
      type: 'Dark',
      origin: 'Madagascar',
      cacaoPercentage: 72,
      averageRating: 4.8,
      ratings: 186,
      imageUrl: '/placeholder-chocolate.jpg'
    }
    // ... rest of your sample data
  ];
  
  // Return appropriate sample data based on category
  return darkChocolates; // Simplified for brevity
};

// Add these functions to the END of your existing chocolateFirebaseService.js file

// Add a chocolate contributed by a user
export const addUserChocolate = async (chocolateData, imageFile) => {
  try {
    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      const timestamp = Date.now();
      const fileName = `user-contributions/${chocolateData.createdBy}/${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    // Prepare chocolate data
    const newChocolate = {
      ...chocolateData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      averageRating: 0,
      reviewCount: 0,
      status: 'approved', // You can change this to 'pending' if you want moderation
      isUserContributed: true,
      contributionDate: serverTimestamp()
    };
    
    // Add the chocolate to the database
    const docRef = await addDoc(chocolatesCollection, newChocolate);
    
    // Update user's contribution count
    await updateUserContributionStats(chocolateData.createdBy, 'chocolatesAdded');
    
    // Award badges if needed
    await checkAndAwardContributionBadges(chocolateData.createdBy);
    
    return {
      id: docRef.id,
      ...newChocolate
    };
  } catch (error) {
    console.error('Error adding user chocolate:', error);
    throw error;
  }
};

// Update user contribution statistics
export const updateUserContributionStats = async (userId, statType, increment_value = 1) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        [`stats.${statType}`]: increment(increment_value),
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new user stats if user document doesn't exist
      await setDoc(userRef, {
        stats: {
          [statType]: increment_value
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating user contribution stats:', error);
    throw error;
  }
};

// Check and award badges based on contributions
export const checkAndAwardContributionBadges = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return;
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    const currentBadges = userData.badges || [];
    const newBadges = [...currentBadges];
    
    // Contribution badges based on chocolates added
    const chocolatesAdded = stats.chocolatesAdded || 0;
    
    if (chocolatesAdded >= 1 && !newBadges.includes('Contributor')) {
      newBadges.push('Contributor');
    }
    
    if (chocolatesAdded >= 5 && !newBadges.includes('Chocolate Scout')) {
      newBadges.push('Chocolate Scout');
    }
    
    if (chocolatesAdded >= 10 && !newBadges.includes('Database Builder')) {
      newBadges.push('Database Builder');
    }
    
    if (chocolatesAdded >= 25 && !newBadges.includes('Chocolate Curator')) {
      newBadges.push('Chocolate Curator');
    }
    
    if (chocolatesAdded >= 50 && !newBadges.includes('Master Contributor')) {
      newBadges.push('Master Contributor');
    }
    
    // Update badges if new ones were earned
    if (newBadges.length > currentBadges.length) {
      await updateDoc(userRef, {
        badges: newBadges,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
  }
};

// Get user's contribution statistics
export const getUserContributionStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return {
        chocolatesAdded: 0,
        reviewsWritten: 0,
        totalContributions: 0
      };
    }
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    
    return {
      chocolatesAdded: stats.chocolatesAdded || 0,
      reviewsWritten: stats.reviewsWritten || 0,
      totalContributions: (stats.chocolatesAdded || 0) + (stats.reviewsWritten || 0)
    };
  } catch (error) {
    console.error('Error getting user contribution stats:', error);
    return {
      chocolatesAdded: 0,
      reviewsWritten: 0,
      totalContributions: 0
    };
  }
};

// Get chocolates contributed by a specific user
export const getUserContributedChocolates = async (userId) => {
  try {
    const q = query(
      chocolatesCollection,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enrich with maker names
    return await enrichChocolatesWithMakers(chocolates);
  } catch (error) {
    console.error('Error getting user contributed chocolates:', error);
    throw error;
  }
};

// Get recent user contributions for community feed
export const getRecentContributions = async (limitCount = 10) => {
  try {
    const q = query(
      chocolatesCollection,
      where('isUserContributed', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return await enrichChocolatesWithMakers(chocolates);
  } catch (error) {
    console.error('Error getting recent contributions:', error);
    return [];
  }
};