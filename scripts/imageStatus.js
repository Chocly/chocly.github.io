// scripts/imageStatus.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
 * Analyze current image status across all chocolates
 */
const analyzeImageStatus = async () => {
  try {
    console.log('📊 Analyzing image status across all chocolates...\n');
    
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    // Stats tracking
    let total = 0;
    let withBarcodes = 0;
    let withoutBarcodes = 0;
    let withRealImages = 0;
    let withPlaceholders = 0;
    let barcodeStats = {
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14+': 0
    };
    let imagesByBarcodeLength = {
      '7': { real: 0, placeholder: 0 }, '8': { real: 0, placeholder: 0 }, 
      '9': { real: 0, placeholder: 0 }, '10': { real: 0, placeholder: 0 },
      '11': { real: 0, placeholder: 0 }, '12': { real: 0, placeholder: 0 },
      '13': { real: 0, placeholder: 0 }, '14+': { real: 0, placeholder: 0 }
    };
    
    // Process each chocolate
    snapshot.forEach((doc) => {
      const chocolate = doc.data();
      total++;
      
      const hasBarcode = chocolate.barcode && chocolate.barcode !== '';
      const hasRealImage = chocolate.imageUrl && !chocolate.imageUrl.includes('placehold.co');
      
      if (hasBarcode) {
        withBarcodes++;
        
        // Track barcode length distribution
        const barcodeLength = chocolate.barcode.length;
        const lengthKey = barcodeLength > 13 ? '14+' : barcodeLength.toString();
        
        // Initialize if doesn't exist
        if (!barcodeStats[lengthKey]) {
          barcodeStats[lengthKey] = 0;
        }
        if (!imagesByBarcodeLength[lengthKey]) {
          imagesByBarcodeLength[lengthKey] = { real: 0, placeholder: 0 };
        }
        
        barcodeStats[lengthKey]++;
        
        // Track images by barcode length
        if (hasRealImage) {
          withRealImages++;
          imagesByBarcodeLength[lengthKey].real++;
        } else {
          withPlaceholders++;
          imagesByBarcodeLength[lengthKey].placeholder++;
        }
      } else {
        withoutBarcodes++;
        if (hasRealImage) {
          withRealImages++;
        } else {
          withPlaceholders++;
        }
      }
    });
    
    // Calculate percentages
    const realImagePercent = Math.round((withRealImages / total) * 100);
    const placeholderPercent = Math.round((withPlaceholders / total) * 100);
    const barcodeSuccessRate = withBarcodes > 0 ? Math.round((withRealImages / withBarcodes) * 100) : 0;
    
    // Display results
    console.log('🎯 OVERALL STATUS:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total chocolates:           ${total}`);
    console.log(`With real images:           ${withRealImages} (${realImagePercent}%)`);
    console.log(`With placeholder images:    ${withPlaceholders} (${placeholderPercent}%)`);
    console.log(`With barcodes:              ${withBarcodes}`);
    console.log(`Without barcodes:           ${withoutBarcodes}`);
    console.log(`Success rate (with barcodes): ${barcodeSuccessRate}%`);
    
    console.log('\n📏 BARCODE LENGTH DISTRIBUTION:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    Object.entries(barcodeStats).forEach(([length, count]) => {
      if (count > 0) {
        const real = imagesByBarcodeLength[length].real;
        const placeholder = imagesByBarcodeLength[length].placeholder;
        const successRate = count > 0 ? Math.round((real / count) * 100) : 0;
        console.log(`${length.padEnd(2)} digits: ${count.toString().padEnd(3)} total | ${real.toString().padEnd(3)} real | ${placeholder.toString().padEnd(3)} placeholder | ${successRate}% success`);
      }
    });
    
    console.log('\n🎨 NEXT STEPS TO IMPROVE:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    if (placeholderPercent > 20) {
      console.log(`🔸 ${withPlaceholders} chocolates still need images`);
      
      // Show which barcode lengths need the most help
      const needsHelp = Object.entries(imagesByBarcodeLength)
        .filter(([length, data]) => data.placeholder > 5)
        .sort((a, b) => b[1].placeholder - a[1].placeholder);
      
      if (needsHelp.length > 0) {
        console.log('🔸 Focus on these barcode lengths:');
        needsHelp.forEach(([length, data]) => {
          console.log(`   - ${length} digits: ${data.placeholder} chocolates need images`);
        });
      }
    } else {
      console.log('🎉 Great job! Most chocolates now have images.');
    }
    
    if (withoutBarcodes > 0) {
      console.log(`🔸 ${withoutBarcodes} chocolates have no barcodes (consider manual image upload)`);
    }
    
    console.log(`\n📈 PROGRESS SUMMARY:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ ${withRealImages}/${total} chocolates have images (${realImagePercent}%)`);
    console.log(`🔄 ${withPlaceholders} chocolates still need images`);
    
    if (realImagePercent >= 60) {
      console.log('🎯 Target achieved! You have 60%+ image coverage.');
    } else {
      const needed = Math.ceil(total * 0.6) - withRealImages;
      console.log(`🎯 Need ${needed} more images to reach 60% coverage.`);
    }
    
  } catch (error) {
    console.error('Error analyzing image status:', error);
  }
};

// Run the analysis
analyzeImageStatus().then(() => {
  console.log('\nAnalysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});