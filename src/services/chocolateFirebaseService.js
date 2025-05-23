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

// Check in src/services/chocolateFirebaseService.js
export const getChocolateById = async (id) => {
  console.log('getChocolateById called with ID:', id);
  try {
    const docRef = doc(db, 'chocolates', id);
    const snapshot = await getDoc(docRef);
    
    console.log('Snapshot exists?', snapshot.exists());
    
    if (snapshot.exists()) {
      const data = {
        id: snapshot.id,
        ...snapshot.data()
      };
      console.log('Returning chocolate data:', data);
      return data;
    } else {
      console.log('Chocolate not found in database');
      throw new Error('Chocolate not found');
    }
  } catch (error) {
    console.error('Error in getChocolateById:', error);
    throw error;
  }
};

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
    
    const term = searchTerm.toLowerCase();
    
    // Filter chocolates that match the search term
    return chocolates.filter(chocolate => {
      // Check basic fields
      const nameMatch = chocolate.name && chocolate.name.toLowerCase().includes(term);
      const makerMatch = chocolate.maker && 
        (typeof chocolate.maker === 'string' 
          ? chocolate.maker.toLowerCase().includes(term)
          : chocolate.maker.name && chocolate.maker.name.toLowerCase().includes(term));
      const originMatch = chocolate.origin && chocolate.origin.toLowerCase().includes(term);
      const typeMatch = chocolate.type && chocolate.type.toLowerCase().includes(term);
      
      // Check tags
      let tagMatch = false;
      if (chocolate.tagIds && Array.isArray(chocolate.tagIds)) {
        tagMatch = chocolate.tagIds.some(tagId => {
          // Check if tag name matches search term
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

// UPDATED: Enhanced getFeaturedChocolates function with smart selection logic
export const getFeaturedChocolates = async (limit = 6) => {
  try {
    // Try to get chocolates from the database first
    const chocolatesSnapshot = await getDocs(chocolatesCollection);
    
    if (!chocolatesSnapshot.empty) {
      // If we have chocolates in the database, use smart selection logic
      const chocolates = chocolatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get recent reviews to determine activity
      const recentReviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(50) // Look at last 50 reviews
      );
      
      const recentReviews = await getDocs(recentReviewsQuery);
      const recentlyReviewedChocolateIds = new Set();
      recentReviews.docs.forEach(doc => {
        recentlyReviewedChocolateIds.add(doc.data().chocolateId);
      });
      
      // Score chocolates based on rating, review count, and recent activity
      const scoredChocolates = chocolates.map(chocolate => {
        const rating = chocolate.averageRating || 0;
        const reviewCount = chocolate.reviewCount || 0;
        const hasRecentActivity = recentlyReviewedChocolateIds.has(chocolate.id);
        
        // Scoring algorithm: rating weight + review count weight + recency bonus
        const score = (rating * 0.4) + (Math.min(reviewCount / 10, 1) * 0.4) + (hasRecentActivity ? 0.2 : 0);
        
        return {
          ...chocolate,
          featuredScore: score
        };
      });
      
      // Sort by score and return top results
      return scoredChocolates
        .sort((a, b) => b.featuredScore - a.featuredScore)
        .slice(0, limit);
    }
    
    // If no database chocolates, fall back to sample data
    return getSampleFeaturedChocolates(limit);
  } catch (error) {
    console.error('Error getting featured chocolates:', error);
    // Return sample data in case of error
    return getSampleFeaturedChocolates(limit);
  }
};

// UPDATED: Sample featured chocolates with real name brands
const getSampleFeaturedChocolates = (limit) => {
  const sampleChocolates = [
    {
      id: 'sample-godiva-1',
      name: 'Dark Chocolate 72% Cacao',
      maker: 'Godiva',
      type: 'Dark',
      origin: 'Ecuador',
      cacaoPercentage: 72,
      averageRating: 4.6,
      reviewCount: 342,
      ratings: 342,
      imageUrl: 'https://images.unsplash.com/photo-1549007992-85de76ce6969?w=300&h=300&fit=crop',
      description: 'Rich and sophisticated dark chocolate with notes of dried fruit and subtle spice.',
      featuredScore: 4.2
    },
    {
      id: 'sample-lindt-1',
      name: 'Excellence 85% Cocoa Dark Chocolate',
      maker: 'Lindt',
      type: 'Dark',
      origin: 'Various',
      cacaoPercentage: 85,
      averageRating: 4.8,
      reviewCount: 567,
      ratings: 567,
      imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop',
      description: 'Intense dark chocolate with complex flavor notes for the true connoisseur.',
      featuredScore: 4.5
    },
    {
      id: 'sample-hu-1',
      name: 'Vanilla Crunch Dark Chocolate',
      maker: 'Hu Kitchen',
      type: 'Dark',
      origin: 'Peru',
      cacaoPercentage: 70,
      averageRating: 4.7,
      reviewCount: 289,
      ratings: 289,
      imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop',
      description: 'Organic, paleo-friendly dark chocolate with real vanilla and crunchy cacao nibs.',
      featuredScore: 4.3
    },
    {
      id: 'sample-theo-1',
      name: 'Salted Almond 70% Dark Chocolate',
      maker: 'Theo Chocolate',
      type: 'Dark',
      origin: 'Madagascar',
      cacaoPercentage: 70,
      averageRating: 4.5,
      reviewCount: 198,
      ratings: 198,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      description: 'Fair trade dark chocolate with roasted almonds and a touch of sea salt.',
      featuredScore: 4.1
    },
    {
      id: 'sample-green-1',
      name: 'Mint Dark Chocolate',
      maker: 'Green & Black\'s',
      type: 'Dark',
      origin: 'Various',
      cacaoPercentage: 70,
      averageRating: 4.4,
      reviewCount: 156,
      ratings: 156,
      imageUrl: 'https://images.unsplash.com/photo-1587736793421-4c5c5b6bf4d7?w=300&h=300&fit=crop',
      description: 'Organic dark chocolate with refreshing natural mint flavor.',
      featuredScore: 4.0
    },
    {
      id: 'sample-ghirardelli-1',
      name: 'Sea Salt Soirée Dark Chocolate',
      maker: 'Ghirardelli',
      type: 'Dark',
      origin: 'Various',
      cacaoPercentage: 72,
      averageRating: 4.3,
      reviewCount: 423,
      ratings: 423,
      imageUrl: 'https://images.unsplash.com/photo-1585065763852-4cc3bc97e8b0?w=300&h=300&fit=crop',
      description: 'Premium dark chocolate with roasted almonds and sea salt crystals.',
      featuredScore: 3.9
    },
    {
      id: 'sample-valrhona-1',
      name: 'Guanaja 70% Dark Chocolate',
      maker: 'Valrhona',
      type: 'Dark',
      origin: 'South America',
      cacaoPercentage: 70,
      averageRating: 4.9,
      reviewCount: 234,
      ratings: 234,
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&h=300&fit=crop',
      description: 'Professional-grade dark chocolate with exceptional balance and complexity.',
      featuredScore: 4.6
    },
    {
      id: 'sample-endangered-1',
      name: 'Dark Chocolate + Sea Salt + Caramel',
      maker: 'Endangered Species',
      type: 'Dark',
      origin: 'Various',
      cacaoPercentage: 72,
      averageRating: 4.4,
      reviewCount: 312,
      ratings: 312,
      imageUrl: 'https://images.unsplash.com/photo-1571197102-95815e6a2769?w=300&h=300&fit=crop',
      description: 'Ethically sourced dark chocolate with gooey caramel and sea salt.',
      featuredScore: 4.0
    }
  ];
  
  // Sort by featured score and return top results
  return sampleChocolates
    .sort((a, b) => b.featuredScore - a.featuredScore)
    .slice(0, limit);
};

// Add to chocolateFirebaseService.js

// Function to update a chocolate with a new image URL
export const updateChocolateImage = async (chocolateId, imageFile) => {
  try {
    // Upload image to storage
    const storageRef = ref(storage, `chocolate-images/${chocolateId}_${Date.now()}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    
    // Update the chocolate document with the new image URL
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

// Function to batch process images from a URL source
export const batchProcessImages = async (chocolates, imageUrlField = 'externalImageUrl') => {
  const results = {
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const chocolate of chocolates) {
    try {
      if (chocolate[imageUrlField] && !chocolate.imageUrl) {
        // Fetch the image from the external URL
        const response = await fetch(chocolate[imageUrlField]);
        const blob = await response.blob();
        
        // Create a file from the blob
        const file = new File([blob], `${chocolate.id}.jpg`, { type: 'image/jpeg' });
        
        // Upload to Firebase Storage
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

// Function to get chocolates by category or tag
export const getChocolatesByCategory = async (filter) => {
  try {
    let q;
    
    // Create the appropriate query based on the filter
    if (filter) {
      q = query(
        collection(db, 'chocolates'),
        where(filter.field, filter.operator, filter.value),
        orderBy('averageRating', 'desc'), // Default sort by rating
        limit(100) // Reasonable limit
      );
    } else {
      // If no filter provided, get all chocolates
      q = query(
        collection(db, 'chocolates'),
        orderBy('averageRating', 'desc'),
        limit(100)
      );
    }
    
    const snapshot = await getDocs(q);
    
    // If no results, fall back to sample data for development/demo
    if (snapshot.empty) {
      return getSampleCategoryChocolates(filter?.value);
    }
    
    // Return the chocolates with their IDs
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting chocolates by category:', error);
    // Return sample data in case of error
    return getSampleCategoryChocolates(filter?.value);
  }
};

// Sample category chocolates for development/demo
const getSampleCategoryChocolates = (category) => {
  // Sample data for different categories
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
    },
    {
      id: 'd2',
      name: 'Ecuador 85% Dark',
      maker: 'Wild Coast Chocolate',
      type: 'Dark',
      origin: 'Ecuador',
      cacaoPercentage: 85,
      averageRating: 4.6,
      ratings: 142,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'd3',
      name: 'Venezuela 70% Dark',
      maker: 'Craft Origins',
      type: 'Dark',
      origin: 'Venezuela',
      cacaoPercentage: 70,
      averageRating: 4.7,
      ratings: 163,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  const milkChocolates = [
    {
      id: 'm1',
      name: 'Classic Milk Chocolate',
      maker: 'Alpine Confections',
      type: 'Milk',
      origin: 'Various',
      cacaoPercentage: 39,
      averageRating: 4.5,
      ratings: 210,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'm2',
      name: 'Creamy Milk Hazelnut',
      maker: 'Artisan Delights',
      type: 'Milk',
      origin: 'Italy',
      cacaoPercentage: 42,
      averageRating: 4.7,
      ratings: 178,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'm3',
      name: 'Toffee Milk Chocolate',
      maker: 'Sweet Traditions',
      type: 'Milk',
      origin: 'Belgium',
      cacaoPercentage: 36,
      averageRating: 4.4,
      ratings: 156,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  const whiteChocolates = [
    {
      id: 'w1',
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
      id: 'w2',
      name: 'Raspberry White Chocolate',
      maker: 'Sweet Traditions',
      type: 'White',
      origin: 'Belgium',
      cacaoPercentage: 30,
      averageRating: 4.3,
      ratings: 87,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  const singleOriginChocolates = [
    {
      id: 'so1',
      name: 'Peru Single Origin 70%',
      maker: 'Bean Masters',
      type: 'Dark',
      origin: 'Peru',
      cacaoPercentage: 70,
      averageRating: 4.9,
      ratings: 132,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'so2',
      name: 'Tanzania Single Origin 75%',
      maker: 'Origin Craft',
      type: 'Dark',
      origin: 'Tanzania',
      cacaoPercentage: 75,
      averageRating: 4.7,
      ratings: 105,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'so3',
      name: 'Dominican Republic Single Origin 65%',
      maker: 'Terroir Artisan',
      type: 'Dark',
      origin: 'Dominican Republic',
      cacaoPercentage: 65,
      averageRating: 4.6,
      ratings: 91,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  const artisanChocolates = [
    {
      id: 'a1',
      name: 'Small Batch Espresso',
      maker: 'Craft Origins',
      type: 'Dark',
      origin: 'Colombia',
      cacaoPercentage: 68,
      averageRating: 4.8,
      ratings: 76,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'a2',
      name: 'Handcrafted Sea Salt',
      maker: 'Artisan Delights',
      type: 'Milk',
      origin: 'Ecuador',
      cacaoPercentage: 45,
      averageRating: 4.6,
      ratings: 82,
      imageUrl: '/placeholder-chocolate.jpg'
    },
    {
      id: 'a3',
      name: 'Stone Ground 85%',
      maker: 'Bean Masters',
      type: 'Dark',
      origin: 'Mexico',
      cacaoPercentage: 85,
      averageRating: 4.7,
      ratings: 64,
      imageUrl: '/placeholder-chocolate.jpg'
    }
  ];
  
  // Determine which sample data to return based on the category
  if (category === 'Dark' || category === 'dark') return darkChocolates;
  if (category === 'Milk' || category === 'milk') return milkChocolates;
  if (category === 'White' || category === 'white') return whiteChocolates;
  if (category === 'single-origin') return singleOriginChocolates;
  if (category === 'bean-to-bar') return artisanChocolates;
  
  // If no match or no category specified, return a mix
  return [
    ...darkChocolates.slice(0, 1),
    ...milkChocolates.slice(0, 1),
    ...whiteChocolates.slice(0, 1),
    ...singleOriginChocolates.slice(0, 1),
    ...artisanChocolates.slice(0, 1)
  ];
};