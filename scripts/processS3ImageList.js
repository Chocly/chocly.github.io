// scripts/processS3ImageList.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
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
 * Download and process the S3 image list
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
    
    console.log('Processing file to build image lookup...');
    
    // Process the file line by line to build the lookup
    const fileContent = fs.readFileSync(outputFile, 'utf8');
    const lines = fileContent.split('\n');
    
    // Filter for image files, focusing on 400px versions for better performance
    const imageEntries = lines.filter(line => line.includes('.400.jpg'));
    
    console.log(`Found ${imageEntries.length} image entries`);
    
    // Process each entry to build the lookup
    imageEntries.forEach(entry => {
      // Extract the barcode from the entry
      // Format: data/401/235/911/4303/1.400.jpg
      
      // For EAN-13 (split path)
      const ean13Pattern = /data\/(\d{3})\/(\d{3})\/(\d{3})\/(\d{4})\/(.+)\.400\.jpg/;
      const ean13Match = entry.match(ean13Pattern);
      
      if (ean13Match) {
        const [, part1, part2, part3, part4, imageType] = ean13Match;
        const barcode = part1 + part2 + part3 + part4;
        
        // Store the available image type for this barcode
        if (!availableImages.has(barcode)) {
          availableImages.set(barcode, []);
        }
        availableImages.get(barcode).push(imageType);
        return;
      }
      
      // For shorter barcodes (unsplit path)
      const shortPattern = /data\/(\d+)\/(.+)\.400\.jpg/;
      const shortMatch = entry.match(shortPattern);
      
      if (shortMatch) {
        const [, barcode, imageType] = shortMatch;
        
        // Store the available image type for this barcode
        if (!availableImages.has(barcode)) {
          availableImages.set(barcode, []);
        }
        availableImages.get(barcode).push(imageType);
      }
    });
    
    console.log(`Built lookup map with ${availableImages.size} unique barcodes`);
    
  } catch (error) {
    console.error('Error processing S3 image list:', error);
    throw error;
  }
};

/**
 * Check if an image is available for a given barcode
 * @param {string} barcode - The product barcode
 * @returns {string|null} - The best available image type or null
 */
const findBestImageType = (barcode) => {
  if (!barcode || !availableImages.has(barcode)) {
    return null;
  }
  
  const availableTypes = availableImages.get(barcode);
  
  // Order of preference for image types
  const preferredTypes = ['front', '1', '2', '3', 'ingredients', 'nutrition'];
  
  // Find the first preferred type that's available
  for (const type of preferredTypes) {
    if (availableTypes.includes(type)) {
      return type;
    }
  }
  
  // If none of the preferred types are available, return the first available type
  return availableTypes[0];
};

/**
 * Get the S3 image URL for a barcode
 * @param {string} barcode - The product barcode
 * @returns {string|null} - The S3 image URL or null
 */
const getS3ImageUrl = (barcode, imageType) => {
  if (!barcode || !imageType) return null;
  
  // Format barcode into S3 path
  let path;
  if (barcode.length === 13) {
    path = `/${barcode.slice(0, 3)}/${barcode.slice(3, 6)}/${barcode.slice(6, 9)}/${barcode.slice(9)}`;
  } else {
    path = `/${barcode}`;
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
    
    for (const chocolateDoc of snapshot.docs) {
      const chocolate = {
        id: chocolateDoc.id,
        ...chocolateDoc.data()
      };
      
      processed++;
      
      // Skip if no barcode or already has a non-placeholder image
      if (!chocolate.barcode) {
        skipped++;
        continue;
      }
      
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
        
        console.log(`Updated image for ${chocolate.name} (${chocolate.barcode}) with type ${bestImageType}`);
        updated++;
      } else {
        console.log(`No image found for ${chocolate.name} (${chocolate.barcode})`);
        skipped++;
      }
      
      // Log progress periodically
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${snapshot.size} (${Math.round(processed/snapshot.size*100)}%)`);
      }
    }
    
    console.log(`Update complete! Updated ${updated}, Skipped ${skipped}, Total ${processed}`);
    
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