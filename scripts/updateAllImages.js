// scripts/updateAllImages.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import axios from 'axios';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMKxVJqQyhB726ZIpqzrnlJwlVMEompzI",
  authDomain: "chocolate-review-web.firebaseapp.com",
  projectId: "chocolate-review-web",
  storageBucket: "chocolate-review-web.appspot.com",
  messagingSenderId: "40760554846",
  appId: "1:40760554846:web:af7701c50e3a44c13acbcf",
  measurementId: "G-CQXWMKJDQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Test if an image URL actually works (just check headers, don't download)
 */
const testImageUrl = async (url) => {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Get product image URL ONLY from Open Food Facts direct image servers
 * NO API calls - only direct image URL construction
 */
async function getBestProductImageUrl(barcode) {
  if (!barcode) return null;
  
  try {
    // Format the barcode for path construction
    let formattedPath;
    if (barcode.length === 13) {
      formattedPath = `${barcode.slice(0, 3)}/${barcode.slice(3, 6)}/${barcode.slice(6, 9)}/${barcode.slice(9, 13)}`;
    } else {
      formattedPath = barcode;
    }
    
    // Try multiple image types in order of preference
    // Using ONLY direct image server URLs - NO API calls
    const imageTypes = [
      'front.400',    // Best quality front image
      'front.200',    // Lower quality front image
      'front',        // Original front image
      '1.400',        // First uploaded image (400px)
      '1.200',        // First uploaded image (200px)
      '1',            // First uploaded image (original)
      '2.400',        // Second image
      '2',            // Second image (original)
      '3.400',        // Third image
      'packaging.400', // Packaging image
      'packaging'     // Packaging (original)
    ];
    
    const baseUrl = `https://images.openfoodfacts.org/images/products/${formattedPath}`;
    
    for (const imageType of imageTypes) {
      const imageUrl = `${baseUrl}/${imageType}.jpg`;
      
      // Test if this image actually exists
      const exists = await testImageUrl(imageUrl);
      if (exists) {
        console.log(`Found image for ${barcode}: ${imageType}`);
        return imageUrl;
      }
    }
    
    console.log(`No images found for barcode: ${barcode}`);
    return null;
    
  } catch (error) {
    console.error(`Error fetching image for ${barcode}:`, error.message);
    return null;
  }
}

/**
 * Update images for chocolates with placeholder images
 */
const updatePlaceholderImages = async (options = {}) => {
  const { 
    limit = null, 
    forceUpdate = false,
    onlyPlaceholders = true 
  } = options;
  
  try {
    console.log('Finding chocolates that need image updates...');
    console.log('📋 Using ONLY direct image URLs - no API calls');
    
    // Get chocolates that have placeholder images
    const chocolatesCollection = collection(db, 'chocolates');
    let chocolatesQuery;
    
    if (onlyPlaceholders) {
      // Only get chocolates with placeholder images
      chocolatesQuery = query(
        chocolatesCollection, 
        where("imageUrl", "==", "https://placehold.co/300x300?text=Chocolate")
      );
    } else {
      // Get all chocolates
      chocolatesQuery = chocolatesCollection;
    }
    
    const snapshot = await getDocs(chocolatesQuery);
    
    if (snapshot.empty) {
      console.log('No chocolates found that need image updates.');
      return;
    }
    
    let chocolates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter for chocolates with barcodes
    chocolates = chocolates.filter(chocolate => 
      chocolate.barcode && chocolate.barcode !== ''
    );
    
    if (limit) {
      chocolates = chocolates.slice(0, limit);
    }
    
    console.log(`Found ${chocolates.length} chocolates to update images for.`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const [index, chocolate] of chocolates.entries()) {
      try {
        console.log(`\n[${index + 1}/${chocolates.length}] Processing: ${chocolate.name}`);
        console.log(`Barcode: ${chocolate.barcode}`);
        
        // Skip if already has a real image (unless forcing update)
        if (!forceUpdate && chocolate.imageUrl && !chocolate.imageUrl.includes('placehold.co')) {
          console.log('Already has real image, skipping...');
          skipped++;
          continue;
        }
        
        // Try to get a better image using ONLY direct URLs
        const newImageUrl = await getBestProductImageUrl(chocolate.barcode);
        
        if (newImageUrl && newImageUrl !== chocolate.imageUrl) {
          // Update the chocolate with the new image
          const chocolateRef = doc(db, 'chocolates', chocolate.id);
          await updateDoc(chocolateRef, {
            imageUrl: newImageUrl,
            updatedAt: new Date()
          });
          
          console.log(`✅ Updated image: ${newImageUrl}`);
          updated++;
        } else {
          console.log('❌ No better image found');
          failed++;
        }
        
        // Add delay to be respectful to their servers (1 second between requests)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error updating ${chocolate.name}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Update complete!`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed/No image: ${failed}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total processed: ${chocolates.length}`);
    
  } catch (error) {
    console.error('Error updating images:', error);
  }
};

/**
 * Show image statistics
 */
const showImageStats = async () => {
  try {
    console.log('Analyzing image status...');
    
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found.');
      return;
    }
    
    let total = 0;
    let withBarcodes = 0;
    let withPlaceholders = 0;
    let withRealImages = 0;
    let withoutBarcodes = 0;
    
    snapshot.forEach((doc) => {
      const chocolate = doc.data();
      total++;
      
      if (chocolate.barcode && chocolate.barcode !== '') {
        withBarcodes++;
        
        if (chocolate.imageUrl && chocolate.imageUrl.includes('placehold.co')) {
          withPlaceholders++;
        } else {
          withRealImages++;
        }
      } else {
        withoutBarcodes++;
      }
    });
    
    console.log(`\n📊 Image Statistics:`);
    console.log(`Total chocolates: ${total}`);
    console.log(`With barcodes: ${withBarcodes}`);
    console.log(`Without barcodes: ${withoutBarcodes}`);
    console.log(`With placeholder images: ${withPlaceholders}`);
    console.log(`With real images: ${withRealImages}`);
    
    if (withBarcodes > 0) {
      console.log(`Success rate: ${Math.round((withRealImages / withBarcodes) * 100)}%`);
    }
    
  } catch (error) {
    console.error('Error analyzing images:', error);
  }
};

// Handle command line arguments
const action = process.argv[2];
const limitArg = process.argv[3];

if (action === 'stats') {
  showImageStats().then(() => process.exit(0));
} else if (action === 'update') {
  const limit = limitArg ? parseInt(limitArg) : null;
  updatePlaceholderImages({ limit }).then(() => process.exit(0));
} else if (action === 'update-all') {
  const limit = limitArg ? parseInt(limitArg) : null;
  updatePlaceholderImages({ limit, onlyPlaceholders: false, forceUpdate: true }).then(() => process.exit(0));
} else {
  console.log('Usage:');
  console.log('  node updateAllImages.js stats                    - Show image statistics');
  console.log('  node updateAllImages.js update [limit]          - Update placeholder images');
  console.log('  node updateAllImages.js update-all [limit]      - Force update all images');
  console.log('');
  console.log('Examples:');
  console.log('  node updateAllImages.js update 10               - Update first 10 placeholders');
  console.log('  node updateAllImages.js update                  - Update all placeholders');
  console.log('');
  console.log('🚫 NO API calls - uses only direct image URLs as recommended by Open Food Facts');
  process.exit(1);
}