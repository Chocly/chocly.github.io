import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import XLSX from 'xlsx';  // Fixed: Use default import for ES modules
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import axios from 'axios';

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

// File path - update this to your Excel file's location
const EXCEL_FILE_PATH = path.join(__dirname, '..', 'data', 'openfoodfacts_export_dark_chocolates.xlsx');

// Function to get product image URL from Open Food Facts
async function getProductImageUrl(barcode) {
  try {
    // Format the barcode for path construction
    let formattedPath;
    if (barcode.length === 13) {
      formattedPath = `${barcode.slice(0, 3)}/${barcode.slice(3, 6)}/${barcode.slice(6, 9)}/${barcode.slice(9, 13)}`;
    } else {
      formattedPath = barcode;
    }
    
    // Check front image first (usually best quality)
    const frontImageUrl = `https://images.openfoodfacts.org/images/products/${formattedPath}/front.400.jpg`;
    
    try {
      const response = await axios.head(frontImageUrl);
      if (response.status === 200) {
        return frontImageUrl;
      }
    } catch (error) {
      // Front image not found, try regular image
    }
    
    // Try first image
    const firstImageUrl = `https://images.openfoodfacts.org/images/products/${formattedPath}/1.400.jpg`;
    
    try {
      const response = await axios.head(firstImageUrl);
      if (response.status === 200) {
        return firstImageUrl;
      }
    } catch (error) {
      // First image not found, return placeholder
      return null;
    }
  } catch (error) {
    console.error(`Error fetching image for ${barcode}:`, error.message);
    return null;
  }
}

// Function to get maker ID or create new maker
async function getMakerIdOrCreate(brand) {
  if (!brand || brand === '') {
    return null;
  }
  
  // Clean brand name - remove "xx:" prefix if present
  let brandName = brand;
  if (brandName.includes(',')) {
    // Take only the first brand if multiple
    brandName = brandName.split(',')[0].trim();
  }
  if (brandName.startsWith('xx:')) {
    brandName = brandName.substring(3);
  }
  
  try {
    // Check if maker already exists
    const makersCollection = collection(db, 'makers');
    const q = query(makersCollection, where("name", "==", brandName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return existing maker ID
      return querySnapshot.docs[0].id;
    }
    
    // Create new maker
    const makerData = {
      name: brandName,
      country: "Unknown", // Default value
      website: ""
    };
    
    const docRef = await addDoc(makersCollection, makerData);
    console.log(`Added new maker: ${brandName} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error getting/creating maker for ${brandName}:`, error);
    return null;
  }
}

// Function to get tag IDs based on categories
async function getTagIds(categories) {
  if (!categories || categories === '') {
    return [];
  }
  
  const tagsCollection = collection(db, 'tags');
  const allTagsSnapshot = await getDocs(tagsCollection);
  const existingTags = {};
  
  allTagsSnapshot.forEach(doc => {
    existingTags[doc.data().name.toLowerCase()] = doc.id;
  });
  
  const tagNames = [];
  
  // Try to extract meaningful categories
  if (categories.includes('dark-chocolates')) tagNames.push('Dark');
  if (categories.includes('milk-chocolates')) tagNames.push('Milk');
  if (categories.includes('white-chocolates')) tagNames.push('White');
  if (categories.includes('organic')) tagNames.push('Organic');
  if (categories.includes('fair-trade')) tagNames.push('Fair Trade');
  if (categories.includes('bean-to-bar')) tagNames.push('Bean to Bar');
  if (categories.includes('single-origin')) tagNames.push('Single Origin');
  
  // Always add Dark since this is dark chocolate data
  if (!tagNames.includes('Dark')) {
    tagNames.push('Dark');
  }
  
  const tagIds = [];
  for (const tagName of tagNames) {
    const tagNameLower = tagName.toLowerCase();
    if (existingTags[tagNameLower]) {
      tagIds.push(existingTags[tagNameLower]);
    } else {
      // Create new tag
      try {
        const tagData = {
          name: tagName,
          category: tagName === 'Dark' || tagName === 'Milk' || tagName === 'White' ? 'Type' : 'Attribute'
        };
        
        const docRef = await addDoc(tagsCollection, tagData);
        console.log(`Added new tag: ${tagName} with ID: ${docRef.id}`);
        tagIds.push(docRef.id);
        existingTags[tagNameLower] = docRef.id;
      } catch (error) {
        console.error(`Error creating tag ${tagName}:`, error);
      }
    }
  }
  
  return tagIds;
}

// Function to extract cacao percentage from product name or dedicated field
function extractCacaoPercentage(row) {
  // Try to get from cocoa_value field
  if (row['cocoa_value'] && !isNaN(parseFloat(row['cocoa_value']))) {
    return parseFloat(row['cocoa_value']);
  }
  
  // Try to extract from product name
  const productName = row['product_name_en'] || row['product_name_es'] || row['product_name_fr'] || '';
  const percentMatch = productName.match(/(\d+)\s*%/);
  if (percentMatch && percentMatch[1]) {
    return parseInt(percentMatch[1]);
  }
  
  // Default value for dark chocolate if we can't find a percentage
  return 70;
}

// Function to get the best available product name
function getBestProductName(row) {
  // Try English name first
  if (row['product_name_en'] && row['product_name_en'].trim() !== '') {
    return row['product_name_en'].trim();
  }
  
  // Try other languages
  const langFields = ['product_name_es', 'product_name_fr', 'product_name_de', 'product_name_it'];
  for (const field of langFields) {
    if (row[field] && row[field].trim() !== '') {
      return row[field].trim();
    }
  }
  
  // If no product name found, create one from the brand and cacao percentage
  const brand = row['brands'] || 'Unknown';
  const cacaoPercentage = extractCacaoPercentage(row);
  return `${brand} Dark Chocolate ${cacaoPercentage}%`;
}

// Function to get the origin of the chocolate
function getOrigin(row) {
  if (row['origins'] && row['origins'].trim() !== '') {
    return row['origins'].trim();
  }
  
  if (row['origin_en'] && row['origin_en'].trim() !== '') {
    return row['origin_en'].trim();
  }
  
  // Check countries field
  if (row['countries'] && row['countries'].trim() !== '') {
    return row['countries'].trim();
  }
  
  return 'Various';
}

// Function to format ingredients list
function formatIngredients(row) {
  // Find the first non-empty ingredients field
  const ingredientsFields = [
    'ingredients_text_en', 
    'ingredients_text_es', 
    'ingredients_text_fr', 
    'ingredients_text_de'
  ];
  
  for (const field of ingredientsFields) {
    if (row[field] && row[field].trim() !== '') {
      return row[field].trim();
    }
  }
  
  return '';
}

// Function to get description
function getDescription(row) {
  // Try generic name fields first
  const genericFields = [
    'generic_name_en', 
    'generic_name_es', 
    'generic_name_fr', 
    'generic_name_de'
  ];
  
  for (const field of genericFields) {
    if (row[field] && row[field].trim() !== '') {
      return row[field].trim();
    }
  }
  
  // Create a description based on available data
  const name = getBestProductName(row);
  const cacaoPercentage = extractCacaoPercentage(row);
  const origin = getOrigin(row);
  
  return `${name} is a dark chocolate with ${cacaoPercentage}% cacao content from ${origin}.`;
}

// Main function to process Excel data and import to Firebase
async function importDarkChocolates() {
  try {
    console.log(`Reading Excel file: ${EXCEL_FILE_PATH}`);
    
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found at: ${EXCEL_FILE_PATH}`);
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} chocolate entries to process`);
    
    // Get chocolates collection
    const chocolatesCollection = collection(db, 'chocolates');
    
    // Process each row
    let added = 0;
    let skipped = 0;
    let failed = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const barcode = row['code']?.toString() || '';
      
      if (!barcode) {
        console.log(`Skipping row ${i+1}: No barcode`);
        skipped++;
        continue;
      }
      
      try {
        // Check if chocolate already exists
        const q = query(chocolatesCollection, where("barcode", "==", barcode));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`Skipping ${barcode}: Already exists in database`);
          skipped++;
          continue;
        }
        
        // Get maker ID
        const makerId = await getMakerIdOrCreate(row['brands']);
        
        // Get tag IDs
        const tagIds = await getTagIds(row['categories_tags']);
        
        // Get product image
        const imageUrl = await getProductImageUrl(barcode);
        
        // Create chocolate data
        const chocolateData = {
          name: getBestProductName(row),
          makerId: makerId,
          type: 'Dark',
          origin: getOrigin(row),
          cacaoPercentage: extractCacaoPercentage(row),
          description: getDescription(row),
          ingredients: formatIngredients(row),
          tagIds: tagIds,
          imageUrl: imageUrl || 'https://placehold.co/300x300?text=Chocolate',
          barcode: barcode,
          averageRating: 0,
          reviewCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // Add nutritional info if available
        if (row['energy-kcal_value'] || row['fat_value']) {
          chocolateData.nutritionalInfo = {
            servingSize: row['serving_size'] || '100g',
            calories: parseFloat(row['energy-kcal_value']) || 0,
            fat: parseFloat(row['fat_value']) || 0,
            sugar: parseFloat(row['sugars_value']) || 0,
            protein: parseFloat(row['proteins_value']) || 0
          };
        }
        
        // Add the chocolate to Firestore
        await addDoc(chocolatesCollection, chocolateData);
        console.log(`Added ${chocolateData.name} (${barcode}) to database`);
        added++;
        
      } catch (error) {
        console.error(`Error processing ${barcode}:`, error);
        failed++;
      }
      
      // Add a delay to avoid overwhelming the database and API
      if (i % 10 === 0) {
        console.log(`Progress: ${i+1}/${data.length} (${Math.round((i+1)/data.length*100)}%)`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Import complete: Added ${added}, Skipped ${skipped}, Failed ${failed}`);
    
  } catch (error) {
    console.error("Error processing Excel file:", error);
  }
}

// Run the import function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importDarkChocolates().then(() => {
    console.log('Dark chocolate import process completed');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}