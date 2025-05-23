// scripts/updateDatabaseProducts.js
import { db } from '../src/firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getOpenFoodFactsImageUrl } from '../src/utils/dataUtils';

const updateDatabaseProducts = async () => {
  try {
    console.log('Starting database product update process...');
    
    // Get all chocolates
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    console.log(`Found ${snapshot.size} chocolates to process.`);
    
    // Process each chocolate
    let processed = 0;
    let updated = 0;
    
    for (const chocolateDoc of snapshot.docs) {
      const chocolate = {
        id: chocolateDoc.id,
        ...chocolateDoc.data()
      };
      
      console.log(`Processing [${++processed}/${snapshot.size}]: ${chocolate.name}`);
      
      let needsUpdate = false;
      const updateData = {};
      
      // 1. Ensure product name includes brand/maker if available
      if (chocolate.maker && !chocolate.name.includes(chocolate.maker)) {
        updateData.name = `${chocolate.maker} - ${chocolate.name}`;
        needsUpdate = true;
        console.log(`- Updated title to include maker: ${updateData.name}`);
      }
      
      // 2. Get maker name if we have makerId but not maker
      if (chocolate.makerId && (!chocolate.maker || chocolate.maker === '')) {
        try {
          const makerDoc = await getDoc(doc(db, 'makers', chocolate.makerId));
          if (makerDoc.exists()) {
            updateData.maker = makerDoc.data().name;
            needsUpdate = true;
            console.log(`- Added maker name: ${updateData.maker}`);
            
            // Also update the name if needed
            if (!updateData.name) {
              updateData.name = `${updateData.maker} - ${chocolate.name}`;
              console.log(`- Updated title with resolved maker: ${updateData.name}`);
            }
          }
        } catch (error) {
          console.error(`- Error fetching maker: ${error.message}`);
        }
      }
      
      // 3. Ensure there's an image if we have a barcode
      if (chocolate.barcode && (!chocolate.imageUrl || chocolate.imageUrl.includes('placehold.co'))) {
        const imageUrl = await getOpenFoodFactsImageUrl(chocolate.barcode);
        if (imageUrl) {
          updateData.imageUrl = imageUrl;
          needsUpdate = true;
          console.log(`- Updated image URL from Open Food Facts`);
        }
      }
      
      // Update the document if needed
      if (needsUpdate) {
        const chocolateRef = doc(db, 'chocolates', chocolate.id);
        
        await updateDoc(chocolateRef, {
          ...updateData,
          updatedAt: new Date()
        });
        
        updated++;
        console.log(`- Document updated successfully`);
      } else {
        console.log(`- No updates needed`);
      }
      
      // Add a delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Update complete! Processed ${processed} chocolates, updated ${updated}.`);
    
  } catch (error) {
    console.error("Error updating database products:", error);
  }
};

export default updateDatabaseProducts;

// Execute the function if this script is run directly
if (require.main === module) {
  updateDatabaseProducts().then(() => {
    console.log('Product update process completed');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}