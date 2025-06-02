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

// 🔧 Fix 1: Updated enrichChocolateWithMaker function
const enrichChocolateWithMaker = async (chocolate) => {
  // Check if maker is already a string (user-contributed chocolates)
  if (chocolate.maker && typeof chocolate.maker === 'string' && chocolate.maker !== 'Unknown Maker') {
    console.log('✅ Chocolate already has direct maker name:', chocolate.maker);
    return chocolate; // Return as-is
  }
  
  // Check if it's a legacy chocolate with maker ID
  if (chocolate.makerId || chocolate.MakerID) {
    console.log('🔄 Looking up maker by ID for legacy chocolate');
    const makerName = await getMakerName(chocolate.makerId || chocolate.MakerID);
    return {
      ...chocolate,
      maker: makerName || 'Unknown Maker'
    };
  }
  
  // No maker info found
  return {
    ...chocolate,
    maker: 'Unknown Maker'
  };
};

// 🔧 Fix 2: Updated enrichChocolatesWithMakers function
const enrichChocolatesWithMakers = async (chocolates) => {
  console.log('🔄 Enriching', chocolates.length, 'chocolates with maker names...');
  
  const enrichedChocolates = await Promise.all(
    chocolates.map(chocolate => enrichChocolateWithMaker(chocolate))
  );
  
  console.log('✅ Enrichment complete');
  return enrichedChocolates;
};


// 🔧 Fix 4: Updated getAllChocolates function
export const getAllChocolates = async () => {
  try {
    console.log('📥 Fetching all chocolates...');
    const snapshot = await getDocs(chocolatesCollection);
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Raw chocolates fetched:', chocolates.length);
    
    // Enrich with maker names
    const enrichedChocolates = await enrichChocolatesWithMakers(chocolates);
    console.log('✅ All chocolates enriched with maker names');
    
    return enrichedChocolates;
  } catch (error) {
    console.error('💥 Error fetching chocolates:', error);
    throw error;
  }
};

// Replace your getChocolateById function in chocolateFirebaseService.js

export const getChocolateById = async (id) => {
  console.log('🔍 getChocolateById called with ID:', id);
  try {
    const docRef = doc(db, 'chocolates', id);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const chocolateData = {
        id: snapshot.id,
        ...snapshot.data()
      };
      
      console.log('📄 Raw chocolate data from database:', {
        maker: chocolateData.maker,
        makerId: chocolateData.makerId,
        MakerID: chocolateData.MakerID,
        isUserContributed: chocolateData.isUserContributed
      });
      
      // 🔑 KEY FIX: Check the storage method in the right order
      
      // FIRST: Check if it's a user-contributed chocolate with direct maker name
      if (chocolateData.isUserContributed && chocolateData.maker && typeof chocolateData.maker === 'string') {
        console.log('✅ User-contributed chocolate with direct maker name:', chocolateData.maker);
        return chocolateData; // Return as-is, maker is already correct
      }
      
      // SECOND: Check if ANY chocolate has a direct maker string (not just user-contributed)
      if (chocolateData.maker && typeof chocolateData.maker === 'string' && chocolateData.maker !== 'Unknown Maker') {
        console.log('✅ Chocolate with direct maker name:', chocolateData.maker);
        return chocolateData; // Return as-is, maker is already correct
      }
      
      // THIRD: Legacy chocolates with maker IDs - look up the maker name
      if (chocolateData.makerId || chocolateData.MakerID) {
        console.log('🔄 Legacy chocolate, looking up maker by ID:', chocolateData.makerId || chocolateData.MakerID);
        const makerName = await getMakerName(chocolateData.makerId || chocolateData.MakerID);
        const enrichedData = {
          ...chocolateData,
          maker: makerName || 'Unknown Maker'
        };
        console.log('✅ Enriched legacy chocolate data with maker:', enrichedData.maker);
        return enrichedData;
      }
      
      // FOURTH: No maker info at all - fallback
      console.log('❌ No maker information found, using Unknown Maker');
      return {
        ...chocolateData,
        maker: 'Unknown Maker'
      };
      
    } else {
      console.log('❌ Chocolate not found in database');
      throw new Error('Chocolate not found');
    }
  } catch (error) {
    console.error('💥 Error in getChocolateById:', error);
    throw error;
  }
};

// 🔧 Fix 3: Updated searchChocolates function
export const searchChocolates = async (searchTerm) => {
  try {
    console.log('🔍 Searching for:', searchTerm);
    
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
    
    console.log('📊 Total chocolates in database:', chocolates.length);
    
    // Enrich with maker names FIRST
    const enrichedChocolates = await enrichChocolatesWithMakers(chocolates);
    
    const term = searchTerm.toLowerCase().trim();
    console.log('🎯 Searching for term:', term);
    
    // Filter chocolates that match the search term
    const matchedChocolates = enrichedChocolates.filter(chocolate => {
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
      
      const matches = nameMatch || makerMatch || originMatch || typeMatch || tagMatch;
      
      if (matches) {
        console.log('✅ Match found:', chocolate.name, 'by', chocolate.maker);
      }
      
      return matches;
    });
    
    console.log('🎯 Search results:', matchedChocolates.length, 'matches found');
    return matchedChocolates;
    
  } catch (error) {
    console.error("💥 Error searching chocolates:", error);
    throw error;
  }
};

// 🔧 Fix 5: Updated getFeaturedChocolates function
export const getFeaturedChocolates = async (limitCount = 10) => {
  try {
    console.log('⭐ Fetching featured chocolates...');
    
    const q = query(
      collection(db, 'chocolates'),
      where('averageRating', '>', 0),
      orderBy('averageRating', 'desc'),
      orderBy('reviewCount', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('📭 No chocolates found in database, returning sample data');
      return getSampleFeaturedChocolates(limitCount);
    }
    
    const chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${chocolates.length} featured chocolates in database`);
    
    // Enrich with maker names
    const enrichedChocolates = await enrichChocolatesWithMakers(chocolates);
    console.log('✅ Featured chocolates enriched with maker names');
    
    return enrichedChocolates;
  } catch (error) {
    console.error('💥 Error getting featured chocolates:', error);
    console.log('🔄 Falling back to sample data due to error');
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

// Replace your addUserChocolate function with this enhanced version

export const addUserChocolate = async (chocolateData, imageFile) => {
  console.log('🍫 Starting addUserChocolate process...');
  console.log('📄 Chocolate data received:', chocolateData);
  console.log('🖼️ Image file received:', imageFile ? {
    name: imageFile.name,
    size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
    type: imageFile.type
  } : 'No image file');

  try {
    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      console.log('📤 Starting image upload...');
      
      const timestamp = Date.now();
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `user-contributions/${chocolateData.createdBy}/${timestamp}_${cleanFileName}`;
      
      console.log('📁 Upload path:', fileName);
      
      const storageRef = ref(storage, fileName);
      
      try {
        console.log('⬆️ Uploading to Firebase Storage...');
        const uploadResult = await uploadBytes(storageRef, imageFile);
        console.log('✅ Upload successful, getting download URL...');
        
        imageUrl = await getDownloadURL(storageRef);
        console.log('🔗 Download URL obtained:', imageUrl);
        
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        
        // Don't fail the entire process - just proceed without image
        console.log('⚠️ Proceeding without image due to upload failure');
        imageUrl = `https://placehold.co/300x300?text=${encodeURIComponent(chocolateData.name.substring(0, 20))}`;
      }
    } else {
      console.log('📷 No image provided, using placeholder');
      imageUrl = `https://placehold.co/300x300?text=${encodeURIComponent(chocolateData.name.substring(0, 20))}`;
    }
    
    // Prepare chocolate data with explicit maker field
    const newChocolate = {
      // Core chocolate data
      name: chocolateData.name,
      maker: chocolateData.maker, // 🔑 CRITICAL: Store maker as string
      type: chocolateData.type,
      origin: chocolateData.origin,
      cacaoPercentage: chocolateData.cacaoPercentage,
      description: chocolateData.description,
      tags: chocolateData.tags || [],
      
      // Image
      imageUrl: imageUrl,
      
      // User contribution metadata
      createdBy: chocolateData.createdBy,
      createdByName: chocolateData.createdByName,
      isUserContributed: true,
      status: 'approved',
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      contributionDate: serverTimestamp(),
      
      // Rating defaults
      averageRating: 0,
      reviewCount: 0,
      ratings: 0 // For compatibility
    };
    
    console.log('💾 Final chocolate object (check maker field):', {
      maker: newChocolate.maker,
      isUserContributed: newChocolate.isUserContributed,
      name: newChocolate.name
    });
    
    // Save to database
    const docRef = await addDoc(chocolatesCollection, newChocolate);
    console.log('✅ Chocolate saved with ID:', docRef.id);
    
    // Update user stats (don't let this fail the main process)
    try {
      console.log('📊 Updating user contribution stats...');
      await updateUserContributionStats(chocolateData.createdBy, 'chocolatesAdded');
      await checkAndAwardContributionBadges(chocolateData.createdBy);
      console.log('✅ User stats updated');
    } catch (statsError) {
      console.error('⚠️ Failed to update user stats (non-critical):', statsError);
    }
    
    const result = {
      id: docRef.id,
      ...newChocolate,
      // Ensure maker is explicitly set in the result
      maker: chocolateData.maker
    };
    
    console.log('🎉 addUserChocolate completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('💥 Error in addUserChocolate:', error);
    console.error('📋 Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
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