// scripts/processS3ImageList.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// ES module fixes
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Map to store available images
let availableImages = new Map();

/**
 * Download and process the S3 image list using streaming (handles 500MB file)
 */
const downloadAndProcessS3List = async () => {
  try {
    console.log('Downloading S3 image list...');
    
    // Create directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const s3ListUrl = 'https://openfoodfacts-images.s3.eu-west-3.amazonaws.com/data/data_keys.gz';
    const outputFile = path.join(dataDir, 'data_keys.txt');
    const compressedFile = path.join(dataDir, 'data_keys.gz');
    
    // Check if we already have the decompressed file
    if (fs.existsSync(outputFile)) {
      console.log('Found existing data_keys.txt file, using it instead of downloading...');
    } else {
      // Download the compressed file
      console.log('Downloading compressed file from S3...');
      const response = await axios({
        method: 'get',
        url: s3ListUrl,
        responseType: 'stream'
      });
      
      // First save the compressed file
      await pipeline(
        response.data,
        fs.createWriteStream(compressedFile)
      );
      
      console.log('Downloaded compressed file, now decompressing...');
      
      // Decompress and process the file
      await pipeline(
        fs.createReadStream(compressedFile),
        createGunzip(),
        fs.createWriteStream(outputFile)
      );
      
      console.log('Decompressed file successfully');
      
      // Clean up compressed file
      fs.unlinkSync(compressedFile);
    }
    
    console.log('Processing file to build image lookup (streaming mode - handles large files)...');
    
    // ✅ STREAMING APPROACH - Process the file line by line
    const fileStream = createReadStream(outputFile);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let processedLines = 0;
    let imageCount = 0;
    
    for await (const line of rl) {
      processedLines++;
      
      // Only process lines that contain image files with 400px versions
      if (line.includes('.400.jpg')) {
        imageCount++;
        
        // Extract the barcode from the entry
        // Format: data/401/235/911/4303/1.400.jpg
        
        // For EAN-13 (split path) - handles both 12-digit (padded) and 13-digit
        const ean13Pattern = /data\/(\d{3})\/(\d{3})\/(\d{3})\/(\d{4})\/(.+)\.400\.jpg/;
        const ean13Match = line.match(ean13Pattern);
        
        if (ean13Match) {
          const [, part1, part2, part3, part4, imageType] = ean13Match;
          const barcode = part1 + part2 + part3 + part4;
          
          // Store the available image type for this barcode
          if (!availableImages.has(barcode)) {
            availableImages.set(barcode, []);
          }
          availableImages.get(barcode).push(imageType);
          continue;
        }
        
        // For shorter barcodes (unsplit path)
        const shortPattern = /data\/(\d+)\/(.+)\.400\.jpg/;
        const shortMatch = line.match(shortPattern);
        
        if (shortMatch) {
          const [, barcode, imageType] = shortMatch;
          
          // Store the available image type for this barcode
          if (!availableImages.has(barcode)) {
            availableImages.set(barcode, []);
          }
          availableImages.get(barcode).push(imageType);
        }
      }
      
      // Show progress every 100,000 lines
      if (processedLines % 100000 === 0) {
        console.log(`Processed ${processedLines.toLocaleString()} lines, found ${imageCount.toLocaleString()} images, built lookup for ${availableImages.size.toLocaleString()} barcodes...`);
      }
    }
    
    console.log(`Processing complete! Processed ${processedLines.toLocaleString()} total lines`);
    console.log(`Found ${imageCount.toLocaleString()} image entries`);
    console.log(`Built lookup map with ${availableImages.size.toLocaleString()} unique barcodes`);
    
  } catch (error) {
    console.error('Error processing S3 image list:', error);
    throw error;
  }
};

/**
 * Check if an image is available for a given barcode (handles multiple barcode lengths)
 * @param {string} barcode - The product barcode
 * @returns {string|null} - The best available image type or null
 */
const findBestImageType = (barcode) => {
  if (!barcode) return null;
  
  // Try different padding strategies for different barcode lengths
  const paddingStrategies = [];
  
  if (barcode.length === 13) {
    // 13-digit: use as-is
    paddingStrategies.push(barcode);
  } else if (barcode.length === 12) {
    // 12-digit: pad with one 0
    paddingStrategies.push('0' + barcode);
  } else if (barcode.length === 11) {
    // 11-digit: try padding with 1 or 2 zeros
    paddingStrategies.push('0' + barcode);   // 12 digits
    paddingStrategies.push('00' + barcode);  // 13 digits
  } else if (barcode.length === 10) {
    // 10-digit: try padding with 2 or 3 zeros
    paddingStrategies.push('00' + barcode);  // 12 digits
    paddingStrategies.push('000' + barcode); // 13 digits
  } else {
    // Other lengths: try as-is and with padding
    paddingStrategies.push(barcode);
    if (barcode.length < 13) {
      paddingStrategies.push('0'.repeat(13 - barcode.length) + barcode);
    }
  }
  
  // Try each padding strategy
  for (const paddedBarcode of paddingStrategies) {
    if (availableImages.has(paddedBarcode)) {
      const availableTypes = availableImages.get(paddedBarcode);
      
      // Order of preference for image types
      const preferredTypes = ['front', '1', '2', '3', 'ingredients', 'nutrition'];
      
      // Find the first preferred type that's available
      for (const type of preferredTypes) {
        if (availableTypes.includes(type)) {
          return type;
        }
      }
      
      // If none of the preferred types are available, return the first available type
      if (availableTypes.length > 0) {
        return availableTypes[0];
      }
    }
  }
  
  return null;
};

/**
 * Get the S3 image URL for a barcode (handles multiple barcode lengths)
 * @param {string} barcode - The product barcode
 * @returns {string|null} - The S3 image URL or null
 */
const getS3ImageUrl = (barcode, imageType) => {
  if (!barcode || !imageType) return null;
  
  // Determine the correct padded barcode to use
  let paddedBarcode = barcode;
  
  if (barcode.length === 12) {
    paddedBarcode = '0' + barcode;
  } else if (barcode.length === 11) {
    // Try both padding strategies, prefer the one that worked in findBestImageType
    const option1 = '0' + barcode;   // 12 digits
    const option2 = '00' + barcode;  // 13 digits
    
    // Use the one that has images available
    if (availableImages.has(option2)) {
      paddedBarcode = option2;
    } else {
      paddedBarcode = option1;
    }
  } else if (barcode.length === 10) {
    // Try both padding strategies
    const option1 = '00' + barcode;  // 12 digits  
    const option2 = '000' + barcode; // 13 digits
    
    if (availableImages.has(option2)) {
      paddedBarcode = option2;
    } else {
      paddedBarcode = option1;
    }
  } else if (barcode.length < 13) {
    // Pad to 13 digits
    paddedBarcode = '0'.repeat(13 - barcode.length) + barcode;
  }
  
  // Format barcode into S3 path (now always 13 digits or handle shorter ones)
  let path;
  if (paddedBarcode.length === 13) {
    path = `/${paddedBarcode.slice(0, 3)}/${paddedBarcode.slice(3, 6)}/${paddedBarcode.slice(6, 9)}/${paddedBarcode.slice(9)}`;
  } else {
    // For non-13 digit barcodes, use as-is
    path = `/${paddedBarcode}`;
  }
  
  return `https://openfoodfacts-images.s3.eu-west-3.amazonaws.com/data${path}/${imageType}.400.jpg`;
};

/**
 * Update chocolate images in the database using the lookup map
 */
const updateChocolateImages = async () => {
  try {
    // Make sure we have the lookup map before proceeding
    if (availableImages.size === 0) {
      await downloadAndProcessS3List();
    }
    
    console.log('Updating chocolate images using S3 lookup...');
    
    // Get chocolates with barcodes
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    console.log(`Found ${snapshot.size} chocolates to check.`);
    
    // Process each chocolate
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let debugInfo = [];
    
    for (const chocolateDoc of snapshot.docs) {
      const chocolate = {
        id: chocolateDoc.id,
        ...chocolateDoc.data()
      };
      
      processed++;
      
      // Skip if no barcode
      if (!chocolate.barcode) {
        skipped++;
        debugInfo.push(`${chocolate.name}: No barcode`);
        continue;
      }
      
      // Skip if already has a non-placeholder image
      if (chocolate.imageUrl && !chocolate.imageUrl.includes('placehold.co')) {
        skipped++;
        continue;
      }
      
      // Find the best image type for this barcode
      const bestImageType = findBestImageType(chocolate.barcode);
      
      if (bestImageType) {
        // Get the S3 image URL
        const imageUrl = getS3ImageUrl(chocolate.barcode, bestImageType);
        
        // Update the document
        const chocolateRef = doc(db, 'chocolates', chocolate.id);
        await updateDoc(chocolateRef, {
          imageUrl,
          updatedAt: new Date()
        });
        
        console.log(`✅ Updated ${chocolate.name} (${chocolate.barcode}) with ${bestImageType} image`);
        updated++;
      } else {
        debugInfo.push(`${chocolate.name}: Barcode ${chocolate.barcode} (${chocolate.barcode.length} digits) - not found in S3`);
        skipped++;
      }
      
      // Log progress periodically
      if (processed % 50 === 0) {
        console.log(`Progress: ${processed}/${snapshot.size} (${Math.round(processed/snapshot.size*100)}%)`);
      }
    }
    
    console.log(`\n🎉 Update complete!`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${processed}`);
    
    // Show some debug info for barcodes not found
    if (debugInfo.length > 0) {
      console.log(`\n📋 First 10 chocolates without S3 images:`);
      debugInfo.slice(0, 10).forEach(info => console.log(`  ${info}`));
      if (debugInfo.length > 10) {
        console.log(`  ... and ${debugInfo.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('Error updating chocolate images:', error);
  }
};

// Main function to run the entire process
const runImageUpdate = async () => {
  try {
    await downloadAndProcessS3List();
    await updateChocolateImages();
    console.log('Image update process completed successfully');
  } catch (error) {
    console.error('Error in image update process:', error);
  }
};

export { downloadAndProcessS3List, updateChocolateImages, runImageUpdate };

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runImageUpdate().then(() => {
    console.log('Script execution complete');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}