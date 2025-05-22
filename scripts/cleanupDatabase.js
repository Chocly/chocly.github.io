// scripts/cleanupDatabase.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc,
  doc
} from 'firebase/firestore';

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
 * Clean up test chocolates that don't have barcodes
 */
const cleanupTestChocolates = async () => {
  try {
    console.log('Starting database cleanup...');
    
    // Get all chocolates
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    console.log(`Found ${snapshot.size} chocolates total.`);
    
    let deleted = 0;
    let kept = 0;
    const toDelete = [];
    
    // First, identify which ones to delete
    snapshot.forEach((doc) => {
      const chocolate = {
        id: doc.id,
        ...doc.data()
      };
      
      // Delete if:
      // 1. No barcode, OR
      // 2. Has placeholder image and no barcode, OR
      // 3. Name suggests it's test data
      const shouldDelete = 
        !chocolate.barcode ||
        chocolate.barcode === '' ||
        (chocolate.imageUrl && chocolate.imageUrl.includes('placehold.co') && !chocolate.barcode) ||
        (chocolate.name && (
          chocolate.name.includes('Sample') ||
          chocolate.name.includes('Test') ||
          chocolate.name.includes('Placeholder')
        ));
      
      if (shouldDelete) {
        toDelete.push({
          id: doc.id,
          name: chocolate.name || 'Unknown',
          barcode: chocolate.barcode || 'None',
          reason: !chocolate.barcode ? 'No barcode' : 'Test data'
        });
      } else {
        kept++;
      }
    });
    
    console.log(`\nPlanning to delete ${toDelete.length} chocolates:`);
    console.log(`Will keep ${kept} chocolates with valid barcodes.`);
    
    // Show first 10 items to be deleted for confirmation
    console.log('\nFirst 10 items to be deleted:');
    toDelete.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (Barcode: ${item.barcode}) - ${item.reason}`);
    });
    
    if (toDelete.length > 10) {
      console.log(`... and ${toDelete.length - 10} more`);
    }
    
    // In a real script, you'd want confirmation here
    // For now, let's add a safety check
    if (toDelete.length > kept) {
      console.log('\n⚠️  WARNING: About to delete more items than keeping!');
      console.log('This might indicate an issue. Please review the deletion criteria.');
      console.log('If you want to proceed anyway, remove this safety check.');
      return;
    }
    
    console.log('\nStarting deletion...');
    
    // Delete the chocolates
    for (const item of toDelete) {
      try {
        await deleteDoc(doc(db, 'chocolates', item.id));
        deleted++;
        
        if (deleted % 10 === 0) {
          console.log(`Deleted ${deleted}/${toDelete.length} items...`);
        }
      } catch (error) {
        console.error(`Error deleting ${item.name}:`, error);
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`Deleted: ${deleted} test chocolates`);
    console.log(`Kept: ${kept} real chocolates with barcodes`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

/**
 * Show database stats without deleting anything
 */
const showDatabaseStats = async () => {
  try {
    console.log('Analyzing database...');
    
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    let withBarcodes = 0;
    let withoutBarcodes = 0;
    let withPlaceholderImages = 0;
    let withRealImages = 0;
    
    snapshot.forEach((doc) => {
      const chocolate = doc.data();
      
      if (chocolate.barcode && chocolate.barcode !== '') {
        withBarcodes++;
      } else {
        withoutBarcodes++;
      }
      
      if (chocolate.imageUrl && chocolate.imageUrl.includes('placehold.co')) {
        withPlaceholderImages++;
      } else {
        withRealImages++;
      }
    });
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`Total chocolates: ${snapshot.size}`);
    console.log(`With barcodes: ${withBarcodes}`);
    console.log(`Without barcodes: ${withoutBarcodes}`);
    console.log(`With real images: ${withRealImages}`);
    console.log(`With placeholder images: ${withPlaceholderImages}`);
    
  } catch (error) {
    console.error('Error analyzing database:', error);
  }
};

// Check command line argument
const action = process.argv[2];

if (action === 'stats') {
  showDatabaseStats().then(() => {
    console.log('Analysis complete');
    process.exit(0);
  });
} else if (action === 'cleanup') {
  cleanupTestChocolates().then(() => {
    console.log('Cleanup complete');
    process.exit(0);
  });
} else {
  console.log('Usage:');
  console.log('  node cleanupDatabase.js stats    - Show database statistics');
  console.log('  node cleanupDatabase.js cleanup  - Clean up test data');
  process.exit(1);
}